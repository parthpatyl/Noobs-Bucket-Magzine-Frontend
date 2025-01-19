import React, { useState } from 'react';
import { Calendar } from 'lucide-react';
import { format, parseISO, eachWeekOfInterval, startOfYear, endOfYear } from 'date-fns';

const TimelineNav = ({ selectedDate, onDateSelect, articles }) => {
  const currentYear = new Date().getFullYear();
  const saturdays = eachWeekOfInterval(
    {
      start: startOfYear(new Date(currentYear, 0, 1)),
      end: endOfYear(new Date(currentYear, 11, 31))
    },
    { weekStartsOn: 6 } // Saturday
  );

  const articlesByDate = articles.reduce((acc, article) => {
    const date = format(parseISO(article.date), 'dd-MM-yyyy');
    if (!acc[date]) acc[date] = [];
    acc[date].push(article);
    return acc;
  }, {});

  return (
    <div className="space-y-4">
      <div className="flex items-center space-x-2 mb-4">
        <Calendar className="h-5 w-5 text-blue-600" />
        <h3 className="text-lg font-semibold dark:text-white">Edition Timeline</h3>
      </div>
      <div className="space-y-2">
        {saturdays.map(saturday => {
          const dateStr = format(saturday, 'dd-MM-yyyy');
          const hasArticles = articlesByDate[dateStr]?.length > 0;
          return (
            <div
              key={dateStr}
              className={`relative pl-6 pb-4 border-l-2 ${
                selectedDate === dateStr
                  ? 'border-blue-600'
                  : hasArticles
                  ? 'border-gray-300 hover:border-blue-400'
                  : 'border-gray-200'
              }`}
            >
              <div
                className={`absolute left-[-5px] w-2 h-2 rounded-full ${
                  selectedDate === dateStr
                    ? 'bg-blue-600'
                    : hasArticles
                    ? 'bg-gray-400'
                    : 'bg-gray-200'
                }`}
              />
              <button
                onClick={() => hasArticles && onDateSelect(dateStr)}
                className={`w-full text-left group ${
                  hasArticles
                    ? 'cursor-pointer'
                    : 'cursor-default opacity-50'
                }`}
                disabled={!hasArticles}
              >
                <div className="flex items-center justify-between">
                  <span className={`text-sm font-medium ${
                    selectedDate === dateStr
                      ? 'text-blue-600'
                      : 'text-gray-700 dark:text-gray-300'
                  }`}>
                    {format(saturday, 'dd MMM, yyyy')}
                  </span>
                  {hasArticles && (
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      {articlesByDate[dateStr].length} articles
                    </span>
                  )}
                </div>
                {hasArticles && selectedDate === dateStr && (
                  <div className="mt-2 space-y-2">
                    {articlesByDate[dateStr].map(article => (
                      <div
                        key={article.id}
                        className="text-sm text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400"
                      >
                        • {article.title}
                      </div>
                    ))}
                  </div>
                )}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};

const EditionCatalog = ({ articles }) => {
  const [selectedDate, setSelectedDate] = useState(null);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
      <TimelineNav
        selectedDate={selectedDate}
        onDateSelect={setSelectedDate}
        articles={articles}
      />
    </div>
  );
};

export default EditionCatalog;
