import AgentCard from './AgentCard';

export default function OfficeCanvas({ agents, onSelect }) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
      {agents.map((a) => <AgentCard key={a.id} agent={a} onClick={onSelect} />)}
    </div>
  );
}
