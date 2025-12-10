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
      className={`mb-8 bg-brand-surface rounded-xl shadow-lg overflow-hidden transform transition-all duration-500 border border-white/5 hover:shadow-glow ${isAnimating ? 'opacity-0 scale-95' : 'opacity-100 scale-100'
        }`}
    >
      <div className="relative h-96">
        <img
          src={currentArticle.image}
          alt="Featured Article"
          className="w-full h-full object-cover"
        />
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-brand-bg via-brand-bg/80 to-transparent p-8">
          <span className="text-brand-primary font-bold tracking-wider uppercase text-sm mb-2 block">Featured Story</span>
          <h2 className="text-4xl font-extrabold text-white mt-2 leading-tight">{currentArticle.title}</h2>
          <p className="text-gray-300 mt-3 text-lg max-w-2xl">{currentArticle.excerpt}</p>
          <div className="flex items-center space-x-4 mt-6 text-sm font-medium">
            <span className="text-brand-secondary">{currentArticle.readTime}</span>
            <span className="text-gray-400">•</span>
            <span className="text-gray-400">{formatDate(currentArticle.date)}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FeaturedArticle;
