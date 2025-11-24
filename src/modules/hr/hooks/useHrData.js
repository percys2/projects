import { useState, useEffect } from "react";

export function useHrData(orgSlug) {
  const [employees, setEmployees] = useState([]);
  const [attendance, setAttendance] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchEmployees = async () => {
    try {
      const response = await fetch(`/api/hr/employees?slug=${orgSlug}`);
      if (response.ok) {
        const data = await response.json();
        setEmployees(data.employees || []);
      }
    } catch (error) {
      console.error("Error fetching employees:", error);
    }
  };

  const fetchAttendance = async () => {
    try {
      const response = await fetch(`/api/hr/attendance?slug=${orgSlug}`);
      if (response.ok) {
        const data = await response.json();
        setAttendance(data.attendance || []);
      }
    } catch (error) {
      console.error("Error fetching attendance:", error);
    }
  };

  const loadData = async () => {
    setLoading(true);
    await Promise.all([fetchEmployees(), fetchAttendance()]);
    setLoading(false);
  };

  const addEmployee = async (employeeData) => {
    try {
      const response = await fetch(`/api/hr/employees?slug=${orgSlug}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(employeeData),
      });

      if (response.ok) {
        await fetchEmployees();
      }
    } catch (error) {
      console.error("Error adding employee:", error);
    }
  };

  const updateEmployee = async (id, employeeData) => {
    try {
      const response = await fetch(`/api/hr/employees?slug=${orgSlug}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, ...employeeData }),
      });

      if (response.ok) {
        await fetchEmployees();
      }
    } catch (error) {
      console.error("Error updating employee:", error);
    }
  };

  const deleteEmployee = async (id) => {
    try {
      const response = await fetch(`/api/hr/employees?slug=${orgSlug}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });

      if (response.ok) {
        await fetchEmployees();
      }
    } catch (error) {
      console.error("Error deleting employee:", error);
    }
  };

  const markAttendance = async (attendanceData) => {
    try {
      const response = await fetch(`/api/hr/attendance?slug=${orgSlug}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(attendanceData),
      });

      if (response.ok) {
        await fetchAttendance();
      }
    } catch (error) {
      console.error("Error marking attendance:", error);
    }
  };

  useEffect(() => {
    if (orgSlug) {
      loadData();
    }
  }, [orgSlug]);

  return {
    employees,
    attendance,
    loading,
    addEmployee,
    updateEmployee,
    deleteEmployee,
    markAttendance,
    refreshData: loadData,
  };
}
