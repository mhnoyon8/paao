import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

export default function WorkflowBarChart({ data = [] }) {
  const rows = data.map((x) => ({ edge: x.edgeId, transfers: x.transfers }));

  return (
    <div className="mt-3 h-48 rounded bg-slate-800 p-2">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={rows}>
          <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
          <XAxis dataKey="edge" tick={{ fill: '#cbd5e1', fontSize: 11 }} />
          <YAxis tick={{ fill: '#cbd5e1', fontSize: 11 }} />
          <Tooltip contentStyle={{ background: '#0f172a', border: '1px solid #334155', color: '#e2e8f0' }} />
          <Bar dataKey="transfers" fill="#22d3ee" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
