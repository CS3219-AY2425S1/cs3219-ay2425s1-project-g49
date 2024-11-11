import React, { useEffect, useRef, useState } from "react";
import { IoMdSend } from "react-icons/io";
import io from "socket.io-client";

interface ChatWindowProps {
    roomId: string;
}

const ChatWindow: React.FC<ChatWindowProps> = ({ roomId }) => {
    const socketRef = useRef<any>(null);
    const [userMessage, setUserMessage] = useState('');
    const [messages, setMessages] = useState<string[]>([]);
    const chatboxRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        const storedMessages = localStorage.getItem(`chat_${roomId}`);
        if (storedMessages) {
            setMessages(JSON.parse(storedMessages));
        }

        socketRef.current = io("http://localhost:3003");
        socketRef.current.emit("joinRoom", roomId);
        socketRef.current.on("receive", (data: { msg: string }) => {
            receiveMessage(data.msg);
        });

        return () => {
            socketRef.current?.disconnect();
        };
    }, [roomId]);

    useEffect(() => {
        if (chatboxRef.current) {
            chatboxRef.current.scrollTop = chatboxRef.current.scrollHeight;
        }
    }, [messages]);

    const receiveMessage = (message: string) => {
        addMessage(message);
    };

    const sendMessage = () => {
        if (userMessage.trim()) {
            addMessage(userMessage, true);
            socketRef.current?.emit("send", { roomId, msg: userMessage });
            setUserMessage('');
        }
    };

    const addMessage = (message: string, isUser: boolean = false) => {
        const newMessage = isUser
            ? `<div class="mb-2 text-right"><p class="bg-blue-500 text-white rounded-lg py-2 px-4 inline-block">${message}</p></div>`
            : `<div class="mb-2"><p class="bg-blue-500 text-white rounded-lg py-2 px-4 inline-block">${message}</p></div>`;

        setMessages((prevMessages) => {
            const updatedMessages = [...prevMessages, newMessage];
            localStorage.setItem(`chat_${roomId}`, JSON.stringify(updatedMessages));
            return updatedMessages;
        });
    };

    return (
        <div className="bg-[#2A2A2A] shadow-md rounded-lg max-w-lg w-full outline outline-1">
            <div id="chatbox" ref={chatboxRef} className="p-4 h-80 overflow-y-auto">
                {messages.map((msg, index) => (
                    <div key={index} dangerouslySetInnerHTML={{ __html: msg }} />
                ))}
            </div>
            <div className="p-4 border-t flex gap-2 bg-[#121212]">
                <input
                    id="user-input"
                    type="text"
                    value={userMessage}
                    onChange={(e) => setUserMessage(e.target.value)}
                    onKeyUp={(e) => e.key === 'Enter' && sendMessage()}
                    placeholder="Type a message"
                    className="w-full px-3 py-2 border rounded-md bg-[#2A2A2A] text-white"
                />
                <button id="send-button" onClick={sendMessage} className="">
                    <IoMdSend size={28} />
                </button>
            </div>
        </div>
    );
};

export default ChatWindow;
