"use client";

import { useEffect, useState, useMemo } from "react";
import { calculateNetSalary, calculateVacationDays, calculateAguinaldo } from "../services/laborConfig";

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

  useEffect(() => {
    async function loadEmployees() {
      try {
        setLoading(true);
        const res = await fetch("/api/hr/employees", {
          headers: { "x-org-slug": orgSlug },
        });

        if (!res.ok) throw new Error("Error al cargar empleados");

        const data = await res.json();
        setEmployees(data.employees || []);
      } catch (err) {
        console.error("HR fetch error:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    if (orgSlug) loadEmployees();
  }, [orgSlug]);

  const filteredEmployees = useMemo(() => {
    return employees.filter((emp) => {
      const matchesSearch =
        emp.name?.toLowerCase().includes(search.toLowerCase()) ||
        emp.position?.toLowerCase().includes(search.toLowerCase()) ||
        emp.cedula?.includes(search);

      const matchesDepartment =
        department === "TODOS" || emp.department === department;

      const matchesStatus =
        status === "TODOS" || emp.status === status;

      return matchesSearch && matchesDepartment && matchesStatus;
    });
  }, [employees, search, department, status]);

  const departments = useMemo(() => {
    const depts = new Set(employees.map((e) => e.department).filter(Boolean));
    return ["TODOS", ...Array.from(depts)];
  }, [employees]);

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

      if (!res.ok) throw new Error("Error al guardar empleado");

      const result = await res.json();

      if (data.id) {
        setEmployees((prev) =>
          prev.map((e) => (e.id === data.id ? result.employee : e))
        );
      } else {
        setEmployees((prev) => [...prev, result.employee]);
      }

      closeModal();
      return { success: true };
    } catch (err) {
      console.error("Save employee error:", err);
      return { success: false, error: err.message };
    }
  }

  async function deleteEmployee(id) {
    try {
      const res = await fetch(`/api/hr/employees/${id}`, {
        method: "DELETE",
        headers: { "x-org-slug": orgSlug },
      });

      if (!res.ok) throw new Error("Error al eliminar empleado");

      setEmployees((prev) => prev.filter((e) => e.id !== id));
      return { success: true };
    } catch (err) {
      console.error("Delete employee error:", err);
      return { success: false, error: err.message };
    }
  }

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
    if (!employee?.hire_date) return { accrued: 0, used: 0, available: 0 };

    const hireDate = new Date(employee.hire_date);
    const now = new Date();
    const monthsWorked = Math.floor((now - hireDate) / (1000 * 60 * 60 * 24 * 30));

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
    const monthsWorked = Math.floor((now - hireDate) / (1000 * 60 * 60 * 24 * 30));

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