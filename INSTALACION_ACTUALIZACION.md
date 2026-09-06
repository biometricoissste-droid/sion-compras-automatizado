# Instalación de la actualización

1. En Supabase, abre **SQL Editor**, pega todo `supabase/seguridad_usuarios.sql` y pulsa **Run**. Conserva las compras actuales y convierte al primer usuario en Administrador.
2. En Supabase abre **Edge Functions**. Crea y despliega `administrar-usuarios` con el contenido de `supabase/functions/administrar-usuarios/index.ts`.
3. Crea y despliega `enviar-notificacion` con el contenido de `supabase/functions/enviar-notificacion/index.ts`.
4. En los secretos de Edge Functions agrega `SITE_URL` con la URL pública de Cloudflare.
5. Para correo agrega `RESEND_API_KEY` y `RESEND_FROM`.
6. Para WhatsApp agrega `META_WA_TOKEN`, `META_WA_PHONE_NUMBER_ID` y `WHATSAPP_TEMPLATE_NAME`.
7. Sube todos los archivos de este paquete a GitHub y confirma el commit. Cloudflare desplegará la actualización.

La plantilla de WhatsApp debe llamarse como `WHATSAPP_TEMPLATE_NAME`, usar idioma `es_MX` y tener tres variables: artículo, monto y área.
