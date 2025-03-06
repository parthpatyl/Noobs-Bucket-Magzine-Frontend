import { useEffect, useState } from "react";

function SavedArticles() {
  const [articles, setArticles] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch("/api/saved-articles")
      .then((res) => {
        if (!res.ok) {
          throw new Error("Failed to fetch articles");
        }
        return res.json();
      })
      .then((data) => {
        console.log("Fetched data:", data);
        setArticles(data);
      })
      .catch((err) => {
        console.error("Fetch error:", err);
        setError(err.message);
      });
  }, []);

  return (
    <div>
      <h2>Saved Articles</h2>
      {error && <p style={{ color: "red" }}>Error: {error}</p>}
      {articles.length === 0 ? (
        <p>No saved articles found.</p>
      ) : (
        <ul>
          {articles.map((article, index) => (
            <li key={index}>{article.title}</li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default SavedArticles;