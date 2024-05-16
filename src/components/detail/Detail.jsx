import React from "react";
import "./detail.css";
import { useEffect } from "react";
import { auth, db } from "../../lib/firebase";
import { useChatStore } from "../../lib/chatStore";
import { useUserStore } from "../../lib/userStore";
import { arrayRemove, arrayUnion, doc, updateDoc } from "firebase/firestore";

const Detail = () => {
  const { chatId, user, isCurrentUserBlocked, isReceiverBlocked } =
    useChatStore();
  const { currentUser } = useUserStore();

  const changeBlock = () => {
    useChatStore.getState().changeBlock();
  };

  const handleBlock = async () => {
    if (!user) return;

    const userDocRef = doc(db, "users", currentUser.uid);
    try {
      await updateDoc(userDocRef, {
        blocked: isReceiverBlocked
          ? arrayRemove(user.uid)
          : arrayUnion(user.uid),
      });

      useChatStore.getState().changeBlock();
      // changeBlock();
    } catch (error) {
      console.log(error);
    }
  };

  const getBlockButtonText = () => {
    if (isCurrentUserBlocked) {
      return "You are blocked!!";
    } else if (isReceiverBlocked) {
      return "User blocked";
    } else {
      return "Block User";
    }
  };
  return (
    <div className="detail">
      <div className="user">
        <img src={user?.avatar || "./avatar.png"} alt="" />
        <h2>{user?.username}</h2>
        <p>Lorem ipsum consectetur adipisicing elit.</p>
      </div>
      <div className="info">
        <div className="option">
          <div className="title">
            <span>Chat Settings</span>
            <img src="./arrowUp.png" alt="" />
          </div>
        </div>
        <div className="option">
          <div className="title">
            <span>Privacy and help</span>
            <img src="./arrowUp.png" alt="" />
          </div>
        </div>
        <div className="option">
          <div className="title">
            <span>Shared Photos</span>
            <img src="./arrowDown.png" alt="" />
          </div>
        </div>
        <div className="option">
          <div className="photos">
            <div className="photoItem">
              <div className="photoDetail">
                <img src="https://picsum.photos/200/300" alt="" />
                <span>photo 1.png</span>
              </div>
              <img src="./download.png" alt="" className="icon" />
            </div>
            <div className="photoItem">
              <div className="photoDetail">
                <img src="https://picsum.photos/200/300" alt="" />
                <span>photo 1.png</span>
              </div>
              <img src="./download.png" alt="" className="icon" />
            </div>
            <div className="photoItem">
              <div className="photoDetail">
                <img src="https://picsum.photos/200/300" alt="" />
                <span>photo 1.png</span>
              </div>
              <img src="./download.png" alt="" className="icon" />
            </div>
          </div>
        </div>
        <div className="option">
          <div className="title">
            <span>Shared Files</span>
            <img src="./arrowUp.png" alt="" />
          </div>
        </div>

        <button className="block" onClick={handleBlock}>
          {getBlockButtonText()}
        </button>
        <button className="logout" onClick={() => auth.signOut()}>
          Logout
        </button>
      </div>
    </div>
  );
};

export default Detail;
