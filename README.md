# Control de Compras SIONLAB

Aplicación basada en tu Excel: registra, edita, elimina, busca e importa compras.

## 1. Supabase (nueva cuenta)

1. Entra a [Supabase](https://supabase.com/dashboard) > **New project** y crea `Control de Compras SIONLAB`.
2. Cuando esté **Active**, abre **SQL Editor** > **New query**. Copia y ejecuta todo `supabase/schema.sql`.
3. Ve a **Authentication** > **Users** > **Add user** y crea el primer usuario con correo y contraseña.
4. En **Project Settings** > **API**, copia Project URL y Publishable key.

## 2. Conexión local

1. Copia `.env.example` como `.env` y completa:

```env
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=sb_publishable_xxxxx
```

2. Ejecuta dentro de esta carpeta:

```bash
npm install
npm run dev
```

3. Abre la dirección indicada, inicia sesión y usa **Importar Excel** para cargar `Compras Generales de operacion.xlsx`.

## 3. GitHub

```bash
git init
git add .
git commit -m "Sistema de control de compras"
git branch -M main
git remote add origin https://github.com/TU-USUARIO/compras-sionlab.git
git push -u origin main
```

No subas `.env`; ya está incluido en `.gitignore`.

## 4. Cloudflare Pages

1. Cloudflare > **Workers & Pages** > **Create application** > **Pages** > **Connect to Git**.
2. Elige el repositorio y usa: Framework **Vite**, Build command `npm run build`, Output `dist`.
3. En **Environment variables** agrega `VITE_SUPABASE_URL` y `VITE_SUPABASE_PUBLISHABLE_KEY`.
4. Presiona **Save and Deploy**. Copia la URL resultante en Supabase > **Authentication** > **URL Configuration** como Site URL y Redirect URL.

## Seguridad

El sitio puede ser público, pero solo usuarios que inicien sesión pueden ver o modificar compras. No uses ni publiques la clave `service_role`.

## 5. Automatización, avisos y Android

1. Ejecuta `supabase/automatizacion_notificaciones.sql` después de la base inicial. Agrega proveedor, gastos recurrentes, fecha de aviso y el historial de avisos.
2. La aplicación ya se instala desde Chrome Android: abre el sitio, menú de Chrome y selecciona **Instalar aplicación**. Dentro del sistema pulsa **Activar avisos** y acepta el permiso.
3. Para correo y WhatsApp, publica la función `supabase/functions/enviar-notificacion/index.ts` y configura como secretos `RESEND_API_KEY`, `META_WA_TOKEN` y `META_WA_PHONE_NUMBER_ID`. Las claves de Meta nunca van en `.env` del sitio.
4. En Meta WhatsApp Business registra el número que enviará los avisos. Para mensajes iniciados por el sistema fuera de la ventana de conversación de 24 horas, Meta exige una plantilla aprobada.
