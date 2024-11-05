import React, { useState } from 'react';
import { Button, Modal } from 'semantic-ui-react';
import { ChatContainer, MessageList, Message, MessageInput } from '@chatscope/chat-ui-kit-react';
import axios from 'axios';
import '@chatscope/chat-ui-kit-styles/dist/default/styles.min.css';

const ChatGPTButton: React.FC = () => {
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

        try {
            const res = await axios.post('https://api.openai.com/v1/chat/completions', {
                model: 'gpt-3.5-turbo',
                messages: [...messages, { role: 'user', content: message }],
            }, {
                headers: {
                    'Authorization': `Bearer ${process.env.REACT_APP_OPENAI_API_KEY}`,
                    'Content-Type': 'application/json',
                },
            });

            const botResponse = {
                message: res.data.choices[0].message.content,
                sentTime: "just now",
                sender: 'bot',
                direction: 'incoming',
                position: 'single',
            };
            setMessages((prevMessages) => [...prevMessages, botResponse]);
        } catch (error) {
            console.error('Error fetching data from OpenAI:', error);
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
            <Button circular onClick={handleToggle} className="chatgpt-button flex items-center">
                <img src={`${process.env.PUBLIC_URL}/chatgpt-logo.png`} alt="ChatGPT Logo" style={{ width: '18px', height: '18px' }} />
            </Button>
            <Modal open={open} onClose={handleToggle} size="small">
                <Modal.Header>ChatGPT-3.5 Turbo</Modal.Header>
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

export default ChatGPTButton;
