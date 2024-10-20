import { useCallback, useEffect, useRef, useState } from 'react';
import './chat.css';
import { onSnapshot, doc, updateDoc, arrayUnion, getDoc } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { useChatStore } from '../../lib/usechatstore';
import { useUserStore } from '../../lib/userstore';
import upload from '../../lib/upload';
import { useNavigate } from 'react-router-dom';

function Chat({ onEnable }) {
  const [chat, setChat] = useState();
  const[text, setText] = useState('');
  const endRef = useRef(null);
  const [img, setImg] = useState({
    file: null,
    url: '',
  });

  const { chatId, user } = useChatStore();
  const { currentUser } = useUserStore();
  const navigate = useNavigate();

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

const handleSend = async () => {
  if(text === '') return;

  let imgUrl = null;

  try{
    if(img.file){
      imgUrl = await upload(img.file);
    }

    await updateDoc(doc(db, "chats", chatId), {
      messages: arrayUnion({
        senderId : currentUser.id,
        text,
        createdAt: new Date(),
        ...(imgUrl && {img: imgUrl}),
      }),
    });

    const userIDs = [currentUser.id, user.id];

    await Promise.all(
      userIDs.map(async (id) => {
        const userChatsRef = doc(db, "userchats", id);
        const userChatsSnapShot = await getDoc(userChatsRef);

        if (userChatsSnapShot.exists()) {
          const userChatsData = userChatsSnapShot.data();
          const chatIndex = userChatsData.chats.findIndex((c) => c.chatId === chatId);

          userChatsData.chats[chatIndex].lastMessage = text;
          userChatsData.chats[chatIndex].isSeen = id === currentUser.id;
          userChatsData.chats[chatIndex].updatedAt = Date.now();

          await updateDoc(userChatsRef, {
            chats: userChatsData.chats,
          });
        }
      })
    );

    setImg({
      file:null,
      imgUrl:'',
    });
    setText(''); 

  } catch(err){
      console.log(err.message);
  }
}

const handleImage = (e) => {
  if(e.target.files[0]){
    setImg({
      file: e.target.files[0],
      url: URL.createObjectURL(e.target.files[0]),
  });
  }
};

console.log(chat);

const handleJoinRoom = useCallback(() => {
  navigate(`/room`)
  onEnable();
}, [navigate]);

  return (
    <div className='chat'>
      <div className='top'>
        <div className='user'>
          <img src={user?.avatar || './avatar.png'} alt=''/>
          <div className='texts'>
            <span>{user?.username}</span>
            <p>Dentist</p>
          </div>
        </div>
        <div className='icons'>
          <img src='./phone.png' alt='' onClick={handleJoinRoom}/>
          <img src='./video.png' alt='' onClick={handleJoinRoom}/>    
          <img src='./info.png' alt=''/>
        </div>
      </div>
      <div className='center'>
        {chat?.messages?.map((message) => (
          <div className={message.senderId === currentUser?.id ? "message own" : "message"} key={message?.createdAt}>
            <div className='texts'>
              {message.img && <img src={message.img} alt=''/>}
              <p>{message.text}</p>
              {/* <span></span> */}
            </div>
          </div>
        ))}
        {img.url && <div className='message own'>
            <div className='texts'>
              <img src={img.url} alt=''/>
            </div>
          </div>}
        <div ref = {endRef}></div>
      </div>
      <div className='bottom'>
        <div className='icons'>
          <label htmlFor="file">
            <img src='./img.png' alt=''/>
          </label>
          <input type='file' id='file' style = {{
            display: "none"
          }} onChange={handleImage}/>
          <img src='./camera.png' alt=''/>
          <img src='./mic.png' alt=''/>
        </div>
        <input 
          type = "text" 
          placeholder='Type a message...'
          value= {text}
          onChange={e => setText(e.target.value)}
        />
        <button className='sendButton' onClick={handleSend}>
          Send
        </button>
      </div>
    </div>
  );
}

export default Chat;