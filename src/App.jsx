import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import VirtualMagazine from './components/VirtualMagazine';
import Login from './components/auth/Login';
import Register from './components/auth/Register';
import ArticleDetail from './components/ArticleDetail'
import { AuthProvider } from './context/AuthContext';
import UserProfile from './components/UserProfile'; // Create this component

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<VirtualMagazine />} />
          <Route path="/auth/login" element={<Login />} />
          <Route path="/auth/register" element={<Register />} />
          <Route path="/article/:id" element={<ArticleDetail />} />
          <Route path="/user/:id" element={<UserProfile />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;