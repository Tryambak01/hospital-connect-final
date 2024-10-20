// import {useParams} from 'react-router-dom';
import {ZegoUIKitPrebuilt} from "@zegocloud/zego-uikit-prebuilt";
import { useChatStore } from "../../lib/usechatstore";
import { useNavigate } from "react-router-dom";
import { useUserStore } from "../../lib/userstore";

const RoomPage = ({ onEnable }) => {
    // const{roomId} = useParams();

    const navigate = useNavigate();
    const {chatId} = useChatStore();
    const {currentUser} = useUserStore();

    const myMeeting = async (element) => {
        const appId = 95626341;
        const serverSecret = "a269af66cbcef2733af116054ec1a32e";
        const kitToken = ZegoUIKitPrebuilt.generateKitTokenForTest(appId, serverSecret, chatId, currentUser.email, currentUser.username);
        const zc = ZegoUIKitPrebuilt.create(kitToken);
        zc.joinRoom({
            container: element,
            maxUsers: 2,
            scenario: {
                mode: ZegoUIKitPrebuilt.OneONoneCall,
            },
            showScreenSharingButton: true,
            turnOnMicrophoneWhenJoining: false,
            turnOnCameraWhenJoining: false,
            showPreJoinView: false,

            onLeaveRoom: () => {
                onEnable();
                navigate('/');
            },
        });
    };

    return <div>
        <div ref={myMeeting} />
    </div>;
};

export default RoomPage;