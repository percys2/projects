"use client";

import React, { useState } from "react";
import { useHr } from "./hooks/useHr";
import EmployeeList from "./components/EmployeeList";
import EmployeeFormModal from "./components/EmployeeFormModal";
import PayrollModal from "./components/PayrollModal";
import PayrollCalculator from "./components/PayrollCalculator";
import HrStats from "./components/HrStats";
import HrFilters from "./components/HrFilters";
import DgiReports from "./components/DgiReports";
import SettlementsManager from "./components/SettlementsManager";
import AttendanceTracker from "./components/AttendanceTracker";
import ComplianceReports from "./components/ComplianceReports";
import EmployeeDocuments from "./components/EmployeeDocuments";
import LoansDeductions from "./components/LoansDeductions";
import PayrollHistory from "./components/PayrollHistory";
import PayrollSheet from "./components/PayrollSheet";
import VacationRequests from "./components/VacationRequests";

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

  const tabs = [
    { id: "employees", label: "Empleados" },
    { id: "payroll", label: "Calculadora" },
    { id: "payrollSheet", label: "Planilla" },
    { id: "payrollHistory", label: "Historial Nomina" },
    { id: "attendance", label: "Asistencia" },
    { id: "vacations", label: "Vacaciones" },
    { id: "loans", label: "Prestamos" },
    { id: "documents", label: "Documentos" },
    { id: "reports", label: "Informes DGI" },
    { id: "compliance", label: "Cumplimiento" },
    { id: "settlements", label: "Liquidaciones" },
  ];

  return (
    <div className="space-y-5 max-w-7xl mx-auto">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-lg font-semibold text-slate-800">
            Recursos Humanos
          </h1>
          <p className="text-xs text-slate-500">
            Gestion de empleados, nomina y prestaciones segun ley nicaraguense
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
        <div className="border-b overflow-x-auto">
          <nav className="flex min-w-max">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-3 text-sm font-medium whitespace-nowrap ${
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

        {activeTab === "payrollSheet" && (
          <div className="px-4 py-3">
            <PayrollSheet orgSlug={orgSlug} employees={hr.employees} />
          </div>
        )}

        {activeTab === "payrollHistory" && (
          <div className="px-4 py-3">
            <PayrollHistory orgSlug={orgSlug} employees={hr.employees} />
          </div>
        )}

        {activeTab === "attendance" && (
          <div className="px-4 py-3">
            <AttendanceTracker orgSlug={orgSlug} employees={hr.employees} />
          </div>
        )}

        {activeTab === "vacations" && (
          <div className="px-4 py-3">
            <VacationRequests orgSlug={orgSlug} employees={hr.employees} />
          </div>
        )}

        {activeTab === "loans" && (
          <div className="px-4 py-3">
            <LoansDeductions orgSlug={orgSlug} employees={hr.employees} />
          </div>
        )}

        {activeTab === "documents" && (
          <div className="px-4 py-3">
            <EmployeeDocuments orgSlug={orgSlug} employees={hr.employees} />
          </div>
        )}

        {activeTab === "reports" && (
          <div className="px-4 py-3">
            <DgiReports orgSlug={orgSlug} />
          </div>
        )}

        {activeTab === "compliance" && (
          <div className="px-4 py-3">
            <ComplianceReports orgSlug={orgSlug} employees={hr.employees} />
          </div>
        )}

        {activeTab === "settlements" && (
          <div className="px-4 py-3">
            <SettlementsManager orgSlug={orgSlug} employees={hr.employees} />
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