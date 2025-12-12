import { useContext, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Heart, ArrowLeft, BookOpen } from 'lucide-react';
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

const LikedArticlesPage = () => {
  const { user, likedArticles, toggleLike } = useContext(AuthContext);
  const navigate = useNavigate();
  const { userId } = useParams();
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchArticles = async () => {
      try {
        setLoading(true);
        setError(null);

        // Check if user is authenticated
        if (!user) {
          setError("Please login to view liked articles");
          setLoading(false);
          return;
        }

        // Allow access if user is authenticated (they can only see their own liked articles)
        // The likedArticles come from AuthContext which is user-specific
        
        // Fetch all articles to get full details
        const response = await fetch(`${API_BASE_URL}/api/articles/get`);
        
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || errorData.error || "Failed to fetch articles");
        }

        const allArticles = await response.json();

        // Handle case where backend returns an error object instead of articles
        if (allArticles.message && allArticles.message === "No articles found") {
          setArticles([]);
          return;
        }

        // Filter to only liked articles
        const likedArticleIds = likedArticles.map(article => {
          // Handle both full article objects and just IDs
          if (article._id) return article._id.toString();
          if (article.id) return article.id.toString();
          return article.toString();
        });

        const likedArticlesWithDetails = allArticles.filter(article => 
          likedArticleIds.includes(article._id.toString())
        );

        setArticles(likedArticlesWithDetails);
      } catch (error) {
        console.error("❌ Error fetching liked articles:", error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    // Only fetch if user is authenticated
    if (user) {
      fetchArticles();
    } else {
      setError("Please login to view liked articles");
      setLoading(false);
    }
  }, [user, likedArticles]);

  const handleReadMore = (article) => {
    navigate(`/article/${article._id}`);
  };

  const handleUnlike = async (article) => {
    try {
      await toggleLike(article);
      // Article will be removed from the list automatically due to the useEffect
    } catch (error) {
      console.error("Error unliking article:", error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-brand-bg text-brand-text flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-accent mx-auto mb-4"></div>
          <p className="text-brand-text">Loading liked articles...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-brand-bg text-brand-text flex items-center justify-center">
        <div className="bg-brand-surface p-8 rounded-xl shadow-lg border border-white/10 text-center max-w-md">
          <Heart className="h-12 w-12 text-brand-accent mx-auto mb-4 opacity-50" />
          <h2 className="text-2xl font-bold text-brand-text mb-4">Error Loading Liked Articles</h2>
          <p className="text-brand-muted mb-6">{error}</p>
          <button
            onClick={() => navigate('/magazine')}
            className="px-6 py-2 bg-brand-primary text-white rounded-lg hover:bg-orange-600 transition-colors shadow-glow"
          >
            Return to Magazine
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-brand-bg text-brand-text">
      <header className="bg-brand-surface shadow-lg sticky top-0 z-50 border-b border-white/5">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <button
                onClick={() => navigate('/magazine')}
                className="p-2 rounded-lg hover:bg-white/10 transition-colors mr-4"
                title="Back to Magazine"
              >
                <ArrowLeft className="h-6 w-6 text-brand-text" />
              </button>
              <BookOpen className="h-8 w-8 text-brand-primary" />
              <h1 className="text-2xl font-bold text-brand-text">Liked Articles</h1>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {articles.length === 0 ? (
          <div className="text-center py-16">
            <div className="mb-6">
              <Heart className="h-16 w-16 text-brand-accent mx-auto opacity-30" />
            </div>
            <h2 className="text-2xl font-bold text-brand-text mb-4">No Liked Articles Yet</h2>
            <p className="text-brand-muted max-w-md mx-auto mb-8">
              You have not liked any articles. Start exploring and like articles you enjoy!
            </p>
            <button
              onClick={() => navigate('/magazine')}
              className="px-6 py-3 bg-brand-primary text-white rounded-xl hover:bg-orange-600 transition-colors shadow-glow font-medium"
            >
              Explore Articles
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {articles.map(article => (
              <div key={article._id} className="bg-brand-surface rounded-xl shadow-lg overflow-hidden border border-white/5 hover:border-brand-accent/30 transition-all hover:shadow-glow duration-300 group">
                <img
                  src={article.image && Array.isArray(article.image) ? article.image[0] : article.image}
                  alt={article.title}
                  className="w-full h-48 object-cover"
                />
                <div className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <span className="text-sm font-semibold text-brand-accent">
                        {article.category}
                      </span>
                      <h3 className="text-xl font-bold text-brand-text mt-2 group-hover:text-brand-primary transition-colors line-clamp-2">
                        {article.title}
                      </h3>
                    </div>
                    <button
                      onClick={(e) => { e.stopPropagation(); handleUnlike(article); }}
                      className="p-2 rounded-xl hover:bg-brand-accent/10 transition-colors text-brand-accent"
                      title="Remove from liked"
                    >
                      <Heart className="h-5 w-5" fill="currentColor" />
                    </button>
                  </div>
                  <p className="text-gray-600 dark:text-gray-300 line-clamp-3 mb-4">{article.excerpt}</p>
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
        )}
      </div>
    </div>
  );
};

export default LikedArticlesPage;