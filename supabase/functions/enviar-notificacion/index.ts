import {createClient} from 'npm:@supabase/supabase-js@2.57.4'
Deno.serve(async req=>{
 try{
  const url=Deno.env.get('SUPABASE_URL')!,service=Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,auth=req.headers.get('Authorization')||''
  const admin=createClient(url,service,{auth:{persistSession:false}})
  const {data:{user}}=await admin.auth.getUser(auth.replace('Bearer ',''));if(!user)return Response.json({error:'No autorizado'},{status:401})
  const {compra}=await req.json();if(!compra?.articulo)return Response.json({error:'Compra incompleta'},{status:400})
  const {data:destinos}=await admin.from('destinatarios_alerta').select('*').eq('activo',true)
  const subject='Nueva compra registrada · SIONLAB',msg=`${compra.articulo} | $${Number(compra.precio||0).toFixed(2)} | ${compra.tienda||'Sin tienda'} | ${compra.area||'Sin área'}`
  const results=[]
  for(const d of destinos||[]){
   if(d.canal==='email'){
    const r=await fetch('https://api.resend.com/emails',{method:'POST',headers:{Authorization:`Bearer ${Deno.env.get('RESEND_API_KEY')}`,'Content-Type':'application/json'},body:JSON.stringify({from:Deno.env.get('RESEND_FROM'),to:[d.destinatario],subject,html:`<h2>${subject}</h2><p>${msg}</p>`})});results.push({destino:d.destinatario,ok:r.ok})
   }else{
    const template=Deno.env.get('WHATSAPP_TEMPLATE_NAME')||'nueva_compra'
    const r=await fetch(`https://graph.facebook.com/v22.0/${Deno.env.get('META_WA_PHONE_NUMBER_ID')}/messages`,{method:'POST',headers:{Authorization:`Bearer ${Deno.env.get('META_WA_TOKEN')}`,'Content-Type':'application/json'},body:JSON.stringify({messaging_product:'whatsapp',to:d.destinatario.replace(/\D/g,''),type:'template',template:{name:template,language:{code:'es_MX'},components:[{type:'body',parameters:[{type:'text',text:compra.articulo},{type:'text',text:`$${Number(compra.precio||0).toFixed(2)}`},{type:'text',text:compra.area||'Sin área'}]}]}})});results.push({destino:d.destinatario,ok:r.ok})
   }
  }
  return Response.json({ok:true,results})
 }catch(error){return Response.json({error:error.message},{status:400})}
})
