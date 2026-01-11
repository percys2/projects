"use client";

import React, { useMemo, useState } from "react";
import { useOdontology } from "./hooks/useOdontology";
import PatientModal from "./components/PatientModal";
import AppointmentModal from "./components/AppointmentModal";
import OdontogramModal from "./components/OdontogramModal";

export default function OdontologyScreen({ orgSlug }) {
  const od = useOdontology(orgSlug);
  const [activeTab, setActiveTab] = useState("patients");

  const filteredPatients = useMemo(() => {
    const term = (od.searchPatients || "").trim().toLowerCase();
    if (!term) return od.patients;
    return od.patients.filter((p) => {
      const name = `${p.first_name || ""} ${p.last_name || ""}`.toLowerCase();
      return (
        name.includes(term) ||
        (p.phone || "").toLowerCase().includes(term) ||
        (p.email || "").toLowerCase().includes(term)
      );
    });
  }, [od.patients, od.searchPatients]);

  const filteredAppointments = useMemo(() => {
    const term = (od.searchAppointments || "").trim().toLowerCase();
    if (!term) return od.appointments;
    return od.appointments.filter((a) => {
      const p = a.patient || {};
      const name = `${p.first_name || ""} ${p.last_name || ""}`.toLowerCase();
      return (
        name.includes(term) ||
        (a.dentist_name || "").toLowerCase().includes(term) ||
        (a.status || "").toLowerCase().includes(term) ||
        (a.reason || "").toLowerCase().includes(term)
      );
    });
  }, [od.appointments, od.searchAppointments]);

  if (od.loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-slate-500">Cargando odontología...</p>
      </div>
    );
  }

  if (od.error) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-red-500">Error: {od.error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-5 max-w-6xl mx-auto px-2 sm:px-0">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
        <div>
          <h1 className="text-lg font-semibold text-slate-800">Odontología</h1>
          <p className="text-xs text-slate-500">Pacientes y citas</p>
        </div>
        <div className="flex gap-2">
          {activeTab === "patients" ? (
            <button
              onClick={od.openNewPatient}
              className="w-full sm:w-auto px-3 py-2 bg-slate-900 text-white rounded-lg text-xs hover:bg-slate-800 min-h-[44px]"
            >
              + Nuevo paciente
            </button>
          ) : (
            <button
              onClick={od.openNewAppointment}
              className="w-full sm:w-auto px-3 py-2 bg-slate-900 text-white rounded-lg text-xs hover:bg-slate-800 min-h-[44px]"
            >
              + Nueva cita
            </button>
          )}
        </div>
      </div>

      <div className="bg-white border rounded-xl shadow-sm overflow-hidden">
        <div className="border-b overflow-x-auto">
          <nav className="flex min-w-max">
            {[
              { id: "patients", label: `Pacientes (${od.patients.length})` },
              { id: "appointments", label: `Citas (${od.appointments.length})` },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-3 py-3 text-xs font-medium whitespace-nowrap ${
                  activeTab === tab.id
                    ? "border-b-2 border-slate-900 text-slate-900"
                    : "text-slate-500 hover:text-slate-700"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {activeTab === "patients" && (
          <>
            <div className="px-3 sm:px-4 py-3 border-b">
              <input
                value={od.searchPatients}
                onChange={(e) => od.setSearchPatients(e.target.value)}
                placeholder="Buscar paciente (nombre, teléfono, email)..."
                className="w-full max-w-xl p-2 text-sm border rounded-lg"
              />
            </div>
            <div className="px-2 sm:px-4 py-3 overflow-x-auto">
              <table className="w-full text-sm min-w-[760px]">
                <thead className="bg-slate-50 border-b">
                  <tr>
                    <th className="text-left p-3 font-medium text-slate-600">Paciente</th>
                    <th className="text-left p-3 font-medium text-slate-600">Teléfono</th>
                    <th className="text-left p-3 font-medium text-slate-600">Email</th>
                    <th className="text-left p-3 font-medium text-slate-600">Notas</th>
                    <th className="text-center p-3 font-medium text-slate-600">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredPatients.map((p) => (
                    <tr key={p.id} className="border-b hover:bg-slate-50">
                      <td className="p-3 font-medium">
                        {p.first_name} {p.last_name || ""}
                      </td>
                      <td className="p-3 text-slate-600">{p.phone || "-"}</td>
                      <td className="p-3 text-slate-600">{p.email || "-"}</td>
                      <td className="p-3 text-slate-500 truncate max-w-[320px]">
                        {p.notes || "-"}
                      </td>
                      <td className="p-3 text-center">
                        <button
                          onClick={() => od.openOdontogram(p)}
                          className="text-slate-900 hover:underline text-xs mr-3"
                        >
                          Odontograma
                        </button>
                        <button
                          onClick={() => od.openEditPatient(p)}
                          className="text-blue-600 hover:underline text-xs mr-3"
                        >
                          Editar
                        </button>
                        <button
                          onClick={() => {
                            if (confirm("¿Eliminar este paciente? Se eliminarán también sus citas.")) {
                              od.deletePatient(p.id);
                            }
                          }}
                          className="text-red-600 hover:underline text-xs"
                        >
                          Eliminar
                        </button>
                      </td>
                    </tr>
                  ))}
                  {filteredPatients.length === 0 && (
                    <tr>
                      <td colSpan="5" className="p-8 text-center text-slate-400">
                        No hay pacientes.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </>
        )}

        {activeTab === "appointments" && (
          <>
            <div className="px-3 sm:px-4 py-3 border-b">
              <input
                value={od.searchAppointments}
                onChange={(e) => od.setSearchAppointments(e.target.value)}
                placeholder="Buscar cita (paciente, profesional, estado, motivo)..."
                className="w-full max-w-xl p-2 text-sm border rounded-lg"
              />
            </div>
            <div className="px-2 sm:px-4 py-3 overflow-x-auto">
              <table className="w-full text-sm min-w-[980px]">
                <thead className="bg-slate-50 border-b">
                  <tr>
                    <th className="text-left p-3 font-medium text-slate-600">Fecha</th>
                    <th className="text-left p-3 font-medium text-slate-600">Paciente</th>
                    <th className="text-left p-3 font-medium text-slate-600">Profesional</th>
                    <th className="text-left p-3 font-medium text-slate-600">Duración</th>
                    <th className="text-left p-3 font-medium text-slate-600">Estado</th>
                    <th className="text-left p-3 font-medium text-slate-600">Motivo</th>
                    <th className="text-center p-3 font-medium text-slate-600">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredAppointments.map((a) => {
                    const p = a.patient || {};
                    const when = a.scheduled_at ? new Date(a.scheduled_at) : null;
                    return (
                      <tr key={a.id} className="border-b hover:bg-slate-50">
                        <td className="p-3 text-slate-700">
                          {when ? when.toLocaleString() : "-"}
                        </td>
                        <td className="p-3 font-medium">
                          {p.first_name || "-"} {p.last_name || ""}
                          <div className="text-[11px] text-slate-500">{p.phone || ""}</div>
                        </td>
                        <td className="p-3 text-slate-700">{a.dentist_name || "-"}</td>
                        <td className="p-3 text-slate-700">{a.duration_minutes ? `${a.duration_minutes} min` : "-"}</td>
                        <td className="p-3">
                          <span className="px-2 py-1 text-xs rounded-full bg-slate-100 text-slate-700">
                            {a.status || "scheduled"}
                          </span>
                        </td>
                        <td className="p-3 text-slate-600">{a.reason || "-"}</td>
                        <td className="p-3 text-center">
                          <button
                            onClick={() => od.openEditAppointment(a)}
                            className="text-blue-600 hover:underline text-xs mr-3"
                          >
                            Editar
                          </button>
                          <button
                            onClick={() => {
                              if (confirm("¿Eliminar esta cita?")) od.deleteAppointment(a.id);
                            }}
                            className="text-red-600 hover:underline text-xs"
                          >
                            Eliminar
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                  {filteredAppointments.length === 0 && (
                    <tr>
                      <td colSpan="7" className="p-8 text-center text-slate-400">
                        No hay citas.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>

      <PatientModal
        isOpen={od.isPatientModalOpen}
        onClose={od.closePatientModal}
        onSave={od.savePatient}
        patient={od.editingPatient}
      />

      <AppointmentModal
        isOpen={od.isAppointmentModalOpen}
        onClose={od.closeAppointmentModal}
        onSave={od.saveAppointment}
        appointment={od.editingAppointment}
        patients={od.patients}
      />

      <OdontogramModal
        isOpen={od.isOdontogramModalOpen}
        onClose={od.closeOdontogram}
        patient={od.odontogramPatient}
        onSaveOdontogram={od.saveOdontogram}
      />
    </div>
  );
}

