import React, { useEffect, useState } from 'react';
import { Button } from 'semantic-ui-react';
import io from 'socket.io-client';
const { GoogleGenerativeAI } = require('@google/generative-ai');

interface GoogleGeminiButtonProps {
  question: string;  // The current coding question in the editor
  code: string;      // The current code in the editor
  roomId: string;    // The collaboration room ID
}

const GoogleGeminiButton: React.FC<GoogleGeminiButtonProps> = ({ question, code, roomId }) => {
  const [isActive, setIsActive] = useState(false);

  const generateHint = async () => {
    const genAI = new GoogleGenerativeAI(process.env.REACT_APP_GOOGLE_API_KEY);
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    try {
      const result = await model.generateContent(
        `Give a either a one-line 'potential error', 'code suggestions', 'explanation/tutorial' for solving this coding question: ${question}. Our code:\n\n${code}, your response should be smart and not be repetitive (varied everytime)`
      );

      const hintMessage = result.response.text();
      const socket = io('http://localhost:3003');
      socket.emit('send', { roomId, msg: hintMessage });

    } catch (error) {
      console.error('Error fetching data from Google Gemini:', error);
      const errorMessage = 'Error fetching hint. Please try again later.';
      const socket = io('http://localhost:3003');
      socket.emit('send', { roomId, msg: errorMessage });
    }
  };

  useEffect(() => {
    let intervalId: NodeJS.Timeout | null = null;  // Initialize intervalId as null

    if (isActive) {
      // generate a hint every 30 seconds
      alert("Gemini API enabled and will generate hints every 30 seconds.");
      intervalId = setInterval(generateHint, 30000);
    } else {
      if (intervalId) {
        clearInterval(intervalId);
      }
    }

    // Cleanup function to clear the interval when toggled off
    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [isActive, question, code, roomId]);

  const toggleHintGeneration = () => {
    setIsActive((prevState) => !prevState);
  };

  return (
    <Button
      circular
      color={isActive ? 'black' : 'red'}
      onClick={toggleHintGeneration}
      className="gemini-button flex items-center"
    >
      <img
        src={`${process.env.PUBLIC_URL}/gemini-logo.png`}
        alt="Gemini Logo"
        style={{ width: '55px', height: '18px' }}
      />
    </Button>
  );
};

export default GoogleGeminiButton;