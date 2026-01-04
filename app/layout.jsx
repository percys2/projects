import "./globals.css";
import ToastProvider from "@/src/components/providers/ToastProvider";
import QueryProvider from "@/src/components/providers/QueryProvider";

export const metadata = {
  title: "ERP AgroCentro",
  description: "ERP Multitenant AgroCentro Nica",
};

export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <body>
        <QueryProvider>
          <ToastProvider>
            {children}
          </ToastProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
