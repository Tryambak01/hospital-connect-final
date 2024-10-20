import { create  } from "zustand";
import { db } from "./firebase";
import { doc, getDoc } from "firebase/firestore";
import { useUserStore } from "./userstore";

export const useChatStore = create((set) => ({
    chatId : null,
    user : null,     
    changeChat : (chatId, user) => {
        const currentUser = useUserStore.getState().currentUser;
        set({
            chatId,
            user,
        });
    },
}))