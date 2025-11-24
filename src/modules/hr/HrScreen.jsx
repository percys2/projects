"use client";

import React, { useState, useEffect } from "react";
import { useHrData } from "./hooks/useHrData";
import EmployeesList from "./components/EmployeesList";
import EmployeeModal from "./components/EmployeeModal";
import AttendanceTracker from "./components/AttendanceTracker";
import PayrollSummary from "./components/PayrollSummary";

export default function HrScreen({ orgSlug }) {
  const {
    employees,
    attendance,
    loading,
    addEmployee,
    updateEmployee,
    deleteEmployee,
    markAttendance,
  } = useHrData(orgSlug);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState(null);
  const [activeTab, setActiveTab] = useState("employees");

  const handleAddEmployee = () => {
    setEditingEmployee(null);
    setIsModalOpen(true);
  };

  const handleEditEmployee = (employee) => {
    setEditingEmployee(employee);
    setIsModalOpen(true);
  };

  const handleSaveEmployee = async (employeeData) => {
    if (editingEmployee) {
      await updateEmployee(editingEmployee.id, employeeData);
    } else {
      await addEmployee(employeeData);
    }
    setIsModalOpen(false);
    setEditingEmployee(null);
  };

  const handleDeleteEmployee = async (id) => {
    if (confirm("¿Está seguro de eliminar este empleado?")) {
      await deleteEmployee(id);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-slate-500">Cargando datos de RRHH...</p>
      </div>
    );
  }

  return (
    <div className="space-y-5 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-lg font-semibold text-slate-800">Recursos Humanos</h1>
          <p className="text-xs text-slate-500">
            Gestión de empleados, asistencia y nómina
          </p>
        </div>
        <button
          onClick={handleAddEmployee}
          className="px-4 py-2 bg-slate-900 text-white rounded-lg text-sm hover:bg-slate-800"
        >
          + Nuevo Empleado
        </button>
      </div>

      {/* Tabs */}
      <div className="bg-white border rounded-xl shadow-sm overflow-hidden">
        <div className="border-b">
          <div className="flex">
            <button
              onClick={() => setActiveTab("employees")}
              className={`px-6 py-3 text-sm font-medium ${
                activeTab === "employees"
                  ? "border-b-2 border-slate-900 text-slate-900"
                  : "text-slate-500 hover:text-slate-700"
              }`}
            >
              Empleados
            </button>
            <button
              onClick={() => setActiveTab("attendance")}
              className={`px-6 py-3 text-sm font-medium ${
                activeTab === "attendance"
                  ? "border-b-2 border-slate-900 text-slate-900"
                  : "text-slate-500 hover:text-slate-700"
              }`}
            >
              Asistencia
            </button>
            <button
              onClick={() => setActiveTab("payroll")}
              className={`px-6 py-3 text-sm font-medium ${
                activeTab === "payroll"
                  ? "border-b-2 border-slate-900 text-slate-900"
                  : "text-slate-500 hover:text-slate-700"
              }`}
            >
              Nómina
            </button>
          </div>
        </div>

        <div className="p-4">
          {activeTab === "employees" && (
            <EmployeesList
              employees={employees}
              onEdit={handleEditEmployee}
              onDelete={handleDeleteEmployee}
            />
          )}
          {activeTab === "attendance" && (
            <AttendanceTracker
              employees={employees}
              attendance={attendance}
              onMarkAttendance={markAttendance}
            />
          )}
          {activeTab === "payroll" && (
            <PayrollSummary employees={employees} attendance={attendance} />
          )}
        </div>
      </div>

      {/* Employee Modal */}
      <EmployeeModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingEmployee(null);
        }}
        onSave={handleSaveEmployee}
        employee={editingEmployee}
      />
    </div>
  );
}
