export default function WorkflowArrows({ agents = [], workflow = [], onEdgeClick }) {
  const order = ['aether', 'orion', 'pulse', 'trace'];
  const nodes = order
    .map((id) => agents.find((a) => a.id === id))
    .filter(Boolean);
  const edges = workflow.length ? workflow : nodes.slice(0, -1).map((n, i) => ({ from: n.id, to: nodes[i + 1].id }));

  if (!nodes.length) return null;

  return (
    <div className="rounded-xl bg-slate-900 border border-slate-700 p-4 mb-4 overflow-x-auto">
      <h3 className="text-sm font-semibold text-slate-200 mb-3">Workflow View</h3>
      <div className="min-w-[620px] flex items-center gap-3">
        {nodes.map((node) => {
          const edge = edges.find((e) => e.from === node.id);
          const next = edge ? nodes.find((n) => n.id === edge.to) : null;
          return (
            <div key={node.id} className="flex items-center gap-3">
              <button
                className="px-3 py-2 rounded-lg bg-slate-800 border border-slate-600 text-sm"
                onClick={() => onEdgeClick?.({ type: 'node', node })}
              >
                {node.name}
              </button>
              {next && (
                <button
                  className="text-cyan-300 text-lg animate-pulse"
                  onClick={() => onEdgeClick?.({ type: 'edge', from: node.id, to: next.id, label: edge.label, edgeId: `${node.id}->${next.id}` })}
                  title={`${node.name} → ${next.name}`}
                >
                  ⟶
                </button>
              )}
            </div>
          );
        })}
      </div>
      <p className="text-xs text-slate-400 mt-3">Aether → Orion → Pulse → Trace data flow</p>
    </div>
  );
}
