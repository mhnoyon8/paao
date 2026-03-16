import { statusConfig } from '../utils/pixelArt';

export default function StatusIndicator({ status }) {
  const meta = statusConfig[status] || statusConfig.idle;
  return (
    <span className={`text-xs px-2 py-1 rounded-full text-black font-semibold ${meta.color}`}>
      {meta.badge} {meta.label}
    </span>
  );
}
