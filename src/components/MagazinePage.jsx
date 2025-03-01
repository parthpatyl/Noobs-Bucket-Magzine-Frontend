import React, { useState, useEffect, useContext } from 'react';
import { ChevronLeft, ChevronRight, BookOpen, Search, Heart, Share2, Bookmark } from 'lucide-react';
import CategoryFilter from './CategoryFilter';
import EditionCatalog from './EditionCatalog';
import FeaturedArticle from './FeaturedArticle';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { API_BASE_URL } from '../utils/api';
import { formatDate } from '../utils/dateUtils';


const MagazinePage = () => {
  const [articles, setArticles] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState(null);
  const [savedArticles, setSavedArticles] = useState([]);
  const [likedArticles, setLikedArticles] = useState([]);
  const [isEditionMinimized, setIsEditionMinimized] = useState(false);
  const itemsPerPage = 8;
  const navigate = useNavigate();
  const { isAuthenticated, user, logout, updateUser } = useContext(AuthContext);

  const handleReadMore = (article) => {
    navigate(`/article/${article._id}`);
  };
  const fetchArticles = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/articles/get`);
      const data = await response.json();
      console.log(data);
      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch articles');
      }
      setArticles(data);
    } catch (error) {
      console.error("Error fetching articles:", error);
    }


  }
  useEffect(() => {
    fetchArticles();
  }, []);

  useEffect(() => {
    if (user) {
      // Make sure we're using the arrays from user data, or initialize as empty arrays
      setSavedArticles(user.savedArticles || []);
      setLikedArticles(user.likedArticles || []);
      
      // Log for debugging
      console.log("Loaded user data:", {
        savedArticles: user.savedArticles || [],
        likedArticles: user.likedArticles || []
      });
    }
  }, [user]);

  const categories = [...new Set(articles.map(article => article.category))];

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



  const toggleSave = async (articleId) => {
    if (!user) return;

    // ✅ Instantly update UI
    const updatedSaves = savedArticles.includes(articleId)
      ? savedArticles.filter(id => id !== articleId)  // Remove save
      : [...savedArticles, articleId];  // Add save

    setSavedArticles(updatedSaves);

    try {
      const response = await fetch(`${API_BASE_URL}/api/articles/save/${articleId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user.id }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Failed to update saved status");

      // ✅ Update state with backend response (ensures persistence)
      setSavedArticles(data.savedArticles);
    } catch (error) {
      console.error("Error updating saved articles:", error);
      setSavedArticles(savedArticles); // ❌ Rollback in case of failure
    }
  };

  const toggleLike = async (articleId) => {
    if (!user) return;

    // ✅ Instantly update UI
    const updatedLikes = likedArticles.includes(articleId)
      ? likedArticles.filter(id => id !== articleId)  // Remove like
      : [...likedArticles, articleId];  // Add like

    setLikedArticles(updatedLikes);

    try {
      const response = await fetch(`${API_BASE_URL}/api/articles/like/${articleId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user.id }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Failed to update like status");

      // ✅ Update state with the backend response (ensures persistence)
      setLikedArticles(data.likedArticles);
    } catch (error) {
      console.error("Error updating likes:", error);
      setLikedArticles(likedArticles); // ❌ Rollback in case of failure
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
                    onClick={() => navigate(`/user/${user.id}`)}
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
              <EditionCatalog
                articles={articles}
                isMinimized={isEditionMinimized}
                onToggleMinimize={() => setIsEditionMinimized(!isEditionMinimized)}
              />
            </div>
          </div>

          <div className="lg:col-span-6 space-y-6">
            {currentArticles.length > 0 ? (
              currentArticles.map(article => (
                <div key={article.id} className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden">
                  <img
                    src={article.image}
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
                          onClick={() => toggleLike(article._id || article.id)}
                          className={`p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 ${likedArticles.includes(article._id || article.id) ? "text-red-500" : "text-gray-500"
                            }`}
                        >
                          <Heart className="h-5 w-5" fill={likedArticles.includes(article._id || article.id) ? "currentColor" : "none"} />
                        </button>

                        <button
                          onClick={() => toggleSave(article._id || article.id)}
                          className={`p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 ${savedArticles.includes(article._id || article.id) ? "text-blue-500" : "text-gray-500"
                            }`}
                        >
                          <Bookmark className="h-5 w-5" fill={savedArticles.includes(article._id || article.id) ? "currentColor" : "none"} />
                        </button>

                        <button
                          onClick={() => shareArticle(article)}
                          className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500">
                          <Share2 className="h-5 w-5" /></button>
                      </div>
                    </div>
                    <p className="text-gray-600 dark:text-gray-300">{article.excerpt}</p>
                    <div className="mt-4 flex justify-between items-center">
                      <div className="flex items-center space-x-4">
                        <span className="text-sm text-gray-500 dark:text-gray-400">{article.readTime}</span>
                        <span className="text-sm text-gray-500 dark:text-gray-400">{formatDate(article.date)}</span>
                      </div>
                      <button
                        onClick={() => handleReadMore(article)}
                        className="text-blue-600 dark:text-blue-400 font-semibold hover:text-blue-800 dark:hover:text-blue-300">
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
                  .filter(article => savedArticles.includes(article.id))
                  .map(article => (
                    <div key={article.id} className="border-b last:border-b-0 pb-4 mb-4 last:mb-0">
                      <h4 className="font-medium dark:text-white">{article.title}</h4>
                      <div className="flex justify-between items-center mt-2">
                        <p className="text-sm text-gray-500 dark:text-gray-400">{article.readTime}</p>
                        <button
                          onClick={() => {
                            toggleSave(article.id)
                          }}
                          className="text-blue-500"
                        >
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