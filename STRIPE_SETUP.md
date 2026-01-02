# Configuración de Stripe para Sistema de Suscripciones

Esta guía te ayudará a configurar Stripe para el sistema de suscripciones del ERP.

## 1. Crear Cuenta de Stripe

1. Ve a [https://dashboard.stripe.com/register](https://dashboard.stripe.com/register)
2. Completa el registro con tu información
3. Verifica tu email

## 2. Obtener API Keys

1. En el Dashboard de Stripe, ve a **Developers → API Keys**
2. Copia las siguientes keys:
   - `Publishable key` (empieza con `pk_test_` o `pk_live_`)
   - `Secret key` (empieza con `sk_test_` o `sk_live_`)

## 3. Crear Productos y Precios

En el Dashboard de Stripe, ve a **Products** y crea los siguientes productos:

### Plan Básico ($29/mes)
1. Click en "Add product"
2. Nombre: "Plan Básico"
3. Descripción: "Ideal para pequeñas empresas - hasta 10 empleados"
4. Precio: $29.00 USD, Recurring, Monthly
5. Guarda el `Price ID` (empieza con `price_`)

### Plan Pro ($79/mes)
1. Click en "Add product"
2. Nombre: "Plan Pro"
3. Descripción: "Para empresas en crecimiento - hasta 50 empleados"
4. Precio: $79.00 USD, Recurring, Monthly
5. Guarda el `Price ID`

### Plan Enterprise ($199/mes)
1. Click en "Add product"
2. Nombre: "Plan Enterprise"
3. Descripción: "Para grandes empresas - empleados ilimitados"
4. Precio: $199.00 USD, Recurring, Monthly
5. Guarda el `Price ID`

## 4. Configurar Webhook

1. Ve a **Developers → Webhooks**
2. Click en "Add endpoint"
3. URL del endpoint: `https://tu-dominio.com/api/stripe/webhook`
4. Selecciona los siguientes eventos:
   - `checkout.session.completed`
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`
5. Click en "Add endpoint"
6. Copia el `Signing secret` (empieza con `whsec_`)

## 5. Configurar Portal de Clientes

1. Ve a **Settings → Billing → Customer portal**
2. Activa las siguientes opciones:
   - Allow customers to update their payment methods
   - Allow customers to view invoice history
   - Allow customers to cancel subscriptions
3. Guarda los cambios

## 6. Variables de Entorno

Agrega las siguientes variables a tu archivo `.env.local`:

```env
# Stripe API Keys
STRIPE_SECRET_KEY=sk_test_xxxxxxxxxxxxx
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_xxxxxxxxxxxxx

# Stripe Webhook Secret
STRIPE_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxx

# Stripe Price IDs (obtener del dashboard después de crear productos)
STRIPE_PRICE_BASICO=price_xxxxxxxxxxxxx
STRIPE_PRICE_PRO=price_xxxxxxxxxxxxx
STRIPE_PRICE_ENTERPRISE=price_xxxxxxxxxxxxx

# URL de la aplicación (para redirects)
NEXT_PUBLIC_APP_URL=https://tu-dominio.com
```

## 7. Ejecutar Migración de Base de Datos

Ejecuta el archivo SQL de migración en tu Supabase:

1. Ve al SQL Editor en tu dashboard de Supabase
2. Copia y pega el contenido de `supabase/migrations/20241227_subscription_tables.sql`
3. Ejecuta la migración

## 8. Probar en Modo Test

Antes de ir a producción, prueba todo en modo test:

1. Usa las keys que empiezan con `pk_test_` y `sk_test_`
2. Usa tarjetas de prueba de Stripe:
   - Éxito: `4242 4242 4242 4242`
   - Rechazada: `4000 0000 0000 0002`
   - Requiere autenticación: `4000 0025 0000 3155`

## 9. Probar Webhooks Localmente

Para probar webhooks en desarrollo local:

1. Instala Stripe CLI: https://stripe.com/docs/stripe-cli
2. Ejecuta: `stripe listen --forward-to localhost:3000/api/stripe/webhook`
3. Copia el webhook signing secret que te da el CLI
4. Usa ese secret en tu `.env.local`

## 10. Ir a Producción

Cuando estés listo para producción:

1. Completa la verificación de tu cuenta en Stripe
2. Cambia a las keys de producción (`pk_live_` y `sk_live_`)
3. Crea los productos/precios en modo live
4. Actualiza el webhook endpoint con tu URL de producción
5. Actualiza todas las variables de entorno en tu servidor

## Estructura de Archivos Creados

```
src/lib/stripe/
├── config.js      # Configuración de planes y precios
├── client.js      # Cliente de Stripe para frontend
├── limits.js      # Sistema de límites por plan
└── middleware.js  # Middleware de verificación

app/api/stripe/
├── checkout/route.js     # Crear sesión de checkout
├── webhook/route.js      # Recibir eventos de Stripe
├── portal/route.js       # Portal de facturación
└── subscription/route.js # Obtener estado de suscripción

app/pricing/page.jsx              # Página de precios pública
app/subscription/success/page.jsx # Página de éxito
app/subscription/cancel/page.jsx  # Página de cancelación

src/modules/settings/components/
└── SubscriptionSettings.jsx # Gestión de suscripción

supabase/migrations/
└── 20241227_subscription_tables.sql # Tablas de BD
```

## Soporte

Si tienes problemas con la configuración, revisa:
- [Documentación de Stripe](https://stripe.com/docs)
- [Stripe API Reference](https://stripe.com/docs/api)
- [Stripe Webhooks](https://stripe.com/docs/webhooks)
