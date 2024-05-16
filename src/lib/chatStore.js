import {create} from "zustand";
import { useUserStore } from "./userStore";

export const useChatStore = create((set) => ({
  chatId: null,
  user: null,
  isCurrentUserBlocked: false,
  isReceiverBlocked: false,
  changeChat: (chatId, user) => {
    const currentUser = useUserStore.getState().currentUser;
    console.log("changeChat called");
    console.log("currentUser:", currentUser);
    console.log("user:", user);

    if (!currentUser || !user) {
      console.error("currentUser or user is undefined");
      return;
    }

    if (!Array.isArray(currentUser.blocked)) {
      currentUser.blocked = [];
    }

    if (!Array.isArray(user.blocked)) {
      user.blocked = [];
    }

    if (user.blocked.includes(currentUser.uid)) {
      return set({
        chatId,
        user: null,
        isCurrentUserBlocked: true,
        isReceiverBlocked: false,
      });
    } else if (currentUser.blocked.includes(user.uid)) {
      return set({
        chatId,
        user: user,
        isCurrentUserBlocked: false,
        isReceiverBlocked: true,
      });
    } else {
      return set({
        chatId,
        user,
        isCurrentUserBlocked: false,
        isReceiverBlocked: false,
      });
    }
  },

  changeBlock: () => {
    set((state) => ({ ...state, isReceiverBlocked: !state.isReceiverBlocked}));
  },
}));
