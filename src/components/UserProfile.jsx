import React, { useContext, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import articlesData from './articles.json';

const UserProfile = () => {
  const { id } = useParams();
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  // State to manage which article list is active
  const [activeTab, setActiveTab] = useState('saved');

  if (!user || user.id.toString() !== id) {
    return (
      <div className="min-h-screen bg-gray-100 dark:bg-gray-900 flex items-center justify-center">
        <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-lg text-center">
          <span className="text-6xl mb-4">😞</span>
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white mb-4">
            User Not Found
          </h1>
          <button
            onClick={() => navigate("/")}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Return Home
          </button>
        </div>
      </div>
    );
  }

  // Render individual article card
  const ArticleCard = ({ article }) => (
    <div className="bg-white dark:bg-gray-700 rounded-lg shadow-md p-4 flex justify-between items-center">
      <div>
        <h3 className="text-lg font-semibold dark:text-white">{article.title}</h3>
        <p className="text-gray-600 dark:text-gray-300 text-sm">{article.description}</p>
      </div>
      <button
        onClick={() => navigate(`/article/${article.id}`)}
        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
      >
        View
      </button>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden">
          {/* Previous Profile Header code remains the same */}
          <div className="bg-blue-600 p-6">
            <div className="flex items-center gap-6">
              <div className="w-20 h-20 rounded-full bg-white flex items-center justify-center">
                <span className="text-2xl font-bold text-blue-600">
                  {user.email[0].toUpperCase()}
                </span>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">Your Profile</h1>
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
                {user.savedArticles?.length || 0}
              </p>
            </div>

            <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
              <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-300 mb-2">
                Liked Articles
              </h3>
              <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                {user.likedArticles?.length || 0}
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

            {/* Articles List */}
            <div className="space-y-4">
              {activeTab === 'saved' && (
                <>
                  {user.savedArticles && user.savedArticles.length > 0 ? (
                    user.savedArticles.map(articleId => {
                      const article = articlesData.articles.find(a => a.id === articleId);
                      return article ? <ArticleCard key={articleId} article={article} /> : null;
                    })
                  ) : (
                    <p className="text-gray-500 dark:text-gray-400 text-center">
                      No Saved articles
                    </p>
                  )}
                </>
              )}

              {activeTab === 'liked' && (
                <>
                  {user.likedArticles && user.likedArticles.length > 0 ? (
                    user.likedArticles.map(articleId => {
                      const article = articlesData.articles.find(a => a.id === articleId);
                      return article ? <ArticleCard key={articleId} article={article} /> : null;
                    })
                  ) : (
                    <p className="text-gray-500 dark:text-gray-400 text-center">
                      No Liked articles
                    </p>
                  )}
                </>
              )}
            </div>
          </div>

          {/* Previous Account Details and Action Buttons remain the same */}
          <div className="p-6 border-t border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-semibold mb-4 dark:text-white">
              Account Details
            </h2>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-600 dark:text-gray-300">Email:</span>
                <span className="font-medium dark:text-white">{user.email}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600 dark:text-gray-300">Member Since:</span>
                <span className="font-medium dark:text-white">
                  {new Date().toLocaleDateString()}
                </span>
              </div>
            </div>
          </div>

          <div className="p-6 border-t border-gray-200 dark:border-gray-700 flex justify-end gap-4">
            <button
              onClick={() => navigate("/")}
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