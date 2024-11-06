import React, { useState } from 'react';
import { Button, Modal } from 'semantic-ui-react';
import { ChatContainer, MessageList, Message, MessageInput } from '@chatscope/chat-ui-kit-react';
import '@chatscope/chat-ui-kit-styles/dist/default/styles.min.css';
const { GoogleGenerativeAI } = require("@google/generative-ai");

const GoogleGeminiButton: React.FC = () => {
    const [open, setOpen] = useState(false);
    const [messages, setMessages] = useState<any[]>([]);
    const [input, setInput] = useState('');

    const handleToggle = () => setOpen(!open);

    const handleSend = async (message: string) => {
        const userMessage = {
            message,
            sentTime: "just now",
            sender: 'user',
            direction: 'outgoing',
            position: 'single',
        };

        setMessages((prevMessages) => [...prevMessages, userMessage]);
        setInput('');

        // Initialize Google Generative AI client
        const genAI = new GoogleGenerativeAI(process.env.REACT_APP_GOOGLE_API_KEY);
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

        try {
            // Call the Gemini API with the user input as the prompt
            const result = await model.generateContent(message);

            const botResponse = {
                message: result.response.text(),
                sentTime: "just now",
                sender: 'bot',
                direction: 'incoming',
                position: 'single',
            };

            setMessages((prevMessages) => [...prevMessages, botResponse]);
        } catch (error) {
            console.error('Error fetching data from Google Gemini:', error);
            const errorMessage = {
                message: 'Error fetching data. Please try again.',
                sentTime: "just now",
                sender: 'bot',
                direction: 'incoming',
                position: 'single',
            };
            setMessages((prevMessages) => [...prevMessages, errorMessage]);
        }
    };

    return (
        <>
            <Button circular color="black" onClick={handleToggle} className="chatgpt-button flex items-center">
                <img src={`${process.env.PUBLIC_URL}/gemini-logo.png`} alt="ChatGPT Logo" style={{ width: '55px', height: '18px' }} />
            </Button>
            <Modal open={open} onClose={handleToggle} size="small">
                <Modal.Header>Google Gemini</Modal.Header>
                <Modal.Content>
                    <ChatContainer>
                        <MessageList>
                            {messages.map((msg, index) => (
                                <Message key={index} model={{
                                    message: msg.message,
                                    sentTime: msg.sentTime,
                                    sender: msg.sender,
                                    direction: msg.direction,
                                    position: msg.position,
                                }} />
                            ))}
                        </MessageList>
                        <MessageInput
                            placeholder="Type your message..."
                            value={input}
                            onChange={(val) => setInput(val)}
                            onSend={() => {
                                handleSend(input);
                            }}
                            attachButton={false}
                        />
                    </ChatContainer>
                </Modal.Content>
                <Modal.Actions>
                    <Button onClick={handleToggle}>Close</Button>
                </Modal.Actions>
            </Modal>
        </>
    );
};

export default GoogleGeminiButton;
