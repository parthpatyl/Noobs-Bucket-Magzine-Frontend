import React, { useContext, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Bookmark, Heart, Calendar } from 'lucide-react';
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
          className="cursor-pointer bg-brand-bg rounded-xl shadow-lg p-6 hover:shadow-glow transition-all duration-300 border border-white/5 group hover:-translate-y-1"
          tabIndex={0}
          onKeyDown={(e) => e.key === "Enter" && navigate(`/article/${articleId}`)}
        >
          <h3 className="text-xl font-bold text-brand-text group-hover:text-brand-primary transition-colors mb-2">{title}</h3>
          {article.excerpt && (
            <p className="text-sm text-brand-muted line-clamp-2">
              {article.excerpt}
            </p>
          )}

          <div className="flex justify-end mt-4">
            <button
              onClick={(e) => { e.stopPropagation(); navigate(`/article/${articleId}`); }}
              className="px-4 py-2 bg-brand-primary text-white rounded-xl hover:bg-orange-600 focus:outline-none focus:ring focus:ring-orange-300 font-bold shadow-glow text-sm"
            >
              Read Article
            </button>
          </div>
        </div>
      );
    });
  };

  return (
    <div className="min-h-screen bg-brand-bg text-brand-text">
      {/* Header Banner */}
      <div className="h-64 bg-gradient-to-r from-brand-primary via-orange-500 to-brand-secondary relative">
        <div className="absolute inset-0 bg-black/20"></div>
      </div>

      <div className="max-w-6xl mx-auto px-4 -mt-32 relative z-10">
        <div className="bg-brand-surface rounded-2xl shadow-2xl overflow-hidden border border-white/10">
          <div className="p-8">
            <div className="flex flex-col md:flex-row items-center md:items-end gap-6 mb-8">
              <div className="w-32 h-32 rounded-2xl bg-brand-surface flex items-center justify-center border-4 border-brand-surface shadow-xl">
                <span className="text-5xl font-bold text-brand-primary">
                  {user.name && user.name[0] ? user.name[0].toUpperCase() : '?'}
                </span>
              </div>
              <div className="text-center md:text-left flex-1">
                <h1 className="text-4xl font-bold text-white mb-2">{user.name}</h1>
                <p className="text-brand-muted text-lg">{user.email}</p>
              </div>
              <div className="flex gap-4">
                <button
                  onClick={() => navigate("/magazine")}
                  className="px-6 py-3 bg-brand-bg text-brand-text rounded-xl hover:bg-white/10 transition-colors border border-white/10 font-medium"
                >
                  Back to Articles
                </button>
              </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
              <div className="bg-brand-bg p-6 rounded-xl border border-white/5 flex items-center gap-4">
                <div className="p-3 bg-brand-primary/10 rounded-lg text-brand-primary">
                  <Bookmark className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-brand-muted text-sm">Saved Articles</p>
                  <p className="text-2xl font-bold text-brand-text">{savedArticles.length}</p>
                </div>
              </div>
              <div className="bg-brand-bg p-6 rounded-xl border border-white/5 flex items-center gap-4">
                <div className="p-3 bg-brand-secondary/10 rounded-lg text-brand-secondary">
                  <Heart className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-brand-muted text-sm">Liked Articles</p>
                  <p className="text-2xl font-bold text-brand-text">{likedArticles.length}</p>
                </div>
              </div>
              <div className="bg-brand-bg p-6 rounded-xl border border-white/5 flex items-center gap-4">
                <div className="p-3 bg-blue-500/10 rounded-lg text-blue-500">
                  <Calendar className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-brand-muted text-sm">Member Since</p>
                  <p className="text-2xl font-bold text-brand-text">
                    {user.memberSince ? new Date(user.memberSince).getFullYear() : 'N/A'}
                  </p>
                </div>
              </div>
            </div>

            {/* Tabs */}
            <div className="border-b border-white/10 mb-8">
              <div className="flex gap-8">
                <button
                  onClick={() => setActiveTab('saved')}
                  className={`pb-4 text-lg font-medium transition-all relative ${activeTab === 'saved'
                    ? 'text-brand-primary'
                    : 'text-brand-muted hover:text-brand-text'
                    }`}
                >
                  Saved Articles
                  {activeTab === 'saved' && (
                    <div className="absolute bottom-0 left-0 right-0 h-1 bg-brand-primary rounded-t-full"></div>
                  )}
                </button>
                <button
                  onClick={() => setActiveTab('liked')}
                  className={`pb-4 text-lg font-medium transition-all relative ${activeTab === 'liked'
                    ? 'text-brand-primary'
                    : 'text-brand-muted hover:text-brand-text'
                    }`}
                >
                  Liked Articles
                  {activeTab === 'liked' && (
                    <div className="absolute bottom-0 left-0 right-0 h-1 bg-brand-primary rounded-t-full"></div>
                  )}
                </button>
              </div>
            </div>

            {/* Content Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {activeTab === 'saved' ? (
                savedArticles.length > 0 ? renderArticles(savedArticles) : (
                  <div className="col-span-full text-center py-12 text-brand-muted bg-brand-bg rounded-xl border border-white/5">
                    <Bookmark className="h-12 w-12 mx-auto mb-4 opacity-20" />
                    <p>No saved articles yet.</p>
                  </div>
                )
              ) : (
                likedArticles.length > 0 ? renderArticles(likedArticles) : (
                  <div className="col-span-full text-center py-12 text-brand-muted bg-brand-bg rounded-xl border border-white/5">
                    <Heart className="h-12 w-12 mx-auto mb-4 opacity-20" />
                    <p>No liked articles yet.</p>
                  </div>
                )
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserProfile;
