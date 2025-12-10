import React from 'react';
import { useNavigate } from 'react-router-dom';
import { BookOpen, ChevronRight } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';
import { useContext } from 'react';

const LandingPage = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useContext(AuthContext);

  const handleLetsBegin = () => {
    navigate('/magazine');
  };

  // Ensure LandingPage is wrapped in AuthProvider
  if (!isAuthenticated) {
    console.warn("⚠️ User is not authenticated.");
  }

  const [recentArticles, setRecentArticles] = React.useState([]);

  React.useEffect(() => {
    const fetchArticles = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/articles/get');
        const data = await response.json();
        if (response.ok) {
          setRecentArticles(data.slice(0, 3));
        }
      } catch (error) {
        console.error("Error fetching recent articles:", error);
      }
    };
    fetchArticles();
  }, []);

  return (
    <div className="min-h-screen bg-brand-bg relative overflow-hidden">
      {/* Background Glow Effects */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-brand-primary/20 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2"></div>
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-brand-secondary/20 rounded-full blur-3xl translate-x-1/2 translate-y-1/2"></div>

      {/* Hero Section */}
      <div className="min-h-screen flex items-center justify-center relative z-10">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <div className="bg-brand-surface border border-white/10 rounded-2xl shadow-2xl p-12 transform transition-all hover:scale-[1.02] hover:shadow-glow duration-500">
            <div className="flex justify-center mb-8">
              <div className="p-4 bg-brand-bg rounded-xl shadow-inner">
                <BookOpen className="h-16 w-16 text-brand-primary animate-pulse" />
              </div>
            </div>
            <h1 className="text-5xl font-extrabold mb-6 text-brand-text tracking-tight">
              Welcome to <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-primary to-brand-secondary">Noob's Bucket</span>
            </h1>
            <p className="text-xl text-brand-muted mb-8 leading-relaxed max-w-2xl mx-auto">
              Dive into a world of knowledge, exploration, and inspiration.
              Our curated collection of articles spans diverse topics,
              designed to spark curiosity and fuel your learning journey.
            </p>
            <div className="flex justify-center space-x-6">
              {!isAuthenticated && (
                <button
                  onClick={() => navigate('/auth/register')}
                  className="px-8 py-4 bg-transparent border-2 border-brand-primary text-brand-primary font-bold rounded-xl hover:bg-brand-primary hover:text-white transition-all duration-300 shadow-[0_0_15px_rgba(255,122,0,0.2)] hover:shadow-glow"
                >
                  Create Account
                </button>
              )}
              <button
                onClick={handleLetsBegin}
                className="px-8 py-4 bg-gradient-to-r from-brand-primary to-brand-secondary text-black font-bold rounded-xl hover:brightness-110 transition-all duration-300 flex items-center space-x-3 shadow-lg hover:shadow-glow transform hover:-translate-y-1"
              >
                <span>Let's Dive In</span>
                <ChevronRight className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Highlights Section */}
      {recentArticles.length > 0 && (
        <div className="max-w-7xl mx-auto px-4 py-20 relative z-10">
          <h2 className="text-3xl font-bold text-brand-text mb-10 text-center">Recent Highlights</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {recentArticles.map((article) => (
              <div
                key={article._id}
                onClick={() => navigate(`/article/${article._id}`)}
                className="bg-brand-surface rounded-xl overflow-hidden shadow-lg border border-white/5 hover:border-brand-primary/50 transition-all duration-300 cursor-pointer group hover:-translate-y-2"
              >
                <img
                  src={article.image && Array.isArray(article.image) ? article.image[0] : article.image}
                  alt={article.title}
                  className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="p-6">
                  <span className="text-xs font-bold text-brand-primary uppercase tracking-wider">{article.category}</span>
                  <h3 className="text-xl font-bold text-brand-text mt-2 mb-3 group-hover:text-brand-primary transition-colors">{article.title}</h3>
                  <p className="text-brand-muted text-sm line-clamp-3">{article.excerpt}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="text-center mt-12">
            <button
              onClick={() => navigate('/magazine')}
              className="text-brand-text hover:text-brand-primary font-semibold flex items-center justify-center mx-auto space-x-2 transition-colors"
            >
              <span>View All Articles</span>
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default LandingPage;