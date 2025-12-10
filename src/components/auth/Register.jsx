import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { Link } from 'react-router-dom';

const Register = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const navigate = useNavigate();
  const { register } = useContext(AuthContext);

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      if (password !== confirmPassword) {
        throw new Error('Passwords do not match');
      }
      const result = await register(name, email, password);
      if (result.success) {
        navigate('/auth/login');
      } else {
        alert(result.message || 'Registration failed');
      }
    } catch (error) {
      alert(error.message || 'An error occurred');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-brand-bg relative overflow-hidden">
      {/* Background Glow Effects */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-brand-primary/20 rounded-full blur-3xl translate-x-1/2 -translate-y-1/2"></div>
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-brand-secondary/20 rounded-full blur-3xl -translate-x-1/2 translate-y-1/2"></div>

      <div className="bg-brand-surface p-8 rounded-2xl shadow-2xl w-96 border border-white/10 relative z-10">
        <h2 className="text-3xl font-bold mb-6 text-brand-text text-center">Create Account</h2>
        <form onSubmit={handleRegister}>
          <div className="mb-4">
            <label className="block text-sm font-medium text-brand-muted mb-1">Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mt-1 p-3 w-full bg-brand-bg border border-white/10 rounded-lg text-brand-text focus:outline-none focus:ring-2 focus:ring-brand-primary transition-all"
              required
            />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium text-brand-muted mb-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 p-3 w-full bg-brand-bg border border-white/10 rounded-lg text-brand-text focus:outline-none focus:ring-2 focus:ring-brand-primary transition-all"
              required
            />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium text-brand-muted mb-1">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 p-3 w-full bg-brand-bg border border-white/10 rounded-lg text-brand-text focus:outline-none focus:ring-2 focus:ring-brand-primary transition-all"
              required
            />
          </div>
          <div className="mb-6">
            <label className="block text-sm font-medium text-brand-muted mb-1">Confirm Password</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="mt-1 p-3 w-full bg-brand-bg border border-white/10 rounded-lg text-brand-text focus:outline-none focus:ring-2 focus:ring-brand-primary transition-all"
              required
            />
          </div>
          <button type="submit" className="w-full bg-brand-primary text-white p-3 rounded-lg hover:bg-orange-600 transition-all font-bold shadow-glow hover:shadow-glow-hover">
            Register
          </button>
        </form>
        <p className="mt-6 text-center text-brand-muted">
          Already have an account? <Link to="/auth/login" className="text-brand-secondary hover:text-white transition-colors font-semibold">Login</Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
