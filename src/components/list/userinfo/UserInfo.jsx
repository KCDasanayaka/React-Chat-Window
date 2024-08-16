import "./userInfo.css"
import { useUserStore } from "../../../lib/userStore";

const UserInfo =()=>{

    const { currentUser } = useUserStore();

    return(
        <div className="userInfo">
            <div className="user">
                <img src={currentUser.avatar || "./avatar.png" }alt="" />
                <h2>{currentUser.username}</h2>
            </div>
            
        </div>
    )
}
export default UserInfo;