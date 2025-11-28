"use client";

import { useEffect, useState, useMemo } from "react";
import {
  calculateNetSalary,
  calculateVacationDays,
  calculateAguinaldo,
} from "../services/laborConfig";

export function useHr(orgSlug) {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [search, setSearch] = useState("");
  const [department, setDepartment] = useState("TODOS");
  const [status, setStatus] = useState("TODOS");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState(null);

  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [payrollModalOpen, setPayrollModalOpen] = useState(false);

  // -------------------------------------------------------
  // LOAD EMPLOYEES
  // -------------------------------------------------------
  useEffect(() => {
    if (!orgSlug) return;

    async function loadEmployees() {
      try {
        setLoading(true);
        const res = await fetch("/api/hr/employees", {
          headers: { "x-org-slug": orgSlug },
        });

        const data = await res.json();
        console.log("GET employees response:", data);

        if (!res.ok) throw new Error(data.error || "Error al cargar empleados");

        setEmployees(data.employees || []);
      } catch (err) {
        console.error("HR fetch error:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    loadEmployees();
  }, [orgSlug]);

  // -------------------------------------------------------
  // FILTERED EMPLOYEES
  // -------------------------------------------------------
  const filteredEmployees = useMemo(() => {
    return employees.filter((emp) => {
      const matchesSearch =
        emp.name?.toLowerCase().includes(search.toLowerCase()) ||
        emp.position?.toLowerCase().includes(search.toLowerCase()) ||
        emp.cedula?.includes(search);

      const matchesDepartment =
        department === "TODOS" || emp.department === department;

      const matchesStatus = status === "TODOS" || emp.status === status;

      return matchesSearch && matchesDepartment && matchesStatus;
    });
  }, [employees, search, department, status]);

  const departments = useMemo(() => {
    const depts = new Set(employees.map((e) => e.department).filter(Boolean));
    return ["TODOS", ...depts];
  }, [employees]);

  // -------------------------------------------------------
  // STATS
  // -------------------------------------------------------
  const stats = useMemo(() => {
    const active = employees.filter((e) => e.status === "activo").length;
    const totalPayroll = employees
      .filter((e) => e.status === "activo")
      .reduce((sum, e) => sum + (e.salary || 0), 0);

    return {
      totalEmployees: employees.length,
      activeEmployees: active,
      totalPayroll,
    };
  }, [employees]);

  // -------------------------------------------------------
  // MODALS
  // -------------------------------------------------------
  function openNewEmployee() {
    setEditingEmployee(null);
    setIsModalOpen(true);
  }

  function openEditEmployee(employee) {
    setEditingEmployee(employee);
    setIsModalOpen(true);
  }

  function closeModal() {
    setIsModalOpen(false);
    setEditingEmployee(null);
  }

  // -------------------------------------------------------
  // SAVE EMPLOYEE
  // -------------------------------------------------------
  async function saveEmployee(data) {
    try {
      const method = data.id ? "PUT" : "POST";

      const res = await fetch("/api/hr/employees", {
        method,
        headers: {
          "Content-Type": "application/json",
          "x-org-slug": orgSlug,
        },
        body: JSON.stringify(data),
      });

      const responseBody = await res.json();
      console.log("SAVE RESPONSE:", responseBody);

      if (!res.ok) {
        throw new Error(responseBody.error || "Error al guardar empleado");
      }

      if (data.id) {
        setEmployees((prev) =>
          prev.map((e) => (e.id === data.id ? responseBody.employee : e))
        );
      } else {
        setEmployees((prev) => [...prev, responseBody.employee]);
      }

      closeModal();
      return { success: true };
    } catch (err) {
      console.error("Save employee error:", err);
      return { success: false, error: err.message };
    }
  }

  // -------------------------------------------------------
  // DELETE EMPLOYEE (DEBUG VERSION)
  // -------------------------------------------------------
  async function deleteEmployee(id) {
    try {
      console.log("Deleting employee ID:", id, " orgSlug:", orgSlug);

      const res = await fetch("/api/hr/employees", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          "x-org-slug": orgSlug,
        },
        body: JSON.stringify({ id }),
      });

      const responseBody = await res.json();
      console.log("DELETE RESPONSE:", responseBody);

      if (!res.ok) {
        throw new Error(responseBody.error || "Error al eliminar empleado");
      }

      setEmployees((prev) => prev.filter((e) => e.id !== id));

      return { success: true };
    } catch (err) {
      console.error("Delete employee error:", err);
      return { success: false, error: err.message };
    }
  }

  // -------------------------------------------------------
  // PAYROLL CALCULATIONS
  // -------------------------------------------------------
  function openPayrollModal(employee) {
    setSelectedEmployee(employee);
    setPayrollModalOpen(true);
  }

  function closePayrollModal() {
    setSelectedEmployee(null);
    setPayrollModalOpen(false);
  }

  function calculateEmployeePayroll(employee) {
    if (!employee?.salary) return null;
    return calculateNetSalary(employee.salary);
  }

  function calculateEmployeeVacation(employee) {
    if (!employee?.hire_date)
      return { accrued: 0, used: 0, available: 0 };

    const hireDate = new Date(employee.hire_date);
    const now = new Date();
    const monthsWorked = Math.floor(
      (now - hireDate) / (1000 * 60 * 60 * 24 * 30)
    );

    const accrued = calculateVacationDays(monthsWorked);
    const used = employee.vacation_days_used || 0;

    return {
      accrued,
      used,
      available: accrued - used,
      monthsWorked,
    };
  }

  function calculateEmployeeAguinaldo(employee) {
    if (!employee?.salary || !employee?.hire_date) return 0;

    const hireDate = new Date(employee.hire_date);
    const now = new Date();
    const monthsWorked = Math.floor(
      (now - hireDate) / (1000 * 60 * 60 * 24 * 30)
    );

    return calculateAguinaldo(employee.salary, Math.min(monthsWorked, 12));
  }

  return {
    employees,
    filteredEmployees,
    loading,
    error,
    stats,
    departments,

    search,
    setSearch,
    department,
    setDepartment,
    status,
    setStatus,

    isModalOpen,
    editingEmployee,
    openNewEmployee,
    openEditEmployee,
    closeModal,
    saveEmployee,
    deleteEmployee,

    selectedEmployee,
    payrollModalOpen,
    openPayrollModal,
    closePayrollModal,
    calculateEmployeePayroll,
    calculateEmployeeVacation,
    calculateEmployeeAguinaldo,
  };
}
