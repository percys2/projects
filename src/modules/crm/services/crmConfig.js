export const DEFAULT_STAGES = [
  { code: "prospeccion", name: "Prospección", order: 1, probability: 0.10, color: "slate" },
  { code: "contacto", name: "Contacto", order: 2, probability: 0.20, color: "blue" },
  { code: "visita", name: "Visita Finca", order: 3, probability: 0.35, color: "cyan" },
  { code: "demo", name: "Demostración", order: 4, probability: 0.50, color: "indigo" },
  { code: "cotizacion", name: "Cotización", order: 5, probability: 0.70, color: "purple" },
  { code: "negociacion", name: "Negociación", order: 6, probability: 0.85, color: "amber" },
  { code: "ganado", name: "Ganado", order: 7, probability: 1.00, color: "emerald" },
  { code: "perdido", name: "Perdido", order: 8, probability: 0.00, color: "red" },
];

export const STAGE_COLORS = {
  slate: { bg: "bg-slate-100", border: "border-slate-300", text: "text-slate-700", header: "bg-slate-200" },
  blue: { bg: "bg-blue-50", border: "border-blue-300", text: "text-blue-700", header: "bg-blue-200" },
  cyan: { bg: "bg-cyan-50", border: "border-cyan-300", text: "text-cyan-700", header: "bg-cyan-200" },
  indigo: { bg: "bg-indigo-50", border: "border-indigo-300", text: "text-indigo-700", header: "bg-indigo-200" },
  purple: { bg: "bg-purple-50", border: "border-purple-300", text: "text-purple-700", header: "bg-purple-200" },
  amber: { bg: "bg-amber-50", border: "border-amber-300", text: "text-amber-700", header: "bg-amber-200" },
  emerald: { bg: "bg-emerald-50", border: "border-emerald-300", text: "text-emerald-700", header: "bg-emerald-200" },
  red: { bg: "bg-red-50", border: "border-red-300", text: "text-red-700", header: "bg-red-200" },
};

export const ACTIVITY_TYPES = [
  { code: "llamada", name: "Llamada", icon: "phone" },
  { code: "visita", name: "Visita", icon: "car" },
  { code: "whatsapp", name: "WhatsApp", icon: "message" },
  { code: "email", name: "Email", icon: "mail" },
  { code: "demo", name: "Demo Campo", icon: "leaf" },
];

export const OPPORTUNITY_SOURCES = [
  "Referido",
  "Visita finca",
  "WhatsApp",
  "Llamada entrante",
  "Feria agrícola",
  "Web",
  "Otro",
];

export function getStageColor(colorName) {
  return STAGE_COLORS[colorName] || STAGE_COLORS.slate;
}

export function calculatePipelineValue(opportunities, stages) {
  return opportunities.reduce((total, opp) => {
    const stage = stages.find((s) => s.id === opp.stage_id);
    const probability = stage?.probability || 0;
    return total + (opp.amount || 0) * probability;
  }, 0);
}

export function groupOpportunitiesByStage(opportunities, stages) {
  const grouped = {};
  stages.forEach((stage) => {
    grouped[stage.id] = {
      stage,
      opportunities: [],
      totalAmount: 0,
      count: 0,
    };
  });

  opportunities.forEach((opp) => {
    if (grouped[opp.stage_id]) {
      grouped[opp.stage_id].opportunities.push(opp);
      grouped[opp.stage_id].totalAmount += opp.amount || 0;
      grouped[opp.stage_id].count += 1;
    }
  });

  return Object.values(grouped).sort((a, b) => a.stage.sort_order - b.stage.sort_order);
}
