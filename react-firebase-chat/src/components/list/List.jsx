import Chatlist from './chatlist/Chatlist';
import './list.css';
import UserInfo from './userInfo/UserInfo';

function List() {
  return (
    <div className='list'>
        <UserInfo/>
        <Chatlist/>
    </div>
  );
}

export default List;