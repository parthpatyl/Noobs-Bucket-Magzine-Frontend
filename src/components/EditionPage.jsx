import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { format, parseISO } from 'date-fns';
import axios from 'axios';
import { API_BASE_URL } from '../utils/api';
import { formatDate } from '../utils/dateUtils';

const EditionPage = () => {
  const { date } = useParams();
  const navigate = useNavigate();
  const [editionArticles, setEditionArticles] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
      const fetchEditionArticles = async () => {
          try {
              const response = await axios.get(`${API_BASE_URL}/api/articles/get`);
              if (response.status === 200) {
                  const filteredArticles = response.data.filter(article => 
                      format(parseISO(article.date), 'dd-MM-yyyy') === date
                  );
                  setEditionArticles(filteredArticles);
              } else {
                  throw new Error("Failed to fetch articles");
              }
          } catch (error) {
              console.error("❌ Error fetching edition articles:", error);
          } finally {
              setLoading(false);
          }
      };

      fetchEditionArticles();
  }, [date]);

  const handleReadMore = (articleId) => {
      navigate(`/article/${articleId}`);
  };

  if (loading) return <p>Loading...</p>;

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
          {/* Header */}
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold text-gray-800 dark:text-white">
              Edition: {format(new Date(date.split('-').reverse().join('-')), 'do MMMM yyyy')}
            </h1>
            <button
              onClick={() => navigate(-1)}
              className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
            >
              Back
            </button>
          </div>

          {/* Articles List */}
          <div className="space-y-4">
            {editionArticles.length > 0 ? (
              editionArticles.map(article => (
                <div 
                  key={article._id}
                  className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg"
                >
                  <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">
                    {article.title}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300">
                    {article.excerpt}
                  </p>
                  <div className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                    {formatDate(article.date)}
                  </div>
                  <button
                    onClick={() => handleReadMore(article._id)}
                    className="mt-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Read More
                  </button>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                No articles found for this edition
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditionPage;