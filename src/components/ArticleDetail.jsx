import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import articlesData from "./articles.json";
import { ArrowLeft, Heart, Share2, Bookmark } from "lucide-react";

const ArticleDetail = () => {
  const { id } = useParams(); // Extract ID from route params
  const navigate = useNavigate();

  // Find the article with a matching ID (ensure type consistency)
  const article = articlesData.articles.find(
    (article) => article.id === parseInt(id)
  );

  if (!article) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold">Article not found</h1>
        <button
          onClick={() => navigate("/")}
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
          onClick={() => navigate("/")}
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
                onClick={() => toggleLike(article.id)}
                className={'p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700'}>
                  <Heart className="h-5 w-5 text-gray-500" />
                </button>
                <button className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700">
                  <Bookmark className="h-5 w-5 text-gray-500" />
                </button>
                <button className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700">
                  <Share2 className="h-5 w-5 text-gray-500" />
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
