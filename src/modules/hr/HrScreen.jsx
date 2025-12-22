"use client";

import React, { useState } from "react";
import { useHr } from "./hooks/useHr";
import EmployeeList from "./components/EmployeeList";
import EmployeeFormModal from "./components/EmployeeFormModal";
import PayrollModal from "./components/PayrollModal";
import PayrollCalculator from "./components/PayrollCalculator";
import PayrollSheet from "./components/PayrollSheet";
import PayrollHistory from "./components/PayrollHistory";
import LoansDeductions from "./components/LoansDeductions";
import AttendanceTracker from "./components/AttendanceTracker";
import VacationRequests from "./components/VacationRequests";
import ComplianceReports from "./components/ComplianceReports";
import EmployeeDocuments from "./components/EmployeeDocuments";
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
    <div className="space-y-4 sm:space-y-5 max-w-6xl mx-auto px-2 sm:px-0">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
        <div>
          <h1 className="text-lg font-semibold text-slate-800">Recursos Humanos</h1>
          <p className="text-xs text-slate-500">Gestion de empleados, nomina y prestaciones segun ley nicaraguense</p>
        </div>
        <button onClick={hr.openNewEmployee} className="w-full sm:w-auto px-3 py-2 bg-slate-900 text-white rounded-lg text-xs hover:bg-slate-800 min-h-[44px]">
          + Agregar empleado
        </button>
      </div>

      <HrStats stats={hr.stats} />

      <div className="bg-white border rounded-xl shadow-sm overflow-hidden">
        <div className="border-b overflow-x-auto">
          <nav className="flex min-w-max">
            {[
              { id: "employees", label: "Empleados" },
              { id: "planilla", label: "Planilla" },
              { id: "history", label: "Historial" },
              { id: "loans", label: "Prestamos" },
              { id: "attendance", label: "Asistencia" },
              { id: "vacations", label: "Vacaciones" },
              { id: "compliance", label: "Reportes" },
              { id: "documents", label: "Documentos" },
              { id: "payroll", label: "Calculadora" },
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

        {activeTab === "employees" && (
          <>
            <div className="px-3 sm:px-4 py-3 border-b">
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
            <div className="px-2 sm:px-4 py-3">
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
          <div className="px-3 sm:px-4 py-3">
            <PayrollCalculator />
          </div>
        )}

        {activeTab === "planilla" && (
          <div className="px-3 sm:px-4 py-3">
            <PayrollSheet employees={hr.employees} />
          </div>
        )}

        {activeTab === "history" && (
          <div className="px-3 sm:px-4 py-3">
            <PayrollHistory employees={hr.employees} orgSlug={orgSlug} />
          </div>
        )}

        {activeTab === "loans" && (
          <div className="px-3 sm:px-4 py-3">
            <LoansDeductions employees={hr.employees} orgSlug={orgSlug} />
          </div>
        )}

        {activeTab === "attendance" && (
          <div className="px-3 sm:px-4 py-3">
            <AttendanceTracker employees={hr.employees} orgSlug={orgSlug} />
          </div>
        )}

        {activeTab === "vacations" && (
          <div className="px-3 sm:px-4 py-3">
            <VacationRequests employees={hr.employees} orgSlug={orgSlug} />
          </div>
        )}

        {activeTab === "compliance" && (
          <div className="px-3 sm:px-4 py-3">
            <ComplianceReports employees={hr.employees} />
          </div>
        )}

        {activeTab === "documents" && (
          <div className="px-3 sm:px-4 py-3">
            <EmployeeDocuments employees={hr.employees} orgSlug={orgSlug} />
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