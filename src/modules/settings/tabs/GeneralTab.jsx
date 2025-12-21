"use client";

import { useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { usePreferences } from "../hooks/usePreferences";
import { useOrganization } from "../hooks/useOrganization";

export default function GeneralTab({ orgSlug }) {
  const { preferences, setPreferences, saving, loadPreferences, savePreferences } = usePreferences(orgSlug);
  const { organization } = useOrganization(orgSlug);

  useEffect(() => {
    loadPreferences();
  }, [loadPreferences]);

  const handleSave = async () => {
    const result = await savePreferences(preferences);
    if (result.success) {
      alert("Configuracion general guardada");
    } else {
      alert("Error: " + result.error);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg sm:text-xl">Ajustes Generales del Sistema</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-col space-y-2">
          <Label>Zona horaria</Label>
          <Input
            placeholder="Ej: America/Managua"
            value={preferences.timezone}
            onChange={(e) => setPreferences({ ...preferences, timezone: e.target.value })}
          />
          <p className="text-xs text-slate-500">Recomendado: America/Managua para Nicaragua</p>
        </div>

        <div className="flex flex-col space-y-2">
          <Label>Moneda predeterminada</Label>
          <Input
            placeholder="Ej: NIO"
            value={organization.currency || "NIO"}
            disabled
            className="bg-slate-50"
          />
          <p className="text-xs text-slate-500">Para cambiar la moneda, ve a la pestana Empresa</p>
        </div>

        <Button className="mt-4 w-full sm:w-auto" onClick={handleSave} disabled={saving}>
          {saving ? "Guardando..." : "Guardar configuracion"}
        </Button>
      </CardContent>
    </Card>
  );
}