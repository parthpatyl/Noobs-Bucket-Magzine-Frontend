import React, { useContext, useState, useEffect } from 'react'; // ✅ Added `useEffect`
import { useParams, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { Heart, Bookmark } from 'lucide-react'; // ✅ Ensure these icons exist

const API_BASE_URL = "http://localhost:5000";

const ArticlePage = () => {
    const { id } = useParams(); // Get ObjectId from URL
    const { user, updateUser } = useContext(AuthContext);
    const navigate = useNavigate();
    const [article, setArticle] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch(`${API_BASE_URL}/api/articles/${_id}`) // ✅ Fetch article by `_id`
            .then((response) => response.json())
            .then((data) => {
                setArticle(data);
                setLoading(false);
            })
            .catch((error) => {
                console.error("Error fetching article:", error);
                setLoading(false);
            });
    }, [id]);

    if (loading) return <p>Loading article...</p>;
    if (!article) return <p>Article not found</p>; // ✅ Removed duplicate check

    // ✅ Use `_id` instead of `id`
    const isSaved = user?.savedArticles?.includes(article._id);
    const isLiked = user?.likedArticles?.includes(article._id);

    const toggleSave = async () => {
        const newSaved = isSaved 
            ? user.savedArticles.filter(savedId => savedId !== article._id)
            : [...(user.savedArticles || []), article._id];

        await updateUser(user._id, { savedArticles: newSaved }); // ✅ Fixed `updateUser` call
    };

    const toggleLike = async () => {
        const newLiked = isLiked
            ? user.likedArticles.filter(likedId => likedId !== article._id)
            : [...(user.likedArticles || []), article._id];

        await updateUser(user._id, { likedArticles: newLiked }); // ✅ Fixed `updateUser` call
    };

    return (
        <div className="min-h-screen bg-gray-100 dark:bg-gray-900 p-8">
            <div className="max-w-4xl mx-auto bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8">
                <button 
                    onClick={() => navigate(-1)}
                    className="mb-6 text-blue-600 dark:text-blue-400 hover:underline"
                >
                    ← Back to Magazine
                </button>

                <img src={article.image} alt={article.title} className="w-full h-64 object-cover rounded-lg mb-6" />

                <div className="flex justify-between items-start mb-6">
                    <div>
                        <span className="text-sm font-semibold text-blue-600 dark:text-blue-400">
                            {article.category}
                        </span>
                        <h1 className="text-3xl font-bold dark:text-white mt-2">{article.title}</h1>
                    </div>
                    <div className="flex gap-4">
                        <button
                            onClick={toggleLike}
                            className={`p-2 rounded-full ${isLiked ? 'text-red-500' : 'text-gray-500'}`}
                        >
                            <Heart className="h-6 w-6" fill={isLiked ? 'currentColor' : 'none'} />
                        </button>
                        <button
                            onClick={toggleSave}
                            className={`p-2 rounded-full ${isSaved ? 'text-blue-500' : 'text-gray-500'}`}
                        >
                            <Bookmark className="h-6 w-6" fill={isSaved ? 'currentColor' : 'none'} />
                        </button>
                    </div>
                </div>

                <div className="prose dark:prose-invert max-w-none">
                    <p className="text-gray-600 dark:text-gray-300 text-lg">{article.content}</p>
                </div>
            </div>
        </div>
    );
};

export default ArticlePage;