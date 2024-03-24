const { Level } = require("level");

// Create a database
const dbPath = "./database";
const db = new Level(dbPath, { valueEncoding: "json" });

module.exports = db;
