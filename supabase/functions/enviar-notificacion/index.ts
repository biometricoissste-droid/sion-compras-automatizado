// Edge Function: configura como secretos RESEND_API_KEY, META_WA_TOKEN y META_WA_PHONE_NUMBER_ID.
Deno.serve(async (request) => {
  if (!request.headers.get('Authorization')) return new Response('No autorizado', { status: 401 })
  const { canal, destinatario, titulo, mensaje } = await request.json()
  if (!canal || !destinatario || !mensaje) return Response.json({ error: 'Datos incompletos' }, { status: 400 })
  if (canal === 'email') {
    const key = Deno.env.get('RESEND_API_KEY')
    if (!key) return Response.json({ error: 'Falta RESEND_API_KEY' }, { status: 500 })
    const r = await fetch('https://api.resend.com/emails', { method:'POST', headers:{Authorization:`Bearer ${key}`,'Content-Type':'application/json'}, body:JSON.stringify({from:'SIONLAB Compras <avisos@tu-dominio.com>',to:[destinatario],subject:titulo,html:`<p>${mensaje}</p>`}) })
    return Response.json({ ok:r.ok, canal, detalle:await r.text() }, { status:r.ok?200:502 })
  }
  if (canal === 'whatsapp') {
    const token=Deno.env.get('META_WA_TOKEN'), phoneId=Deno.env.get('META_WA_PHONE_NUMBER_ID')
    if (!token || !phoneId) return Response.json({ error:'Faltan secretos de Meta WhatsApp Business' },{status:500})
    const r=await fetch(`https://graph.facebook.com/v22.0/${phoneId}/messages`,{method:'POST',headers:{Authorization:`Bearer ${token}`,'Content-Type':'application/json'},body:JSON.stringify({messaging_product:'whatsapp',to:destinatario.replace(/\D/g,''),type:'text',text:{body:`${titulo}\n${mensaje}`}})})
    return Response.json({ ok:r.ok, canal, detalle:await r.text() },{status:r.ok?200:502})
  }
  return Response.json({ error:'Canal no compatible' },{status:400})
})
