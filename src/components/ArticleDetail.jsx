import React, { useContext, useState, useEffect, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { AuthContext } from "../context/AuthContext";
import { API_BASE_URL } from "../utils/api";
import axios from "axios";
import { parseISO, format } from "date-fns";
import { formatDate } from "../utils/dateUtils";

const ArticleDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const [article, setArticle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [articles, setArticles] = useState([]);

  // ✅ Fetch the current article
  useEffect(() => {
    const fetchArticle = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`${API_BASE_URL}/api/articles/get/${id}`);
        if (response.status === 200) {
          setArticle(response.data.article);
        } else {
          throw new Error("Article not found");
        }
      } catch (error) {
        console.error("❌ Error fetching article:", error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };
    fetchArticle();
  }, [id]);

  // ✅ Fetch all articles for category filtering
  useEffect(() => {
    const fetchAllArticles = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/api/articles/get`);
        if (response.status === 200) {
          setArticles(response.data);
        } else {
          throw new Error("Failed to fetch articles");
        }
      } catch (error) {
        console.error("❌ Error fetching articles:", error);
      }
    };
    fetchAllArticles();
  }, []);

  // ✅ Get unique categories from **same date** articles
  const filteredCategories = useMemo(() => {
    if (!article) return {}; // Ensure article is loaded

    const normalizedCurrentDate = format(parseISO(article.date), "yyyy-MM-dd");

    return articles.reduce((acc, item) => {
      const normalizedItemDate = format(parseISO(item.date), "yyyy-MM-dd");

      if (normalizedItemDate === normalizedCurrentDate) { // ✅ Only same-date articles
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

  // ✅ Handle category click (navigate to same-date article in category)
  const handleCategoryClick = (categoryName) => {
    if (!article) return;

    const categoryArticles = filteredCategories[categoryName]?.articles || [];
    const normalizedCurrentDate = format(parseISO(article.date), "yyyy-MM-dd");

    const sameDateArticles = categoryArticles.filter((item) => {
      const normalizedItemDate = format(parseISO(item.date), "yyyy-MM-dd");
      return normalizedItemDate === normalizedCurrentDate;
    });

    if (sameDateArticles.length > 0) {
      navigate(`/article/${sameDateArticles[0]._id}`);
    }
  };

  if (loading) return <p>Loading...</p>;
  if (error || !article) return <h1>Article not found.</h1>;

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
      <div className="container mx-auto px-4 py-8">
        <button onClick={() => navigate("/magazine")} className="mb-6 flex items-center text-blue-600 hover:text-blue-800">
          <ArrowLeft className="h-5 w-5 mr-2" /> Back to Articles
        </button>

        <div className="grid grid-cols-12 gap-5">
          {/* ✅ Left Sidebar - Shows Only Articles from the Same Date */}
          <div className="col-span-3">
            <h2 className="text-xl font-bold mb-4 dark:text-white">Category</h2>
            <div className="space-y-6">
              {Object.entries(filteredCategories).map(([categoryName, data]) => (
                <button
                  key={categoryName}
                  onClick={() => handleCategoryClick(categoryName)}
                  className={`w-full text-left py-2 px-3 rounded transition-colors 
                    ${article.category === categoryName
                      ? "bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400"
                      : "hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300"
                    }`}>
                  <div className="flex justify-between items-center">
                    <span>{categoryName}</span>
                    <span className="text-sm text-gray-500">{data.count}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* ✅ Main Content */}
          <div className="col-span-9">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden">
              <img src={article.image} alt={article.title} className="w-full h-72 object-cover" />
              <div className="p-8">
                <div className="mb-6">
                  <span className="text-sm font-semibold text-blue-600 dark:text-blue-400">{article.category}</span>
                  <h1 className="text-3xl font-bold mt-2 dark:text-white">{article.title}</h1>
                </div>
                <div className="flex items-center justify-between mb-8">
                  <div className="flex items-center space-x-4 text-sm text-gray-500">
                    <span>{formatDate(article.date)}</span>
                    <span>{article.readTime}</span>
                  </div>
                </div>
                <div className="prose dark:prose-invert max-w-none">
                  <p className="text-gray-600 dark:text-gray-300 leading-relaxed">{article.excerpt}</p>
                  {article.content && (
                    <div className="mt-4 text-gray-600 dark:text-gray-300 leading-relaxed">{article.content}</div>
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
