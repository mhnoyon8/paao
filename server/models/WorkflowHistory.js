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

export function getWorkflowAnalytics(days = 7) {
  const byEdge = db.prepare(`
    SELECT edgeId, COUNT(*) as transfers, SUM(dataSize) as totalDataSize, MAX(timestamp) as lastSeen
    FROM workflow_history
    WHERE timestamp >= datetime('now', ?)
    GROUP BY edgeId
    ORDER BY transfers DESC
  `).all(`-${Number(days)} day`);

  const summary = db.prepare(`
    SELECT COUNT(*) as totalTransfers, COALESCE(SUM(dataSize),0) as totalDataSize
    FROM workflow_history
    WHERE timestamp >= datetime('now', ?)
  `).get(`-${Number(days)} day`);

  return { days: Number(days), summary, byEdge };
}

export function cleanupWorkflowHistory(retentionDays = 30) {
  const stmt = db.prepare(`
    DELETE FROM workflow_history
    WHERE timestamp < datetime('now', ?)
  `);
  const info = stmt.run(`-${Number(retentionDays)} day`);
  return info.changes || 0;
}

export function exportWorkflowCsv(limit = 1000) {
  const rows = db.prepare(`
    SELECT id, edgeId, fromAgent, toAgent, taskDescription, dataSize, timestamp, status
    FROM workflow_history
    ORDER BY timestamp DESC
    LIMIT ?
  `).all(Number(limit));

  const esc = (v) => `"${String(v ?? '').replace(/"/g, '""')}"`;
  const head = ['id','edgeId','fromAgent','toAgent','taskDescription','dataSize','timestamp','status'];
  const lines = [head.join(',')];
  rows.forEach((r) => lines.push([
    r.id, r.edgeId, r.fromAgent, r.toAgent, r.taskDescription, r.dataSize, r.timestamp, r.status,
  ].map(esc).join(',')));
  return lines.join('\n');
}
