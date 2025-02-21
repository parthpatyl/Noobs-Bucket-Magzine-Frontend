import { createContext, useState } from 'react';
import { API_BASE_URL } from '../utils/api';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const storedUser = localStorage.getItem('user');
    return storedUser ? JSON.parse(storedUser) : null;
  });

  const register = async (name, email, password) => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }),
      });
  
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Registration failed');
      }
  
      if (data.success) {
        localStorage.setItem('user', JSON.stringify({
          ...data.user,
          memberSince: data.user.memberSince // Ensure this is included
        }));
        setUser(data.user);
      }
      return data;
    } catch (error) {
      console.error('Registration error:', error);
      return { success: false, message: error.message };
    }
  };
  
  // Update login function
  const login = async (email, password) => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
  
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Login failed');
      }
  
      if (data.success) {
        localStorage.setItem('user', JSON.stringify({
          ...data.user,
          memberSince: data.user.memberSince // Ensure this is included
        }));
        setUser(data.user);
      }
      return data;
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, message: error.message };
    }
  };
  
  const logout = () => {
    localStorage.removeItem('user');
    setUser(null);
  };

  const updateUser = async (userId, updates) => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/user/${userId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });
      const data = await response.json();
      if (data.success) {
        localStorage.setItem('user', JSON.stringify(data.user));
        setUser(data.user);
      }
      return data;
    } catch (error) {
      console.error('Update error:', error);
      return { success: false };
    }
  };

  const isAuthenticated = !!user;

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        login,
        register,
        logout,
        updateUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};