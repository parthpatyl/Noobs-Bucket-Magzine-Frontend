import { createContext, useState, useEffect } from "react";
import axios from "axios";
import { debounce } from "lodash"; // Add lodash for debouncing

export const AuthContext = createContext();

const API_BASE_URL = "http://localhost:5000"; // Our steadfast backend endpoint

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(false);
  const [likedArticles, setLikedArticles] = useState([]);
  const [savedArticles, setSavedArticles] = useState([]);

  const offlineQueue = [];

  const debouncedUpdateLocalStorage = debounce((key, value) => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (err) {
      console.error(`Error writing ${key} to localStorage`, err);
    }
  }, 500);

  // Fetch user data from backend on mount
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        // Validate user data structure
        if (parsedUser && typeof parsedUser === 'object' && parsedUser._id) {
          setUser(parsedUser);
          setIsAuthenticated(true);
          setLikedArticles(parsedUser.likedArticles || []);
          setSavedArticles(parsedUser.savedArticles || []);
        }
      } catch (error) {
        console.error("Failed to parse user data from localStorage:", error);
        localStorage.removeItem("user");
      }
    }
  }, []);

  const fetchUserData = async (userId) => {
    try {
      // If userId isn't provided, try to fetch from a generic endpoint
      // that returns the current session's user data
      const idToFetch = userId || ""; // Adjust if your backend supports session-based fetching
      const response = await axios.get(`${API_BASE_URL}/auth/user/${idToFetch}`, {
        withCredentials: true,
        headers: { "Accept": "application/json" }
      });
      if (response.data && response.data.user) {
        const userData = response.data.user;
        setUser(userData);
        setIsAuthenticated(true);
        if (userData.likedArticles) {
          setLikedArticles(userData.likedArticles);
        }
        if (userData.savedArticles) {
          setSavedArticles(userData.savedArticles);
        }
      } else {
        console.error("Failed to fetch user data:", response.data);
      }
    } catch (error) {
      console.error("Error fetching user data:", error);
    }
  };

  const login = async (email, password) => {
    setLoading(true);
    try {
      const response = await axios.post(
        `${API_BASE_URL}/auth/login`,
        { email, password },
        {
          withCredentials: true,
          headers: { "Content-Type": "application/json", "Accept": "application/json" }
        }
      );
      const data = response.data;
      if (!data.success) {
        throw new Error(data.message || "Login failed");
      }
      const userData = { ...data.user, _id: data.user._id || data.user.id };
      setUser(userData);
      setIsAuthenticated(true);
      if (userData.likedArticles) {
        setLikedArticles(userData.likedArticles);
      }
      if (userData.savedArticles) {
        setSavedArticles(userData.savedArticles);
      }
      try {
        localStorage.setItem("user", JSON.stringify(userData));
      } catch (error) {
        console.warn("Failed to save user data to localStorage:", error);
        // App continues to work without localStorage persistence
      }
      return { success: true, user: userData };
    } catch (error) {
      console.error("Login error:", error);
      return { success: false, message: error.message };
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      await axios.post(`${API_BASE_URL}/auth/logout`, {}, { withCredentials: true });
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      setUser(null);
      setIsAuthenticated(false);
      setLikedArticles([]);
      setSavedArticles([]);
      try {
        localStorage.removeItem("user");
      } catch (error) {
        console.error("Error removing user from localStorage:", error);
      }
    }
  };

  const register = async (name, email, password) => {
    setLoading(true);
    try {
      const response = await axios.post(
        `${API_BASE_URL}/auth/register`,
        { name, email, password },
        { headers: { "Content-Type": "application/json" } }
      );
      const data = response.data;
      if (response.status !== 201 || !data.success) {
        throw new Error(data.message || "Registration failed");
      }
      return { success: true };
    } catch (error) {
      console.error("Registration error:", error);
      return { success: false, message: error.message };
    } finally {
      setLoading(false);
    }
  };

  const updateUser = async (updatedData) => {
    try {
      const updatedUser = { ...user, ...updatedData };
      setUser(updatedUser);
      return { success: true };
    } catch (error) {
      console.error("Update user error:", error);
      return { success: false, message: error.message };
    }
  };

  const syncOfflineActions = async () => {
    while (offlineQueue.length > 0) {
      const action = offlineQueue.shift();
      try {
        await action();
      } catch (error) {
        console.error("Failed to sync offline action:", error);
        offlineQueue.unshift(action); // Re-add to queue if it fails
        break;
      }
    }
  };

  const likeArticle = async (articleId) => {
    if (!user) return { success: false, message: "Not authenticated" };
    const action = async () => {
      await axios.post(`${API_BASE_URL}/api/articles/like/${articleId}`, { userId: user._id }, { withCredentials: true });
      fetchUserData(user._id);
    };
    if (navigator.onLine) {
      try {
        await action();
        return { success: true };
      } catch (error) {
        console.error("Like article error:", error);
        return { success: false, message: error.message };
      }
    } else {
      offlineQueue.push(action);
      setLikedArticles((prev) => [...prev, articleId]); // Optimistic update
      debouncedUpdateLocalStorage("likedArticles", [...likedArticles, articleId]);
      return { success: true, message: "Action queued for offline sync" };
    }
  };

  const unlikeArticle = async (articleId) => {
    if (!user) return { success: false, message: "Not authenticated" };
    const action = async () => {
      await axios.post(`${API_BASE_URL}/api/articles/unlike/${articleId}`, { userId: user._id }, { withCredentials: true });
      fetchUserData(user._id);
    };
    if (navigator.onLine) {
      try {
        await action();
        return { success: true };
      } catch (error) {
        console.error("Unlike article error:", error);
        return { success: false, message: error.message };
      }
    } else {
      offlineQueue.push(action);
      setLikedArticles((prev) => prev.filter((id) => id !== articleId)); // Optimistic update
      debouncedUpdateLocalStorage("likedArticles", likedArticles.filter((id) => id !== articleId));
      return { success: true, message: "Action queued for offline sync" };
    }
  };

  const saveArticle = async (articleId) => {
    if (!user) return { success: false, message: "Not authenticated" };
    const action = async () => {
      await axios.post(`${API_BASE_URL}/api/articles/save/${articleId}`, { userId: user._id }, { withCredentials: true });
      fetchUserData(user._id);
    };
    if (navigator.onLine) {
      try {
        await action();
        return { success: true };
      } catch (error) {
        console.error("Save article error:", error);
        return { success: false, message: error.message };
      }
    } else {
      offlineQueue.push(action);
      setSavedArticles((prev) => [...prev, articleId]); // Optimistic update
      debouncedUpdateLocalStorage("savedArticles", [...savedArticles, articleId]);
      return { success: true, message: "Action queued for offline sync" };
    }
  };

  const unsaveArticle = async (articleId) => {
    if (!user) return { success: false, message: "Not authenticated" };
    const action = async () => {
      await axios.post(`${API_BASE_URL}/api/articles/unsave/${articleId}`, { userId: user._id }, { withCredentials: true });
      fetchUserData(user._id);
    };
    if (navigator.onLine) {
      try {
        await action();
        return { success: true };
      } catch (error) {
        console.error("Unsave article error:", error);
        return { success: false, message: error.message };
      }
    } else {
      offlineQueue.push(action);
      setSavedArticles((prev) => prev.filter((id) => id !== articleId)); // Optimistic update
      debouncedUpdateLocalStorage("savedArticles", savedArticles.filter((id) => id !== articleId));
      return { success: true, message: "Action queued for offline sync" };
    }
  };

  useEffect(() => {
    if (navigator.onLine) {
      syncOfflineActions();
    }
    const handleOnline = () => syncOfflineActions();
    window.addEventListener("online", handleOnline);
    return () => window.removeEventListener("online", handleOnline);
  }, []);

  const contextValue = {
    user,
    isAuthenticated,
    loading,
    login,
    logout,
    register,
    updateUser,
    likedArticles,
    savedArticles,
    likeArticle,
    unlikeArticle,
    saveArticle,
    unsaveArticle
  };

  return <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>;
};

export default AuthProvider;
