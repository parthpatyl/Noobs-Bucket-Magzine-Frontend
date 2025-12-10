import React, { useContext, useState, useEffect, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Heart, Bookmark, Share2 } from "lucide-react";
import { AuthContext } from "../context/AuthContext";
import { API_BASE_URL } from "../utils/api";
import axios from "axios";
import { parseISO, format } from "date-fns";



const ArticleDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, likedArticles, savedArticles, toggleLike, toggleSave } = useContext(AuthContext);

  const [article, setArticle] = useState(null);
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch a single article ensuring backend returns lean JSON
  const fetchArticle = async () => {
    try {
      setLoading(true);
      // Ensure your backend route uses .lean() or JSON.parse(JSON.stringify(...))
      const response = await axios.get(`${API_BASE_URL}/api/articles/get/${id}`);
      if (response.status === 200) {
        setArticle(response.data);
      } else {
        throw new Error("Article not found");
      }
    } catch (err) {
      console.error("Error fetching article:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchArticle();
  }, [id]);

  // Fetch all articles to group by category (for articles published on the same day)
  useEffect(() => {
    const fetchAllArticles = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/api/articles/get`);
        if (response.status === 200) {
          setArticles(response.data);
        } else {
          throw new Error("Failed to fetch articles");
        }
      } catch (err) {
        console.error("Error fetching all articles:", err);
      }
    };
    fetchAllArticles();
  }, []);

  // Group articles by category if they share the same publication date as the current article
  const filteredCategories = useMemo(() => {
    if (!article || !article.date) return {};
    const normalizedCurrentDate = format(parseISO(article.date), "yyyy-MM-dd");
    return articles.reduce((acc, item) => {
      if (!item.date) return acc;
      const normalizedItemDate = format(parseISO(item.date), "yyyy-MM-dd");
      if (normalizedItemDate === normalizedCurrentDate) {
        const category = item.category || "Uncategorized";
        if (!acc[category]) {
          acc[category] = { count: 1, articles: [item] };
        } else {
          acc[category].count += 1;
          acc[category].articles.push(item);
        }
      }
      return acc;
    }, {});
  }, [articles, article]);

  const handleCategoryClick = (categoryName) => {
    if (!article) return;
    const categoryArticles = filteredCategories[categoryName]?.articles || [];
    if (categoryArticles.length > 0) {
      navigate(`/article/${categoryArticles[0]._id}`);
    }
  };

  const isLiked = useMemo(() => {
    if (!article) return false;
    return likedArticles.some(item => (item._id || item) === article._id);
  }, [likedArticles, article]);

  const isSaved = useMemo(() => {
    if (!article) return false;
    return savedArticles.some(item => (item._id || item) === article._id);
  }, [savedArticles, article]);

  // Share article using navigator.share
  const shareArticle = (article) => {
    if (navigator.share) {
      navigator.share({
        title: article.title,
        text: article.excerpt,
        url: window.location.href,
      })
        .then(() => console.log("Article shared successfully"))
        .catch((error) => console.error("Error sharing article:", error));
    } else {
      alert("Sharing is not supported in this browser.");
    }
  };

  // Utility: Format date using date-fns
  const formatArticleDate = (rawDate) => {
    if (!rawDate) return "No date available";
    try {
      const dateObj = parseISO(rawDate);
      return format(dateObj, "dd MMM yyyy");
    } catch (error) {
      console.error("Error formatting date:", error);
      return rawDate;
    }
  };

  if (loading) return <p>Loading...</p>;
  if (error || !article) return <h1>Article not found.</h1>;

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
      <header className="bg-white dark:bg-gray-800 shadow-md sticky top-0 z-10">
        <div className="container mx-auto px-4 py-6 flex items-center justify-between">
          <button onClick={() => navigate("/magazine")} className="flex items-center text-blue-600 hover:text-blue-800">
            <ArrowLeft className="h-5 w-5 mr-2" /> Back to Articles
          </button>
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Article Detail</h1>
        </div>
      </header>
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-12 gap-5">
          <div className="col-span-3">
            <h2 className="text-xl font-bold mb-4 dark:text-white">Categories</h2>
            <div className="space-y-6">
              {Object.entries(filteredCategories).map(([categoryName, data]) => (
                <button
                  key={categoryName}
                  onClick={() => handleCategoryClick(categoryName)}
                  className={`w-full text-left py-2 px-3 rounded transition-colors ${article.category === categoryName
                    ? "bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400"
                    : "hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300"
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
          <div className="col-span-9">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden">
              <img src={article.image && article.image[0] ? article.image[0] : ''} alt={article.title} className="w-full h-72 object-cover" />
              <div className="p-8">
                <div className="mb-6">
                  <span className="text-sm font-semibold text-blue-600 dark:text-blue-400">{article.category}</span>
                  <h1 className="text-3xl font-bold mt-2 dark:text-white">{article.title}</h1>
                  <div className="flex space-x-2 mt-4">
                    <button
                      onClick={() => toggleLike(article)}
                      className={`p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 ${isLiked ? "text-red-500" : "text-gray-500"
                        }`}
                    >
                      <Heart className="h-5 w-5" fill={isLiked ? "currentColor" : "none"} />
                    </button>
                    <button
                      onClick={() => toggleSave(article)}
                      className={`p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 ${isSaved ? "text-blue-500" : "text-gray-500"
                        }`}
                    >
                      <Bookmark className="h-5 w-5" fill={isSaved ? "currentColor" : "none"} />
                    </button>
                    <button
                      onClick={() => shareArticle(article)}
                      className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500"
                    >
                      <Share2 className="h-5 w-5" />
                    </button>
                  </div>
                </div>
                <div className="flex items-center justify-between mb-8">
                  <div className="flex items-center space-x-4 text-sm text-gray-500">
                    <span>{formatArticleDate(article.date)}</span>
                    <span>{article.readtime}</span>
                  </div>
                </div>
                <div className="prose dark:prose-invert max-w-none">
                  <p className="text-gray-600 dark:text-gray-300 leading-relaxed">{article.excerpt}</p>
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
