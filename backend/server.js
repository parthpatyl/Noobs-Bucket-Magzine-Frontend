const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
require('dotenv').config();

const app = express();
const PORT = 5000;

// Middleware
app.use(cors({ origin: 'http://localhost:5173' }));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// MongoDB Connection
mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => console.log("MongoDB connected"))
  .catch(err => console.log("MongoDB connection error:", err));

// Load users from users.json (keeping existing functionality)
const usersFilePath = path.join(__dirname, 'users.json');
delete require.cache[usersFilePath];
let users = require(usersFilePath);

// Save users to users.json (keeping existing functionality)
const saveUsers = () => {
  fs.writeFileSync(usersFilePath, JSON.stringify(users, null, 2));
};

// Routes
app.use('/auth', require('./routes/auth'));
app.use('/api/articles', require('./routes/articleRoutes'));

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});