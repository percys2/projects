"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const STEPS = [
  { id: "welcome", title: "Bienvenido" },
  { id: "company", title: "Datos de Empresa" },
  { id: "branch", title: "Primera Sucursal" },
  { id: "preferences", title: "Preferencias" },
  { id: "complete", title: "Completado" },
];

export default function OnboardingWizard({ orgSlug, onComplete }) {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [companyData, setCompanyData] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
  });

  const [branchData, setBranchData] = useState({
    name: "Sucursal Principal",
    address: "",
    phone: "",
  });

  const [preferences, setPreferences] = useState({
    currency: "NIO",
    timezone: "America/Managua",
    tax_rate: 15,
  });

  const handleNext = () => {
    if (currentStep < STEPS.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const saveCompanyData = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/settings/organization", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "x-org-slug": orgSlug,
        },
        body: JSON.stringify(companyData),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Error al guardar datos de empresa");
      }
      handleNext();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const saveBranchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/branches", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-org-slug": orgSlug,
        },
        body: JSON.stringify(branchData),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Error al crear sucursal");
      }
      handleNext();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const savePreferences = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/settings/preferences", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "x-org-slug": orgSlug,
        },
        body: JSON.stringify(preferences),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Error al guardar preferencias");
      }
      handleNext();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const completeOnboarding = async () => {
    setLoading(true);
    try {
      await fetch("/api/settings/preferences", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "x-org-slug": orgSlug,
        },
        body: JSON.stringify({ onboarding_completed: true }),
      });
      
      if (onComplete) {
        onComplete();
      } else {
        router.push(`/${orgSlug}/dashboard`);
      }
    } catch (err) {
      console.error("Error completing onboarding:", err);
      router.push(`/${orgSlug}/dashboard`);
    }
  };

  const renderStep = () => {
    switch (STEPS[currentStep].id) {
      case "welcome":
        return (
          <div className="text-center space-y-6">
            <div className="text-6xl mb-4">🌱</div>
            <h2 className="text-2xl font-bold text-slate-800">
              Bienvenido a Agro ERP
            </h2>
            <p className="text-slate-600 max-w-md mx-auto">
              Vamos a configurar tu cuenta en unos simples pasos. 
              Esto solo tomara unos minutos.
            </p>
            <Button onClick={handleNext} size="lg" className="mt-4">
              Comenzar configuracion
            </Button>
          </div>
        );

      case "company":
        return (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <h2 className="text-xl font-bold text-slate-800">Datos de tu Empresa</h2>
              <p className="text-slate-600 text-sm">Esta informacion aparecera en tus facturas y reportes</p>
            </div>

            <div className="space-y-4">
              <div className="flex flex-col space-y-2">
                <Label>Nombre de la empresa *</Label>
                <Input
                  placeholder="Ej: AgroCentro Nicaragua"
                  value={companyData.name}
                  onChange={(e) => setCompanyData({ ...companyData, name: e.target.value })}
                  required
                />
              </div>

              <div className="flex flex-col space-y-2">
                <Label>Correo electronico</Label>
                <Input
                  type="email"
                  placeholder="Ej: contacto@empresa.com"
                  value={companyData.email}
                  onChange={(e) => setCompanyData({ ...companyData, email: e.target.value })}
                />
              </div>

              <div className="flex flex-col space-y-2">
                <Label>Telefono</Label>
                <Input
                  placeholder="Ej: +505 8888 8888"
                  value={companyData.phone}
                  onChange={(e) => setCompanyData({ ...companyData, phone: e.target.value })}
                />
              </div>

              <div className="flex flex-col space-y-2">
                <Label>Direccion</Label>
                <Input
                  placeholder="Ej: Km 5 Carretera Norte, Managua"
                  value={companyData.address}
                  onChange={(e) => setCompanyData({ ...companyData, address: e.target.value })}
                />
              </div>
            </div>

            {error && <p className="text-red-500 text-sm">{error}</p>}

            <div className="flex justify-between pt-4">
              <Button variant="outline" onClick={handleBack}>Atras</Button>
              <Button onClick={saveCompanyData} disabled={loading || !companyData.name}>
                {loading ? "Guardando..." : "Siguiente"}
              </Button>
            </div>
          </div>
        );

      case "branch":
        return (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <h2 className="text-xl font-bold text-slate-800">Tu Primera Sucursal</h2>
              <p className="text-slate-600 text-sm">Configura tu sucursal principal. Podras agregar mas despues.</p>
            </div>

            <div className="space-y-4">
              <div className="flex flex-col space-y-2">
                <Label>Nombre de la sucursal *</Label>
                <Input
                  placeholder="Ej: Sucursal Central"
                  value={branchData.name}
                  onChange={(e) => setBranchData({ ...branchData, name: e.target.value })}
                  required
                />
              </div>

              <div className="flex flex-col space-y-2">
                <Label>Direccion</Label>
                <Input
                  placeholder="Ej: Km 5 Carretera Norte"
                  value={branchData.address}
                  onChange={(e) => setBranchData({ ...branchData, address: e.target.value })}
                />
              </div>

              <div className="flex flex-col space-y-2">
                <Label>Telefono</Label>
                <Input
                  placeholder="Ej: +505 8888 8888"
                  value={branchData.phone}
                  onChange={(e) => setBranchData({ ...branchData, phone: e.target.value })}
                />
              </div>
            </div>

            {error && <p className="text-red-500 text-sm">{error}</p>}

            <div className="flex justify-between pt-4">
              <Button variant="outline" onClick={handleBack}>Atras</Button>
              <Button onClick={saveBranchData} disabled={loading || !branchData.name}>
                {loading ? "Guardando..." : "Siguiente"}
              </Button>
            </div>
          </div>
        );

      case "preferences":
        return (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <h2 className="text-xl font-bold text-slate-800">Preferencias del Sistema</h2>
              <p className="text-slate-600 text-sm">Configura la moneda, zona horaria e impuestos</p>
            </div>

            <div className="space-y-4">
              <div className="flex flex-col space-y-2">
                <Label>Moneda</Label>
                <select
                  value={preferences.currency}
                  onChange={(e) => setPreferences({ ...preferences, currency: e.target.value })}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                >
                  <option value="NIO">Cordobas (NIO)</option>
                  <option value="USD">Dolares (USD)</option>
                  <option value="EUR">Euros (EUR)</option>
                </select>
              </div>

              <div className="flex flex-col space-y-2">
                <Label>Zona horaria</Label>
                <select
                  value={preferences.timezone}
                  onChange={(e) => setPreferences({ ...preferences, timezone: e.target.value })}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                >
                  <option value="America/Managua">America/Managua (Nicaragua)</option>
                  <option value="America/Guatemala">America/Guatemala</option>
                  <option value="America/El_Salvador">America/El_Salvador</option>
                  <option value="America/Tegucigalpa">America/Tegucigalpa (Honduras)</option>
                  <option value="America/Costa_Rica">America/Costa_Rica</option>
                  <option value="America/Panama">America/Panama</option>
                </select>
              </div>

              <div className="flex flex-col space-y-2">
                <Label>Tasa de impuesto predeterminada (%)</Label>
                <Input
                  type="number"
                  min="0"
                  max="100"
                  value={preferences.tax_rate}
                  onChange={(e) => setPreferences({ ...preferences, tax_rate: parseFloat(e.target.value) || 0 })}
                />
              </div>
            </div>

            {error && <p className="text-red-500 text-sm">{error}</p>}

            <div className="flex justify-between pt-4">
              <Button variant="outline" onClick={handleBack}>Atras</Button>
              <Button onClick={savePreferences} disabled={loading}>
                {loading ? "Guardando..." : "Siguiente"}
              </Button>
            </div>
          </div>
        );

      case "complete":
        return (
          <div className="text-center space-y-6">
            <div className="text-6xl mb-4">🎉</div>
            <h2 className="text-2xl font-bold text-slate-800">Configuracion Completada</h2>
            <p className="text-slate-600 max-w-md mx-auto">
              Tu cuenta esta lista. Ahora puedes comenzar a usar Agro ERP para gestionar tu negocio.
            </p>
            <div className="space-y-3 pt-4">
              <Button onClick={completeOnboarding} size="lg" className="w-full max-w-xs" disabled={loading}>
                {loading ? "Cargando..." : "Ir al Dashboard"}
              </Button>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-blue-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-lg">
        <CardHeader>
          <div className="flex justify-between items-center mb-2">
            {STEPS.map((step, index) => (
              <div
                key={step.id}
                className={`flex-1 h-2 mx-1 rounded-full ${
                  index <= currentStep ? "bg-emerald-500" : "bg-slate-200"
                }`}
              />
            ))}
          </div>
          <p className="text-xs text-slate-500 text-center">
            Paso {currentStep + 1} de {STEPS.length}: {STEPS[currentStep].title}
          </p>
        </CardHeader>
        <CardContent className="pt-2">
          {renderStep()}
        </CardContent>
      </Card>
    </div>
  );
}