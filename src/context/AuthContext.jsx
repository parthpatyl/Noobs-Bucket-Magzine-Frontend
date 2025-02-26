import { createContext, useState } from 'react';
import { API_BASE_URL } from '../utils/api';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

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
        const response = await axios.post(`${API_BASE_URL}/auth/login`, { 
            email, 
            password 
        }, { withCredentials: true });

        console.log("🔍 Full API Response:", response);

        if (!response.data || !response.data.success) {
            console.error("❌ Login failed:", response.data);
            return { success: false, message: "Invalid login response" }; // ✅ Fix: Return proper error response
        }

        setUser(response.data.user);
        localStorage.setItem("user", JSON.stringify(response.data.user));

        console.log("✅ User logged in:", response.data.user);

        return { success: true, user: response.data.user }; // ✅ Fix: Ensure login function returns correct data
    } catch (error) {
        console.error("❌ Error during login:", error.response?.data || error.message);
        return { success: false, message: error.response?.data?.message || "Login failed" }; // ✅ Fix: Return error object
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