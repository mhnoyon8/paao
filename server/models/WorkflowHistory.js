import db from '../services/db.js';

export function initWorkflowHistoryTable() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS workflow_history (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      edgeId TEXT NOT NULL,
      fromAgent TEXT NOT NULL,
      toAgent TEXT NOT NULL,
      taskDescription TEXT,
      dataSize INTEGER DEFAULT 0,
      timestamp TEXT NOT NULL,
      status TEXT DEFAULT 'delivered'
    );
  `);
}

export function insertWorkflowHistory({ edgeId, fromAgent, toAgent, taskDescription, dataSize, timestamp, status }) {
  const stmt = db.prepare(`
    INSERT INTO workflow_history (edgeId, fromAgent, toAgent, taskDescription, dataSize, timestamp, status)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);
  const info = stmt.run(
    edgeId,
    fromAgent,
    toAgent,
    taskDescription || '',
    Number(dataSize || 0),
    timestamp || new Date().toISOString(),
    status || 'delivered'
  );
  return info.lastInsertRowid;
}

export function getWorkflowHistoryByEdge(edgeId) {
  const stmt = db.prepare(`
    SELECT * FROM workflow_history
    WHERE edgeId = ?
      AND timestamp >= datetime('now', '-7 day')
    ORDER BY timestamp DESC
  `);
  return stmt.all(edgeId);
}

export function getWorkflowHistoryRecent(limit = 20) {
  const stmt = db.prepare(`
    SELECT * FROM workflow_history
    ORDER BY timestamp DESC
    LIMIT ?
  `);
  return stmt.all(Number(limit));
}
