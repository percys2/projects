export default function PipelineBadge({ pipeline }) {
  const colors = {
    lead: "bg-slate-300",
    prospecto: "bg-blue-300",
    activo: "bg-green-300",
    frecuente: "bg-yellow-400",
    alto: "bg-purple-400",
    inactivo: "bg-red-300",
  };

  return (
    <span className={`px-3 py-1 rounded-full text-xs font-bold ${colors[pipeline]}`}>
      {pipeline.toUpperCase()}
    </span>
  );
}

