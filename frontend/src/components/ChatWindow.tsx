import React from "react";
import { IoMdSend } from "react-icons/io";

const ChatWindow = () => {
    return (
        <div className="bg-[#2A2A2A] shadow-md rounded-lg max-w-lg w-full outline outline-1">

            <div id="chatbox" className="p-4 h-80 overflow-y-auto">

                <div className="mb-2 text-right">
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
                </div>
            </div>
            <div className="p-4 border-t flex gap-2 bg-[#121212]">
                <input id="user-input" type="text" placeholder="Type a message" className="w-full px-3 py-2 border rounded-md bg-[#2A2A2A] text-white" />
                <button className=""><IoMdSend size={28} /></button>
            </div>
        </div>)
}

export default ChatWindow;