// Secretos: RESEND_API_KEY, RESEND_FROM, ALERT_EMAIL, META_WA_TOKEN,
// META_WA_PHONE_NUMBER_ID, ALERT_WHATSAPP_TO y WHATSAPP_TEMPLATE_NAME.
const escape = (value: unknown) => String(value ?? '').replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;')

Deno.serve(async (request) => {
  if (request.method !== 'POST') return new Response('Método no permitido', { status: 405 })
  if (!request.headers.get('Authorization')?.startsWith('Bearer ')) return new Response('No autorizado', { status: 401 })
  const { compra } = await request.json()
  if (!compra?.articulo) return Response.json({ error: 'Compra incompleta' }, { status: 400 })

  const titulo = 'Nueva compra registrada · SIONLAB'
  const monto = `$${Number(compra.precio || 0).toFixed(2)}`
  const area = compra.area || 'Sin área'
  const mensaje = `${compra.articulo} | ${monto} | Área: ${area} | Tienda: ${compra.tienda || 'Sin tienda'}`
  const resultados: Record<string, unknown> = {}

  const emailKey = Deno.env.get('RESEND_API_KEY'), emailTo = Deno.env.get('ALERT_EMAIL'), emailFrom = Deno.env.get('RESEND_FROM')
  if (emailKey && emailTo && emailFrom) {
    const response = await fetch('https://api.resend.com/emails', { method: 'POST', headers: { Authorization: `Bearer ${emailKey}`, 'Content-Type': 'application/json' }, body: JSON.stringify({ from: emailFrom, to: [emailTo], subject: titulo, html: `<h2>${escape(titulo)}</h2><p>${escape(mensaje)}</p>` }) })
    resultados.email = response.ok ? 'enviado' : await response.text()
  } else resultados.email = 'pendiente de configurar Resend'

  const token = Deno.env.get('META_WA_TOKEN'), phoneId = Deno.env.get('META_WA_PHONE_NUMBER_ID'), whatsappTo = Deno.env.get('ALERT_WHATSAPP_TO'), template = Deno.env.get('WHATSAPP_TEMPLATE_NAME')
  if (token && phoneId && whatsappTo && template) {
    const response = await fetch(`https://graph.facebook.com/v22.0/${phoneId}/messages`, { method: 'POST', headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }, body: JSON.stringify({ messaging_product: 'whatsapp', to: whatsappTo.replace(/\D/g, ''), type: 'template', template: { name: template, language: { code: 'es_MX' }, components: [{ type: 'body', parameters: [{ type: 'text', text: compra.articulo }, { type: 'text', text: monto }, { type: 'text', text: area }] }] } }) })
    resultados.whatsapp = response.ok ? 'enviado' : await response.text()
  } else resultados.whatsapp = 'pendiente de configurar Meta WhatsApp'

  return Response.json({ ok: true, resultados })
})
