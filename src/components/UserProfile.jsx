import React, { useContext, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';


const UserProfile = () => {
  const { id } = useParams();
  const { user, likedArticles, savedArticles } = useContext(AuthContext);
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('saved');

  // Ensure UserProfile is wrapped in AuthProvider
  if (!user) {
    console.warn("⚠️ User is undefined, redirecting...");
    navigate("/auth/login");
    return null; // Return null to avoid rendering the component
  }

  // Ensure the URL id matches our user id
  if (user._id !== id) {
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

  // Helper function to render articles from an array (handles both objects and IDs)
  const renderArticles = (articlesArray) => {
    // If elements are objects, use their properties; if they are IDs, just display the ID.
    return articlesArray.map((article, idx) => {
      const articleId = article._id || article.id || article; // fallback to article itself if it's an ID
      const title = (article && article.title) ? article.title : `Article ${articleId}`;
      return (
        <div
          key={articleId}
          className="cursor-pointer bg-white dark:bg-blue-800 rounded-lg shadow-md p-4 hover:shadow-lg transition-shadow duration-100"
          tabIndex={0}
          onKeyDown={(e) => e.key === "Enter" && navigate(`/article/${articleId}`)}
        >
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{title}</h3>
          {article.excerpt && (
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
              {article.excerpt}
            </p>
          )}

          <div className="flex justify-end mt-3">
            <button
              onClick={() => navigate(`/article/${articleId}`)}
              className="w-10 h-10 bg-blue-600 text-white rounded-full hover:bg-blue-700 focus:outline-none focus:ring focus:ring-blue-300 font-bold"
            >
              GO
            </button>
          </div>
        </div>
      );
    });
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden">
          {/* Header Section */}
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

          {/* Stats Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6">
            <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
              <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-300 mb-2">
                Saved Articles
              </h3>
              <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                {savedArticles.length}
              </p>
            </div>
            <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
              <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-300 mb-2">
                Liked Articles
              </h3>
              <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                {likedArticles.length}
              </p>
            </div>
          </div>

          {/* Tab Navigation and Articles List */}
          <div className="p-6 border-t border-gray-200 dark:border-gray-700">
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

            <div className="space-y-4">
              {activeTab === 'saved' ? (
                savedArticles.length > 0 ? renderArticles(savedArticles) : <p>No saved articles</p>
              ) : (
                likedArticles.length > 0 ? renderArticles(likedArticles) : <p>No liked articles</p>
              )}
            </div>
          </div>

          {/* Account Details */}
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

          {/* Refresh and Navigation */}
          <div className="p-6 border-t border-gray-200 dark:border-gray-700 flex justify-between gap-4">
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
