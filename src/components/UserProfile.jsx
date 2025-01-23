import React, { useContext } from 'react';
import { useParams } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const UserProfile = () => {
  const { id } = useParams();
  const { user } = useContext(AuthContext);

  if (!user || user.id.toString() !== id) {
    return <div>User not found</div>;
  }

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold">User Profile</h1>
      <p>Email: {user.email}</p>
      <p>Saved Articles: {user.savedArticles?.length}</p>
      <p>Liked Articles: {user.likedArticles?.length}</p>
    </div>
  );
};

export default UserProfile;