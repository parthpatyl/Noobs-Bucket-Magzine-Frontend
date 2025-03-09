import { createContext, useState, useEffect } from "react";
import axios from "axios";

export const AuthContext = createContext();

const API_BASE_URL = "http://localhost:5000"; // Our steadfast backend endpoint

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(false);
  const [likedArticles, setLikedArticles] = useState([]);
  const [savedArticles, setSavedArticles] = useState([]);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      const parsedUser = JSON.parse(storedUser);
      setUser(parsedUser);
      setIsAuthenticated(true);
      setLikedArticles(JSON.parse(localStorage.getItem("likedArticles") || "[]"));
      setSavedArticles(JSON.parse(localStorage.getItem("savedArticles") || "[]"));
      fetchUserData(parsedUser._id || parsedUser.id);
    }
  }, []);

  const fetchUserData = async (userId) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/auth/user/${userId}`, {
        withCredentials: true,
        headers: { "Accept": "application/json" }
      });
      if (response.data && response.data.user) {
        const userData = response.data.user;
        if (userData.likedArticles) {
          setLikedArticles(userData.likedArticles);
          localStorage.setItem("likedArticles", JSON.stringify(userData.likedArticles));
        }
        if (userData.savedArticles) {
          setSavedArticles(userData.savedArticles);
          localStorage.setItem("savedArticles", JSON.stringify(userData.savedArticles));
        }
      } else {
        console.error("Failed to fetch user data:", response.data);
      }
    } catch (error) {
      console.error("Error fetching user data:", error);
    }
  };

  // Updated login to employ axios and consistently use _id
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
      localStorage.setItem("user", JSON.stringify(userData));
      if (userData.likedArticles) {
        setLikedArticles(userData.likedArticles);
        localStorage.setItem("likedArticles", JSON.stringify(userData.likedArticles));
      }
      if (userData.savedArticles) {
        setSavedArticles(userData.savedArticles);
        localStorage.setItem("savedArticles", JSON.stringify(userData.savedArticles));
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
      localStorage.removeItem("user");
      localStorage.removeItem("likedArticles");
      localStorage.removeItem("savedArticles");
      setUser(null);
      setIsAuthenticated(false);
      setLikedArticles([]);
      setSavedArticles([]);
      window.location.reload();
    }
  };

  // Newly added register function, echoing our classic practices
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
      localStorage.setItem("user", JSON.stringify(updatedUser));
      return { success: true };
    } catch (error) {
      console.error("Update user error:", error);
      return { success: false, message: error.message };
    }
  };

  const likeArticle = async (articleId) => {
    if (!user) return { success: false, message: "Not authenticated" };
    try {
      const updatedLikes = [...likedArticles, articleId];
      setLikedArticles(updatedLikes);
      localStorage.setItem("likedArticles", JSON.stringify(updatedLikes));
      await axios.post(`${API_BASE_URL}/api/articles/like/${articleId}`, { userId: user._id }, { withCredentials: true });
      return { success: true };
    } catch (error) {
      console.error("Like article error:", error);
      return { success: false, message: error.message };
    }
  };

  const unlikeArticle = async (articleId) => {
    if (!user) return { success: false, message: "Not authenticated" };
    try {
      const updatedLikes = likedArticles.filter(id => id !== articleId);
      setLikedArticles(updatedLikes);
      localStorage.setItem("likedArticles", JSON.stringify(updatedLikes));
      await axios.post(`${API_BASE_URL}/api/articles/unlike/${articleId}`, { userId: user._id }, { withCredentials: true });
      return { success: true };
    } catch (error) {
      console.error("Unlike article error:", error);
      return { success: false, message: error.message };
    }
  };

  const saveArticle = async (articleId) => {
    if (!user) return { success: false, message: "Not authenticated" };
    try {
      const updatedSaved = [...savedArticles, articleId];
      setSavedArticles(updatedSaved);
      localStorage.setItem("savedArticles", JSON.stringify(updatedSaved));
      await axios.post(`${API_BASE_URL}/api/articles/save/${articleId}`, { userId: user._id }, { withCredentials: true });
      return { success: true };
    } catch (error) {
      console.error("Save article error:", error);
      return { success: false, message: error.message };
    }
  };

  const unsaveArticle = async (articleId) => {
    if (!user) return { success: false, message: "Not authenticated" };
    try {
      const updatedSaved = savedArticles.filter(id => id !== articleId);
      setSavedArticles(updatedSaved);
      localStorage.setItem("savedArticles", JSON.stringify(updatedSaved));
      await axios.post(`${API_BASE_URL}/api/articles/unsave/${articleId}`, { userId: user._id }, { withCredentials: true });
      return { success: true };
    } catch (error) {
      console.error("Unsave article error:", error);
      return { success: false, message: error.message };
    }
  };

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

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;
