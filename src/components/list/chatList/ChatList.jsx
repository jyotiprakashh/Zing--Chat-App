import React, { useEffect } from "react";
import "./chatList.css";
import AddUser from "./addUser/AddUser";
import { useUserStore } from "../../../lib/userStore";
import { doc, onSnapshot, updateDoc } from "firebase/firestore";
import { getDoc } from "firebase/firestore";
import { db } from "../../../lib/firebase";
import { useChatStore } from "../../../lib/chatStore";

const ChatList = () => {
  const [addmode, setAddmode] = React.useState(false);
  const [chats, setChats] = React.useState([]);
  const [input, setInput] = React.useState("");
  const { currentUser } = useUserStore();
  const { chatId, changeChat } = useChatStore();
  useEffect(() => {
    if (!currentUser.uid) return;
    const unsub = onSnapshot(
      doc(db, "userchats", currentUser.uid),
      async (res) => {
        // setChats[doc.data()];
        const items = res.data().chats;
        const promises = items.map(async (item) => {
          const userDocRef = doc(db, "users", item.receiverId);
          const userDocSnap = await getDoc(userDocRef);

          const user = userDocSnap.data();
          return { ...item, user };
        });
        const chatData = await Promise.all(promises);
        setChats(chatData.sort((a, b) => b.updatedAt - a.updatedAt));
      }
    );

    return () => {
      unsub();
    };
  }, [currentUser.uid]);

  const handleSelect = async (chat) => {
    const userChats = chats.map((item) => {
      const { user, ...rest } = item;
      return rest;
    });

    const chatIndex = userChats.findIndex(
      (item) => item.chatId === chat.chatId
    );

    userChats[chatIndex].isSeen = true;

    const userChatsRef = doc(db, "userchats", currentUser.uid);

    try {
      await updateDoc(userChatsRef, {
        chats: userChats,
      });
      changeChat(chat.chatId, chat.user);
    } catch (er) {
      console.log(er);
    }
  };

  const filteredChats= chats.filter((chat) => chat.user.username.toLowerCase().includes(input.toLowerCase()))
  return (
    <div className="chatlist">
      <div className="search">
        <div className="searchbar">
          <img src="./search.png" alt=""></img>
          <input type="text" placeholder="Search" onChange={(e) => setInput(e.target.value)}></input>
        </div>

        <img
          src={addmode ? "./minus.png" : "./plus.png"}
          alt=""
          className="add"
          onClick={() => setAddmode(!addmode)}
        />
      </div>
      {filteredChats.map((chat) => (
        <div
          className="item"
          key={chat.chatId}
          onClick={() => handleSelect(chat)}
          style={{ backgroundColor: chat?.isSeen ? "transparent" : "#6580c7" }}
        >
          <img
            src={
              chat.user.blocked.includes(currentUser.uid)
                ? "./avatar.png"
                : chat.user.avatar || "./avatar.png"
            }
            alt=""
          />
          <div className="texts">
            <span>
              {chat.user.blocked.includes(currentUser.uid)
                ? "Blocked User"
                : chat.user.username}
            </span>
            <p>{chat.lastMessage}</p>
          </div>
        </div>
      ))}

      {addmode && <AddUser />}
    </div>
  );
};

export default ChatList;
