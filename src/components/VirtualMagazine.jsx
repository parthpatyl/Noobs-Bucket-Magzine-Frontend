import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, BookOpen, Search, Heart, Share2, Bookmark } from 'lucide-react';
import CategoryFilter from './CategoryFilter';
import EditionCatalog from './EditionCatalog';
import FeaturedArticle from './FeaturedArticle';



const VirtualMagazine = () => {
  // Existing state management
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState(null);
  const [savedArticles, setSavedArticles] = useState([]);
  const [likedArticles, setLikedArticles] = useState([]);
  const itemsPerPage = 8;
  
  // Your existing articles array
  const articles = [
    {
      id: 1,
      title: "The Future of Technology",
      category: "Bookmark",
      image: "https://images.unsplash.com/photo-1705721357357-ab87523248f7?q=80&w=1854&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
      excerpt: "Exploring the latest trends in artificial intelligence and machine learning",
      readTime: "5 min read",
      date: "2025-01-15"
    },
    {
      id: 2,
      title: "Sustainable Living",
      category: "Tour Ticket",
      image: "https://plus.unsplash.com/premium_photo-1687653079484-12a596ddf7a9?q=80&w=2071&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
      excerpt: "Simple ways to reduce your carbon footprint",
      readTime: "4 min read",
      date: "2025-01-14"
    },
    {
      id: 3,
      title: "Modern Architecture",
      category: "TypoError",
      image: "https://static.vecteezy.com/system/resources/thumbnails/033/692/769/small_2x/rear-view-of-journalists-interviewing-a-man-in-the-news-studio-media-interview-in-a-conference-room-microphones-press-conference-press-conference-ai-generated-free-photo.jpg",
      excerpt: "Revolutionary building designs shaping our cities",
      readTime: "4 min read",
      date: "2025-01-14"
    },
    {
      id: 4,
      title: "Healthy Living",
      category: "Ashed Archives",
      image: "https://images.squarespace-cdn.com/content/v1/5d23fc4db9f14e0001763c43/1585335226592-L4JY2YJM11FLM0L6GA09/image-asset.jpeg",
      excerpt: "Tips for maintaining a balanced lifestyle",
      readTime: "4 min read",
      date: "2025-01-14"
    },
    {
      id: 5,
      title: "Travel Destinations",
      category: "Tarots",
      image: "https://images.squarespace-cdn.com/content/v1/55d635efe4b0d6e1513565eb/1697334271234-WDTIZE69XVPKSNO0NW57/petr-sidorov-GESOWH4YLRI-unsplash.jpg?format=1500w",
      excerpt: "Hidden gems around the world",
      readTime: "4 min read",
      date: "2025-01-14"
    },
    {
      id: 6,
      title: "Digital Art",
      category: "Brain Breakers",
      image: "https://images.unsplash.com/photo-1541692641319-981cc79ee10a?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
      excerpt: "The evolution of artistic expression in the digital age",
      readTime: "4 min read",
      date: "2025-01-14"
    },
    {
      id: 7,
      title: "The Art of Photography",
      category: "Cheat Sheet",
      image: "https://plus.unsplash.com/premium_photo-1690297732590-b9875f77471d?fm=jpg&q=60&w=3000&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MXx8ZGlnaXRhbCUyMGJyYWlufGVufDB8fDB8fHww",
      excerpt: "Mastering composition and lighting techniques",
      author: "Michael Brown",
      readTime: "7 min read",
      date: "2025-01-10"
    },
    {
      id: 8,
      title: "Mindful Meditation",
      category: "Burp Out",
      image: "https://images.unsplash.com/photo-1445979323117-80453f573b71?q=80&w=2073&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
      excerpt: "Finding peace in the digital age",
      author: "Sarah Wilson",
      readTime: "6 min read",
      date: "2025-01-09"
    }
  ];
  
  // Filter and search articles
  const filteredArticles = articles.filter(article => {
    const matchesCategory = !activeCategory || article.category === activeCategory;
    const matchesSearch = article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         article.excerpt.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  // Pagination
  const totalPages = Math.ceil(filteredArticles.length / itemsPerPage);
  const currentArticles = filteredArticles.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Existing functions
  const toggleSave = (articleId) => {
    setSavedArticles(prev => 
      prev.includes(articleId) 
        ? prev.filter(id => id !== articleId)
        : [...prev, articleId]
    );
  };

  const toggleLike = (articleId) => {
    setLikedArticles(prev => 
      prev.includes(articleId) 
        ? prev.filter(id => id !== articleId)
        : [...prev, articleId]
    );
  };

  const shareArticle = (article) => {
    if (navigator.share) {
      navigator.share({
        title: article.title,
        text: article.excerpt,
        url: window.location.href,
      });
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-md sticky top-0 z-10">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <BookOpen className="h-8 w-8 text-blue-600" />
              <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Noobs Bucket</h1>
            </div>
            <div className="flex items-center space-x-4">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search articles..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                />
                <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
              </div>
              <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                Subscribe
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6">
        {/* Featured Article */}
        <FeaturedArticle articles={articles} interval={5000} />

        {/* Three Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Edition Catalog */}
          <div className="lg:col-span-3">
            <div className="sticky top-4">
              <EditionCatalog articles={articles} />
            </div>
          </div>



          {/* Main Articles */}
          <div className="lg:col-span-6 space-y-6">
            {currentArticles.map(article => (
              <div key={article.id} className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden">
                <img
                  src={article.image}
                  alt={article.title}
                  className="w-full h-48 object-cover"
                />
                <div className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <span className="text-sm font-semibold text-blue-600 dark:text-blue-400">
                        {article.category}
                      </span>
                      <h3 className="text-xl font-bold dark:text-white mt-2">{article.title}</h3>
                    </div>
                    <div className="flex space-x-2">
                      <button 
                        onClick={() => toggleLike(article.id)}
                        className={`p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 ${
                          likedArticles.includes(article.id) ? 'text-red-500' : 'text-gray-500'
                        }`}
                      >
                        <Heart className="h-5 w-5" fill={likedArticles.includes(article.id) ? "currentColor" : "none"} />
                      </button>
                      <button 
                        onClick={() => toggleSave(article.id)}
                        className={`p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 ${
                          savedArticles.includes(article.id) ? 'text-blue-500' : 'text-gray-500'
                        }`}
                      >
                        <Bookmark className="h-5 w-5" fill={savedArticles.includes(article.id) ? "currentColor" : "none"} />
                      </button>
                      <button 
                        onClick={() => shareArticle(article)}
                        className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500"
                      >
                        <Share2 className="h-5 w-5" />
                      </button>
                    </div>
                  </div>
                  <p className="text-gray-600 dark:text-gray-300">{article.excerpt}</p>
                  <div className="mt-4 flex justify-between items-center">
                    <div className="flex items-center space-x-4">
                      <span className="text-sm text-gray-500 dark:text-gray-400">{article.readTime}</span>
                      <span className="text-sm text-gray-500 dark:text-gray-400">{article.date}</span>
                    </div>
                    <button className="text-blue-600 dark:text-blue-400 font-semibold hover:text-blue-800 dark:hover:text-blue-300">
                      Read More →
                    </button>
                  </div>
                </div>
              </div>
            ))}

            {/* Pagination */}
            <div className="flex justify-center items-center space-x-4 mt-8">
              <button 
                className="p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 disabled:opacity-50"
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
              >
                <ChevronLeft className="h-6 w-6 dark:text-white" />
              </button>
              <span className="text-lg font-semibold dark:text-white">
                Page {currentPage} of {totalPages}
              </span>
              <button 
                className="p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 disabled:opacity-50"
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
              >
                <ChevronRight className="h-6 w-6 dark:text-white" />
              </button>
            </div>
          </div>

          {/* Saved Articles */}
          <div className="lg:col-span-3">
          <div className="sticky top-4">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
              <h2 className="text-xl font-bold mb-4 dark:text-white">Saved Articles</h2>
                {articles
                  .filter(article => savedArticles.includes(article.id))
                  .map(article => (
                    <div key={article.id} className="border-b pb-4">
                      <div className="aspect-video mb-2 overflow-hidden rounded-lg">
                        <img
                          src={article.image}
                          alt={article.title}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <h4 className="font-medium dark:text-white">{article.title}</h4>
                      <div className="flex justify-between items-center mt-2">
                        <p className="text-sm text-gray-500 dark:text-gray-400">{article.readTime}</p>
                        <button 
                          onClick={() => toggleSave(article.id)}
                          className="text-blue-500"
                        >
                          <Bookmark className="h-4 w-4" fill="currentColor" />
                        </button>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VirtualMagazine;