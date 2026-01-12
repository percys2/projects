"use client";

import React, { useState } from "react";
import { usePosStore } from "../store/usePosStore";
import CustomerSelector from "./CustomerSelector";
import CustomerHeader from "./CustomerHeader";
import CustomerForm from "./CustomerForm";

import { formatCurrency } from "../utils/formatCurrency";
import { salesService } from "../services/salesService";
import { creditService } from "../services/creditService";

import { useCashRegisterStore } from "../store/useCashRegisterStore";
import { useBranchStore } from "../store/useBranchStore";

const MENUDEO_CLIENT_ID = "619e12b1-d067-4ef5-8868-25921621d1fa";

export default function CartSidebar({ orgSlug }) {
  const cart = usePosStore((s) => s.cart);
  const clearCart = usePosStore((s) => s.clearCart);
  const client = usePosStore((s) => s.selectedClient);

  const branch = useBranchStore((s) => s.activeBranch);
  const isCashOpen = useCashRegisterStore((s) => s.isOpen);
  const addMovement = useCashRegisterStore((s) => s.addMovement);

  const customerForm = usePosStore((s) => s.customerForm);

  const [loading, setLoading] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("efectivo");

  const total = cart.reduce((acc, item) => acc + item.qty * item.price, 0);

  const isMenudeoClient = client?.id === MENUDEO_CLIENT_ID || 
    client?.first_name?.toLowerCase() === "menudeo";

  const handleSale = async () => {
    try {
      if (!isCashOpen) {
        alert("Abra la caja antes de vender.");
        return;
      }

      if (!client && !customerForm?.firstName) {
        alert("Seleccione un cliente antes de vender.");
        return;
      }

      setLoading(true);

      const sale = await salesService.makeSale({
        orgSlug,
        client: client || customerForm,
        cart,
        paymentType: paymentMethod,
        branchId: branch,
      });

      if (paymentMethod === "efectivo") {
        addMovement({
          type: "entrada",
          amount: sale.total,
          description: `Venta ${sale.invoice}`,
          time: new Date(),
        });
      }

      clearCart();
      
      if (paymentMethod === "credito" && isMenudeoClient) {
        alert(`Venta a crédito registrada. Factura: ${sale.invoice}\nDeuda de Menudeo aumentada en C$ ${total.toFixed(2)}`);
      } else {
        alert(`Venta realizada. Factura: ${sale.invoice}`);
      }

    } catch (error) {
      alert(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRegistrarMenudeo = async () => {
    try {
      if (cart.length === 0) {
        alert("El carrito está vacío.");
        return;
      }

      if (!isCashOpen) {
        alert("Abra la caja antes de registrar menudeo.");
        return;
      }

      setLoading(true);

      await creditService.registerPayment(
        orgSlug,
        branch,
        MENUDEO_CLIENT_ID,
        total,
        "cash",
        `Venta menudeo - ${cart.length} productos`
      );

      addMovement({
        type: "entrada",
        amount: total,
        description: `Menudeo - ${cart.length} productos`,
        time: new Date(),
      });

      clearCart();
      alert(`Menudeo registrado!\nAbono de C$ ${total.toFixed(2)} aplicado a la deuda de Menudeo.`);

    } catch (error) {
      alert("Error al registrar menudeo: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white border rounded-xl shadow-md h-full p-3 flex flex-col space-y-3">

      <CustomerHeader />
      <CustomerSelector orgSlug={orgSlug} />
      <CustomerForm />

      <div className="flex-1 overflow-y-auto mt-2 space-y-2 pr-1">
        {cart.length === 0 ? (
          <p className="text-xs text-slate-400 text-center py-4">
            Carrito vacío
          </p>
        ) : (
          cart.map((item) => (
            <div
              key={item.id}
              className="bg-slate-50 p-2 rounded-lg border border-slate-200 shadow-sm"
            >
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-xs font-semibold">{item.name}</p>
                  <p className="text-[10px] text-slate-500">
                    {item.qty} x C$ {item.price}
                  </p>
                </div>
                <p className="text-xs font-bold">
                  {formatCurrency(item.qty * item.price)}
                </p>
              </div>
            </div>
          ))
        )}
      </div>

      <div className="border-t pt-3">
        <div className="flex justify-between text-xs font-bold mb-2">
          <span>Total</span>
          <span>{formatCurrency(total)}</span>
        </div>

        {client && (
          <div className="mb-3">
            <label className="text-[10px] text-slate-500 block mb-1">Método de Pago</label>
            <div className="flex gap-2">
              <button
                onClick={() => setPaymentMethod("efectivo")}
                className={`flex-1 py-1.5 rounded text-[10px] font-medium ${
                  paymentMethod === "efectivo"
                    ? "bg-green-600 text-white"
                    : "bg-slate-100 text-slate-600"
                }`}
              >
                Efectivo
              </button>
              {client.is_credit_client && (
                <button
                  onClick={() => setPaymentMethod("credito")}
                  className={`flex-1 py-1.5 rounded text-[10px] font-medium ${
                    paymentMethod === "credito"
                      ? "bg-purple-600 text-white"
                      : "bg-slate-100 text-slate-600"
                  }`}
                >
                  Crédito
                </button>
              )}
            </div>
            {paymentMethod === "credito" && client.is_credit_client && (
              <p className="text-[9px] text-purple-600 mt-1">
                Disponible: C$ {((client.credit_limit || 0) - (client.credit_balance || 0)).toFixed(2)}
              </p>
            )}
          </div>
        )}

        <button
          className="w-full bg-green-600 hover:bg-green-700 text-white py-2 rounded-lg text-xs font-semibold disabled:opacity-50"
          onClick={handleSale}
          disabled={cart.length === 0 || loading || (!client && !customerForm?.firstName)}
        >
          {loading ? "Procesando..." : "Finalizar Venta"}
        </button>

        <button
          onClick={handleRegistrarMenudeo}
          disabled={cart.length === 0 || loading}
          className="w-full mt-2 bg-orange-500 hover:bg-orange-600 text-white py-2 rounded-lg text-xs font-semibold disabled:opacity-50"
        >
          Registrar Menudeo
        </button>

        <button
          onClick={clearCart}
          className="w-full mt-2 bg-slate-300 text-slate-800 py-1.5 rounded-lg text-[10px]"
          disabled={cart.length === 0}
        >
          Vaciar Carrito
        </button>
      </div>
    </div>
  );
}
