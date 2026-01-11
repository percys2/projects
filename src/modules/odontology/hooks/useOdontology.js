"use client";

import { useCallback, useEffect, useState } from "react";

export function useOdontology(orgSlug) {
  const [patients, setPatients] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [searchPatients, setSearchPatients] = useState("");
  const [searchAppointments, setSearchAppointments] = useState("");

  const [isPatientModalOpen, setIsPatientModalOpen] = useState(false);
  const [editingPatient, setEditingPatient] = useState(null);

  const [isOdontogramModalOpen, setIsOdontogramModalOpen] = useState(false);
  const [odontogramPatient, setOdontogramPatient] = useState(null);

  const [isAppointmentModalOpen, setIsAppointmentModalOpen] = useState(false);
  const [editingAppointment, setEditingAppointment] = useState(null);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const [patientsRes, apptsRes] = await Promise.all([
        fetch("/api/odontology/patients", { headers: { "x-org-slug": orgSlug } }),
        fetch("/api/odontology/appointments", { headers: { "x-org-slug": orgSlug } }),
      ]);

      const patientsData = await patientsRes.json();
      const apptsData = await apptsRes.json();

      if (!patientsRes.ok) throw new Error(patientsData.error || "Error al cargar pacientes");
      if (!apptsRes.ok) throw new Error(apptsData.error || "Error al cargar citas");

      setPatients(patientsData.patients || patientsData || []);
      setAppointments(apptsData.appointments || apptsData || []);
    } catch (err) {
      console.error("Odontology fetch error:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [orgSlug]);

  useEffect(() => {
    if (orgSlug) loadData();
  }, [orgSlug, loadData]);

  // Patients modal
  const openNewPatient = useCallback(() => {
    setEditingPatient(null);
    setIsPatientModalOpen(true);
  }, []);

  const openEditPatient = useCallback((patient) => {
    setEditingPatient(patient);
    setIsPatientModalOpen(true);
  }, []);

  const closePatientModal = useCallback(() => {
    setIsPatientModalOpen(false);
    setEditingPatient(null);
  }, []);

  // Odontogram modal
  const openOdontogram = useCallback((patient) => {
    setOdontogramPatient(patient);
    setIsOdontogramModalOpen(true);
  }, []);

  const closeOdontogram = useCallback(() => {
    setIsOdontogramModalOpen(false);
    setOdontogramPatient(null);
  }, []);

  // Appointments modal
  const openNewAppointment = useCallback(() => {
    setEditingAppointment(null);
    setIsAppointmentModalOpen(true);
  }, []);

  const openEditAppointment = useCallback((appointment) => {
    setEditingAppointment(appointment);
    setIsAppointmentModalOpen(true);
  }, []);

  const closeAppointmentModal = useCallback(() => {
    setIsAppointmentModalOpen(false);
    setEditingAppointment(null);
  }, []);

  // Patients CRUD
  const savePatient = useCallback(
    async (data) => {
      const method = data.id ? "PUT" : "POST";
      const res = await fetch("/api/odontology/patients", {
        method,
        headers: { "Content-Type": "application/json", "x-org-slug": orgSlug },
        body: JSON.stringify(data),
      });

      const payload = await res.json();
      if (!res.ok) throw new Error(payload.error || "Error al guardar paciente");

      const saved = payload.patient || payload;
      setPatients((prev) => {
        if (data.id) return prev.map((p) => (p.id === saved.id ? saved : p));
        return [saved, ...prev];
      });

      closePatientModal();
      return { success: true };
    },
    [orgSlug, closePatientModal]
  );

  const saveOdontogram = useCallback(
    async ({ patientId, odontogram }) => {
      const base = patients.find((p) => p.id === patientId) || odontogramPatient;
      if (!base?.first_name) throw new Error("Paciente inválido");

      const res = await fetch("/api/odontology/patients", {
        method: "PUT",
        headers: { "Content-Type": "application/json", "x-org-slug": orgSlug },
        body: JSON.stringify({
          id: patientId,
          first_name: base.first_name,
          last_name: base.last_name || null,
          phone: base.phone || null,
          email: base.email || null,
          dob: base.dob || null,
          sex: base.sex || null,
          address: base.address || null,
          emergency_contact_name: base.emergency_contact_name || null,
          emergency_contact_phone: base.emergency_contact_phone || null,
          notes: base.notes || null,
          odontogram,
        }),
      });

      const payload = await res.json();
      if (!res.ok) throw new Error(payload.error || "Error al guardar odontograma");

      const saved = payload.patient || payload;
      setPatients((prev) => prev.map((p) => (p.id === saved.id ? saved : p)));
      setOdontogramPatient(saved);
      return { success: true, patient: saved };
    },
    [orgSlug, odontogramPatient, patients]
  );

  const deletePatient = useCallback(
    async (id) => {
      try {
        const res = await fetch("/api/odontology/patients", {
          method: "DELETE",
          headers: { "Content-Type": "application/json", "x-org-slug": orgSlug },
          body: JSON.stringify({ id }),
        });
        const payload = await res.json();
        if (!res.ok) throw new Error(payload.error || "Error al eliminar paciente");

        setPatients((prev) => prev.filter((p) => p.id !== id));
        // appointments cascade at DB level; refresh to keep UI in sync
        await loadData();
        return { success: true };
      } catch (err) {
        console.error("Delete patient error:", err);
        return { success: false, error: err.message };
      }
    },
    [orgSlug, loadData]
  );

  // Appointments CRUD
  const saveAppointment = useCallback(
    async (data) => {
      const method = data.id ? "PUT" : "POST";
      const res = await fetch("/api/odontology/appointments", {
        method,
        headers: { "Content-Type": "application/json", "x-org-slug": orgSlug },
        body: JSON.stringify(data),
      });

      const payload = await res.json();
      if (!res.ok) throw new Error(payload.error || "Error al guardar cita");

      const saved = payload.appointment || payload;
      setAppointments((prev) => {
        if (data.id) return prev.map((a) => (a.id === saved.id ? saved : a));
        return [saved, ...prev].sort((x, y) => new Date(x.scheduled_at) - new Date(y.scheduled_at));
      });

      closeAppointmentModal();
      return { success: true };
    },
    [orgSlug, closeAppointmentModal]
  );

  const deleteAppointment = useCallback(
    async (id) => {
      try {
        const res = await fetch("/api/odontology/appointments", {
          method: "DELETE",
          headers: { "Content-Type": "application/json", "x-org-slug": orgSlug },
          body: JSON.stringify({ id }),
        });
        const payload = await res.json();
        if (!res.ok) throw new Error(payload.error || "Error al eliminar cita");

        setAppointments((prev) => prev.filter((a) => a.id !== id));
        return { success: true };
      } catch (err) {
        console.error("Delete appointment error:", err);
        return { success: false, error: err.message };
      }
    },
    [orgSlug]
  );

  return {
    patients,
    appointments,
    loading,
    error,

    searchPatients,
    setSearchPatients,
    searchAppointments,
    setSearchAppointments,

    isPatientModalOpen,
    editingPatient,
    openNewPatient,
    openEditPatient,
    closePatientModal,
    savePatient,
    deletePatient,

    isOdontogramModalOpen,
    odontogramPatient,
    openOdontogram,
    closeOdontogram,
    saveOdontogram,

    isAppointmentModalOpen,
    editingAppointment,
    openNewAppointment,
    openEditAppointment,
    closeAppointmentModal,
    saveAppointment,
    deleteAppointment,
  };
}

