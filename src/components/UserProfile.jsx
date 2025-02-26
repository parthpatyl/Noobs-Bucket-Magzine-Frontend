import React, { useContext, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const UserProfile = () => {
  const { id } = useParams();
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('saved');

  if (!user) {
    console.warn("⚠️ User is undefined, redirecting...");
    navigate("/auth/login");
    return null;
  }

  // Fix ID comparison
  if (!user || user.id !== String(id)) {
    return (
      <div className="min-h-screen bg-gray-100 dark:bg-gray-900 flex items-center justify-center">
        <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-lg text-center">
          <span className="text-6xl mb-4">😞</span>
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white mb-4">
            User Not Found
          </h1>
          <button
            onClick={() => navigate("/magazine")}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Return Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden">
          <div className="bg-blue-600 p-6">
            <div className="flex items-center gap-6">
              <div className="w-20 h-20 rounded-full bg-white flex items-center justify-center">
                <span className="text-2xl font-bold text-blue-600">
                  {user.name[0].toUpperCase()}
                </span>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">{user.name}</h1>
                <p className="text-blue-100">{user.email}</p>
              </div>
            </div>
          </div>

          <div className="p-6 border-t border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-semibold mb-4 dark:text-white">Account Details</h2>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-600 dark:text-gray-300">Name:</span>
                <span className="font-medium dark:text-white">{user.name}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600 dark:text-gray-300">Email:</span>
                <span className="font-medium dark:text-white">{user.email}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600 dark:text-gray-300">Member Since:</span>
                <span className="font-medium dark:text-white">
                  {new Date(user.memberSince).toLocaleDateString()}
                </span>
              </div>
            </div>
          </div>

          <div className="p-6 border-t border-gray-200 dark:border-gray-700 flex justify-end gap-4">
            <button
              onClick={() => navigate("/magazine")}
              className="px-6 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
            >
              Back to Articles
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserProfile;
