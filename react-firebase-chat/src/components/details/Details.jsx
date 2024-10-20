import { auth } from '../../lib/firebase';
import './details.css';

function Details({ hospital }) {
  return (
    <div className='details'>
        <div className='hospitalName'>
            <h2>{hospital}</h2>
        </div>
        <div className='info'>
            <div className='option'>
                <div className='title'>
                    <span>Chat Settings</span>
                    <img src='./arrowUp.png' alt=''/>
                </div>
            </div>
            <div className='option'>
                <div className='title'>
                    <span>Privacy and Help</span>
                    <img src='./arrowUp.png' alt=''/>
                </div>
            </div>
        </div>
        <div className='bottom'>
            <button onClick={() => auth.signOut()}>Logout</button>
        </div>
    </div>
  );
}

export default Details;