import List from './components/list/List';
import Chat from './components/chat/Chat';
import Details from './components/details/Details';
import './index.css';
import Login from './components/login/Login';
import Notification from './components/notification/Notification';
import { useEffect, useState } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from './lib/firebase';
import { useUserStore } from './lib/userstore';
import { useChatStore } from './lib/usechatstore';
import HospitalFinder from './components/Hospitals/HospitalFinder';
import { BrowserRouter as Router, Routes, Route} from 'react-router-dom';
import RoomPage from './components/room/Room';

const App = () => {
  const { currentUser, isLoading, fetchUserInfo } = useUserStore();
  const { chatId } = useChatStore();
  const [hospitalSelected, setHospitalSelected] = useState(false); 
  const [hospitalName, setHospitalName] = useState(null);
  const [enable, setEnable] = useState(false); // For video call

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      fetchUserInfo(user?.uid);
    });

    return () => {
      unsub();
    };
  }, [fetchUserInfo]);

  if (isLoading) return <div className='loading'>Loading ...</div>;

  const handleHospitalSelect = (name) => {
    setHospitalName(name);
    setHospitalSelected(true);
  };

  const handleVidEnable = () => {
    setEnable(true); // Enable video call when invoked
  };

  const handleVidDisable = () => {
    setEnable(false);
  };

  return (
    <Router>
      <div className='root'>
        {enable ? (
          // Show only the videoCall div and RoomPage when enable is true
          <div className='videoCall'>
            <Routes>
              <Route 
                path="/room" 
                element={<RoomPage onEnable = {handleVidDisable}/>} 
              />
            </Routes>
          </div>
        ) : (
          // Show the main content when enable is false
          <>
            {!hospitalSelected ? (
              <div className='LandingPage'>
                <HospitalFinder onSelectHospital={handleHospitalSelect} />
              </div>
            ) : (
              <div className='container'> {/* Main content */}
                {currentUser ? (
                  <>
                    <List />
                    {chatId && <Chat onEnable={handleVidEnable} />} {/* Pass the handler to Chat */}
                    {chatId && <Details hospital={hospitalName} />}
                  </>
                ) : (
                  <Login />
                )}
                <Notification />
              </div>
            )}
          </>
        )}
      </div>
    </Router>
  );
};

export default App;
