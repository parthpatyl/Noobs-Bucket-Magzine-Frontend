import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";

const useArticleActions = () => {
  const {
    likedArticles,
    savedArticles,
    likeArticle,
    unlikeArticle,
    saveArticle,
    unsaveArticle,
  } = useContext(AuthContext);

  const toggleLike = async (articleId) => {
    if (likedArticles.includes(articleId)) {
      return await unlikeArticle(articleId);
    } else {
      return await likeArticle(articleId);
    }
  };

  const toggleSave = async (articleId) => {
    if (savedArticles.includes(articleId)) {
      return await unsaveArticle(articleId);
    } else {
      return await saveArticle(articleId);
    }
  };

  return {
    likedArticles,
    savedArticles,
    toggleLike,
    toggleSave,
  };
};

export default useArticleActions;
