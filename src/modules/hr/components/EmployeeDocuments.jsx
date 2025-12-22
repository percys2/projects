"use client";

import React, { useState, useMemo } from "react";

export default function EmployeeDocuments({ employees, orgSlug }) {
  const [documents, setDocuments] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState("");
  const [documentForm, setDocumentForm] = useState({
    type: "contrato",
    name: "",
    expiryDate: "",
    notes: "",
  });
  const [filterEmployee, setFilterEmployee] = useState("");
  const [filterType, setFilterType] = useState("");

  const activeEmployees = useMemo(() => {
    return employees.filter((emp) => emp.status === "activo");
  }, [employees]);

  const documentTypes = {
    contrato: { label: "Contrato", color: "bg-blue-100 text-blue-700" },
    cedula: { label: "Cedula", color: "bg-slate-100 text-slate-700" },
    inss: { label: "Carnet INSS", color: "bg-emerald-100 text-emerald-700" },
    licencia: { label: "Licencia", color: "bg-purple-100 text-purple-700" },
    titulo: { label: "Titulo/Certificado", color: "bg-amber-100 text-amber-700" },
    evaluacion: { label: "Evaluacion", color: "bg-cyan-100 text-cyan-700" },
    amonestacion: { label: "Amonestacion", color: "bg-red-100 text-red-700" },
    otro: { label: "Otro", color: "bg-slate-100 text-slate-700" },
  };

  const filteredDocuments = useMemo(() => {
    return documents.filter((doc) => {
      if (filterEmployee && doc.employeeId !== filterEmployee) return false;
      if (filterType && doc.type !== filterType) return false;
      return true;
    });
  }, [documents, filterEmployee, filterType]);

  const expiringDocuments = useMemo(() => {
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
    return documents.filter((doc) => {
      if (!doc.expiryDate) return false;
      const expiry = new Date(doc.expiryDate);
      return expiry <= thirtyDaysFromNow && expiry >= new Date();
    });
  }, [documents]);

  const expiredDocuments = useMemo(() => {
    const today = new Date();
    return documents.filter((doc) => {
      if (!doc.expiryDate) return false;
      return new Date(doc.expiryDate) < today;
    });
  }, [documents]);

  const handleAddDocument = () => {
    if (!selectedEmployee || !documentForm.name) {
      alert("Complete los campos requeridos");
      return;
    }
    const employee = activeEmployees.find((e) => e.id === selectedEmployee);
    const newDocument = {
      id: Date.now().toString(),
      employeeId: selectedEmployee,
      employeeName: employee?.name || "",
      type: documentForm.type,
      name: documentForm.name,
      expiryDate: documentForm.expiryDate || null,
      notes: documentForm.notes,
      createdAt: new Date().toISOString(),
    };
    setDocuments((prev) => [newDocument, ...prev]);
    setShowModal(false);
    setDocumentForm({ type: "contrato", name: "", expiryDate: "", notes: "" });
    setSelectedEmployee("");
  };

  const handleDeleteDocument = (docId) => {
    if (confirm("Eliminar este documento?")) {
      setDocuments((prev) => prev.filter((d) => d.id !== docId));
    }
  };

  const getExpiryStatus = (expiryDate) => {
    if (!expiryDate) return null;
    const expiry = new Date(expiryDate);
    const today = new Date();
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
    if (expiry < today) return { label: "Vencido", color: "bg-red-100 text-red-700" };
    if (expiry <= thirtyDaysFromNow) return { label: "Por vencer", color: "bg-amber-100 text-amber-700" };
    return { label: "Vigente", color: "bg-emerald-100 text-emerald-700" };
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
        <div>
          <h3 className="text-sm font-semibold text-slate-700">Documentos de Empleados</h3>
          <p className="text-xs text-slate-500">Gestiona contratos, cedulas y otros documentos</p>
        </div>
        <button onClick={() => setShowModal(true)} className="px-3 py-2 bg-slate-900 text-white rounded-lg text-xs hover:bg-slate-800">+ Agregar Documento</button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 text-center">
          <p className="text-2xl font-bold text-slate-700">{documents.length}</p>
          <p className="text-xs text-slate-500">Total Documentos</p>
        </div>
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 text-center">
          <p className="text-2xl font-bold text-amber-600">{expiringDocuments.length}</p>
          <p className="text-xs text-slate-500">Por Vencer (30 dias)</p>
        </div>
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
          <p className="text-2xl font-bold text-red-600">{expiredDocuments.length}</p>
          <p className="text-xs text-slate-500">Vencidos</p>
        </div>
      </div>

      {(expiringDocuments.length > 0 || expiredDocuments.length > 0) && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
          <h4 className="text-sm font-semibold text-amber-700 mb-2">Alertas de Vencimiento</h4>
          <div className="space-y-2">
            {expiredDocuments.map((doc) => (
              <div key={doc.id} className="flex justify-between items-center text-sm">
                <span className="text-red-700">{doc.employeeName} - {documentTypes[doc.type]?.label}: {doc.name}</span>
                <span className="px-2 py-0.5 text-xs rounded-full bg-red-100 text-red-700">Vencido {new Date(doc.expiryDate).toLocaleDateString("es-NI")}</span>
              </div>
            ))}
            {expiringDocuments.map((doc) => (
              <div key={doc.id} className="flex justify-between items-center text-sm">
                <span className="text-amber-700">{doc.employeeName} - {documentTypes[doc.type]?.label}: {doc.name}</span>
                <span className="px-2 py-0.5 text-xs rounded-full bg-amber-100 text-amber-700">Vence {new Date(doc.expiryDate).toLocaleDateString("es-NI")}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="flex flex-wrap gap-3">
        <select value={filterEmployee} onChange={(e) => setFilterEmployee(e.target.value)} className="px-3 py-2 border rounded-lg text-sm">
          <option value="">Todos los empleados</option>
          {activeEmployees.map((emp) => (<option key={emp.id} value={emp.id}>{emp.name}</option>))}
        </select>
        <select value={filterType} onChange={(e) => setFilterType(e.target.value)} className="px-3 py-2 border rounded-lg text-sm">
          <option value="">Todos los tipos</option>
          {Object.entries(documentTypes).map(([key, { label }]) => (<option key={key} value={key}>{label}</option>))}
        </select>
      </div>

      <div className="border rounded-lg">
        <div className="px-4 py-3 border-b bg-slate-50">
          <h4 className="text-sm font-semibold text-slate-700">Documentos ({filteredDocuments.length})</h4>
        </div>
        <div className="divide-y max-h-96 overflow-y-auto">
          {filteredDocuments.length === 0 ? (
            <p className="p-4 text-sm text-slate-400 text-center">No hay documentos registrados</p>
          ) : (
            filteredDocuments.map((doc) => {
              const expiryStatus = getExpiryStatus(doc.expiryDate);
              return (
                <div key={doc.id} className="p-4 flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`px-2 py-0.5 text-xs rounded-full ${documentTypes[doc.type]?.color}`}>{documentTypes[doc.type]?.label}</span>
                      {expiryStatus && <span className={`px-2 py-0.5 text-xs rounded-full ${expiryStatus.color}`}>{expiryStatus.label}</span>}
                    </div>
                    <p className="font-medium text-slate-800">{doc.name}</p>
                    <p className="text-xs text-slate-500">{doc.employeeName}</p>
                    {doc.expiryDate && <p className="text-xs text-slate-400">Vence: {new Date(doc.expiryDate).toLocaleDateString("es-NI")}</p>}
                    {doc.notes && <p className="text-xs text-slate-400 mt-1">{doc.notes}</p>}
                  </div>
                  <button onClick={() => handleDeleteDocument(doc.id)} className="text-xs text-red-600 hover:text-red-800">Eliminar</button>
                </div>
              );
            })
          )}
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6">
            <h3 className="text-lg font-semibold mb-4">Agregar Documento</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Empleado *</label>
                <select value={selectedEmployee} onChange={(e) => setSelectedEmployee(e.target.value)} className="w-full px-3 py-2 border rounded-lg text-sm">
                  <option value="">Seleccionar empleado</option>
                  {activeEmployees.map((emp) => (<option key={emp.id} value={emp.id}>{emp.name}</option>))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Tipo de Documento *</label>
                <select value={documentForm.type} onChange={(e) => setDocumentForm({ ...documentForm, type: e.target.value })} className="w-full px-3 py-2 border rounded-lg text-sm">
                  {Object.entries(documentTypes).map(([key, { label }]) => (<option key={key} value={key}>{label}</option>))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Nombre del Documento *</label>
                <input type="text" value={documentForm.name} onChange={(e) => setDocumentForm({ ...documentForm, name: e.target.value })} className="w-full px-3 py-2 border rounded-lg text-sm" placeholder="Ej: Contrato Indefinido 2024" />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Fecha de Vencimiento</label>
                <input type="date" value={documentForm.expiryDate} onChange={(e) => setDocumentForm({ ...documentForm, expiryDate: e.target.value })} className="w-full px-3 py-2 border rounded-lg text-sm" />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Notas</label>
                <textarea value={documentForm.notes} onChange={(e) => setDocumentForm({ ...documentForm, notes: e.target.value })} className="w-full px-3 py-2 border rounded-lg text-sm" rows={2} placeholder="Observaciones..." />
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-6">
              <button onClick={() => { setShowModal(false); setSelectedEmployee(""); }} className="px-4 py-2 text-sm text-slate-600 hover:text-slate-800">Cancelar</button>
              <button onClick={handleAddDocument} className="px-4 py-2 text-sm bg-slate-900 text-white rounded-lg hover:bg-slate-800">Guardar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}