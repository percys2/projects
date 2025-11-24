"use client";

import React, { useState, useEffect } from "react";
import { useSettingsData } from "./hooks/useSettingsData";
import OrganizationSettings from "./components/OrganizationSettings";
import UserManagement from "./components/UserManagement";
import SystemPreferences from "./components/SystemPreferences";
import LaborLawConfig from "./components/LaborLawConfig";

export default function SettingsScreen({ orgSlug }) {
  const { settings, users, loading, updateSettings, addUser, updateUser, deleteUser } = useSettingsData(orgSlug);
  const [activeTab, setActiveTab] = useState("organization");

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-slate-500">Cargando configuración...</p>
      </div>
    );
  }

  return (
    <div className="space-y-5 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-lg font-semibold text-slate-800">Configuración</h1>
          <p className="text-xs text-slate-500">
            Ajustes del sistema, usuarios y preferencias
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white border rounded-xl shadow-sm overflow-hidden">
        <div className="border-b">
          <div className="flex">
            <button
              onClick={() => setActiveTab("organization")}
              className={`px-6 py-3 text-sm font-medium ${
                activeTab === "organization"
                  ? "border-b-2 border-slate-900 text-slate-900"
                  : "text-slate-500 hover:text-slate-700"
              }`}
            >
              Organización
            </button>
            <button
              onClick={() => setActiveTab("users")}
              className={`px-6 py-3 text-sm font-medium ${
                activeTab === "users"
                  ? "border-b-2 border-slate-900 text-slate-900"
                  : "text-slate-500 hover:text-slate-700"
              }`}
            >
              Usuarios
            </button>
            <button
              onClick={() => setActiveTab("preferences")}
              className={`px-6 py-3 text-sm font-medium ${
                activeTab === "preferences"
                  ? "border-b-2 border-slate-900 text-slate-900"
                  : "text-slate-500 hover:text-slate-700"
              }`}
            >
              Preferencias
            </button>
            <button
              onClick={() => setActiveTab("labor")}
              className={`px-6 py-3 text-sm font-medium ${
                activeTab === "labor"
                  ? "border-b-2 border-slate-900 text-slate-900"
                  : "text-slate-500 hover:text-slate-700"
              }`}
            >
              Leyes Laborales
            </button>
          </div>
        </div>

        <div className="p-6">
          {activeTab === "organization" && (
            <OrganizationSettings settings={settings} onUpdate={updateSettings} />
          )}
          {activeTab === "users" && (
            <UserManagement
              users={users}
              onAdd={addUser}
              onUpdate={updateUser}
              onDelete={deleteUser}
            />
          )}
          {activeTab === "preferences" && (
            <SystemPreferences settings={settings} onUpdate={updateSettings} />
          )}
          {activeTab === "labor" && (
            <LaborLawConfig settings={settings} onUpdate={updateSettings} />
          )}
        </div>
      </div>
    </div>
  );
}
