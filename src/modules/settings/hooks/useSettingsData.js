import { useState, useEffect } from "react";

export function useSettingsData(orgSlug) {
  const [settings, setSettings] = useState({
    organization_name: "",
    organization_slug: "",
    currency: "NIO",
    timezone: "America/Managua",
    language: "es",
    labor_config: {
      vacation_days_per_year: 30,
      aguinaldo_months_per_year: 1,
      severance_days_per_year: 30,
      severance_max_months: 5,
      inss_employee_rate: 0.07,
      inss_employer_rate: 0.19,
      ir_exempt_amount: 100000,
    },
  });
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchSettings = async () => {
    try {
      const response = await fetch(`/api/settings?slug=${orgSlug}`);
      if (response.ok) {
        const data = await response.json();
        if (data.settings) {
          setSettings(data.settings);
        }
      }
    } catch (error) {
      console.error("Error fetching settings:", error);
    }
  };

  const fetchUsers = async () => {
    try {
      const response = await fetch(`/api/settings/users?slug=${orgSlug}`);
      if (response.ok) {
        const data = await response.json();
        setUsers(data.users || []);
      }
    } catch (error) {
      console.error("Error fetching users:", error);
    }
  };

  const loadData = async () => {
    setLoading(true);
    await Promise.all([fetchSettings(), fetchUsers()]);
    setLoading(false);
  };

  const updateSettings = async (settingsData) => {
    try {
      const response = await fetch(`/api/settings?slug=${orgSlug}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settingsData),
      });

      if (response.ok) {
        await fetchSettings();
      }
    } catch (error) {
      console.error("Error updating settings:", error);
    }
  };

  const addUser = async (userData) => {
    try {
      const response = await fetch(`/api/settings/users?slug=${orgSlug}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(userData),
      });

      if (response.ok) {
        await fetchUsers();
      }
    } catch (error) {
      console.error("Error adding user:", error);
    }
  };

  const updateUser = async (id, userData) => {
    try {
      const response = await fetch(`/api/settings/users?slug=${orgSlug}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, ...userData }),
      });

      if (response.ok) {
        await fetchUsers();
      }
    } catch (error) {
      console.error("Error updating user:", error);
    }
  };

  const deleteUser = async (id) => {
    try {
      const response = await fetch(`/api/settings/users?slug=${orgSlug}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });

      if (response.ok) {
        await fetchUsers();
      }
    } catch (error) {
      console.error("Error deleting user:", error);
    }
  };

  useEffect(() => {
    if (orgSlug) {
      loadData();
    }
  }, [orgSlug]);

  return {
    settings,
    users,
    loading,
    updateSettings,
    addUser,
    updateUser,
    deleteUser,
    refreshData: loadData,
  };
}
