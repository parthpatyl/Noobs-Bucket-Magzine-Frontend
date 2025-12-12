import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LandingPage from './components/LandingPage';
import MagazinePage from './components/MagazinePage';
import Login from './components/auth/Login';
import Register from './components/auth/Register';
import ArticleDetail from './components/ArticleDetail';
import { AuthProvider } from './context/AuthContext';
import { NotificationProvider } from './components/Notification';
import UserProfile from './components/UserProfile';
import SavedArticlesPage from './components/SavedArticlesPage';
import LikedArticlesPage from './components/LikedArticlesPage';

function App() {
  return (
    <AuthProvider>
      <NotificationProvider>
        <Router>
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/magazine" element={<MagazinePage />} />
            <Route path="/auth/login" element={<Login />} />
            <Route path="/auth/register" element={<Register />} />
            <Route path="/article/:id" element={<ArticleDetail />} />
            <Route path="/user/:id" element={<UserProfile />} />
            <Route path="/user/:id/saved" element={<SavedArticlesPage />} />
            <Route path="/user/:id/liked" element={<LikedArticlesPage />} />
          </Routes>
        </Router>
      </NotificationProvider>
    </AuthProvider>
  );
}

export default App;