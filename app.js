//Inicializamos Supabase
const SUPABASE_URL = 'https://fgbdxecvzotxqcpzxqex.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_gzbbfiHj59c1VoN1Wwgrrw_IiLkRDHx';

//Conexion al supabase
const supabaseClient = supabase.createClient(SUPABASE_URL,SUPABASE_ANON_KEY);


//Referencias al DOM
const panelAuth = document.getElementById('panel-auth');
const panelApp = document.getElementById('panel-app');
const emailInput = document.getElementById('email');
const passInput = document.getElementById('password');
const msgAuth = document.getElementById('msg-auth');
const nameInput = document.getElementById('nombre');

//Funcion para registrar un usuario.

document.getElementById('btn-register').addEventListener('click', async () => {
    msgAuth.innerText = 'Registrando...';
    const {data,error} =  await supabaseClient.auth.signUp({
        email: emailInput.value,
        password: passInput.value,
        options: {
            data: {
                name: nameInput.value
            }
        }
    });

    if (error){
        msgAuth.innerText = error.message;
    }else{
         msgAuth.innerText = "Registro Exitoso ya puedes iniciar sesion";
    }
});



//Funcion para iniciar sesion.
document.getElementById('btn-login').addEventListener('click', async ()  => {
    msgAuth.innerText = "Iniciando Sesion...";
    const {data,error} = await supabaseClient.auth.signInWithPassword({
        email: emailInput.value,
        password: passInput.value,
    });

    if(error){
        msgAuth.innerText = error.message;
    } else{
        verificarSesion(); //
    }

});

//Funcion para cerrar cesion.
document.getElementById('btn-logout').addEventListener('click', async () => {
    await supabaseClient.auth.signOut();
    verificarSesion();
});


//Revisa si estamos logueados
async function verificarSesion(){
    const {data: {session}} = await supabaseClient.auth.getSession();

    if(session) {
        panelAuth.classList.add('oculto');
        panelApp.classList.remove('oculto');
        const nombreUsuario = session.user.user_metadata.name || session.user.email;

        document.getElementById('user-email').innerText = nombreUsuario;
    }else {
        panelAuth.classList.remove('oculto');
        panelApp.classList.add('oculto')
        msgAuth.innerText = "";
    }
}

//Subir Factura

document.getElementById('btn-upload').addEventListener('click', async () => {
    const fileInput = document.getElementById('file-ticket');
    const file = fileInput.files[0];

    //Validacion por si gno sube archivo

    if (!file){
        alert("Por favor selecciona la foto de una factura primero.")
        return;
    }

    const btnUpload = document.getElementById('btn-upload');
    btnUpload.innerText = "Subieno Imagen....";
    btnUpload.disabled = true;
    

    try {
        //Generar un nombre unico para guardarlo en el balde
        const fileExt = file.name.split('.').pop(); // Este linea lo que hace es separar un nombre cada que encuentre un . y el pop() lo que hace es tomar el ultimo elemento del array
        const fileName = `${Date.now()}.${fileExt}`;  // se crear el numero de la imagen usando la fecha y la extension.
        

        const {error: uploadError} = await supabaseClient
            .storage
            .from('tickets')
            .upload(fileName,file);
        
        if(uploadError) throw uploadError;

        //Obtener URL publica de la imagen
        const {data,publicData } = supabaseClient
            .storage
            .from('tickets')
            .getPublicUrl(fileName);
        
        const imagenUrl = data.publicUrl;

        //Guardar el registro en la tabla datos.
        const {data:{session }} = await supabaseClient.auth.getSession();

        const {error: dbError } = await supabaseClient
            .from('gastos')
            .insert([
                {
                    user_id: session.user.id,
                    imagen_url: imagenUrl,
                    estado: 'procesando'
                }
            ]);
        
        if(dbError) throw dbError;

        alert("Factura subida con exito! Lista para ser analizada por la IA.");
        
    } catch(error){
        console.error("Errror completo: ", error);
        alert("Hubo un error al subir: " + error.message);
    }finally{
        //Devolvemos el boton a la normalidad
        btnUpload.innerText = "Subir y Analizar"
        btnUpload.disabled = false;
        fileInput.value = ""
    }
});

verificarSesion()