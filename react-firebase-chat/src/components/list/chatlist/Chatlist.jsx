import { useEffect, useState } from 'react';
import './chatlist.css';
import Adduser from './addUser/Adduser';
import { useUserStore } from '../../../lib/userstore';
import { onSnapshot, doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '../../../lib/firebase';
import { useChatStore } from '../../../lib/usechatstore';

function Chatlist() {

  const [addMode, setAddMode] = useState(false);
  const [chats, setChats] = useState([]);
  const [input, setInput] = useState("");

  const { currentUser } = useUserStore();
  const { changeChat } = useChatStore();

  useEffect(() => {
    const unsub = onSnapshot(doc(db, "userchats", currentUser.id), async (res) => {
        const items = res.data().chats;                                               //contains chats []

        //need to get user from chat[] list which contains reciever Id. Through reciever Id we can obtain names of all who the user has texted before.
        const promises = items.map(async (item) => {
            const userDocRef = doc(db, "users", item.recieverId);
            const userDocSnap = await getDoc(userDocRef);

            const user = userDocSnap.data();

            return {...item, user };
        });

        const chatData = await Promise.all(promises);
        setChats(chatData.sort((a, b) => {b.updatedAt - a.updatedAt}));
    });

    return () => {
        unsub();
    }
  }, [currentUser.id]);

  console.log(chats);

  const handleSelect = async (chat) => {
    const userChats = chats.map((item) => {
        const { user, ...rest} = item;
        return rest;
    });

    const chatIndex = userChats.findIndex(
        (item) => item.chatId === chat.chatId
    );

    userChats[chatIndex].isSeen = true;

    const userChatsRef = doc(db, "userchats", currentUser.id);

    try{
        await updateDoc(userChatsRef, {
            chats: userChats,
        })
        changeChat(chat.chatId, chat.user);
    } catch(err) {
        console.log(err.message);
    }
  }

  return (
    <div className='chatlist'>
        <div className='search'>
            <div className='searchBar'>
                <img src='/search.png' alt=''/>
                <input type = "text" placeholder = 'search' onChange={(e) => setInput(e.target.value)}/>
            </div>
            <div className='add'>
                <img 
                    src= {addMode ? './minus.png' : './plus.png'} 
                    alt='' 
                    onClick={() => setAddMode((prev) => (!prev))}
                />
            </div>
        </div>
        {chats.map((chat) => (
            <div 
                className="item" 
                key = {chat.chatId} 
                onClick={() => handleSelect(chat)}
                style = {{
                    backgroundColor : chat?.isSeen ? "transparent" : "#5183fe",
                }}
            >
                <img src={chat.user.avatar || './avatar.png'} alt=''/>
                <div className="texts">
                    <span>{chat.user.username}</span>
                    <p>{chat.lastMessage}</p>
                </div>
            </div>
        ))}
        {addMode && <Adduser/>}
    </div>
  );
}

export default Chatlist;