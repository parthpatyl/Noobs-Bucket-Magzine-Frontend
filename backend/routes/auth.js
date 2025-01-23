const express = require('express');
const router = express.Router();
const users = require('../users.json');
const fs = require('fs');
const path = require('path');

const usersFilePath = path.join(__dirname, '../users.json');

// Save users to users.json
const saveUsers = () => {
  fs.writeFileSync(usersFilePath, JSON.stringify(users, null, 2));
};

// Login endpoint
router.post('/login', (req, res) => {
  const { email, password } = req.body;
  const user = users.find((u) => u.email === email && u.password === password);

  if (user) {
    res.json({ success: true, user });
  } else {
    res.status(401).json({ success: false, message: 'Invalid credentials' });
  }
});

// Register endpoint
router.post('/register', (req, res) => {
  const { email, password } = req.body;
  const userExists = users.some((u) => u.email === email);

  if (userExists) {
    res.status(400).json({ success: false, message: 'User already exists' });
  } else {
    const newUser = {
      id: users.length + 1,
      email,
      password,
      savedArticles: [],
      likedArticles: [],
    };
    users.push(newUser);
    saveUsers(); // Save the updated users array to users.json
    res.json({ success: true, user: newUser });
  }
});

module.exports = router;