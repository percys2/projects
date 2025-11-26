"use client";

import { usePosStore } from "../store/usePosStore";

export default function CustomerForm() {
  const customer = usePosStore((s) => s.customerForm);
  const setField = usePosStore((s) => s.setCustomerField);

  const fields = [
    { label: "Nombre", key: "firstName" },
    { label: "Apellido", key: "lastName" },
    { label: "Teléfono", key: "phone" },
    { label: "Dirección", key: "address" },
    { label: "Municipio", key: "city" },
    { label: "Ciudad", key: "state" },
    { label: "País", key: "country" },
    { label: "RUC/Cédula", key: "ruc" },
  ];

  return (
    <div className="bg-white border rounded-lg p-3 space-y-2 shadow-sm">
      <h3 className="text-xs font-semibold mb-1">Datos del Cliente</h3>

      <div className="grid grid-cols-2 gap-2">
        {fields.map((f) => (
          <div key={f.key}>
            <input
              type="text"
              placeholder={f.label}
              value={customer[f.key]}
              onChange={(e) => setField(f.key, e.target.value)}
              className="w-full border rounded-md p-1.5 text-[11px] focus:ring-1 focus:ring-blue-400"
            />
          </div>
        ))}
      </div>
    </div>
  );
}
