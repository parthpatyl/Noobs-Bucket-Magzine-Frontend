import React, { useState, useEffect, useContext } from 'react';
import { ChevronLeft, ChevronRight, BookOpen, Search, Heart, Share2, Bookmark } from 'lucide-react';
import CategoryFilter from './CategoryFilter';
import FeaturedArticle from './FeaturedArticle';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { API_BASE_URL } from '../utils/api';
import { parseISO, format } from "date-fns";
import { syncWithLocalStorage, updateLocalStorage } from '../utils/localStorage';

const formatArticleDate = (rawDate) => {
  if (!rawDate) return "No date available";
  try {
    let dateObj;

    // Handle MongoDB Extended JSON format: { "$date": "2025-01-11T00:00:00.000Z" }
    if (typeof rawDate === "object" && rawDate.$date) {
      dateObj = new Date(rawDate.$date);
    }
    // Handle ISO string date: "2025-01-11T00:00:00.000Z"
    else if (typeof rawDate === "string" && !isNaN(Date.parse(rawDate))) {
      dateObj = parseISO(rawDate);
    }
    // Handle already-converted Date objects
    else if (rawDate instanceof Date && !isNaN(rawDate.getTime())) {
      dateObj = rawDate;
    }
    // If format is unrecognized, return "Invalid Date"
    else {
      console.error("⚠️ Unrecognized date format:", rawDate);
      return "Invalid Date";
    }

    return format(dateObj, "dd MMM yyyy"); // e.g., "11 Jan 2025"
  } catch (error) {
    console.error("❌ Error formatting date:", error);
    return "Invalid Date";
  }
};

const MagazinePage = () => {
  const [articles, setArticles] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState(null);
  const [savedArticles, setSavedArticles] = useState([]);
  const [likedArticles, setLikedArticles] = useState([]);
  const itemsPerPage = 8;
  const navigate = useNavigate();
  const { isAuthenticated, user, logout } = useContext(AuthContext);

  const handleReadMore = (article) => {
    navigate(`/article/${article._id}`);
  };

  // Fetch articles from the backend (ensure backend returns lean JSON)
  const fetchArticles = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/articles/get`);
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Failed to fetch articles");
      setArticles(data);
    } catch (error) {
      console.error("❌ Error fetching articles:", error);
    }
  };

  useEffect(() => {
    fetchArticles();
  }, []);

  // Sync saved and liked articles from user data
  useEffect(() => {
    if (user) {
      setSavedArticles(user.savedArticles || []);
      setLikedArticles(user.likedArticles || []);
    }
  }, [user]);


  // Derive a list of unique categories from articles
  const categories = [...new Set(articles.map(article => article.category))];

  // Filter articles based on search query and active category
  const filteredArticles = articles.filter(article => {
    const matchesCategory = !activeCategory || article.category === activeCategory;
    const matchesSearch = article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      article.excerpt.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const totalPages = Math.ceil(filteredArticles.length / itemsPerPage);
  const currentArticles = filteredArticles.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Toggle save status using user._id consistently
  const toggleSave = async (articleId) => {
    if (!user) return;
    const isAlreadySaved = savedArticles.some(id => id === articleId);
    const updatedSaves = isAlreadySaved
      ? savedArticles.filter(id => id !== articleId)
      : [...savedArticles, articleId];
    setSavedArticles(updatedSaves);
    try {
      const response = await fetch(`${API_BASE_URL}/api/articles/save/${articleId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user._id })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Failed to update saved status");
      setSavedArticles(data.savedArticles);
      syncWithLocalStorage(`savedArticles_${user._id}`, data.savedArticles);
    } catch (error) {
      console.error("❌ Error updating saved articles:", error);
      // Optionally revert state on error
    }
  };

  // Toggle like status using user._id consistently
  const toggleLike = async (articleId) => {
    if (!user) return;
    const isAlreadyLiked = likedArticles.some(id => id === articleId);
    const updatedLikes = isAlreadyLiked
      ? likedArticles.filter(id => id !== articleId)
      : [...likedArticles, articleId];
    setLikedArticles(updatedLikes);
    try {
      const response = await fetch(`${API_BASE_URL}/api/articles/like/${articleId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user._id })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Failed to update like status");
      setLikedArticles(data.likedArticles);
      syncWithLocalStorage(`likedArticles_${user._id}`, data.likedArticles);
    } catch (error) {
      console.error("❌ Error updating liked articles:", error);
      // Optionally revert state on error
    }
  };

  const shareArticle = (article) => {
    if (navigator.share) {
      navigator.share({
        title: article.title,
        text: article.excerpt,
        url: window.location.href,
      });
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
      <header className="bg-white dark:bg-gray-800 shadow-md sticky top-0 z-10">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <BookOpen className="h-8 w-8 text-blue-600" />
              <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Noob's Bucket</h1>
            </div>
            <div className="flex items-center space-x-4">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search articles..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                />
                <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
              </div>
              {isAuthenticated ? (
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => navigate(`/user/${user._id}`)}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    Profile
                  </button>
                  <button
                    onClick={logout}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                  >
                    Logout
                  </button>
                </div>
              ) : (
                <>
                  <button
                    onClick={() => navigate('/auth/register')}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    Register
                  </button>
                  <button
                    onClick={() => navigate('/auth/login')}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    Login
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6">
        <CategoryFilter
          categories={categories}
          activeCategory={activeCategory}
          onCategoryChange={setActiveCategory}
        />

        {articles.length > 0 && <FeaturedArticle articles={articles} interval={5000} />}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-3">
            <div className="sticky top-4">
            </div>
          </div>

          <div className="lg:col-span-6 space-y-6">
            {currentArticles.length > 0 ? (
              currentArticles.map(article => (
                <div key={article._id} className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden">
                  <img
                    src={article.image && Array.isArray(article.image) ? article.image[0] : article.image}
                    alt={article.title}
                    className="w-full h-48 object-cover"
                  />
                  <div className="p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <span className="text-sm font-semibold text-blue-600 dark:text-blue-400">
                          {article.category}
                        </span>
                        <h3 className="text-xl font-bold dark:text-white mt-2">{article.title}</h3>
                      </div>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => toggleLike(article._id)}
                          className={`p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 ${likedArticles.some(id => id === article._id) ? "text-red-500" : "text-gray-500"
                            }`}
                        >
                          <Heart className="h-5 w-5" fill={likedArticles.some(id => id === article._id) ? "currentColor" : "none"} />
                        </button>
                        <button
                          onClick={() => toggleSave(article._id)}
                          className={`p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 ${savedArticles.some(id => id === article._id) ? "text-blue-500" : "text-gray-500"
                            }`}
                        >
                          <Bookmark className="h-5 w-5" fill={savedArticles.some(id => id === article._id) ? "currentColor" : "none"} />
                        </button>
                        <button
                          onClick={() => shareArticle(article)}
                          className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500"
                        >
                          <Share2 className="h-5 w-5" />
                        </button>
                      </div>
                    </div>
                    <p className="text-gray-600 dark:text-gray-300">{article.excerpt}</p>
                    <div className="mt-4 flex justify-between items-center">
                      <div className="flex items-center space-x-4">
                        <span className="text-sm text-gray-500 dark:text-gray-400">{article.readtime}</span>
                        <span className="text-sm text-gray-500 dark:text-gray-400">{formatArticleDate(article.date)}</span>
                      </div>
                      <button
                        onClick={() => handleReadMore(article)}
                        className="text-blue-600 dark:text-blue-400 font-semibold hover:text-blue-800 dark:hover:text-blue-300"
                      >
                        Read More →
                      </button>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-600 dark:text-gray-400">No articles found.</p>
              </div>
            )}

            {currentArticles.length > 0 && (
              <div className="flex justify-center items-center space-x-4 mt-8">
                <button
                  className="p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 disabled:opacity-50"
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                >
                  <ChevronLeft className="h-6 w-6 dark:text-white" />
                </button>
                <span className="text-lg font-semibold dark:text-white">
                  Page {currentPage} of {totalPages}
                </span>
                <button
                  className="p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 disabled:opacity-50"
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                >
                  <ChevronRight className="h-6 w-6 dark:text-white" />
                </button>
              </div>
            )}
          </div>

          <div className="lg:col-span-3">
            <div className="sticky top-4">
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
                <h2 className="text-xl font-bold mb-4 dark:text-white">Saved Articles</h2>
                {articles
                  .filter(article => savedArticles.some(id => id === article._id))
                  .map(article => (
                    <div key={article._id} className="border-b last:border-b-0 pb-4 mb-4 last:mb-0">
                      <h4 className="font-medium dark:text-white">{article.title}</h4>
                      <div className="flex justify-between items-center mt-2">
                        <p className="text-sm text-gray-500 dark:text-gray-400">{article.readtime}</p>
                        <button onClick={() => toggleSave(article._id)} className="text-blue-500">
                          <Bookmark className="h-4 w-4" fill="currentColor" />
                        </button>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MagazinePage;
