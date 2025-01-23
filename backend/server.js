const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 5173;

app.use(cors());
app.use(bodyParser.json());

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