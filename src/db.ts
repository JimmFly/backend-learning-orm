import Database from "better-sqlite3";

export interface User {
  id: number;
  username: string;
  password: string;
}
export interface Todo {
  id: number;
  user_id: number;
  task: string;
  completed: boolean;
}
const db: Database.Database = new Database("todo.db");
db.pragma("journal_mode = WAL");

//Execute some SQL commands to set up a table,if EXISTS, it won't recreate it
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT NOT NULL UNIQUE,
    password TEXT NOT NULL
  );
`);

db.exec(`
  CREATE TABLE IF NOT EXISTS todos (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    task TEXT NOT NULL,
    completed BOOLEAN NOT NULL DEFAULT 0,
    FOREIGN KEY (user_id) REFERENCES users(id)
  );
`);

export default db;
