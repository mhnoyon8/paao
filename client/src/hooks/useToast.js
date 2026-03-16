import { useCallback, useState } from 'react';

let idSeq = 1;

export default function useToast() {
  const [toasts, setToasts] = useState([]);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const pushToast = useCallback((message, type = 'success', ttl = 2500) => {
    const id = idSeq++;
    setToasts((prev) => [...prev, { id, message, type }]);
    if (ttl > 0) setTimeout(() => removeToast(id), ttl);
    return id;
  }, [removeToast]);

  const updateToast = useCallback((id, patch) => {
    setToasts((prev) => prev.map((t) => (t.id === id ? { ...t, ...patch } : t)));
  }, []);

  return { toasts, pushToast, removeToast, updateToast };
}
