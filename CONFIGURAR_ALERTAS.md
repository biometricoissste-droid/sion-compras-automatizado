# Alertas de nuevos gastos

La aplicación solicita esta función cada vez que se crea un gasto. Para activarla:

1. En Supabase abre **Edge Functions** y despliega la función `enviar-notificacion` desde la carpeta `supabase/functions/enviar-notificacion`.
2. En **Edge Functions > Secrets**, agrega estos valores:

| Nombre | Valor |
| --- | --- |
| `ALERT_EMAIL` | Correo que recibirá las alertas |
| `ALERT_WHATSAPP_TO` | Número con código de país y sin espacios |
| `RESEND_API_KEY` | Llave de API de Resend |
| `RESEND_FROM` | Remitente verificado en Resend, por ejemplo `Compras SIONLAB <avisos@tudominio.com>` |
| `META_WA_TOKEN` | Token permanente de Meta WhatsApp Business |
| `META_WA_PHONE_NUMBER_ID` | ID del número emisor de Meta WhatsApp Business |
| `WHATSAPP_TEMPLATE_NAME` | Plantilla aprobada por Meta con tres campos de texto |

La plantilla de WhatsApp debe tener tres variables en el cuerpo: artículo, importe y área. Meta exige una plantilla aprobada para iniciar una conversación por WhatsApp.
