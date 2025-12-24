"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Bell, X, AlertTriangle, Package, Clock, DollarSign, CheckCircle } from "lucide-react";

export default function NotificationCenter({ orgSlug }) {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  const loadNotifications = useCallback(async () => {
    if (!orgSlug) return;
    setLoading(true);
    try {
      const headers = { "x-org-slug": orgSlug };
      
      // Fetch dashboard data for alerts
      const [dashRes, receivablesRes, payablesRes] = await Promise.all([
        fetch(`/api/dashboard?range=30`, { headers }),
        fetch("/api/finance/reports/receivables", { headers }),
        fetch("/api/finance/reports/payables", { headers }),
      ]);

      const [dashData, receivablesData, payablesData] = await Promise.all([
        dashRes.json(),
        receivablesRes.json(),
        payablesRes.json(),
      ]);

      const newNotifications = [];
      const today = new Date();

      // Low stock alerts
      const lowStock = dashData.lowStock || [];
      if (lowStock.length > 0) {
        newNotifications.push({
          id: "low-stock",
          type: "warning",
          icon: Package,
          title: "Stock Bajo",
          message: `${lowStock.length} producto(s) con stock bajo`,
          details: lowStock.slice(0, 5).map(item => item.products?.name || "Producto").join(", "),
          link: `/${orgSlug}/inventory`,
          timestamp: new Date(),
          read: false,
        });
      }

      // Overdue receivables
      const overdueReceivables = (receivablesData.receivables || []).filter(r => {
        if (!r.due_date || r.status === "paid") return false;
        return new Date(r.due_date) < today;
      });
      
      if (overdueReceivables.length > 0) {
        const totalOverdue = overdueReceivables.reduce((sum, r) => 
          sum + ((r.total || 0) - (r.amount_paid || 0)), 0
        );
        newNotifications.push({
          id: "overdue-receivables",
          type: "error",
          icon: DollarSign,
          title: "Cuentas por Cobrar Vencidas",
          message: `${overdueReceivables.length} cuenta(s) vencida(s)`,
          details: `Total: C$ ${totalOverdue.toLocaleString("es-NI", { minimumFractionDigits: 2 })}`,
          link: `/${orgSlug}/finance`,
          timestamp: new Date(),
          read: false,
        });
      }

      // Overdue payables
      const overduePayables = (payablesData.payables || []).filter(p => {
        if (!p.due_date || p.status === "paid") return false;
        return new Date(p.due_date) < today;
      });
      
      if (overduePayables.length > 0) {
        const totalOverdue = overduePayables.reduce((sum, p) => 
          sum + ((p.total || 0) - (p.amount_paid || 0)), 0
        );
        newNotifications.push({
          id: "overdue-payables",
          type: "error",
          icon: Clock,
          title: "Cuentas por Pagar Vencidas",
          message: `${overduePayables.length} cuenta(s) vencida(s)`,
          details: `Total: C$ ${totalOverdue.toLocaleString("es-NI", { minimumFractionDigits: 2 })}`,
          link: `/${orgSlug}/finance`,
          timestamp: new Date(),
          read: false,
        });
      }

      // Upcoming payables (next 7 days)
      const sevenDays = new Date(today);
      sevenDays.setDate(sevenDays.getDate() + 7);
      
      const upcomingPayables = (payablesData.payables || []).filter(p => {
        if (!p.due_date || p.status === "paid") return false;
        const due = new Date(p.due_date);
        return due >= today && due <= sevenDays;
      });
      
      if (upcomingPayables.length > 0) {
        const totalUpcoming = upcomingPayables.reduce((sum, p) => 
          sum + ((p.total || 0) - (p.amount_paid || 0)), 0
        );
        newNotifications.push({
          id: "upcoming-payables",
          type: "info",
          icon: AlertTriangle,
          title: "Pagos Proximos",
          message: `${upcomingPayables.length} pago(s) en los proximos 7 dias`,
          details: `Total: C$ ${totalUpcoming.toLocaleString("es-NI", { minimumFractionDigits: 2 })}`,
          link: `/${orgSlug}/finance`,
          timestamp: new Date(),
          read: false,
        });
      }

      setNotifications(newNotifications);
      setUnreadCount(newNotifications.filter(n => !n.read).length);
    } catch (err) {
      console.error("Error loading notifications:", err);
    } finally {
      setLoading(false);
    }
  }, [orgSlug]);

  useEffect(() => {
    loadNotifications();
    // Refresh notifications every 5 minutes
    const interval = setInterval(loadNotifications, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [loadNotifications]);

  const markAsRead = (id) => {
    setNotifications(prev => 
      prev.map(n => n.id === id ? { ...n, read: true } : n)
    );
    setUnreadCount(prev => Math.max(0, prev - 1));
  };

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    setUnreadCount(0);
  };

  const getTypeStyles = (type) => {
    switch (type) {
      case "error":
        return "bg-red-50 border-red-200 text-red-700";
      case "warning":
        return "bg-yellow-50 border-yellow-200 text-yellow-700";
      case "success":
        return "bg-green-50 border-green-200 text-green-700";
      default:
        return "bg-blue-50 border-blue-200 text-blue-700";
    }
  };

  const getIconColor = (type) => {
    switch (type) {
      case "error": return "text-red-500";
      case "warning": return "text-yellow-500";
      case "success": return "text-green-500";
      default: return "text-blue-500";
    }
  };

  return (
    <div className="relative">
      {/* Bell Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-lg hover:bg-slate-100 transition-colors"
      >
        <Bell className="w-5 h-5 text-slate-600" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown Panel */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 z-40" 
            onClick={() => setIsOpen(false)}
          />
          
          {/* Panel */}
          <div className="absolute right-0 top-full mt-2 w-80 sm:w-96 bg-white rounded-xl shadow-2xl border z-50 max-h-[80vh] overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b bg-slate-50">
              <h3 className="font-semibold text-slate-800">Notificaciones</h3>
              <div className="flex items-center gap-2">
                {unreadCount > 0 && (
                  <button
                    onClick={markAllAsRead}
                    className="text-xs text-blue-600 hover:text-blue-800"
                  >
                    Marcar todas leidas
                  </button>
                )}
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1 hover:bg-slate-200 rounded"
                >
                  <X className="w-4 h-4 text-slate-500" />
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="overflow-y-auto max-h-[60vh]">
              {loading ? (
                <div className="p-8 text-center text-slate-500">
                  Cargando notificaciones...
                </div>
              ) : notifications.length === 0 ? (
                <div className="p-8 text-center">
                  <CheckCircle className="w-12 h-12 text-green-400 mx-auto mb-3" />
                  <p className="text-slate-600 font-medium">Todo en orden</p>
                  <p className="text-sm text-slate-400">No hay alertas pendientes</p>
                </div>
              ) : (
                <div className="divide-y">
                  {notifications.map((notification) => {
                    const Icon = notification.icon;
                    return (
                      <a
                        key={notification.id}
                        href={notification.link}
                        onClick={() => markAsRead(notification.id)}
                        className={`block p-4 hover:bg-slate-50 transition-colors ${
                          !notification.read ? "bg-blue-50/50" : ""
                        }`}
                      >
                        <div className="flex gap-3">
                          <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${getTypeStyles(notification.type)}`}>
                            <Icon className={`w-5 h-5 ${getIconColor(notification.type)}`} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2">
                              <p className="font-medium text-sm text-slate-800">
                                {notification.title}
                              </p>
                              {!notification.read && (
                                <span className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0 mt-1.5" />
                              )}
                            </div>
                            <p className="text-sm text-slate-600 mt-0.5">
                              {notification.message}
                            </p>
                            {notification.details && (
                              <p className="text-xs text-slate-400 mt-1 truncate">
                                {notification.details}
                              </p>
                            )}
                          </div>
                        </div>
                      </a>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="px-4 py-3 border-t bg-slate-50">
              <button
                onClick={loadNotifications}
                className="w-full text-sm text-blue-600 hover:text-blue-800 font-medium"
              >
                Actualizar notificaciones
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}