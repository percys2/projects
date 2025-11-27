"use client";

import React, { useState } from "react";
import { useHr } from "./hooks/useHr";
import EmployeeList from "./components/EmployeeList";
import EmployeeFormModal from "./components/EmployeeFormModal";
import PayrollModal from "./components/PayrollModal";
import PayrollCalculator from "./components/PayrollCalculator";
import HrStats from "./components/HrStats";
import HrFilters from "./components/HrFilters";

export default function HrScreen({ orgSlug }) {
  const hr = useHr(orgSlug);
  const [activeTab, setActiveTab] = useState("employees");

  if (hr.loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-slate-500">Cargando datos de recursos humanos...</p>
      </div>
    );
  }

  if (hr.error) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-red-500">Error: {hr.error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-5 max-w-6xl mx-auto">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-lg font-semibold text-slate-800">
            Recursos Humanos
          </h1>
          <p className="text-xs text-slate-500">
            Gestión de empleados, nómina y prestaciones según ley nicaragüense
          </p>
        </div>

        <button
          onClick={hr.openNewEmployee}
          className="px-3 py-2 bg-slate-900 text-white rounded-lg text-xs hover:bg-slate-800"
        >
          + Agregar empleado
        </button>
      </div>

      <HrStats stats={hr.stats} />

      <div className="bg-white border rounded-xl shadow-sm overflow-hidden">
        <div className="border-b">
          <nav className="flex">
            <button
              onClick={() => setActiveTab("employees")}
              className={`px-4 py-3 text-sm font-medium ${
                activeTab === "employees"
                  ? "border-b-2 border-slate-900 text-slate-900"
                  : "text-slate-500 hover:text-slate-700"
              }`}
            >
              Empleados
            </button>
            <button
              onClick={() => setActiveTab("payroll")}
              className={`px-4 py-3 text-sm font-medium ${
                activeTab === "payroll"
                  ? "border-b-2 border-slate-900 text-slate-900"
                  : "text-slate-500 hover:text-slate-700"
              }`}
            >
              Calculadora de Nómina
            </button>
          </nav>
        </div>

        {activeTab === "employees" && (
          <>
            <div className="px-4 py-3 border-b">
              <HrFilters
                search={hr.search}
                setSearch={hr.setSearch}
                department={hr.department}
                setDepartment={hr.setDepartment}
                departments={hr.departments}
                status={hr.status}
                setStatus={hr.setStatus}
              />
            </div>

            <div className="px-4 py-3">
              <EmployeeList
                employees={hr.filteredEmployees}
                onEdit={hr.openEditEmployee}
                onDelete={hr.deleteEmployee}
                onViewPayroll={hr.openPayrollModal}
                calculateVacation={hr.calculateEmployeeVacation}
                calculateAguinaldo={hr.calculateEmployeeAguinaldo}
              />
            </div>
          </>
        )}

        {activeTab === "payroll" && (
          <div className="px-4 py-3">
            <PayrollCalculator />
          </div>
        )}
      </div>

      <EmployeeFormModal
        isOpen={hr.isModalOpen}
        onClose={hr.closeModal}
        onSave={hr.saveEmployee}
        employee={hr.editingEmployee}
        departments={hr.departments.filter((d) => d !== "TODOS")}
      />

      <PayrollModal
        isOpen={hr.payrollModalOpen}
        onClose={hr.closePayrollModal}
        employee={hr.selectedEmployee}
        payroll={hr.calculateEmployeePayroll(hr.selectedEmployee)}
        vacation={hr.calculateEmployeeVacation(hr.selectedEmployee)}
        aguinaldo={hr.calculateEmployeeAguinaldo(hr.selectedEmployee)}
      />
    </div>
  );
}