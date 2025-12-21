"use client";

import { useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useOrganization } from "../hooks/useOrganization";

export default function CompanyTab({ orgSlug }) {
  const { organization, setOrganization, saving, loadOrganization, saveOrganization } = useOrganization(orgSlug);

  useEffect(() => {
    loadOrganization();
  }, [loadOrganization]);

  const handleSave = async () => {
    const result = await saveOrganization(organization);
    if (result.success) {
      alert("Datos de empresa guardados");
    } else {
      alert("Error: " + result.error);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg sm:text-xl">Datos de la Empresa</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-col space-y-2">
          <Label>Nombre de la empresa</Label>
          <Input
            placeholder="AgroCentro Nica"
            value={organization.name}
            onChange={(e) => setOrganization({ ...organization, name: e.target.value })}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="flex flex-col space-y-2">
            <Label>Correo administrativo</Label>
            <Input
              type="email"
              placeholder="correo@empresa.com"
              value={organization.email}
              onChange={(e) => setOrganization({ ...organization, email: e.target.value })}
            />
          </div>

          <div className="flex flex-col space-y-2">
            <Label>Telefono</Label>
            <Input
              placeholder="+505 8888 8888"
              value={organization.phone}
              onChange={(e) => setOrganization({ ...organization, phone: e.target.value })}
            />
          </div>
        </div>

        <div className="flex flex-col space-y-2">
          <Label>Moneda</Label>
          <Input
            placeholder="NIO"
            value={organization.currency}
            onChange={(e) => setOrganization({ ...organization, currency: e.target.value })}
          />
          <p className="text-xs text-slate-500">Codigos comunes: NIO (Cordoba), USD (Dolar)</p>
        </div>

        <Button className="mt-4 w-full sm:w-auto" onClick={handleSave} disabled={saving}>
          {saving ? "Guardando..." : "Guardar cambios"}
        </Button>
      </CardContent>
    </Card>
  );
}