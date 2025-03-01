import React, { useContext, useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { API_BASE_URL } from '../utils/api';

const UserProfile = () => {
  const { id } = useParams();
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('saved');
  const [savedArticles, setSavedArticles] = useState([]);
  const [likedArticles, setLikedArticles] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!user) {
      console.warn("⚠️ User is undefined, redirecting...");
      navigate("/auth/login");
      return;
    }

    const fetchArticles = async () => {
      setIsLoading(true);
      setError(null);

      try {
        // First, log the actual API URLs to help with debugging
        console.log(`🔍 Attempting to fetch saved articles from: ${API_BASE_URL}/api/articles/saved/${user.id}`);
        console.log(`🔍 Attempting to fetch liked articles from: ${API_BASE_URL}/api/articles/liked/${user.id}`);

        // Try fetching saved articles
        const savedResponse = await fetch(`${API_BASE_URL}/api/articles/saved/${user.id}`);
        
        // Check for non-JSON responses
        const savedContentType = savedResponse.headers.get('content-type');
        if (!savedContentType || !savedContentType.includes('application/json')) {
          console.error(`❌ API returned non-JSON content: ${savedContentType}`);
          const text = await savedResponse.text();
          console.error(`Response body (first 100 chars): ${text.substring(0, 100)}...`);
          throw new Error('API returned non-JSON response');
        }

        const savedData = await savedResponse.json();
        
        if (!savedResponse.ok) {
          console.error(`❌ API error: ${savedData.message || savedResponse.statusText}`);
          throw new Error(savedData.message || 'Failed to fetch saved articles');
        }
        
        setSavedArticles(savedData.articles || []);
        console.log("✅ Saved articles fetched:", savedData.articles);

        // Try fetching liked articles
        const likedResponse = await fetch(`${API_BASE_URL}/api/articles/liked/${user.id}`);
        
        // Check for non-JSON responses
        const likedContentType = likedResponse.headers.get('content-type');
        if (!likedContentType || !likedContentType.includes('application/json')) {
          console.error(`❌ API returned non-JSON content: ${likedContentType}`);
          const text = await likedResponse.text();
          console.error(`Response body (first 100 chars): ${text.substring(0, 100)}...`);
          throw new Error('API returned non-JSON response');
        }
        
        const likedData = await likedResponse.json();
        
        if (!likedResponse.ok) {
          console.error(`❌ API error: ${likedData.message || likedResponse.statusText}`);
          throw new Error(likedData.message || 'Failed to fetch liked articles');
        }
        
        setLikedArticles(likedData.articles || []);
        console.log("✅ Liked articles fetched:", likedData.articles);
      } catch (error) {
        console.error("❌ Error fetching articles:", error);
        setError(error.message);
        // Don't clear the arrays - keep any previously fetched data
      } finally {
        setIsLoading(false);
      }
    };

    fetchArticles();
  }, [user, navigate]);

  // Rest of your component remains the same...

  const ArticleCard = ({ article }) => (
    <div className="bg-white dark:bg-gray-700 rounded-lg shadow-md p-4 flex justify-between items-center">
      <div>
        <h3 className="text-lg font-semibold dark:text-white">{article.title}</h3>
        <p className="text-gray-600 dark:text-gray-300 text-sm">{article.description}</p>
      </div>
      <button
        onClick={() => navigate(`/article/${article._id}`)}
        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
      >
        View
      </button>
    </div>
  );

  if (!user) {
    return null; 
  }

  if (user.id !== String(id)) {
    return (
      <div className="min-h-screen bg-gray-100 dark:bg-gray-900 flex items-center justify-center">
        <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-lg text-center">
          <span className="text-6xl mb-4">😞</span>
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white mb-4">
            User Not Found
          </h1>
          <button
            onClick={() => navigate("/magazine")}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Return Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden">
          {/* Header section */}
          <div className="bg-blue-600 p-6">
            <div className="flex items-center gap-6">
              <div className="w-20 h-20 rounded-full bg-white flex items-center justify-center">
                <span className="text-2xl font-bold text-blue-600">
                  {user.name && user.name[0] ? user.name[0].toUpperCase() : '?'}
                </span>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">{user.name}</h1>
                <p className="text-blue-100">{user.email}</p>
              </div>
            </div>
          </div>

          {/* Error message if there was a problem */}
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 m-6 rounded relative" role="alert">
              <strong className="font-bold">Error: </strong>
              <span className="block sm:inline">{error}</span>
              <p className="mt-2 text-sm">
                Please try refreshing the page or contact support if the problem persists.
              </p>
            </div>
          )}

          {/* Stats Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6">
            <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
              <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-300 mb-2">
                Saved Articles
              </h3>
              <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                {isLoading ? '...' : savedArticles.length}
              </p>
            </div>

            <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
              <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-300 mb-2">
                Liked Articles
              </h3>
              <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                {isLoading ? '...' : likedArticles.length}
              </p>
            </div>
          </div>

          {/* Article Lists Section */}
          <div className="p-6 border-t border-gray-200 dark:border-gray-700">
            {/* Tab Navigation */}
            <div className="flex mb-4 border-b border-gray-200 dark:border-gray-700">
              <button
                onClick={() => setActiveTab('saved')}
                className={`px-4 py-2 ${activeTab === 'saved'
                  ? 'border-b-2 border-blue-600 text-blue-600'
                  : 'text-gray-500 dark:text-gray-400'
                  }`}
              >
                Saved Articles
              </button>
              <button
                onClick={() => setActiveTab('liked')}
                className={`px-4 py-2 ${activeTab === 'liked'
                  ? 'border-b-2 border-blue-600 text-blue-600'
                  : 'text-gray-500 dark:text-gray-400'
                  }`}
              >
                Liked Articles
              </button>
            </div>

            {/* Loading indicator */}
            {isLoading && (
              <div className="flex justify-center items-center py-10">
                <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-500"></div>
              </div>
            )}

            {/* Articles List */}
            {!isLoading && (
              <div className="space-y-4">
                {activeTab === 'saved' && (
                  <>
                    {savedArticles.length > 0 ? (
                      savedArticles.map(article => (
                        <ArticleCard key={article._id} article={article} />
                      ))
                    ) : (
                      <p className="text-gray-500 dark:text-gray-400 text-center py-4">
                        No saved articles
                      </p>
                    )}
                  </>
                )}

                {activeTab === 'liked' && (
                  <>
                    {likedArticles.length > 0 ? (
                      likedArticles.map(article => (
                        <ArticleCard key={article._id} article={article} />
                      ))
                    ) : (
                      <p className="text-gray-500 dark:text-gray-400 text-center py-4">
                        No liked articles
                      </p>
                    )}
                  </>
                )}
              </div>
            )}
          </div>

          <div className="p-6 border-t border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-semibold mb-4 dark:text-white">Account Details</h2>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-600 dark:text-gray-300">Name:</span>
                <span className="font-medium dark:text-white">{user.name}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600 dark:text-gray-300">Email:</span>
                <span className="font-medium dark:text-white">{user.email}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600 dark:text-gray-300">Member Since:</span>
                <span className="font-medium dark:text-white">
                  {user.memberSince ? new Date(user.memberSince).toLocaleDateString() : 'N/A'}
                </span>
              </div>
            </div>
          </div>

          <div className="p-6 border-t border-gray-200 dark:border-gray-700 flex justify-between gap-4">
            <button
              onClick={() => fetchArticles()}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Refresh Data
            </button>
            <button
              onClick={() => navigate("/magazine")}
              className="px-6 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
            >
              Back to Articles
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserProfile;