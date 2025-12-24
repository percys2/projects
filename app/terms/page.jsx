export default function TermsOfService() {
  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4">
      <div className="max-w-3xl mx-auto bg-white rounded-xl shadow-sm border p-8">
        <h1 className="text-3xl font-bold text-slate-800 mb-2">Terminos de Servicio</h1>
        <p className="text-sm text-slate-500 mb-8">Ultima actualizacion: Diciembre 2024</p>

        <div className="prose prose-slate max-w-none">
          <h2 className="text-xl font-semibold text-slate-700 mt-6 mb-3">1. Aceptacion de los Terminos</h2>
          <p className="text-slate-600 mb-4">
            Al acceder y utilizar AgroCentro ERP ("el Servicio"), usted acepta estar sujeto a estos 
            Terminos de Servicio. Si no esta de acuerdo con alguna parte de estos terminos, no podra 
            acceder al Servicio.
          </p>

          <h2 className="text-xl font-semibold text-slate-700 mt-6 mb-3">2. Descripcion del Servicio</h2>
          <p className="text-slate-600 mb-4">
            AgroCentro ERP es un sistema de planificacion de recursos empresariales (ERP) disenado 
            para negocios agricolas y agroservicios. El Servicio incluye modulos de inventario, 
            punto de venta, finanzas, recursos humanos y gestion de clientes.
          </p>

          <h2 className="text-xl font-semibold text-slate-700 mt-6 mb-3">3. Cuentas de Usuario</h2>
          <p className="text-slate-600 mb-4">
            Para utilizar el Servicio, debe crear una cuenta proporcionando informacion precisa y 
            completa. Usted es responsable de mantener la confidencialidad de su cuenta y contrasena, 
            y de todas las actividades que ocurran bajo su cuenta.
          </p>

          <h2 className="text-xl font-semibold text-slate-700 mt-6 mb-3">4. Uso Aceptable</h2>
          <p className="text-slate-600 mb-2">Usted se compromete a no:</p>
          <ul className="list-disc pl-6 text-slate-600 mb-4 space-y-1">
            <li>Usar el Servicio para fines ilegales o no autorizados</li>
            <li>Intentar acceder a cuentas o sistemas sin autorizacion</li>
            <li>Transmitir virus, malware o codigo danino</li>
            <li>Interferir con el funcionamiento del Servicio</li>
            <li>Revender o redistribuir el Servicio sin autorizacion</li>
          </ul>

          <h2 className="text-xl font-semibold text-slate-700 mt-6 mb-3">5. Propiedad Intelectual</h2>
          <p className="text-slate-600 mb-4">
            El Servicio y su contenido original, caracteristicas y funcionalidad son propiedad de 
            AgroCentro ERP y estan protegidos por leyes de propiedad intelectual. Los datos que 
            usted ingrese al sistema permanecen siendo de su propiedad.
          </p>

          <h2 className="text-xl font-semibold text-slate-700 mt-6 mb-3">6. Privacidad y Datos</h2>
          <p className="text-slate-600 mb-4">
            Su uso del Servicio esta sujeto a nuestra Politica de Privacidad. Al usar el Servicio, 
            usted consiente la recopilacion y uso de informacion de acuerdo con dicha politica.
          </p>

          <h2 className="text-xl font-semibold text-slate-700 mt-6 mb-3">7. Disponibilidad del Servicio</h2>
          <p className="text-slate-600 mb-4">
            Nos esforzamos por mantener el Servicio disponible 24/7, pero no garantizamos que el 
            Servicio estara disponible en todo momento. Podemos realizar mantenimiento programado 
            o de emergencia que puede afectar temporalmente la disponibilidad.
          </p>

          <h2 className="text-xl font-semibold text-slate-700 mt-6 mb-3">8. Limitacion de Responsabilidad</h2>
          <p className="text-slate-600 mb-4">
            En ningún caso AgroCentro ERP sera responsable por danos indirectos, incidentales, 
            especiales, consecuentes o punitivos, incluyendo perdida de beneficios, datos, uso 
            u otras perdidas intangibles.
          </p>

          <h2 className="text-xl font-semibold text-slate-700 mt-6 mb-3">9. Modificaciones</h2>
          <p className="text-slate-600 mb-4">
            Nos reservamos el derecho de modificar estos terminos en cualquier momento. Los cambios 
            entraran en vigor inmediatamente despues de su publicacion. El uso continuado del 
            Servicio constituye la aceptacion de los terminos modificados.
          </p>

          <h2 className="text-xl font-semibold text-slate-700 mt-6 mb-3">10. Terminacion</h2>
          <p className="text-slate-600 mb-4">
            Podemos terminar o suspender su cuenta y acceso al Servicio inmediatamente, sin previo 
            aviso, por cualquier razon, incluyendo el incumplimiento de estos Terminos.
          </p>

          <h2 className="text-xl font-semibold text-slate-700 mt-6 mb-3">11. Ley Aplicable</h2>
          <p className="text-slate-600 mb-4">
            Estos terminos se regiran e interpretaran de acuerdo con las leyes de la Republica de 
            Nicaragua, sin tener en cuenta sus disposiciones sobre conflictos de leyes.
          </p>

          <h2 className="text-xl font-semibold text-slate-700 mt-6 mb-3">12. Contacto</h2>
          <p className="text-slate-600 mb-4">
            Si tiene preguntas sobre estos Terminos de Servicio, puede contactarnos a traves de 
            nuestro correo electronico de soporte.
          </p>
        </div>

        <div className="mt-8 pt-6 border-t">
          <a href="/" className="text-emerald-600 hover:text-emerald-700 font-medium">
            ← Volver al inicio
          </a>
        </div>
      </div>
    </div>
  );
}