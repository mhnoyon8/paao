export const statuses = ['working', 'waiting', 'calling', 'idle', 'error'];

export function normalizeAgent(row) {
  return {
    ...row,
    progress: Number(row.progress || 0),
    conversations: typeof row.conversations === 'string' ? JSON.parse(row.conversations || '[]') : (row.conversations || []),
  };
}
