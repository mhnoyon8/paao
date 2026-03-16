const state = {
  lastRunAt: null,
  lastDeleted: 0,
  history: [],
};

export function recordCleanupRun(deleted = 0) {
  const item = { at: new Date().toISOString(), deleted: Number(deleted || 0) };
  state.lastRunAt = item.at;
  state.lastDeleted = item.deleted;
  state.history.unshift(item);
  state.history = state.history.slice(0, 20);
}

export function getCleanupStatus() {
  return {
    lastRunAt: state.lastRunAt,
    lastDeleted: state.lastDeleted,
    history: state.history,
  };
}
