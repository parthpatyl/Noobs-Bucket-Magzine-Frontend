import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LandingPage from './components/LandingPage';
import MagazinePage from './components/MagazinePage';
import EditionPage from './components/EditionPage';
import Login from './components/auth/Login';
import Register from './components/auth/Register';
import ArticleDetail from './components/ArticleDetail';
import { AuthProvider } from './context/AuthContext';
import UserProfile from './components/UserProfile';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/magazine" element={<MagazinePage />} />
          <Route path="/auth/login" element={<Login />} />
          <Route path="/auth/register" element={<Register />} />
          <Route path="/article/:id" element={<ArticleDetail />} />
          <Route path="/edition/:date" element={<EditionPage />} />
          <Route path="/user/:id" element={<UserProfile />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;