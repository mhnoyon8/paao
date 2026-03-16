CREATE TABLE IF NOT EXISTS agents (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  role TEXT NOT NULL,
  status TEXT NOT NULL,
  currentTask TEXT,
  progress INTEGER DEFAULT 0,
  lastActive TEXT,
  assignedTo TEXT,
  conversations TEXT DEFAULT '[]'
);
