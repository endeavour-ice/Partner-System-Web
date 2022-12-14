import {ref} from "vue";
import {getCurrentUser} from "../services/users";
import {getMessages} from "../services/MeesageUtils";
import {Notify, Toast} from "vant";
import {useRouter} from "vue-router";

import {chatStateEnum} from "../states/chat";
import {messageType} from "../services/MessageType";
const socketList:any = ref([])
const message = ref('')
let socket: any;
let cloneTime: any;
const router = useRouter();
const initSocket = async () => {
    const user = await getCurrentUser();
    if (user == null) {
        Toast.fail("未登录,请重试")
        router.back();
        return;
    }
    const userId = user.id;
    socket =getSocket();
    socket.onopen = () => {
        // 构建发给服务器的消息体
        if (userId == null) {
            return;
        }
        // const message = getMessage(0, userId, null, null, null, null);
        const message = getMessages(0, userId);
        // 发送消息
        sendSocket(JSON.stringify(message));
        // 定时发送心跳包
        try {
            cloneTime =setInterval(() => {
                keepalive();
            }, 10000);
        } catch (e){

            initSocket()
        }
    };
    socket.onclose =  () => {
        socketList.value = [];
        clearInterval(cloneTime)
        socket = null;
    };

    socket.onerror =  () => {
        socketList.value = [];
        clearInterval(cloneTime)
        socket = null;
    };
    socket.onmessage=(msg:any) => {
        const chatRecord: messageType = JSON.parse(msg.data);
        if (chatRecord.type === 2){

        }else if (chatRecord.type === 1) {

        }
        if (chatRecord.chatRecord.message != null) {
            message.value = chatRecord.chatRecord.message;
            Notify({
                message: message.value,
                color: '#333',
                background: '#FFFAFA',
            });
        }

    }

}

const sendSocket = async (msg: string) => {
    if (socket != null && socket.readyState == WebSocket.OPEN) {
        socket.send(msg);
    } else {
        socket = getSocket();
        // 异步调用需要设置延时
        setTimeout( () => {
            // 重新连接
            socket.send(msg);
        }, 1000);
    }
}

const getOnMessage = () => {
    return null;
}

const keepalive =  async () =>{
    // 构建对象
    const heartMessage = getMessages(chatStateEnum.XT);
    await sendSocket(JSON.stringify(heartMessage));
}
const getSocket = () => {
    // 如果当前状态已经连接，无需再次初始化websocket
    if (socket != null && socket.readyState == WebSocket.OPEN) {
        return socket;
    }
    if (socketList.value.length === 0) {
        // socket = new WebSocket("ws://localhost:9001/ws");
        // const sockets = new WebSocket("ws://localhost:9001/ws");
        const sockets = new WebSocket("ws://47.92.124.72:9001/ws");
        socketList.value.push(sockets)
    }
    socket = socketList.value[0];
    return socketList.value[0];

    // return socket;
}
export default {
    initSocket,
    sendSocket,
    getSocket,
    getOnMessage
}
