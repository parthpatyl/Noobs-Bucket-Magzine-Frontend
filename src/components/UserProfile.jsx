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
      <div className="min-h-screen bg-brand-bg flex items-center justify-center">
        <div className="bg-brand-surface p-8 rounded-lg shadow-lg text-center border border-white/10">
          <span className="text-6xl mb-4 block">😞</span>
          <h1 className="text-2xl font-bold text-brand-text mb-4">
            User Not Found
          </h1>
          <button
            onClick={() => navigate("/magazine")}
            className="px-6 py-2 bg-brand-primary text-white rounded-lg hover:bg-orange-600 transition-colors shadow-glow"
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
          className="cursor-pointer bg-brand-bg rounded-lg shadow-md p-4 hover:shadow-glow transition-all duration-300 border border-white/5 group"
          tabIndex={0}
          onKeyDown={(e) => e.key === "Enter" && navigate(`/article/${articleId}`)}
        >
          <h3 className="text-lg font-semibold text-brand-text group-hover:text-brand-primary transition-colors">{title}</h3>
          {article.excerpt && (
            <p className="text-sm text-brand-muted mt-2">
              {article.excerpt}
            </p>
          )}

          <div className="flex justify-end mt-3">
            <button
              onClick={() => navigate(`/article/${articleId}`)}
              className="w-10 h-10 bg-brand-primary text-white rounded-full hover:bg-orange-600 focus:outline-none focus:ring focus:ring-orange-300 font-bold shadow-glow"
            >
              GO
            </button>
          </div>
        </div>
      );
    });
  };

  return (
    <div className="min-h-screen bg-brand-bg p-6 text-brand-text">
      <div className="max-w-4xl mx-auto">
        <div className="bg-brand-surface rounded-xl shadow-lg overflow-hidden border border-white/10">
          {/* Header Section */}
          <div className="bg-gradient-to-r from-brand-primary to-brand-secondary p-6">
            <div className="flex items-center gap-6">
              <div className="w-20 h-20 rounded-full bg-brand-surface flex items-center justify-center border-4 border-white/20">
                <span className="text-3xl font-bold text-brand-primary">
                  {user.name && user.name[0] ? user.name[0].toUpperCase() : '?'}
                </span>
              </div>
              <div>
                <h1 className="text-3xl font-bold text-white">{user.name}</h1>
                <p className="text-white/80">{user.email}</p>
              </div>
            </div>
          </div>

          {/* Stats Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6">
            <div className="bg-brand-bg p-4 rounded-lg border border-white/5">
              <h3 className="text-sm font-semibold text-brand-muted mb-2">
                Saved Articles
              </h3>
              <p className="text-3xl font-bold text-brand-primary">
                {savedArticles.length}
              </p>
            </div>
            <div className="bg-brand-bg p-4 rounded-lg border border-white/5">
              <h3 className="text-sm font-semibold text-brand-muted mb-2">
                Liked Articles
              </h3>
              <p className="text-3xl font-bold text-brand-secondary">
                {likedArticles.length}
              </p>
            </div>
          </div>

          {/* Tab Navigation and Articles List */}
          <div className="p-6 border-t border-white/10">
            <div className="flex mb-4 border-b border-white/10">
              <button
                onClick={() => setActiveTab('saved')}
                className={`px-4 py-2 transition-colors ${activeTab === 'saved'
                  ? 'border-b-2 border-brand-primary text-brand-primary font-bold'
                  : 'text-brand-muted hover:text-brand-text'
                  }`}
              >
                Saved Articles
              </button>
              <button
                onClick={() => setActiveTab('liked')}
                className={`px-4 py-2 transition-colors ${activeTab === 'liked'
                  ? 'border-b-2 border-brand-secondary text-brand-secondary font-bold'
                  : 'text-brand-muted hover:text-brand-text'
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
          <div className="p-6 border-t border-white/10">
            <h2 className="text-xl font-semibold mb-4 text-brand-text">Account Details</h2>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-brand-muted">Name:</span>
                <span className="font-medium text-brand-text">{user.name}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-brand-muted">Email:</span>
                <span className="font-medium text-brand-text">{user.email}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-brand-muted">Member Since:</span>
                <span className="font-medium text-brand-text">
                  {user.memberSince ? new Date(user.memberSince).toLocaleDateString() : 'N/A'}
                </span>
              </div>
            </div>
          </div>

          {/* Refresh and Navigation */}
          <div className="p-6 border-t border-white/10 flex justify-between gap-4">
            <button
              onClick={() => navigate("/magazine")}
              className="px-6 py-2 bg-brand-bg text-brand-text rounded-lg hover:bg-white/10 transition-colors border border-white/5"
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
