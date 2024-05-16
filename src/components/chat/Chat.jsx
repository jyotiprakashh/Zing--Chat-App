import React, { useEffect, useState, useRef } from "react";
import "./chat.css";
import EmojiPicker from "emoji-picker-react";
import {
  arrayUnion,
  getDoc,
  doc,
  onSnapshot,
  updateDoc,
} from "firebase/firestore";
import { db } from "../../lib/firebase";
import { useChatStore } from "../../lib/chatStore";
import { toast } from "react-toastify";
import { useUserStore } from "../../lib/userStore";
import { getDownloadURL, getStorage, ref, uploadBytes } from "firebase/storage";

const Chat = () => {
  const [chat, setChat] = useState();
  const [emoji, setEmoji] = useState(false);
  const [text, setText] = useState("");
  const [img, setImg] = useState({
    file: null,
    url: "",
  });
  const { chatId, user, isCurrentUserBlocked,isReceiverBlocked } = useChatStore();
  const { currentUser } = useUserStore();

  const endRef = useRef(null);
  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);
  useEffect(() => {
    const unSub = onSnapshot(doc(db, "chats", chatId), (res) => {
      setChat(res.data());
    });
    return () => {
      unSub();
    };
  }, [chatId]);
  const handleEmoji = (e) => {
    // console.log(e)
    setText((prev) => prev + e.emoji);
  };

  const uploadImage = async (file) => {
    if (!file) return null;
    const storage = getStorage();
    const storageRef = ref(storage, `chat_images/${file.name}`);
    await uploadBytes(storageRef, file);
    const url = await getDownloadURL(storageRef);
    return url;
  };

  const handleSend = async () => {
    if (text === "") {
      toast.error("Please enter a message");
      return;
    }

    // let imgURL = null;
    try {
      let imgURL = null;
      if (img.file) {
        imgURL = await uploadImage(img.file);
      }

      const chatDocRef = doc(db, "chats", chatId);
      await updateDoc(chatDocRef, {
        messages: arrayUnion({
          senderId: currentUser.uid,
          text,
          createdAt: new Date(),
          ...(imgURL && { img: imgURL }),
        }),
      });
      console.log(text);

      const userIDs = [currentUser.uid, user.uid];
      userIDs.forEach(async (uid) => {
        const userChatsRef = doc(db, "userchats", uid);
        const userChatsSnapshot = await getDoc(userChatsRef);

        if (userChatsSnapshot.exists()) {
          const userChatsData = userChatsSnapshot.data();

          if (Array.isArray(userChatsData.chats)) {
            const chatIndex = userChatsData.chats.findIndex(
              (c) => c.chatId === chatId
            );
            userChatsData.chats[chatIndex].lastMessage = text;
            userChatsData.chats[chatIndex].isSeen =
              uid === currentUser.uid ? true : false;
            userChatsData.chats[chatIndex].updatedAt = Date.now();
            await updateDoc(userChatsRef, { chats: userChatsData.chats });
          }
        } else {
          userChatsData.chats.push({
            chatId,
            lastMessage: text,
            isSeen: uid === currentUser.uid,
            updatedAt: new Date().toISOString(),
          });
          await updateDoc(userChatsRef, { chats: userChatsData.chats });
        }
      });
    } catch (err) {
      console.log(err);
    } finally {
      setImg({
        file: null,
        url: "",
      });

      setText("");
    }
  };
  const handleImage = (e) => {
    if (e.target.files[0]) {
      setImg({
        file: e.target.files[0],
        url: URL.createObjectURL(e.target.files[0]),
      });
    }
  };
  return (
    <div className="chat">
      <div className="top">
        <div className="user">
          <img src={ user?.avatar || "./avatar.png" }alt=""></img>
          <div className="texts">
            <span>{user?.username}</span>
            <p>I love chocolates!</p>
          </div>
        </div>
        <div className="icons">
          <img src="./phone.png" alt="" />
          <img src="./video.png" alt="" />
          <img src="./info.png" alt="" />
        </div>
      </div>
      <div className="center">
        {chat?.messages?.map((message) => (
          <div className={message.senderId=== currentUser?.uid ? "message own" : "message"} key={message?.createdAt}>
            <div className="texts">
              {message.img && <img src={message.img} alt="" />}
              <p>{message.text}</p>
              <span> 1 min ago</span>
            </div>
          </div>
        ))}
        {img.url && (
          <div className="message own">
            <div className="texts">
              <img src={img.url} alt="" />
            </div>
          </div>
        )}
        <div ref={endRef}></div>
      </div>
      <div className="bottom">
        <div className="icons">
          <label htmlFor="file">
            <img src="./img.png" alt="" />
          </label>
          <input
            type="file"
            id="file"
            style={{ display: "none" }}
            onChange={handleImage}
          />
          <img src="./mic.png" alt="" />
          <img src="./camera.png" alt="" />
        </div>
        <input
          type="text"
          placeholder={isCurrentUserBlocked || isReceiverBlocked ? "Oops! You can't send message to this user" : "Type a message..."}
          value={text}
          onChange={(e) => setText(e.target.value)}
          disabled={isCurrentUserBlocked || isReceiverBlocked}
        />
        <div className="emoji">
          <img src="./emoji.png" alt="" onClick={() => setEmoji(!emoji)} />
          <div className="picker">
            {emoji && <EmojiPicker onEmojiClick={handleEmoji} />}
          </div>
        </div>
        <button className="sendbutton" onClick={handleSend} disabled={isCurrentUserBlocked || isReceiverBlocked}>
          send
        </button>
      </div>
    </div>
  );
};

export default Chat;
