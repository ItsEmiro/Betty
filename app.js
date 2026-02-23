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
        panelApp.classList.remove('oculto');
        panelApp.classList.add('oculto')
        msgAuth.innerText = "";
    }
}

//Subir Factura

document.getElementById('btn-upload').addEventListener('Click', async () => {
    const fileInput = document.getElementById('file-ticket');
    const file = fileInput.files[0];

    //Validacion por si gno sube archivo

    if (!file){
        alert("Por favor selecciona la foto de una factura primero.")
        return;
    }

    const btnUpload = document.getElementById('btn-upload');
    btnUpload.innerText = "Subieno Imagen...."
    btnUpload.disabled = true;
})

verificarSesion()