"use client";

import { useEffect, useState, useMemo, useCallback } from "react";
import { groupOpportunitiesByStage, calculatePipelineValue } from "../services/crmConfig";

export function useCrm(orgSlug) {
  const [stages, setStages] = useState([]);
  const [opportunities, setOpportunities] = useState([]);
  const [activities, setActivities] = useState([]);
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [search, setSearch] = useState("");
  const [stageFilter, setStageFilter] = useState("TODOS");
  const [statusFilter, setStatusFilter] = useState("open");

  const [isOpportunityModalOpen, setIsOpportunityModalOpen] = useState(false);
  const [editingOpportunity, setEditingOpportunity] = useState(null);

  const [isActivityModalOpen, setIsActivityModalOpen] = useState(false);
  const [selectedOpportunityForActivity, setSelectedOpportunityForActivity] = useState(null);

  const [isClientModalOpen, setIsClientModalOpen] = useState(false);
  const [editingClient, setEditingClient] = useState(null);

  /* ============================================================
     LOAD DATA
  ============================================================ */
  const loadData = useCallback(async () => {
    try {
      setLoading(true);

      const [stagesRes, oppsRes, clientsRes] = await Promise.all([
        fetch("/api/crm/stages", { headers: { "x-org-slug": orgSlug } }),
        fetch("/api/crm/opportunities", { headers: { "x-org-slug": orgSlug } }),
        fetch("/api/clients", { headers: { "x-org-slug": orgSlug } }),
      ]);

      const stagesData = await stagesRes.json();
      const oppsData = await oppsRes.json();
      const clientsData = await clientsRes.json();

      setStages(stagesData.stages || []);
      setOpportunities(oppsData.opportunities || []);
      setClients(clientsData.clients || clientsData || []);

    } catch (err) {
      console.error("CRM fetch error:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [orgSlug]);

  useEffect(() => {
    if (orgSlug) loadData();
  }, [orgSlug, loadData]);

  /* ============================================================
     FILTER OPPORTUNITIES
  ============================================================ */
  const filteredOpportunities = useMemo(() => {
    return opportunities.filter((opp) => {
      const searchLower = search.toLowerCase();

      const matchesSearch =
        opp.title?.toLowerCase().includes(searchLower) ||
        opp.client_name?.toLowerCase().includes(searchLower);

      const matchesStage =
        stageFilter === "TODOS" || opp.stage_id === stageFilter;

      const matchesStatus =
        statusFilter === "TODOS" || opp.status === statusFilter;

      return matchesSearch && matchesStage && matchesStatus;
    });
  }, [opportunities, search, stageFilter, statusFilter]);

  /* ============================================================
     PIPELINE DATA
  ============================================================ */
  const pipelineData = useMemo(() => {
    const openOpps = opportunities.filter((o) => o.status === "open");
    return groupOpportunitiesByStage(openOpps, stages);
  }, [opportunities, stages]);

  /* ============================================================
     STATS
  ============================================================ */
  const stats = useMemo(() => {
    const openOpps = opportunities.filter((o) => o.status === "open");
    const wonOpps = opportunities.filter((o) => o.status === "won");
    const lostOpps = opportunities.filter((o) => o.status === "lost");

    const totalPipelineValue = openOpps.reduce((sum, o) => sum + (o.amount || 0), 0);
    const weightedValue = calculatePipelineValue(openOpps, stages);

    const now = new Date();
    const weekFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

    const closingThisWeek = openOpps.filter((o) => {
      if (!o.expected_close_date) return false;
      const closeDate = new Date(o.expected_close_date);
      return closeDate >= now && closeDate <= weekFromNow;
    }).length;

    const last30Days = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const recentWon = wonOpps.filter((o) => new Date(o.updated_at) >= last30Days).length;
    const recentLost = lostOpps.filter((o) => new Date(o.updated_at) >= last30Days).length;

    const conversionRate =
      recentWon + recentLost > 0
        ? Math.round((recentWon / (recentWon + recentLost)) * 100)
        : 0;

    return {
      totalOpportunities: openOpps.length,
      totalPipelineValue,
      weightedValue,
      closingThisWeek,
      conversionRate,
      wonCount: wonOpps.length,
      lostCount: lostOpps.length,
      totalClients: clients.length,
    };
  }, [opportunities, stages, clients]);

  /* ============================================================
     CLIENTS BY STAGE
  ============================================================ */
  const clientsByStage = useMemo(() => {
    const map = new Map();

    opportunities.filter((o) => o.status === "open").forEach((opp) => {
      if (!opp.client_id) return;

      const stage = stages.find((s) => s.id === opp.stage_id);
      const existing = map.get(opp.client_id);

      if (!existing || existing.stageOrder < stage?.sort_order) {
        map.set(opp.client_id, {
          client_id: opp.client_id,
          client_name: opp.client_name,
          client_phone: opp.client_phone,
          stage_id: opp.stage_id,
          stage_name: stage?.name || "Sin etapa",
          stage_color: stage?.color || "slate",
          stageOrder: stage?.sort_order || 0,
          opportunityCount: (existing?.opportunityCount || 0) + 1,
          totalAmount: (existing?.totalAmount || 0) + (opp.amount || 0),
          lastContact: opp.last_activity_date || opp.updated_at,
        });
      }
    });

    return Array.from(map.values()).sort((a, b) => a.stageOrder - b.stageOrder);
  }, [opportunities, stages]);

  /* ============================================================
     OPEN / CLOSE MODALS
  ============================================================ */
  const openNewOpportunity = useCallback(() => {
    setEditingOpportunity(null);
    setIsOpportunityModalOpen(true);
  }, []);

  const openEditOpportunity = useCallback((opportunity) => {
    setEditingOpportunity(opportunity);
    setIsOpportunityModalOpen(true);
  }, []);

  const closeOpportunityModal = useCallback(() => {
    setIsOpportunityModalOpen(false);
    setEditingOpportunity(null);
  }, []);

  /* ============================================================
     SAVE OPPORTUNITY
     👇 FIX DEFINITIVO: stage_id NUNCA será null
  ============================================================ */
  const saveOpportunity = useCallback(
    async (data) => {
      try {
        // 🔥 1) VALIDAR STAGE_ID
        if (!data.stage_id || data.stage_id === "" || data.stage_id.startsWith("default-")) {
          const defaultStage = stages?.[0]?.id;
          if (!defaultStage) throw new Error("No hay etapas configuradas.");
          data.stage_id = defaultStage;
        }

        // 🔥 2) VALIDAR CLIENTE NULL
        if (!data.client_id || data.client_id === "" || data.client_id.startsWith("default-")) {
          data.client_id = null;
        }

        const method = data.id ? "PUT" : "POST";

        const res = await fetch("/api/crm/opportunities", {
          method,
          headers: {
            "Content-Type": "application/json",
            "x-org-slug": orgSlug,
          },
          body: JSON.stringify(data),
        });

        if (!res.ok) {
          const errData = await res.json();
          throw new Error(errData.error || "Error al guardar oportunidad");
        }

        const result = await res.json();

        if (data.id) {
          setOpportunities((prev) =>
            prev.map((o) => (o.id === data.id ? result.opportunity : o))
          );
        } else {
          setOpportunities((prev) => [...prev, result.opportunity]);
        }

        closeOpportunityModal();
        return { success: true };

      } catch (err) {
        console.error("Save opportunity error:", err);
        return { success: false, error: err.message };
      }
    },
    [orgSlug, stages, closeOpportunityModal]
  );

  /* ============================================================
     DELETE OPPORTUNITY
  ============================================================ */
  const deleteOpportunity = useCallback(
    async (id) => {
      try {
        const res = await fetch(`/api/crm/opportunities/${id}`, {
          method: "DELETE",
          headers: { "x-org-slug": orgSlug },
        });

        if (!res.ok) throw new Error("Error al eliminar oportunidad");

        setOpportunities((prev) => prev.filter((o) => o.id !== id));
        return { success: true };
      } catch (err) {
        console.error("Delete opportunity error:", err);
        return { success: false, error: err.message };
      }
    },
    [orgSlug]
  );

  /* ============================================================
     MOVE OPPORTUNITY TO STAGE
  ============================================================ */
  const moveOpportunityToStage = useCallback(
    async (opportunityId, newStageId) => {
      const opportunity = opportunities.find((o) => o.id === opportunityId);
      if (!opportunity) return { success: false, error: "Oportunidad no encontrada" };

      const newStage = stages.find((s) => s.id === newStageId);
      if (!newStage) return { success: false, error: "Etapa no encontrada" };

      setOpportunities((prev) =>
        prev.map((o) =>
          o.id === opportunityId
            ? { ...o, stage_id: newStageId, stage_name: newStage.name }
            : o
        )
      );

      try {
        const res = await fetch("/api/crm/opportunities", {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            "x-org-slug": orgSlug,
          },
          body: JSON.stringify({
            id: opportunityId,
            stage_id: newStageId,
          }),
        });

        if (!res.ok) {
          setOpportunities((prev) =>
            prev.map((o) =>
              o.id === opportunityId
                ? { ...o, stage_id: opportunity.stage_id, stage_name: opportunity.stage_name }
                : o
            )
          );
          throw new Error("Error al mover oportunidad");
        }

        return { success: true };
      } catch (err) {
        console.error("Move opportunity error:", err);
        return { success: false, error: err.message };
      }
    },
    [opportunities, stages, orgSlug]
  );

  /* ============================================================
     MARK WON / LOST
  ============================================================ */
  const markOpportunityWon = useCallback(
    async (opportunityId) => saveOpportunity({ id: opportunityId, status: "won" }),
    [saveOpportunity]
  );

  const markOpportunityLost = useCallback(
    async (opportunityId, reason) =>
      saveOpportunity({ id: opportunityId, status: "lost", lost_reason: reason }),
    [saveOpportunity]
  );

  /* ============================================================
     ACTIVITIES
  ============================================================ */
  const openActivityModal = useCallback((opportunity) => {
    setSelectedOpportunityForActivity(opportunity);
    setIsActivityModalOpen(true);
  }, []);

  const closeActivityModal = useCallback(() => {
    setIsActivityModalOpen(false);
    setSelectedOpportunityForActivity(null);
  }, []);

  const saveActivity = useCallback(
    async (data) => {
      try {
        const res = await fetch("/api/crm/activities", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-org-slug": orgSlug,
          },
          body: JSON.stringify(data),
        });

        if (!res.ok) throw new Error("Error al guardar actividad");

        const result = await res.json();

        setActivities((prev) => [...prev, result.activity]);
        closeActivityModal();
        return { success: true };
      } catch (err) {
        console.error("Save activity error:", err);
        return { success: false, error: err.message };
      }
    },
    [orgSlug, closeActivityModal]
  );

  /* ============================================================
     CLIENTS CRUD
  ============================================================ */
  const openNewClient = useCallback(() => {
    setEditingClient(null);
    setIsClientModalOpen(true);
  }, []);

  const openEditClient = useCallback((client) => {
    setEditingClient(client);
    setIsClientModalOpen(true);
  }, []);

  const closeClientModal = useCallback(() => {
    setIsClientModalOpen(false);
    setEditingClient(null);
  }, []);

  const saveClient = useCallback(
    async (data) => {
      try {
        const method = data.id ? "PUT" : "POST";

        const res = await fetch("/api/clients", {
          method,
          headers: {
            "Content-Type": "application/json",
            "x-org-slug": orgSlug,
          },
          body: JSON.stringify(data),
        });

        if (!res.ok) {
          const errData = await res.json();
          throw new Error(errData.error || "Error al guardar cliente");
        }

        const newClient = await res.json();

        if (data.id) {
          setClients((prev) =>
            prev.map((c) => (c.id === data.id ? newClient : c))
          );
        } else {
          setClients((prev) => [newClient, ...prev]);
        }

        closeClientModal();
        return { success: true };

      } catch (err) {
        console.error("Save client error:", err);
        throw err;
      }
    },
    [orgSlug, closeClientModal]
  );

  const deleteClient = useCallback(
    async (id) => {
      try {
        const res = await fetch("/api/clients", {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            "x-org-slug": orgSlug,
          },
          body: JSON.stringify({ id }),
        });

        if (!res.ok) throw new Error("Error al eliminar cliente");

        setClients((prev) => prev.filter((c) => c.id !== id));
        return { success: true };

      } catch (err) {
        console.error("Delete client error:", err);
        return { success: false, error: err.message };
      }
    },
    [orgSlug]
  );

  /* ============================================================
     RETURN (PUBLIC API)
  ============================================================ */
  return {
    stages,
    opportunities,
    filteredOpportunities,
    activities,
    clients,
    loading,
    error,
    stats,
    pipelineData,
    clientsByStage,

    search,
    setSearch,
    stageFilter,
    setStageFilter,
    statusFilter,
    setStatusFilter,

    isOpportunityModalOpen,
    editingOpportunity,
    openNewOpportunity,
    openEditOpportunity,
    closeOpportunityModal,
    saveOpportunity,
    deleteOpportunity,
    moveOpportunityToStage,
    markOpportunityWon,
    markOpportunityLost,

    isActivityModalOpen,
    selectedOpportunityForActivity,
    openActivityModal,
    closeActivityModal,
    saveActivity,

    isClientModalOpen,
    editingClient,
    openNewClient,
    openEditClient,
    closeClientModal,
    saveClient,
    deleteClient,
  };
}
