import React, { useContext, useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { Heart, Bookmark } from 'lucide-react';
import { API_BASE_URL } from '../utils/api';

const ArticlePage = () => {
    const { id } = useParams(); // Get ObjectId from URL
    const { user, updateUser } = useContext(AuthContext);
    const navigate = useNavigate();
    const [article, setArticle] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch(`${API_BASE_URL}/api/articles/get/${id}`) // ✅ Correct API call
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

    if (loading) return <p>Loading...</p>;
    if (!article) return <p>Article not found.</p>;

    return (
        <div>
            <h1>{article.title}</h1>
            <p>{article.content}</p>
        </div>
    );
};

export default ArticlePage;
