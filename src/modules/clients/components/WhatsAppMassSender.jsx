"use client";

export default function WhatsAppMassSender({ clients }) {
  const sendMass = () => {
    clients.forEach((c) => {
      const msg = encodeURIComponent(
        `Hola ${c.name}, AgroCentro Nica tiene nuevas ofertas para usted.`
      );
      window.open(`https://wa.me/505${c.phone}?text=${msg}`, "_blank");
    });
  };

  return (
    <button
      onClick={sendMass}
      className="px-4 py-2 bg-green-600 text-white rounded-lg"
    >
      Enviar WhatsApp Masivo
    </button>
  );
}
