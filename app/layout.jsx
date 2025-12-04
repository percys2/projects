import "./globals.css";

export const metadata = {
  title: "ERP AgroCentro",
  description: "ERP Multitenant AgroCentro Nica",
};

export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}
