// SQLite
import { DatabaseSync } from "node:sqlite";

const db = new DatabaseSync(":memory:"); // creates a in memory database, :memory: means the database is temporary.

// Execute SQL statements from strings

// SQL command to create table
// primary key uniquely identifies each row(record) in a table
db.exec(`
  CREATE TABLE users (
  id INTEGER PRIMARY KEY AUTOINCREMENT, 
  username TEXT UNIQUE,           
  password TEXT
  )
  `);

db.exec(`
    CREATE TABLE todos(
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER, 
    task TEXT, 
    completed BOOLEAN DEFAULT 0,
    FOREIGN KEY(user_id) REFERENCES users(id)
    )
    `);

export default db;
