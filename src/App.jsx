import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import VirtualMagazine from './components/VirtualMagazine';
import Login from './auth/Login';
import Register from './auth/Register';
import { AuthProvider } from './context/AuthContext';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<VirtualMagazine />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;