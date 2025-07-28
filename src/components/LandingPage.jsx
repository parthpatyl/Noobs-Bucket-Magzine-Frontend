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

  return (
    <div className="min-h-screen bg-[url(src/assets/img.svg)]">  
    <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-12 transform transition-all hover:scale-105">
          <div className="flex justify-center mb-8">
            <BookOpen className="h-16 w-16 text-blue-600 dark:text-blue-400" />
          </div>
          <h1 className="text-4xl font-extrabold mb-6 text-gray-900 dark:text-white">
            Welcome to Noob's Bucket
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 leading-relaxed">
            Dive into a world of knowledge, exploration, and inspiration.
            Our curated collection of articles spans diverse topics,
            designed to spark curiosity and fuel your learning journey.
          </p>
          <div className="flex justify-center space-x-4">
            {!isAuthenticated && (
              <button
                onClick={() => navigate('/auth/register')}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Create Account
              </button>
            )}
            <button
              onClick={handleLetsBegin}
              className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2"
            >
              <span>Let's Dive In</span>
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>
          <div className="mt-12 grid grid-cols-3 gap-4 opacity-50">
          </div>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;