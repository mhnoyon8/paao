import Database from 'better-sqlite3';
import fs from 'node:fs';
import path from 'node:path';

const dbPath = process.env.DB_PATH || process.env.DATABASE_URL || './db/paao.sqlite';
const sqlPath = path.resolve('./db/init.sql');
const sql = fs.readFileSync(sqlPath, 'utf-8');

const db = new Database(dbPath);
db.exec(sql);

export default db;
