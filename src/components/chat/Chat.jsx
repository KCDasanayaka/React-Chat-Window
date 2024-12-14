import { useEffect, useRef, useState } from "react";
import "./Chat.css";
import CallWindow from "../../lib/CallWindow";
import EmojiPicker from "emoji-picker-react";
import { arrayUnion, doc, onSnapshot, updateDoc } from "firebase/firestore";
import { db } from "../../lib/firebase";
import { useChatStore } from "../../lib/chatStore";
import { useUserStore } from "../../lib/userStore";
import upload from "../../lib/upload";

const Chat = () => {
  const [chat, setChat] = useState(null);
  const [open, setOpen] = useState(false);
  const [text, setText] = useState("");
  const [lastSeen, setLastSeen] = useState(null);
  const [isCallOpen, setIsCallOpen] = useState(false);
  const [isVideoCallOpen, setIsVideoCallOpen] = useState(false);
  const [localStream, setLocalStream] = useState(null);
  const [remoteStream, setRemoteStream] = useState(null);

  const { isCurrentUserBlocked, isReceiverBlocked } = useChatStore();
  const currentUser = useUserStore((state) => state.currentUser);
  const chatId = useChatStore((state) => state.chatId);
  const user = useChatStore((state) => state.user);
  const img = useChatStore((state) => state.img);
  const setImg = useChatStore((state) => state.setImg);
  const endRef = useRef(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chat?.messages]);

  useEffect(() => {
    const unSubChat = onSnapshot(doc(db, "chats", chatId), (res) => {
      setChat(res.data());
    });

    const unSubUser = onSnapshot(doc(db, "users", user.id), (res) => {
      if (res.exists()) {
        setLastSeen(res.data().lastSeen);
      }
    });

    return () => {
      unSubChat();
      unSubUser();
    };
  }, [chatId, user.id]);

  const startCall = async (isVideo) => {
    setIsCallOpen(true);
    setIsVideoCallOpen(isVideo);

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: isVideo,
        audio: true,
      });
      setLocalStream(stream);

      // Simulating remote stream for demonstration.
      const fakeRemoteStream = new MediaStream();
      setRemoteStream(fakeRemoteStream);
    } catch (err) {
      console.error("Error starting call:", err);
    }
  };

  const endCall = () => {
    if (localStream) {
      localStream.getTracks().forEach((track) => track.stop());
    }
    setLocalStream(null);
    setRemoteStream(null);
    setIsCallOpen(false);
    setIsVideoCallOpen(false);
  };

  const handleSend = async () => {
    if (text === "" && !img.file) return;

    let imgUrl = null;

    try {
      if (img.file) {
        imgUrl = await upload(img.file, "chat_images");
      }
      await updateDoc(doc(db, "chats", chatId), {
        messages: arrayUnion({
          senderId: currentUser.id,
          text,
          createdAt: new Date(),
          ...(imgUrl && { img: imgUrl }),
        }),
      });
    } catch (err) {
      console.error(err);
    }

    setImg({ file: null, url: "" });
    setText("");
  };

  return (
    <div className="chat">
      <div className="top">
        <div className="user">
          <img src={user?.avatar || "./avatar.png"} alt="" />
          <div className="texts">
            <span>{user?.username}</span>
            <p style={{ color: "white" }}>
              {lastSeen
                ? `Last seen: ${new Date(lastSeen.seconds * 1000).toLocaleDateString()}`
                : "Loading..."}
            </p>
          </div>
        </div>
        <div className="icons">
          <img src="./phone.png" alt="Phone" onClick={() => startCall(false)} />
          <img src="./video.png" alt="Video" onClick={() => startCall(true)} />
          <img src="./info.png" alt="Info" />
        </div>
      </div>
      <div className="center">
        {chat?.messages?.map((message, index) => (
          <div
            className={message.senderId === currentUser?.id ? "message own" : "message"}
            key={index}
          >
            <div className="texts">
              {message.img && <img src={message.img} alt="message" />}
              {message.text && <p>{message.text}</p>}
            </div>
          </div>
        ))}
        <div ref={endRef} />
      </div>
      <div className="bottom">
        <input
          type="text"
          placeholder={
            isCurrentUserBlocked || isReceiverBlocked
              ? "You cannot send a message"
              : "Type a message..."
          }
          value={text}
          onChange={(e) => setText(e.target.value)}
          disabled={isCurrentUserBlocked || isReceiverBlocked}
        />
        <button onClick={handleSend}>Send</button>
      </div>

      {isCallOpen && (
        <CallWindow
          isVideoCall={isVideoCallOpen}
          onEndCall={endCall}
          user={user}
          localStream={localStream}
          remoteStream={remoteStream}
        />
      )}
    </div>
  );
};

export default Chat;
