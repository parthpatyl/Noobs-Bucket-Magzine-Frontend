const express = require('express');
const router = express.Router();
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const fs = require('fs'); // File system module

const usersFilePath = path.join(__dirname, '../users.json');
let users = require(usersFilePath);

router.post('/register', (req, res) => {
  const { email, password } = req.body;
  
  if (users.some(u => u.email === email)) {
    return res.status(400).json({ 
      success: false, 
      message: "User already exists",
      user: null 
    });
  }

  const newUser = {
    id: uuidv4(),
    email,
    password,
    savedArticles: [],
    likedArticles: []
  };

  users.push(newUser);
  fs.writeFileSync(usersFilePath, JSON.stringify(users, null, 2));
  
  res.json({ 
    success: true,
    user: newUser 
  });
});

router.post('/login', (req, res) => {
  const { email, password } = req.body;
  const user = users.find(u => u.email === email && u.password === password);

  if (!user) {
    return res.status(401).json({ success: false, message: "Invalid credentials" });
  }

  res.json({ success: true, user });
});

router.put('/user/:userId', (req, res) => {
  const { userId } = req.params;
  const updates = req.body;
  const userIndex = users.findIndex(u => u.id === userId);

  if (userIndex === -1) {
    return res.status(404).json({ success: false, message: "User not found" });
  }

  // Merge updates while preserving existing array structures
  const updatedUser = {
    ...users[userIndex],
    ...updates,
    savedArticles: updates.savedArticles || users[userIndex].savedArticles,
    likedArticles: updates.likedArticles || users[userIndex].likedArticles
  };

  users[userIndex] = updatedUser;
  fs.writeFileSync(usersFilePath, JSON.stringify(users, null, 2));
  res.json({ success: true, user: updatedUser });
});

module.exports = router;