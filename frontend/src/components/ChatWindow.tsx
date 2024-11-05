import React, { useEffect, useRef, useState } from "react";
import { IoMdSend } from "react-icons/io";
import io, { Socket } from "socket.io-client";

interface ChatWindowProps {
    roomId: string;
}

const ChatWindow: React.FC<ChatWindowProps> = ({roomId}) => {

    const socketRef = useRef<any>(null);
    const [userMessage, setUserMessage] = useState('');
    const chatboxRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        socketRef.current = io("http://localhost:3003");
        socketRef.current.emit("joinRoom", roomId);
        socketRef.current.on("receive", (data: {msg: string }) => {
            receiveMessage(data.msg)
        });

        return () => {
            socketRef.current?.disconnect();
        }
    }, [])

    const receiveMessage = (message : string) => {
        if (chatboxRef.current){
            const messageElement = document.createElement("div");
            messageElement.classList.add("mb-2");
            messageElement.innerHTML = `<p class="bg-blue-500 text-white rounded-lg py-2 px-4 inline-block">${message}</p>`;
            chatboxRef.current.appendChild(messageElement);
            chatboxRef.current.scrollTop = chatboxRef.current.scrollHeight;
        }
    };

    const sendMessage = () => {
        if (chatboxRef.current){
            const messageElement = document.createElement("div");
            messageElement.classList.add("mb-2", "text-right");
            messageElement.innerHTML = `<p class="bg-blue-500 text-white rounded-lg py-2 px-4 inline-block">${userMessage}</p>`;
            chatboxRef.current.appendChild(messageElement);
            chatboxRef.current.scrollTop = chatboxRef.current.scrollHeight;
        }
        setUserMessage('');
        socketRef.current?.emit("send", { roomId, msg: userMessage });
    
    }

    

    return (
        <div className="bg-[#2A2A2A] shadow-md rounded-lg max-w-lg w-full outline outline-1">

            <div id="chatbox" ref={chatboxRef} className="p-4 h-80 overflow-y-auto">

                {/* <div className="mb-2 text-right">
                    <p className="bg-blue-500 text-white rounded-lg py-2 px-4 inline-block">this is user</p>
                </div>
                <div className="mb-2">
                    <p className="bg-blue-500 text-white rounded-lg py-2 px-4 inline-block">This is matched user</p>
                </div>
                <div className="mb-2 text-right">
                    <p className="bg-blue-500 text-white rounded-lg py-2 px-4 inline-block">this is user</p>
                </div>
                <div className="mb-2">
                    <p className="bg-blue-500 text-white rounded-lg py-2 px-4 inline-block">this is matched user</p>
                </div>
                <div className="mb-2 text-right">
                    <p className="bg-blue-500 text-white rounded-lg py-2 px-4 inline-block">this is user</p>
                </div>
                <div className="mb-2">
                    <p className="bg-blue-500 text-white rounded-lg py-2 px-4 inline-block">this is matched user</p>
                </div>  */}
            </div>
            <div className="p-4 border-t flex gap-2 bg-[#121212]">
                <input id="user-input" 
                type="text" 
                value={userMessage} 
                onChange={(e) => setUserMessage(e.target.value)} 
                onKeyUp={(e) => e.key === 'Enter' && sendMessage()} 
                placeholder="Type a message" 
                className="w-full px-3 py-2 border rounded-md bg-[#2A2A2A] text-white" />
                <button id = "send-button" onClick={sendMessage} className=""><IoMdSend size={28} /></button>
            </div>
        </div>)
}

export default ChatWindow;