const express = require("express");
const router = express.Router();

// Temporary routes for testing
router.get("/", (req, res) => {
    res.json({ message: "Articles route is working" });
});

module.exports = router;