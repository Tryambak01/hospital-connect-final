import './adduser.css';
import { db } from '../../../../lib/firebase';
import { collection, query, where, getDocs, setDoc, serverTimestamp, updateDoc, arrayUnion } from 'firebase/firestore';
import { useState } from 'react';
import { doc } from 'firebase/firestore';
import { useUserStore } from '../../../../lib/userstore';

function Adduser() {
  const [user, setUser] = useState(null);

  const { currentUser } = useUserStore();

  const handleSearch = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const username = formData.get("username");
    console.log("Trying to fetch user to add");
    try{
      const userRef = collection(db, "users");
      //creating a query to fetch user
      const q = query(userRef, where("username", "==", username));
      const querySnapShot = await getDocs(q);

      if(!querySnapShot.empty){
          setUser(querySnapShot.docs[0].data());
      }
    } catch (err){
        console.log(err.message);
    }
  }

  const handleAdd = async () => {
    const chatRef = collection(db, "chats");
    const userChatsRef = collection(db, "userchats");
    try {
      const newChatRef = doc(chatRef);                 //creates a randomly generated id [CHAT ID]

      await setDoc(newChatRef, {
        createdAt: serverTimestamp(),
        messages: [],
      });

      await updateDoc(doc(userChatsRef, user.id), {
        chats: arrayUnion({
          chatId: newChatRef.id,
          lastMessage: "",
          recieverId: currentUser.id,
          updatedAt: Date.now(),
        })
      });
      console.log(newChatRef.id);                      //new unique id for "chats" collection

      await updateDoc(doc(userChatsRef, currentUser.id), {
        chats: arrayUnion({
          chatId: newChatRef.id,
          lastMessage: "",
          recieverId: user.id,
          updatedAt: Date.now(),
        })
      });
    } catch(err) {
      console.log(err.message);
    }
  }

  return (
    <div className='adduser'>
      <form onSubmit={handleSearch}>
        <input type = "text" placeholder='Username' name = "username"/>
        <button>Search</button>
      </form>
      {user && <div className='user'>
        <div className='details'>
          <img src={user.avatar || './avatar.png'} alt=''/>
          <span>{user.username}</span>
        </div>
        <button onClick={handleAdd}>Add User</button>
      </div>}
    </div>
  );
}

export default Adduser;