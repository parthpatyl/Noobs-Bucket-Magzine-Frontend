import React from 'react';
import { Calendar, ChevronUp, ChevronDown } from 'lucide-react';
import { format, parseISO, eachWeekOfInterval, startOfYear, endOfYear } from 'date-fns';
import { useNavigate } from 'react-router-dom';

const TimelineNav = ({ articles, isMinimized, onToggleMinimize }) => {
  const navigate = useNavigate();
  const currentYear = new Date().getFullYear();
  
  const saturdays = eachWeekOfInterval(
    { start: startOfYear(new Date(currentYear, 0, 1)), end: endOfYear(new Date(currentYear, 11, 31)) },
    { weekStartsOn: 6 }
  );

  const articlesByDate = articles.reduce((acc, article) => {
    const date = format(parseISO(article.date), 'dd-MM-yyyy');
    acc[date] = acc[date] || [];
    acc[date].push(article);
    return acc;
  }, {});

  const handleDateClick = (dateStr) => {
    navigate(`/edition/${dateStr}`);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <Calendar className="h-5 w-5 text-blue-600" />
          <h3 className="text-lg font-semibold dark:text-white">Edition Timeline</h3>
        </div>
        <button 
          onClick={onToggleMinimize}
          className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
        >
          {isMinimized ? (
            <ChevronDown className="h-5 w-5 text-gray-600 dark:text-gray-300" />
          ) : (
            <ChevronUp className="h-5 w-5 text-gray-600 dark:text-gray-300" />
          )}
        </button>
      </div>

      {!isMinimized && (
        <div className="space-y-2">
          {saturdays.map(saturday => {
            const dateStr = format(saturday, 'dd-MM-yyyy');
            const hasArticles = articlesByDate[dateStr]?.length > 0;
            
            return (
              <div
                key={dateStr}
                className={`relative pl-6 pb-4 border-l-2 ${
                  hasArticles 
                    ? 'border-gray-300 hover:border-blue-400 cursor-pointer' 
                    : 'border-gray-200'
                }`}
                onClick={() => hasArticles && handleDateClick(dateStr)}
              >
                <div className={`absolute left-[-5px] w-2 h-2 rounded-full ${
                  hasArticles ? 'bg-gray-400' : 'bg-gray-200'
                }`} />
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    {format(saturday, 'dd MMM, yyyy')}
                  </span>
                  {hasArticles && (
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      {articlesByDate[dateStr].length} article
                      {articlesByDate[dateStr].length > 1 ? 's' : ''}
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

const EditionCatalog = ({ articles, isMinimized, onToggleMinimize }) => {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
      <TimelineNav 
        articles={articles}
        isMinimized={isMinimized}
        onToggleMinimize={onToggleMinimize}
      />
    </div>
  );
};

export default EditionCatalog;