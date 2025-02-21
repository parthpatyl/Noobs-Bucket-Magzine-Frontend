import React, { useContext, useState, useEffect, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Heart, Share2, Bookmark } from "lucide-react";
import { AuthContext } from "../context/AuthContext";

const API_BASE_URL = "http://localhost:5000"; // Backend API URL

const ArticleDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, updateUser } = useContext(AuthContext);
  const [article, setArticle] = useState(null);
  const [loading, setLoading] = useState(true); // Add loading state
  const [error, setError] = useState(null);
  const [articles, setArticles] = useState([]); // For category articles

  // Fetch article data
  const fetchArticle = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/articles/${id}`);
      
      // Check if the response is JSON
      const contentType = response.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        const text = await response.text();
        throw new Error(`Server did not return JSON. Response: ${text}`);
      }
  
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch article');
      }
      
      setArticle(data);
      fetchAllArticles();
    } catch (error) {
      console.error("Error fetching article:", error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  // Fetch all articles for categories
  const fetchAllArticles = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/articles`);
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch articles');
      }
      
      setArticles(data);
    } catch (error) {
      console.error("Error fetching articles:", error);
    }
  };

  useEffect(() => {
    if (id) {
      fetchArticle();
    }
  }, [id]);

  // Get unique categories and their articles count
  const categories = useMemo(() => {
    return articles.reduce((acc, article) => {
      const category = article.category;
      if (!acc[category]) {
        acc[category] = {
          count: 1,
          articles: [article],
        };
      } else {
        acc[category].count += 1;
        acc[category].articles.push(article);
      }
      return acc;
    }, {});
  }, [articles]);

  const handleCategoryClick = (categoryName) => {
    const categoryArticles = categories[categoryName]?.articles || [];
    if (categoryArticles.length === 0 || !article) return;
    
    const currentArticleDate = new Date(article.date);
    const sameDateArticles = categoryArticles.filter((item) => {
      const itemDate = new Date(item.date);
      return (
        itemDate.getFullYear() === currentArticleDate.getFullYear() &&
        itemDate.getMonth() === currentArticleDate.getMonth() &&
        itemDate.getDate() === currentArticleDate.getDate()
      );
    });
    
    if (sameDateArticles.length > 0) {
      navigate(`/article/${sameDateArticles[0]._id}`);
    }
  };

  const isSaved = user?.savedArticles?.includes(article?._id);
  const isLiked = user?.likedArticles?.includes(article?._id);

  const toggleSave = async () => {
    if (!user || !article) return;

    try {
      const endpoint = isSaved ? 'remove-saved-article' : 'save-article';
      const response = await fetch(`${API_BASE_URL}/api/articles/${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: user._id,
          articleId: article._id
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update saved status');
      }

      const newSaved = isSaved
        ? user.savedArticles.filter((_id) => _id !== article._id)
        : [...(user.savedArticles || []), article._id];
      
      await updateUser(user._id, { savedArticles: newSaved });
    } catch (error) {
      console.error('Error toggling save:', error);
    }
  };

  const toggleLike = async () => {
    if (!user || !article) return;

    try {
      const endpoint = isLiked ? 'remove-liked-article' : 'like-article';
      const response = await fetch(`${API_BASE_URL}/api/articles/${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: user._id,
          articleId: article._id
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update like status');
      }

      const newLiked = isLiked
        ? user.likedArticles.filter((_id) => _id !== article._id)
        : [...(user.likedArticles || []), article._id];
      
      await updateUser(user._id, { likedArticles: newLiked });
    } catch (error) {
      console.error('Error toggling like:', error);
    }
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: article.title,
        text: article.excerpt,
        url: window.location.href,
      });
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">Loading...</div>
      </div>
    );
  }

  if (error || !article) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold">
          {error || "Article not found"}
        </h1>
        <button
          onClick={() => navigate("/magazine")}
          className="mt-4 flex items-center text-blue-600 hover:text-blue-800"
        >
          <ArrowLeft className="h-5 w-5 mr-2" />
          Back to Articles
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
      <div className="container mx-auto px-4 py-8">
        <button
          onClick={() => navigate("/magazine")}
          className="mb-6 flex items-center text-blue-600 hover:text-blue-800"
        >
          <ArrowLeft className="h-5 w-5 mr-2" />
          Back to Articles
        </button>
        
        <div className="grid grid-cols-12 gap-5">
          {/* Left Sidebar */}
          <div className="col-span-3">
            <h2 className="text-xl font-bold mb-4 dark:text-white">Category</h2>
            <div className="space-y-6">
              {Object.entries(categories).map(([categoryName, data]) => (
                <button
                  key={categoryName}
                  onClick={() => handleCategoryClick(categoryName)}
                  className={`w-full text-left py-2 px-3 rounded transition-colors 
                    ${article.category === categoryName
                      ? 'bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400' 
                      : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300'
                    }`}
                >
                  <div className="flex justify-between items-center">
                    <span>{categoryName}</span>
                    <span className="text-sm text-gray-500">{data.count}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Main Content */}
          <div className="col-span-9">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden">
              <img
                src={article.image}
                alt={article.title}
                className="w-full h-72 object-cover"
              />
              <div className="p-8">
                <div className="mb-6">
                  <span className="text-sm font-semibold text-blue-600 dark:text-blue-400">
                    {article.category}
                  </span>
                  <h1 className="text-3xl font-bold mt-2 dark:text-white">
                    {article.title}
                  </h1>
                </div>
                <div className="flex items-center justify-between mb-8">
                  <div className="flex items-center space-x-4 text-sm text-gray-500">
                    <span>{article.date}</span>
                    <span>{article.readTime}</span>
                  </div>
                  <div className="flex space-x-4">
                    <button
                      onClick={toggleLike}
                      className={`p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 ${
                        isLiked ? 'text-red-500' : 'text-gray-500'
                      }`}
                    >
                      <Heart className="h-5 w-5" fill={isLiked ? 'currentColor' : 'none'} />
                    </button>
                    <button
                      onClick={toggleSave}
                      className={`p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 ${
                        isSaved ? 'text-blue-500' : 'text-gray-500'
                      }`}
                    >
                      <Bookmark className="h-5 w-5" fill={isSaved ? 'currentColor' : 'none'} />
                    </button>
                    <button
                      onClick={handleShare}
                      className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500"
                    >
                      <Share2 className="h-5 w-5" />
                    </button>
                  </div>
                </div>
                <div className="prose dark:prose-invert max-w-none">
                  <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                    {article.excerpt}
                  </p>
                  {article.content && (
                    <div className="mt-4 text-gray-600 dark:text-gray-300 leading-relaxed">
                      {article.content}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ArticleDetail;