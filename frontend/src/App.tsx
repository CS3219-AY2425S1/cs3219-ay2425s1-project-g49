import React, { useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import LoginPage from './pages/LoginPage'
import ProfilePage from './pages/ProfilePage'
import QuestionServicePage from './pages/questionservicepage';
import { UserContextProvider } from './UserContextProvider';
import './App.css';

const App: React.FC = () => {
  useEffect(() => {
    document.documentElement.classList.add('dark');
  }, []);

  return (
    <UserContextProvider>

      <div className="App h-screen bg-gray-900 text-white">
        <Routes>
          <Route path='/' element={<LoginPage />} />
          <Route path='/login' element={<LoginPage />} />
          <Route path='/profile' element={<ProfilePage />} />
          <Route path="/questions-page" element={<QuestionServicePage />} />
        </Routes>
      </div>

    </UserContextProvider>
  );
};

export default App;
