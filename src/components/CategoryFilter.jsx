import React from 'react';

const CategoryFilter = ({ categories, activeCategory, onCategoryChange, vertical = false }) => {
  return (
    <div className={`flex ${vertical ? 'flex-col items-stretch' : 'flex-wrap'} gap-2 mb-6`}>
      <button
        onClick={() => onCategoryChange(null)}
        className={`px-4 py-2 rounded-full transition-all duration-300 ${!activeCategory
          ? 'bg-brand-primary text-white shadow-glow'
          : 'bg-brand-surface text-brand-text hover:bg-white/10 border border-white/5'
          }`}
      >
        All
      </button>
      {categories.map((category) => (
        <button
          key={category}
          onClick={() => onCategoryChange(category)}
          className={`px-4 py-2 rounded-full transition-all duration-300 ${activeCategory === category
            ? 'bg-brand-primary text-white shadow-glow'
            : 'bg-brand-surface text-brand-text hover:bg-white/10 border border-white/5'
            }`}
        >
          {category}
        </button>
      ))}
    </div>
  );
};

export default CategoryFilter;