import AgentCard from './AgentCard';

export default function OfficeCanvas({ agents, onSelect, mode3d = false }) {
  return (
    <div className={`${mode3d ? 'office-3d ' : ''}grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3`}>
      {agents.map((a) => <AgentCard key={a.id} agent={a} onClick={onSelect} />)}
    </div>
  );
}
