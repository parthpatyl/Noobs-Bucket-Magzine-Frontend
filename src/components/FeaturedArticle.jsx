import React, { useEffect, useState } from 'react';
import { formatDate } from '../utils/dateUtils';

const FeaturedArticle = ({ articles, interval = 5000 }) => {
  const [currentIndex, setCurrentIndex] = useState(0); // Track the current article index
  const [isAnimating, setIsAnimating] = useState(false); // Track animation state

  useEffect(() => {
    const intervalId = setInterval(() => {
      setIsAnimating(true); // Start animation
      setTimeout(() => {
        setCurrentIndex((prevIndex) => (prevIndex + 1) % articles.length); // Move to the next article
        setIsAnimating(false); // End animation
      }, 300); // Match this duration to the CSS animation timing
    }, interval);

    return () => clearInterval(intervalId); // Cleanup interval on unmount
  }, [articles, interval]);

  const currentArticle = articles[currentIndex];

  if (!currentArticle) return null; // Handle empty articles array

  return (
    <div
      className={`mb-8 bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden transform transition-transform duration-300 ${
        isAnimating ? 'opacity-0 scale-95' : 'opacity-100 scale-100'
      }`}
    >
      <div className="relative h-96">
        <img
          src={currentArticle.image}
          alt="Featured Article"
          className="w-full h-full object-cover"
        />
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent p-6">
          <span className="text-blue-400 font-semibold">Featured</span>
          <h2 className="text-4xl font-bold text-white mt-2">{currentArticle.title}</h2>
          <p className="text-gray-200 mt-2">{currentArticle.excerpt}</p>
          <div className="flex items-center space-x-4 mt-4">
            <span className="text-gray-300">{currentArticle.readTime}</span>
            <span className="text-gray-300">{formatDate(currentArticle.date)}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FeaturedArticle;
