import React, { useEffect } from "react";
import List from "./components/list/List";
import Chat from "./components/chat/Chat";
import Detail from "./components/detail/Detail";
import Login from "./components/login/Login";
import Notification from "./components/notification/Notification";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "./lib/firebase";
import { useUserStore } from "./lib/userStore";
import "ldrs/ring";
import { bouncy } from "ldrs";
import { useChatStore } from "./lib/chatStore";

bouncy.register();

const App = () => {
  // const user = false;
  const { currentUser, isLoading, fetchUserInfo } = useUserStore();
  const { chatId } = useChatStore();
  useEffect(() => {
    const unSub = onAuthStateChanged(auth, (user) => {
      fetchUserInfo(user?.uid);
    });
    return () => {
      unSub();
    };
  }, [fetchUserInfo]);

  console.log(currentUser);

  if (isLoading)
    return (
      <div className="loading">
        <l-bouncy size="75" speed="1.75" color="#000"></l-bouncy>
      </div>
    );
  return (
    <>
       
    <div className="container">
      {currentUser ? (
        <>
          <List />
          {chatId && <Chat />}
          {chatId && <Detail />}
        </>
      ) : (
        
        <Login />
      )}
      <Notification />
    </div>
    </>
  );
};

export default App;
