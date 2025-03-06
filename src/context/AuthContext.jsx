import { createContext, useState, useEffect } from "react";
import axios from "axios";

export const AuthContext = createContext();

// Use the same API_BASE_URL as in UserProfile
export const API_BASE_URL = "http://localhost:5000";

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
        setUser(fetchedUser);
        localStorage.setItem("user", JSON.stringify(fetchedUser));
        
        // Fetch liked and saved articles data separately to align with articleRoutes implementation
        await fetchLikedArticles(fetchedUser.id);
        await fetchSavedArticles(fetchedUser.id);
      } else {
        console.error("Failed to fetch user data");
      }
    } catch (error) {
      console.error("Error fetching user data:", error);
    }
  };

  // New function to fetch liked articles
  const fetchLikedArticles = async (userId) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/articles/liked/${userId}`);
      if (response.data && response.data.success) {
        // Store the actual article objects
        setLikedArticles(response.data.articles || []);
        localStorage.setItem("likedArticles", JSON.stringify(response.data.articles || []));
      }
    } catch (error) {
      console.error("Error fetching liked articles:", error);
    }
  };

  // New function to fetch saved articles
  const fetchSavedArticles = async (userId) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/articles/saved/${userId}`);
      if (response.data && response.data.success) {
        // Store the actual article objects
        setSavedArticles(response.data.articles || []);
        localStorage.setItem("savedArticles", JSON.stringify(response.data.articles || []));
      }
    } catch (error) {
      console.error("Error fetching saved articles:", error);
    }
  };

  // Toggle like for an article - matching the backend implementation
  const toggleLikeArticle = async (articleId) => {
    if (!user) return { success: false, message: "User not authenticated" };
    
    try {
      const response = await axios.post(
        `${API_BASE_URL}/api/articles/like/${articleId}`,
        { userId: user.id }
      );
      
      if (response.data && response.data.success) {
        // After successful toggle, fetch the updated article list
        await fetchLikedArticles(user.id);
        return { success: true };
      }
      return { success: false, message: "Failed to toggle like" };
    } catch (error) {
      console.error("Error toggling article like:", error);
      return { 
        success: false, 
        message: error.response?.data?.message || "Failed to toggle like" 
      };
    }
  };

  // Toggle save for an article - matching the backend implementation
  const toggleSaveArticle = async (articleId) => {
    if (!user) return { success: false, message: "User not authenticated" };
    
    try {
      const response = await axios.post(
        `${API_BASE_URL}/api/articles/save/${articleId}`,
        { userId: user.id }
      );
      
      if (response.data && response.data.success) {
        // After successful toggle, fetch the updated article list
        await fetchSavedArticles(user.id);
        return { success: true };
      }
      return { success: false, message: "Failed to toggle save" };
    } catch (error) {
      console.error("Error toggling article save:", error);
      return { 
        success: false, 
        message: error.response?.data?.message || "Failed to toggle save" 
      };
    }
  };

  // On component mount, if a user exists, fetch their complete data
  useEffect(() => {
    if (user) {
      fetchUserData(user.id);
    }
  }, [user?.id]); // Only depend on user.id to prevent infinite loops

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
      const response = await axios.put(`${API_BASE_URL}/auth/user/${userId}`, updates);
      const data = response.data;
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

  // Check if an article is liked
  const isArticleLiked = (articleId) => {
    return likedArticles.some(article => article._id === articleId);
  };

  // Check if an article is saved
  const isArticleSaved = (articleId) => {
    return savedArticles.some(article => article._id === articleId);
  };

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
        isArticleLiked,
        isArticleSaved,
        toggleLikeArticle,
        toggleSaveArticle,
        refreshUserData: () => user && fetchUserData(user.id),
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};