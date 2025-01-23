const express = require('express');
const router = express.Router();
const users = require('../users.json');
const fs = require('fs');
const path = require('path');

const usersFilePath = path.join(__dirname, '../users.json'); // Adjust if needed

const loadUsers = () => {
  return JSON.parse(fs.readFileSync(usersFilePath, 'utf-8'));
};

const saveUsers = () => {
  fs.writeFileSync(usersFilePath, JSON.stringify(users, null, 2));
};

router.post('/login', (req, res) => {
  try {
    const { email, password } = req.body;
    const users = loadUsers(); // Reload users from file
    const user = users.find((u) => u.email === email && u.password === password);

    if (user) {
      res.json({ success: true, user });
    } else {
      res.status(401).json({ success: false, message: 'Invalid credentials' });
    }
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

router.post('/register', (req, res) => {
  try {
    const { email, password } = req.body;
    const users = loadUsers(); // Reload users from file
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
      saveUsers(); // Save to users.json
      res.json({ success: true, user: newUser });
    }
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Add this new route
router.put('/user/:id', (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    const users = loadUsers();
    
    const userIndex = users.findIndex(u => u.id === parseInt(id));
    if (userIndex === -1) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    users[userIndex] = { ...users[userIndex], ...updates };
    saveUsers();
    res.json({ success: true, user: users[userIndex] });
  } catch (error) {
    console.error('Update error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;