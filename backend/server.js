const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 5000;

app.use(cors({ origin: 'http://localhost:5173' })); // Allow frontend origin
app.use(bodyParser.json()); // Parse JSON bodies
app.use(bodyParser.urlencoded({ extended: true })); // Parse URL-encoded bodies

// Load users from users.json
const usersFilePath = path.join(__dirname, 'users.json');
let users = require(usersFilePath);

// Save users to users.json
const saveUsers = () => {
  fs.writeFileSync(usersFilePath, JSON.stringify(users, null, 2));
};

// Routes
app.use('/auth', require('./routes/auth'));

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});