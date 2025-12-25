/**
 * Help Content Database
 * In-app documentation and help system
 */

export const HELP_CATEGORIES = {
  GETTING_STARTED: "getting_started",
  POS: "pos",
  INVENTORY: "inventory",
  SALES: "sales",
  FINANCE: "finance",
  CRM: "crm",
  HR: "hr",
  SETTINGS: "settings",
  TROUBLESHOOTING: "troubleshooting",
};

export const helpArticles = {
  "getting-started-overview": {
    id: "getting-started-overview",
    category: HELP_CATEGORIES.GETTING_STARTED,
    title: "Bienvenido a AgroCentro ERP",
    summary: "Guia rapida para comenzar a usar el sistema",
    content: `
# Bienvenido a AgroCentro ERP

AgroCentro ERP es un sistema completo de gestion para agroservicios que incluye:

## Modulos Principales

- **Punto de Venta (POS)**: Realiza ventas rapidas con soporte para impresoras termicas
- **Inventario**: Controla tu stock, movimientos y alertas de productos bajos
- **Ventas**: Historial completo de ventas con reportes detallados
- **Finanzas**: Cuentas por cobrar, pagar, y reportes financieros
- **CRM**: Gestion de clientes y oportunidades de venta
- **RRHH**: Administracion de empleados y nomina

## Primeros Pasos

1. Configura tu organizacion en **Configuracion > Empresa**
2. Agrega tus productos en **Inventario**
3. Registra tus clientes en **CRM > Clientes**
4. Comienza a vender en **Punto de Venta**

## Soporte

Si necesitas ayuda, contacta a soporte tecnico o consulta esta guia de ayuda.
    `,
    keywords: ["inicio", "comenzar", "tutorial", "guia"],
  },

  "pos-basic-sale": {
    id: "pos-basic-sale",
    category: HELP_CATEGORIES.POS,
    title: "Como realizar una venta",
    summary: "Pasos para completar una venta en el punto de venta",
    content: `
# Como Realizar una Venta

## Pasos Basicos

1. **Abrir Caja**: Antes de vender, abre la caja con el monto inicial
2. **Buscar Productos**: Usa la barra de busqueda o escanea el codigo de barras
3. **Agregar al Carrito**: Haz clic en el producto para agregarlo
4. **Ajustar Cantidad**: Modifica la cantidad si es necesario
5. **Seleccionar Cliente**: Opcional - selecciona o crea un cliente
6. **Procesar Pago**: Selecciona el metodo de pago y confirma

## Metodos de Pago

- Efectivo
- Tarjeta
- Transferencia
- Credito (requiere cliente registrado)

## Imprimir Factura

Despues de confirmar la venta, puedes imprimir la factura en tu impresora termica.
    `,
    keywords: ["venta", "vender", "factura", "cobrar", "pago"],
  },

  "pos-cash-closing": {
    id: "pos-cash-closing",
    category: HELP_CATEGORIES.POS,
    title: "Cierre de Caja",
    summary: "Como realizar el cierre de caja diario",
    content: `
# Cierre de Caja

## Cuando Cerrar

Realiza el cierre de caja al final de cada turno o dia de trabajo.

## Proceso de Cierre

1. Haz clic en **Cerrar Caja** en la pantalla del POS
2. Cuenta el efectivo fisico en caja
3. Ingresa el monto contado
4. El sistema calculara la diferencia (sobrante/faltante)
5. Agrega notas si hay diferencias
6. Confirma el cierre

## Reporte de Cierre

El reporte incluye:
- Ventas totales del turno
- Desglose por metodo de pago
- Monto inicial vs final
- Diferencias detectadas

## Historial

Puedes ver el historial de cierres en **POS > Historial de Cierres**.
    `,
    keywords: ["cierre", "caja", "arqueo", "efectivo", "turno"],
  },

  "inventory-add-product": {
    id: "inventory-add-product",
    category: HELP_CATEGORIES.INVENTORY,
    title: "Agregar Productos",
    summary: "Como agregar nuevos productos al inventario",
    content: `
# Agregar Productos al Inventario

## Crear Producto Nuevo

1. Ve a **Inventario**
2. Haz clic en **Nuevo Producto**
3. Completa los campos:
   - Nombre del producto
   - SKU/Codigo
   - Categoria
   - Precio de venta
   - Costo
   - Stock minimo (para alertas)
4. Guarda el producto

## Campos Importantes

- **SKU**: Codigo unico para identificar el producto
- **Stock Minimo**: El sistema te alertara cuando el stock baje de este nivel
- **Lote y Vencimiento**: Para productos perecederos

## Importar Productos

Puedes importar multiples productos usando un archivo Excel/CSV.
    `,
    keywords: ["producto", "agregar", "nuevo", "crear", "inventario"],
  },

  "inventory-movements": {
    id: "inventory-movements",
    category: HELP_CATEGORIES.INVENTORY,
    title: "Movimientos de Inventario",
    summary: "Entradas, salidas y transferencias de productos",
    content: `
# Movimientos de Inventario

## Tipos de Movimiento

### Entradas
- Compras a proveedores
- Devoluciones de clientes
- Ajustes positivos

### Salidas
- Ventas
- Mermas/Perdidas
- Ajustes negativos

### Transferencias
- Entre sucursales
- Entre bodegas

## Registrar Movimiento

1. Ve a **Inventario > Movimientos**
2. Selecciona el tipo de movimiento
3. Elige el producto y cantidad
4. Agrega referencia (factura, orden, etc.)
5. Confirma el movimiento

## Kardex

El Kardex muestra el historial completo de movimientos por producto.
    `,
    keywords: ["movimiento", "entrada", "salida", "transferencia", "kardex"],
  },

  "finance-receivables": {
    id: "finance-receivables",
    category: HELP_CATEGORIES.FINANCE,
    title: "Cuentas por Cobrar",
    summary: "Gestion de creditos y cobros a clientes",
    content: `
# Cuentas por Cobrar

## Ventas a Credito

Cuando realizas una venta a credito, se crea automaticamente una cuenta por cobrar.

## Ver Cuentas Pendientes

1. Ve a **Finanzas**
2. Selecciona la pestana **Por Cobrar**
3. Filtra por cliente, fecha o estado

## Registrar Pago

1. Encuentra la cuenta pendiente
2. Haz clic en **Registrar Pago**
3. Ingresa el monto recibido
4. Selecciona el metodo de pago
5. Confirma

## Pagos Parciales

El sistema soporta pagos parciales. El saldo pendiente se actualiza automaticamente.

## Alertas de Vencimiento

Recibiras notificaciones cuando las cuentas esten proximas a vencer o vencidas.
    `,
    keywords: ["cobrar", "credito", "deuda", "cliente", "pago"],
  },

  "finance-payables": {
    id: "finance-payables",
    category: HELP_CATEGORIES.FINANCE,
    title: "Cuentas por Pagar",
    summary: "Gestion de deudas con proveedores",
    content: `
# Cuentas por Pagar

## Registrar Deuda

1. Ve a **Finanzas > Por Pagar**
2. Haz clic en **Nueva Cuenta**
3. Selecciona el proveedor
4. Ingresa el monto y fecha de vencimiento
5. Guarda

## Realizar Pago

1. Encuentra la cuenta pendiente
2. Haz clic en **Pagar**
3. Ingresa el monto a pagar
4. Confirma el pago

## Reportes

- Antigüedad de saldos
- Proyeccion de pagos
- Historial por proveedor
    `,
    keywords: ["pagar", "proveedor", "deuda", "factura"],
  },

  "settings-users": {
    id: "settings-users",
    category: HELP_CATEGORIES.SETTINGS,
    title: "Gestion de Usuarios",
    summary: "Como agregar y administrar usuarios del sistema",
    content: `
# Gestion de Usuarios

## Agregar Usuario

1. Ve a **Configuracion > Usuarios**
2. Haz clic en **Nuevo Usuario**
3. Ingresa email y nombre
4. Asigna un rol (Admin, Vendedor, etc.)
5. El usuario recibira un email para crear su contrasena

## Roles Disponibles

- **Administrador**: Acceso completo
- **Gerente**: Acceso a reportes y configuracion
- **Vendedor**: Solo POS y ventas
- **Inventario**: Solo gestion de inventario

## Permisos

Puedes personalizar los permisos de cada rol en **Configuracion > Permisos**.
    `,
    keywords: ["usuario", "rol", "permiso", "acceso", "empleado"],
  },

  "troubleshooting-printer": {
    id: "troubleshooting-printer",
    category: HELP_CATEGORIES.TROUBLESHOOTING,
    title: "Problemas con Impresora",
    summary: "Soluciones para problemas comunes de impresion",
    content: `
# Problemas con Impresora

## La impresora no imprime

1. Verifica que la impresora este encendida y conectada
2. Revisa la configuracion en **Configuracion > Impresora**
3. Prueba imprimir una pagina de prueba

## Impresion cortada o ilegible

- Verifica el ancho de papel (58mm o 80mm)
- Limpia el cabezal de impresion
- Revisa que el papel este bien colocado

## Impresora USB no detectada

1. Desconecta y reconecta el cable USB
2. Reinicia la impresora
3. Verifica los drivers en tu computadora

## Impresora de Red

- Verifica la IP de la impresora
- Asegurate que este en la misma red
- Puerto por defecto: 9100
    `,
    keywords: ["impresora", "imprimir", "ticket", "factura", "error"],
  },

  "troubleshooting-sync": {
    id: "troubleshooting-sync",
    category: HELP_CATEGORIES.TROUBLESHOOTING,
    title: "Problemas de Sincronizacion",
    summary: "Que hacer cuando los datos no se actualizan",
    content: `
# Problemas de Sincronizacion

## Los datos no se actualizan

1. Verifica tu conexion a internet
2. Recarga la pagina (F5 o Ctrl+R)
3. Cierra sesion y vuelve a entrar

## Datos duplicados

Si ves registros duplicados, contacta a soporte tecnico.

## Error al guardar

- Verifica que todos los campos requeridos esten completos
- Revisa tu conexion a internet
- Intenta nuevamente en unos minutos

## Limpiar Cache

1. Presiona Ctrl+Shift+Delete
2. Selecciona "Datos en cache"
3. Haz clic en "Borrar datos"
4. Recarga la pagina
    `,
    keywords: ["sincronizar", "actualizar", "error", "cache", "conexion"],
  },
};

export function searchHelp(query) {
  if (!query || query.length < 2) return [];
  
  const normalizedQuery = query.toLowerCase().trim();
  const results = [];

  for (const article of Object.values(helpArticles)) {
    const score = calculateRelevance(article, normalizedQuery);
    if (score > 0) {
      results.push({ ...article, score });
    }
  }

  return results.sort((a, b) => b.score - a.score).slice(0, 10);
}

function calculateRelevance(article, query) {
  let score = 0;
  
  if (article.title.toLowerCase().includes(query)) {
    score += 10;
  }
  
  if (article.summary.toLowerCase().includes(query)) {
    score += 5;
  }
  
  if (article.keywords.some(k => k.includes(query) || query.includes(k))) {
    score += 8;
  }
  
  if (article.content.toLowerCase().includes(query)) {
    score += 2;
  }
  
  return score;
}

export function getArticlesByCategory(category) {
  return Object.values(helpArticles).filter(a => a.category === category);
}

export function getArticleById(id) {
  return helpArticles[id] || null;
}

export function getCategories() {
  const categories = [
    { id: HELP_CATEGORIES.GETTING_STARTED, name: "Primeros Pasos", icon: "rocket" },
    { id: HELP_CATEGORIES.POS, name: "Punto de Venta", icon: "shopping-cart" },
    { id: HELP_CATEGORIES.INVENTORY, name: "Inventario", icon: "package" },
    { id: HELP_CATEGORIES.SALES, name: "Ventas", icon: "receipt" },
    { id: HELP_CATEGORIES.FINANCE, name: "Finanzas", icon: "wallet" },
    { id: HELP_CATEGORIES.CRM, name: "Clientes (CRM)", icon: "users" },
    { id: HELP_CATEGORIES.HR, name: "Recursos Humanos", icon: "user-check" },
    { id: HELP_CATEGORIES.SETTINGS, name: "Configuracion", icon: "settings" },
    { id: HELP_CATEGORIES.TROUBLESHOOTING, name: "Solucion de Problemas", icon: "help-circle" },
  ];

  return categories.map(cat => ({
    ...cat,
    articleCount: getArticlesByCategory(cat.id).length,
  }));
}
