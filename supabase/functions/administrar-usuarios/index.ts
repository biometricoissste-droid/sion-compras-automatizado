import {createClient} from 'npm:@supabase/supabase-js@2.57.4'
Deno.serve(async req=>{
 try{
  const auth=req.headers.get('Authorization')||''
  const url=Deno.env.get('SUPABASE_URL')!,service=Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  const admin=createClient(url,service,{auth:{persistSession:false}})
  const {data:{user}}=await admin.auth.getUser(auth.replace('Bearer ',''))
  if(!user)return Response.json({error:'No autorizado'},{status:401})
  const {data:caller}=await admin.from('perfiles').select('es_admin').eq('id',user.id).single()
  if(!caller?.es_admin)return Response.json({error:'Solo el administrador puede invitar'},{status:403})
  const {accion,email,rol,permisos}=await req.json()
  if(accion!=='invitar'||!email)return Response.json({error:'Solicitud incorrecta'},{status:400})
  const {data,error}=await admin.auth.admin.inviteUserByEmail(email,{redirectTo:Deno.env.get('SITE_URL')})
  if(error)throw error
  await admin.from('perfiles').upsert({id:data.user.id,email,rol:rol||'Capturista',permisos:permisos||['ver','crear'],es_admin:false})
  return Response.json({ok:true})
 }catch(error){return Response.json({error:error.message},{status:400})}
})
