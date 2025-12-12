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
        // Update localStorage with fresh data from server
        try {
          localStorage.setItem("user", JSON.stringify(userData));
        } catch (e) {
          console.warn("Failed to update localStorage after fetch", e);
        }
      } else {
        console.error("Failed to fetch user data:", response.data);
      }
    } catch (error) {
      console.error("Error fetching user data:", error);
    }
  };

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

          // Sync with server to get latest state
          fetchUserData(parsedUser._id);
        }
      } catch (error) {
        console.error("Failed to parse user data from localStorage:", error);
        localStorage.removeItem("user");
      }
    }
  }, []);

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
      if (!user || !user._id) {
        throw new Error("User not authenticated");
      }

      // Optimistic update
      const updatedUser = { ...user, ...updatedData };
      setUser(updatedUser);
      
      // Update localStorage
      try {
        localStorage.setItem("user", JSON.stringify(updatedUser));
      } catch (error) {
        console.warn("Failed to update localStorage:", error);
      }

      // Call backend API
      const response = await axios.put(
        `${API_BASE_URL}/auth/user/${user._id}`,
        updatedData,
        {
          withCredentials: true,
          headers: { "Content-Type": "application/json" }
        }
      );

      if (response.data && response.data.user) {
        // Update with server response to ensure consistency
        setUser(response.data.user);
        try {
          localStorage.setItem("user", JSON.stringify(response.data.user));
        } catch (error) {
          console.warn("Failed to update localStorage with server response:", error);
        }
      }

      return { success: true };
    } catch (error) {
      console.error("Update user error:", error);
      // Revert optimistic update on error
      if (user) {
        setUser(user);
        try {
          localStorage.setItem("user", JSON.stringify(user));
        } catch (error) {
          console.warn("Failed to revert localStorage:", error);
        }
      }
      return { success: false, message: error.message };
    }
  };

  // Change user password
  const changePassword = async (currentPassword, newPassword) => {
    try {
      if (!user || !user._id) {
        throw new Error("User not authenticated");
      }

      const response = await axios.post(
        `${API_BASE_URL}/auth/change-password/${user._id}`,
        { currentPassword, newPassword },
        {
          withCredentials: true,
          headers: { "Content-Type": "application/json" }
        }
      );

      if (response.data && response.data.success) {
        return { success: true, message: response.data.message };
      } else {
        return { success: false, message: response.data.message || "Password change failed" };
      }
    } catch (error) {
      console.error("Change password error:", error);
      const errorMessage = error.response?.data?.message || error.message || "Failed to change password";
      return { success: false, message: errorMessage };
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

  // Helper to check if an article is in the list (handles both IDs and Objects)
  const isArticleInList = (list, articleId) => {
    return list.some(item => {
      const itemId = item._id || item;
      return itemId === articleId;
    });
  };

  const toggleLike = async (article) => {
    if (!user) return { success: false, message: "Not authenticated" };
    const articleId = article._id || article;

    const isLiked = isArticleInList(likedArticles, articleId);
    let updatedList;

    if (isLiked) {
      // Optimistic Unlike
      updatedList = likedArticles.filter(item => (item._id || item) !== articleId);
      setLikedArticles(updatedList);

      // Update user object and localStorage
      const updatedUser = { ...user, likedArticles: updatedList };
      setUser(updatedUser);
      debouncedUpdateLocalStorage("user", updatedUser);

      try {
        await axios.post(`${API_BASE_URL}/api/articles/unlike/${articleId}`, { userId: user._id }, { withCredentials: true });
        // Background sync to ensure consistency
        // fetchUserData(user._id); // Optional: can be removed if we trust the optimistic update + mount sync
        return { success: true, liked: false };
      } catch (error) {
        console.error("Unlike article error:", error);
        // Revert on error
        setLikedArticles(likedArticles);
        setUser(user); // Revert user state
        return { success: false, message: error.message };
      }
    } else {
      // Optimistic Like
      // If we have the full article object, store it, otherwise just the ID
      const itemToAdd = typeof article === 'object' ? article : articleId;
      updatedList = [...likedArticles, itemToAdd];
      setLikedArticles(updatedList);

      // Update user object and localStorage
      const updatedUser = { ...user, likedArticles: updatedList };
      setUser(updatedUser);
      debouncedUpdateLocalStorage("user", updatedUser);

      try {
        await axios.post(`${API_BASE_URL}/api/articles/like/${articleId}`, { userId: user._id }, { withCredentials: true });
        // fetchUserData(user._id);
        return { success: true, liked: true };
      } catch (error) {
        console.error("Like article error:", error);
        setLikedArticles(likedArticles);
        setUser(user);
        return { success: false, message: error.message };
      }
    }
  };

  const toggleSave = async (article) => {
    if (!user) return { success: false, message: "Not authenticated" };
    const articleId = article._id || article;

    const isSaved = isArticleInList(savedArticles, articleId);
    let updatedList;

    if (isSaved) {
      // Optimistic Unsave
      updatedList = savedArticles.filter(item => (item._id || item) !== articleId);
      setSavedArticles(updatedList);

      // Update user object and localStorage
      const updatedUser = { ...user, savedArticles: updatedList };
      setUser(updatedUser);
      debouncedUpdateLocalStorage("user", updatedUser);

      try {
        await axios.post(`${API_BASE_URL}/api/articles/unsave/${articleId}`, { userId: user._id }, { withCredentials: true });
        // fetchUserData(user._id);
        return { success: true, saved: false };
      } catch (error) {
        console.error("Unsave article error:", error);
        setSavedArticles(savedArticles);
        setUser(user);
        return { success: false, message: error.message };
      }
    } else {
      // Optimistic Save
      const itemToAdd = typeof article === 'object' ? article : articleId;
      updatedList = [...savedArticles, itemToAdd];
      setSavedArticles(updatedList);

      // Update user object and localStorage
      const updatedUser = { ...user, savedArticles: updatedList };
      setUser(updatedUser);
      debouncedUpdateLocalStorage("user", updatedUser);

      try {
        await axios.post(`${API_BASE_URL}/api/articles/save/${articleId}`, { userId: user._id }, { withCredentials: true });
        // fetchUserData(user._id);
        return { success: true, saved: true };
      } catch (error) {
        console.error("Save article error:", error);
        setSavedArticles(savedArticles);
        setUser(user);
        return { success: false, message: error.message };
      }
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
    changePassword,
    likedArticles,
    savedArticles,
    toggleLike,
    toggleSave
  };

  return <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>;
};

export default AuthProvider;
