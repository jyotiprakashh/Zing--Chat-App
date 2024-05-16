// import React, { useState } from "react";
// import "./addUser.css";
// import { db } from "../../../../lib/firebase";
// import { useUserStore } from "../../../../lib/userStore";
// import {
//   arrayUnion,
//   collection,
//   doc,
//   getDoc,
//   getDocs,
//   query,
//   serverTimestamp,
//   setDoc,
//   updateDoc,
//   where,
// } from "firebase/firestore";

// const AddUser = () => {
//   const [user, setUser] = useState(null);
//   const { currentUser } = useUserStore();
//   const handleSearch = async (e) => {
//     e.preventDefault();
//     const formData = new FormData(e.target);
//     const username = formData.get("username");

//     try {
//       const userRef = collection(db, "users");

//       const q = query(userRef, where("username", "==", username));
//       const querySnapshot = await getDocs(q);
//       if (!querySnapshot.empty) {
//         setUser(querySnapshot.docs[0].data());
//       }
//     } catch (err) {
//       console.log(err);
//     }
//   };

//   const handleAdd = async () => {
//     const chatRef = collection(db, "chats");
//     const userChatRef = collection(db, "userchats");

//     try {
//       const newChatRef = doc(chatRef);
//       await setDoc(newChatRef, {
//         createdAt: serverTimestamp(),
//         messages: [],
//       });

//       await updateDoc(doc(userChatRef, user.uid), {
//         chats: arrayUnion({
//           chatId: newChatRef.id,
//           lastMessage: "",
//           receiverId: currentUser.uid,
//           updatedAt: Date.now(),
//         }),
//       });

//       await updateDoc(doc(userChatRef, currentUser.uid), {
//         chats: arrayUnion({
//           chatId: newChatRef.id,
//           lastMessage: "",
//           receiverId: user.uid,
//           updatedAt: Date.now(),
//         }),
//       });
//     } catch (err) {
//       console.log(err);
//     }
//   };
//   return (
//     <div className="addUser">
//       <form onSubmit={handleSearch}>
//         <input type="text" placeholder="Username" name="username" />
//         <button>Search</button>
//       </form>
//       {user && (
//         <div className="user">
//           <div className="detail">
//             <img src={user.avatar || "./avatar.png"} alt="" />
//             <span>{user.username}</span>
//           </div>
//           <button onClick={handleAdd}>Add User</button>
//         </div>
//       )}
//     </div>
//   );
// };

// export default AddUser;

import "./addUser.css";
import { db } from "../../../../lib/firebase";
import {
  arrayUnion,
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
} from "firebase/firestore";
import { useState } from "react";
import { useUserStore } from "../../../../lib/userStore";

const AddUser = () => {
  const [user, setUser] = useState(null);

  const { currentUser } = useUserStore();

  const handleSearch = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const username = formData.get("username");

    try {
      const userRef = collection(db, "users");

      const q = query(userRef, where("username", "==", username));

      const querySnapShot = await getDocs(q);

      if (!querySnapShot.empty) {
        setUser(querySnapShot.docs[0].data());
      }
    } catch (err) {
      console.log(err);
    }
  };

  const handleAdd = async () => {
    const chatRef = collection(db, "chats");
    const userChatsRef = collection(db, "userchats");

    try {
      const newChatRef = doc(chatRef);

      await setDoc(newChatRef, {
        createdAt: serverTimestamp(),
        messages: [],
      });

      const userChatDocRef = doc(userChatsRef, user.uid);
      const currentUserChatDocRef = doc(userChatsRef, currentUser.uid);

      const userChatDoc = await getDoc(userChatDocRef);
      if (!userChatDoc.exists()) {
        await setDoc(userChatDocRef, { chats: [] });
      }

      const currentUserChatDoc = await getDoc(currentUserChatDocRef);
      if (!currentUserChatDoc.exists()) {
        await setDoc(currentUserChatDocRef, { chats: [] });
      }

      await updateDoc(userChatDocRef, {
        chats: arrayUnion({
          chatId: newChatRef.id,
          lastMessage: "",
          receiverId: currentUser.uid,
          updatedAt: Date.now(),
        }),
      });

      await updateDoc(currentUserChatDocRef, {
        chats: arrayUnion({
          chatId: newChatRef.id,
          lastMessage: "",
          receiverId: user.uid,
          updatedAt: Date.now(),
        }),
      });
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <div className="addUser">
      <form onSubmit={handleSearch}>
        <input type="text" placeholder="Username" name="username" />
        <button>Search</button>
      </form>
      {user && (
        <div className="user">
          <div className="detail">
            <img src={user.avatar || "./avatar.png"} alt="" />
            <span>{user.username}</span>
          </div>
          <button onClick={handleAdd}>Add User</button>
        </div>
      )}
    </div>
  );
};

export default AddUser;
