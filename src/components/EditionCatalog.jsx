import React, { useState, useEffect } from 'react';
import { Calendar, ChevronUp, ChevronDown } from 'lucide-react';
import { format, parseISO, eachWeekOfInterval, startOfYear, endOfYear } from 'date-fns';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { API_BASE_URL } from '../utils/api';

const EditionCatalog = ({ isMinimized, onToggleMinimize }) => {
  const navigate = useNavigate();
  const currentYear = new Date().getFullYear();
  const [articles, setArticles] = useState([]);

  // Fetch articles from the backend ensuring lean, proper JSON objects
  useEffect(() => {
    const fetchArticles = async () => {
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

    fetchArticles();
  }, []);

  // Generate all saturdays of the current year as timeline markers
  const saturdays = eachWeekOfInterval(
    { start: startOfYear(new Date(currentYear, 0, 1)), end: endOfYear(new Date(currentYear, 11, 31)) },
    { weekStartsOn: 6 }
  );

  // Group articles by their publication date (converted to dd-MM-yyyy)
  const articlesByDate = articles.reduce((acc, article) => {
    if (!article.date) return acc;
    try {
      const parsedDate = parseISO(article.date);
      const dateStr = format(parsedDate, 'dd-MM-yyyy');
      if (!acc[dateStr]) acc[dateStr] = [];
      acc[dateStr].push(article);
    } catch (error) {
      console.error("Error parsing article date:", article.date, error);
    }
    return acc;
  }, {});

  // Navigate to the edition page when a date with articles is clicked
  const handleDateClick = (dateStr) => {
    navigate(`/edition/${dateStr}`);
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <Calendar className="h-5 w-5 text-blue-600" />
          <h3 className="text-lg font-bold dark:text-white">Edition Timeline</h3>
        </div>
        <button 
          onClick={onToggleMinimize}
          className="p-1 hover:bg-gray-100 dark:hover:bg-blue-700 rounded-lg transition-colors"
        >
          {isMinimized ? <ChevronDown className="h-5 w-5 text-gray-600 dark:text-gray-300" /> : <ChevronUp className="h-5 w-5 text-gray-600 dark:text-gray-300" />}
        </button>
      </div>

      {isMinimized && (
        <div className="space-y-2">
          {saturdays.map(saturday => {
            // Format each saturday as dd-MM-yyyy for grouping purposes
            const dateStr = format(saturday, 'dd-MM-yyyy');
            const hasArticles = articlesByDate[dateStr] && articlesByDate[dateStr].length > 0;
            return (
              <div
                key={dateStr}
                className={`relative pl-6 pb-4 border-l-2 ${hasArticles ? 'border-gray-300 hover:border-blue-600 cursor-pointer' : 'border-gray-200'}`}
                onClick={() => hasArticles && handleDateClick(dateStr)}
              >
                <div className={`absolute left-[-5px] w-2 h-2 rounded-full ${hasArticles ? 'bg-gray-400' : 'bg-gray-200'}`} />
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    {format(saturday, 'dd MMM, yyyy')}
                  </span>
                  {hasArticles && (
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      {articlesByDate[dateStr].length} article{articlesByDate[dateStr].length > 1 ? 's' : ''}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default EditionCatalog;
