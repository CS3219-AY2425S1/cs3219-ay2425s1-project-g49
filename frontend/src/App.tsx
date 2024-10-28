import React, { useEffect } from 'react';
import { Route, Routes } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import ProfilePage from './pages/ProfilePage';
import QuestionServicePage from './pages/questionservicepage';
import LoadingPage from './pages/loadingpage'; 
import MatchingPage from './pages/matchingpage';
import { UserContextProvider } from './UserContextProvider';
import './App.css';
import CollaborationPage from './pages/CollaborationPage';

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
          <Route path='/loading' element={<LoadingPage />} />
          <Route path='/profile' element={<ProfilePage />} />
          <Route path='/questions-page' element={<QuestionServicePage />} />
          <Route path='/matching-page' element={<MatchingPage />} />
          <Route path='/collaboration-page/room_id/:roomId' element={<CollaborationPage/>} />
          <Route path='/collaboration-page' element={<CollaborationPage/>} />
        </Routes>
      </div>
    </UserContextProvider>
  );
};

export default App;
