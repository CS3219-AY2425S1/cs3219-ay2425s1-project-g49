import React, { useEffect, useState } from 'react';
import { Loader } from 'semantic-ui-react';
import { useNavigate } from 'react-router-dom';
import 'semantic-ui-css/semantic.min.css';

const LoadingPage: React.FC = () => {
  const navigate = useNavigate();
  const [countdown, setCountdown] = useState(30);
  const [matchFound, setMatchFound] = useState(false);

  useEffect(() => {

    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev === 1) {
          clearInterval(timer);
          // navigate('/profile');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [navigate]);


  const resetTimer = () => {
    setCountdown(5);
  };

  const conditionalRender = () => {
    if (countdown && !matchFound) {
      return (
        <Loader active inverted indeterminate size="massive" content={`Matching in ${countdown} seconds`} />
      )
    }
    else if (!countdown && !matchFound) {
      return (
        <div className='text-center'>
          <h1 className="text-4xl font-bold mb-4">Unable to find a match</h1>
          <h2 className="text-2xl font-medium mb-4">Retry matchmaking?</h2>
          <div className="flex space-x-5 justify-center">
            <button className="bg-blue-700 motion-safe:hover:scale-110 hover:bg-blue-500 text-white py-2 px-4 rounded-full transition" onClick={resetTimer}>
              Retry
            </button>
            <button className="bg-red-700 motion-safe:hover:scale-110 hover:bg-red-500 text-white py-2 px-4 rounded-full transition" onClick={() => navigate("/matching-page")}>
              Exit
            </button>
          </div>
        </div>
      )
    }
    else {
      return (
        <div>
          <h1 className="text-4xl font-bold mb-6">Match Found</h1>
          <div className="flex space-x-5 justify-center">
            <button className="bg-blue-600 motion-safe:hover:scale-110 hover:bg-blue-500 text-white py-2 px-4 rounded-full transition">
              Accept
            </button>
            <button className="bg-red-600 motion-safe:hover:scale-110 hover:bg-red-500 text-white py-2 px-4 rounded-full transition" onClick={() => navigate("/profile")}>
              Decline
            </button>
          </div>
        </div>
      )
    }
  }

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-900 text-white">
      {conditionalRender()}
    </div>
  );
};

export default LoadingPage;
