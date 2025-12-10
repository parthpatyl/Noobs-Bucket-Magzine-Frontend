import React, { useState, useEffect, useContext } from 'react';
import { ChevronLeft, ChevronRight, BookOpen, Search, Heart, Share2, Bookmark } from 'lucide-react';
import CategoryFilter from './CategoryFilter';
import FeaturedArticle from './FeaturedArticle';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { API_BASE_URL } from '../utils/api';
import { parseISO, format } from "date-fns";


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

  const itemsPerPage = 8;
  const navigate = useNavigate();
  const { isAuthenticated, user, logout, likedArticles, savedArticles, toggleLike, toggleSave } = useContext(AuthContext);

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
    <div className="min-h-screen bg-brand-bg text-brand-text">
      <header className="bg-brand-surface shadow-lg sticky top-0 z-50 border-b border-white/5">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <BookOpen className="h-8 w-8 text-brand-primary" />
              <h1 className="text-2xl font-bold text-brand-text">Noob's Bucket</h1>
            </div>
            <div className="flex items-center space-x-4">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search articles..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 pr-4 py-2 bg-brand-bg border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-primary text-brand-text placeholder-gray-500 w-64 transition-all focus:w-80"
                />
                <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-500" />
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
                    className="px-4 py-2 bg-transparent border border-brand-primary text-brand-primary rounded-lg hover:bg-brand-primary hover:text-white transition-all shadow-glow-hover"
                  >
                    Register
                  </button>
                  <button
                    onClick={() => navigate('/auth/login')}
                    className="px-4 py-2 bg-brand-primary text-white rounded-lg hover:bg-orange-600 transition-all shadow-glow"
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
        {articles.length > 0 && <FeaturedArticle articles={articles} interval={5000} />}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-2">
            <div className="sticky top-24">
              <div className="bg-brand-surface rounded-xl shadow-lg p-6 border border-white/5">
                <h2 className="text-xl font-bold mb-4 text-brand-text border-b border-white/10 pb-2">Categories</h2>
                <CategoryFilter
                  categories={categories}
                  activeCategory={activeCategory}
                  onCategoryChange={setActiveCategory}
                  vertical={true}
                />
              </div>
            </div>
          </div>

          <div className="lg:col-span-7 space-y-6">
            {currentArticles.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {currentArticles.map(article => (
                  <div key={article._id} className="bg-brand-surface rounded-xl shadow-lg overflow-hidden border border-white/5 hover:border-brand-primary/30 transition-all hover:shadow-glow duration-300 group">
                    <img
                      src={article.image && Array.isArray(article.image) ? article.image[0] : article.image}
                      alt={article.title}
                      className="w-full h-48 object-cover"
                    />
                    <div className="p-6">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <span className="text-sm font-semibold text-brand-primary">
                            {article.category}
                          </span>
                          <h3 className="text-xl font-bold text-brand-text mt-2 group-hover:text-brand-primary transition-colors">{article.title}</h3>
                        </div>
                        <div className="flex space-x-2">
                          <button
                            onClick={() => toggleLike(article)}
                            className={`p-2 rounded-full hover:bg-white/10 transition-colors ${likedArticles.some(item => (item._id || item) === article._id) ? "text-brand-accent" : "text-gray-500"
                              }`}
                          >
                            <Heart className="h-5 w-5" fill={likedArticles.some(item => (item._id || item) === article._id) ? "currentColor" : "none"} />
                          </button>
                          <button
                            onClick={() => toggleSave(article)}
                            className={`p-2 rounded-full hover:bg-white/10 transition-colors ${savedArticles.some(item => (item._id || item) === article._id) ? "text-brand-secondary" : "text-gray-500"
                              }`}
                          >
                            <Bookmark className="h-5 w-5" fill={savedArticles.some(item => (item._id || item) === article._id) ? "currentColor" : "none"} />
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
                          className="text-brand-primary font-semibold hover:text-brand-secondary transition-colors"
                        >
                          Read More →
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-600 dark:text-gray-400">No articles found.</p>
              </div>
            )}

            {currentArticles.length > 0 && (
              <div className="flex justify-center items-center space-x-4 mt-8">
                <button
                  className="p-2 rounded-lg hover:bg-white/10 disabled:opacity-50 transition-colors"
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                >
                  <ChevronLeft className="h-6 w-6 text-brand-text" />
                </button>
                <span className="text-lg font-semibold text-brand-text">
                  Page {currentPage} of {totalPages}
                </span>
                <button
                  className="p-2 rounded-lg hover:bg-white/10 disabled:opacity-50 transition-colors"
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                >
                  <ChevronRight className="h-6 w-6 text-brand-text" />
                </button>
              </div>
            )}
          </div>

          <div className="lg:col-span-3">
            <div className="sticky top-24">
              <div className="bg-brand-surface rounded-xl shadow-lg p-6 border border-white/5">
                <h2 className="text-xl font-bold mb-4 text-brand-text border-b border-white/10 pb-2">Saved Articles</h2>
                {articles
                  .filter(article => savedArticles.some(item => (item._id || item) === article._id))
                  .map(article => (
                    <div key={article._id} className="border-b border-white/10 last:border-b-0 pb-4 mb-4 last:mb-0 group cursor-pointer" onClick={() => handleReadMore(article)}>
                      <h4 className="font-medium text-brand-text group-hover:text-brand-primary transition-colors">{article.title}</h4>
                      <div className="flex justify-between items-center mt-2">
                        <p className="text-sm text-gray-500">{article.readtime}</p>
                        <button onClick={(e) => { e.stopPropagation(); toggleSave(article); }} className="text-brand-secondary hover:text-white transition-colors">
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
