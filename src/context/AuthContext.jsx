import { createContext, useState, useEffect } from "react";
import axios from "axios";

export const AuthContext = createContext();

const API_BASE_URL = "http://localhost:5000"; // Adjust based on your backend

export const AuthProvider = ({ children }) => {
  // Initialize user from localStorage if available
  const [user, setUser] = useState(() => {
    const storedUser = localStorage.getItem("user");
    return storedUser ? JSON.parse(storedUser) : null;
  });

  // Initialize liked and saved articles from localStorage
  const [likedArticles, setLikedArticles] = useState(() => {
    return JSON.parse(localStorage.getItem("likedArticles")) || [];
  });
  const [savedArticles, setSavedArticles] = useState(() => {
    return JSON.parse(localStorage.getItem("savedArticles")) || [];
  });

  // Fetch complete user data (including liked & saved articles) from backend
  const fetchUserData = async (userId) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/auth/user/${userId}`, { withCredentials: true });
      if (response.data && response.data.success) {
        const fetchedUser = response.data.user;
        // Ensure the user has an "id" field (fallback to _id)
        fetchedUser.id = fetchedUser._id || fetchedUser.id;
        setLikedArticles(fetchedUser.likedArticles || []);
        setSavedArticles(fetchedUser.savedArticles || []);
        localStorage.setItem("likedArticles", JSON.stringify(fetchedUser.likedArticles || []));
        localStorage.setItem("savedArticles", JSON.stringify(fetchedUser.savedArticles || []));
      } else {
        console.error("Failed to fetch user data");
      }
    } catch (error) {
      console.error("Error fetching user data:", error);
    }
  };

  // On component mount, if a user exists, fetch their complete data
  useEffect(() => {
    if (user) {
      fetchUserData(user.id);
    }
  }, [user]);

  // Update localStorage when liked/saved articles change
  useEffect(() => {
    if (user) {
      localStorage.setItem("likedArticles", JSON.stringify(likedArticles));
      localStorage.setItem("savedArticles", JSON.stringify(savedArticles));
    }
  }, [likedArticles, savedArticles, user]);

  // Login function: after login, update user state and fetch full user data
  const login = async (email, password) => {
    try {
      const response = await axios.post(
        `${API_BASE_URL}/auth/login`,
        { email, password },
        { withCredentials: true }
      );

      if (!response.data || !response.data.success) {
        return { success: false, message: "Invalid login response" };
      }

      const loggedInUser = response.data.user;
      // Ensure user has an "id" field (use _id if necessary)
      loggedInUser.id = loggedInUser._id || loggedInUser.id;
      setUser(loggedInUser);
      localStorage.setItem("user", JSON.stringify(loggedInUser));

      // Immediately fetch complete user data to update liked/saved articles
      await fetchUserData(loggedInUser.id);

      return { success: true, user: loggedInUser };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || "Login failed",
      };
    }
  };

  // Logout function: clear user and articles data, then refresh the page
  const logout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("likedArticles");
    localStorage.removeItem("savedArticles");
    setUser(null);
    setLikedArticles([]);
    setSavedArticles([]);
    setTimeout(() => {
      window.location.reload();
    }, 100);
  };

  // Update user info in backend and update local state
  const updateUser = async (userId, updates) => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/user/${userId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });
      const data = await response.json();
      if (data.success) {
        // Create updated user by merging current user with updates
        const updatedUser = { ...user, ...updates };
        localStorage.setItem('user', JSON.stringify(updatedUser));
        setUser(updatedUser);
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
        logout,
        updateUser,
        likedArticles,
        savedArticles,
        setLikedArticles,
        setSavedArticles,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
