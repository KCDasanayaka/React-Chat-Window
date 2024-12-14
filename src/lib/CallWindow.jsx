import React from "react";
import "./CallWindow.css";

const CallWindow = ({ isVideoCall, onEndCall, user, localStream, remoteStream }) => {
  return (
    <div className="callWindow">
      <div className="callHeader">
        <div className="user">
          <img src={user?.avatar || "./avatar.png"} alt="User Avatar" className="callAvatar" />
          <div className="texts">
            <span>{user?.username}</span>
            <p style={{ color: "white" }}>
              {user?.lastSeen
                ? `Last seen: ${new Date(user.lastSeen.seconds * 1000).toLocaleDateString()}`
                : "Loading..."}
            </p>
          </div>
        </div>
      </div>
      <div className="callContent">
        {isVideoCall ? (
          <div className="videoStreams">
            <video
              className="localVideo"
              autoPlay
              muted
              ref={(ref) => ref && localStream && (ref.srcObject = localStream)}
            />
            <video
              className="remoteVideo"
              autoPlay
              ref={(ref) => ref && remoteStream && (ref.srcObject = remoteStream)}
            />
          </div>
        ) : (
          <p className="callMessage">Voice Call in Progress...</p>
        )}
      </div>
      <button className="endCallButton" onClick={onEndCall}>
        End Call
      </button>
    </div>
  );
};

export default CallWindow;
