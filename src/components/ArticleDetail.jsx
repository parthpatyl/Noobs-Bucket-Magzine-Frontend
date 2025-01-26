import React, { useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Heart, Share2, Bookmark } from "lucide-react";
import articlesData from "./articles.json";
import { AuthContext } from "../context/AuthContext";

const ArticleDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, updateUser } = useContext(AuthContext);

  const article = articlesData.articles.find(
    (article) => article.id === Number(id)
  );

  const isSaved = user?.savedArticles?.includes(article?.id);
  const isLiked = user?.likedArticles?.includes(article?.id);

  const toggleSave = async () => {
    if (!user || !article) return;
    const newSaved = isSaved
      ? user.savedArticles.filter((id) => id !== article.id)
      : [...(user.savedArticles || []), article.id];
    await updateUser(user.id, { savedArticles: newSaved });
  };

  const toggleLike = async () => {
    if (!user || !article) return;
    const newLiked = isLiked
      ? user.likedArticles.filter((id) => id !== article.id)
      : [...(user.likedArticles || []), article.id];
    await updateUser(user.id, { likedArticles: newLiked });
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

  if (!article) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold">Article not found</h1>
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
                  className={`p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 ${isLiked ? 'text-red-500' : 'text-gray-500'
                    }`}
                >
                  <Heart className="h-5 w-5" fill={isLiked ? 'currentColor' : 'none'} />
                </button>
                <button
                  onClick={toggleSave}
                  className={`p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 ${isSaved ? 'text-blue-500' : 'text-gray-500'
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
  );
};

export default ArticleDetail;