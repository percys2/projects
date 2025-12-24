export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4">
      <div className="max-w-3xl mx-auto bg-white rounded-xl shadow-sm border p-8">
        <h1 className="text-3xl font-bold text-slate-800 mb-2">Politica de Privacidad</h1>
        <p className="text-sm text-slate-500 mb-8">Ultima actualizacion: Diciembre 2024</p>

        <div className="prose prose-slate max-w-none">
          <h2 className="text-xl font-semibold text-slate-700 mt-6 mb-3">1. Informacion que Recopilamos</h2>
          <p className="text-slate-600 mb-2">Recopilamos los siguientes tipos de informacion:</p>
          <ul className="list-disc pl-6 text-slate-600 mb-4 space-y-1">
            <li><strong>Informacion de cuenta:</strong> Nombre, correo electronico, telefono, direccion de la empresa</li>
            <li><strong>Datos comerciales:</strong> Inventario, ventas, clientes, empleados, transacciones financieras</li>
            <li><strong>Informacion de uso:</strong> Como interactua con el Servicio, paginas visitadas, funciones utilizadas</li>
            <li><strong>Informacion del dispositivo:</strong> Tipo de navegador, direccion IP, sistema operativo</li>
          </ul>

          <h2 className="text-xl font-semibold text-slate-700 mt-6 mb-3">2. Como Usamos su Informacion</h2>
          <p className="text-slate-600 mb-2">Utilizamos la informacion recopilada para:</p>
          <ul className="list-disc pl-6 text-slate-600 mb-4 space-y-1">
            <li>Proporcionar, mantener y mejorar el Servicio</li>
            <li>Procesar transacciones y enviar notificaciones relacionadas</li>
            <li>Responder a sus comentarios, preguntas y solicitudes de soporte</li>
            <li>Enviar comunicaciones tecnicas, actualizaciones y alertas de seguridad</li>
            <li>Detectar, investigar y prevenir actividades fraudulentas</li>
            <li>Generar reportes y analisis para su negocio</li>
          </ul>

          <h2 className="text-xl font-semibold text-slate-700 mt-6 mb-3">3. Almacenamiento y Seguridad de Datos</h2>
          <p className="text-slate-600 mb-4">
            Sus datos se almacenan en servidores seguros con encriptacion de nivel empresarial. 
            Implementamos medidas de seguridad tecnicas, administrativas y fisicas disenadas para 
            proteger su informacion contra acceso no autorizado, alteracion, divulgacion o destruccion.
          </p>
          <p className="text-slate-600 mb-4">
            Utilizamos Supabase como proveedor de base de datos, que cumple con estandares de 
            seguridad de la industria incluyendo encriptacion en transito y en reposo.
          </p>

          <h2 className="text-xl font-semibold text-slate-700 mt-6 mb-3">4. Compartir Informacion</h2>
          <p className="text-slate-600 mb-2">No vendemos su informacion personal. Podemos compartir informacion con:</p>
          <ul className="list-disc pl-6 text-slate-600 mb-4 space-y-1">
            <li><strong>Proveedores de servicios:</strong> Terceros que nos ayudan a operar el Servicio (hosting, analisis)</li>
            <li><strong>Cumplimiento legal:</strong> Cuando sea requerido por ley o proceso legal</li>
            <li><strong>Proteccion de derechos:</strong> Para proteger nuestros derechos, privacidad, seguridad o propiedad</li>
            <li><strong>Con su consentimiento:</strong> Cuando usted nos autorice expresamente</li>
          </ul>

          <h2 className="text-xl font-semibold text-slate-700 mt-6 mb-3">5. Sus Derechos</h2>
          <p className="text-slate-600 mb-2">Usted tiene derecho a:</p>
          <ul className="list-disc pl-6 text-slate-600 mb-4 space-y-1">
            <li>Acceder a sus datos personales</li>
            <li>Corregir datos inexactos o incompletos</li>
            <li>Solicitar la eliminacion de sus datos</li>
            <li>Exportar sus datos en formato legible</li>
            <li>Oponerse al procesamiento de sus datos</li>
            <li>Retirar su consentimiento en cualquier momento</li>
          </ul>

          <h2 className="text-xl font-semibold text-slate-700 mt-6 mb-3">6. Retencion de Datos</h2>
          <p className="text-slate-600 mb-4">
            Retenemos su informacion mientras su cuenta este activa o segun sea necesario para 
            proporcionarle el Servicio. Tambien retenemos y usamos su informacion segun sea 
            necesario para cumplir con obligaciones legales, resolver disputas y hacer cumplir 
            nuestros acuerdos.
          </p>

          <h2 className="text-xl font-semibold text-slate-700 mt-6 mb-3">7. Cookies y Tecnologias Similares</h2>
          <p className="text-slate-600 mb-4">
            Utilizamos cookies y tecnologias similares para mantener su sesion activa, recordar 
            sus preferencias y analizar como se utiliza el Servicio. Puede configurar su navegador 
            para rechazar cookies, pero esto puede afectar la funcionalidad del Servicio.
          </p>

          <h2 className="text-xl font-semibold text-slate-700 mt-6 mb-3">8. Transferencias Internacionales</h2>
          <p className="text-slate-600 mb-4">
            Su informacion puede ser transferida y almacenada en servidores ubicados fuera de su 
            pais de residencia. Al usar el Servicio, usted consiente esta transferencia. Nos 
            aseguramos de que cualquier transferencia cumpla con las leyes de proteccion de datos 
            aplicables.
          </p>

          <h2 className="text-xl font-semibold text-slate-700 mt-6 mb-3">9. Menores de Edad</h2>
          <p className="text-slate-600 mb-4">
            El Servicio no esta dirigido a personas menores de 18 anos. No recopilamos 
            intencionalmente informacion de menores. Si descubrimos que hemos recopilado 
            informacion de un menor, tomaremos medidas para eliminarla.
          </p>

          <h2 className="text-xl font-semibold text-slate-700 mt-6 mb-3">10. Cambios a esta Politica</h2>
          <p className="text-slate-600 mb-4">
            Podemos actualizar esta Politica de Privacidad periodicamente. Le notificaremos sobre 
            cambios significativos publicando la nueva politica en esta pagina y actualizando la 
            fecha de "Ultima actualizacion".
          </p>

          <h2 className="text-xl font-semibold text-slate-700 mt-6 mb-3">11. Contacto</h2>
          <p className="text-slate-600 mb-4">
            Si tiene preguntas sobre esta Politica de Privacidad o sobre como manejamos sus datos, 
            puede contactarnos a traves de nuestro correo electronico de soporte.
          </p>
        </div>

        <div className="mt-8 pt-6 border-t flex gap-4">
          <a href="/" className="text-emerald-600 hover:text-emerald-700 font-medium">
            ← Volver al inicio
          </a>
          <a href="/terms" className="text-slate-600 hover:text-slate-700">
            Ver Terminos de Servicio
          </a>
        </div>
      </div>
    </div>
  );
}