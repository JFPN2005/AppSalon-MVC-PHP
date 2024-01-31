let paso = 1;
const pasoInicial = 1;
const pasoFinal = 3;

const cita = {
    id: '',
    nombre: '',
    fecha: '',
    hora: '',
    servicios: []
}

document.addEventListener('DOMContentLoaded', function() {
    iniciarApp();
});

function iniciarApp() {
    mostrarSeccion(); // Muestra y ocultas las secciones
    tabs(); // Cambiar la seccion cuando se presionen los tabs
    botonesPaginador(); // Agrega o quita los botones del paginado
    paginaAnterior(); // Ve a  la pagina anterior
    paginaSiguiente(); // Ve a  la pagina siguiente

    consultarAPI(); // Consulta la API en el backend de PHP

    idCliente();
    nombreCliente(); // Añarde el nombre del cliente al objeto de cita
    selecccionarFecha(); // Añade la fecha de la cita al objeto de cita
    seleccionarHora(); // Añade la hora de la cita al objetod de cita
    mostrarResumen(); // Mostrar el resumen de la cita
};

function mostrarSeccion() {

    // Ocultar la seccion que tenga la clase de mostrar
    const seccionAnterior = document.querySelector('.mostrar');

        // Si existe una seccion anterior remuevela
        if(seccionAnterior) {
            seccionAnterior.classList.remove('mostrar');
        }
    

    // Seleccionar la seccion con el paso...
    const pasoSelector = `#paso-${paso}`;
    const seccion = document.querySelector(pasoSelector);
    seccion.classList.add('mostrar');

    // Quita la clase actual al tab anterior
    const tabAnterior = document.querySelector('.actual');

     // Su existe un tab anterior remuevelo
     if(tabAnterior) {
        tabAnterior.classList.remove('actual');
     }

    // Resalta el tab actual
    const tab = document.querySelector(`[data-paso="${paso}"]`);
    tab.classList.add('actual');

};

function tabs() {
    const botones = document.querySelectorAll('.tabs button');
    botones.forEach( boton => {
        boton.addEventListener('click', function(e) {
            e.preventDefault();
            paso = parseInt(e.target.dataset.paso);
            mostrarSeccion();
            botonesPaginador();
        })
    })
};

function botonesPaginador() {
    const paginaAnterior = document.querySelector('#anterior');
    const paginaSiguiente = document.querySelector('#siguiente');

    if(paso === 1) {
        paginaAnterior.classList.add('ocultar');
        paginaSiguiente.classList.remove('ocultar');

    } else if(paso === 3) {
        paginaAnterior.classList.remove('ocultar');
        paginaSiguiente.classList.add('ocultar');

        mostrarResumen();
    } else {
        paginaAnterior.classList.remove('ocultar');
        paginaSiguiente.classList.remove('ocultar');
    }

    mostrarSeccion();
}

function paginaAnterior() {
    const paginaAnterior = document.querySelector('#anterior');
    paginaAnterior.addEventListener('click', function() {
        if(paso <= pasoInicial) return;

        paso--;
        botonesPaginador();
    })
}

function paginaSiguiente() {
    const paginaSiguiente = document.querySelector('#siguiente');
    paginaSiguiente.addEventListener('click', function() {
        if(paso >= pasoFinal) return;

        paso++;
        botonesPaginador();
    })
}

async function consultarAPI() {
    try {
        const url = '/api/servicios';
        const resultado = await fetch(url);
        const servicios = await resultado.json();
        mostrarServicios(servicios);
    } catch (error) {
        console.log(error);
    }
}

function mostrarServicios(servicios) {
    servicios.forEach(servicio => {
        const { id, nombre, precio } = servicio;
        const nombreServicio = document.createElement('P');
        nombreServicio.classList.add('nombre-servicio');
        nombreServicio.textContent = nombre;

        const precioServicio = document.createElement('P');
        precioServicio.classList.add('precio-servicio');
        precioServicio.textContent = `$${precio}`;

        const servicioDiv = document.createElement('DIV');
        servicioDiv.classList.add('servicio');
        servicioDiv.dataset.idServicio = id;
        servicioDiv.onclick = function() {
            seleccionarServicio(servicio);
        }

        servicioDiv.appendChild(nombreServicio);
        servicioDiv.appendChild(precioServicio);
        document.querySelector('#servicios').appendChild(servicioDiv);
    });
}

function seleccionarServicio(servicio) {
    // Extraemos el id de servicio
    const {id} = servicio;
    // Extraemos servicios de cita
    const {servicios} = cita;
    //  Identificar al elemento al que se le da click
    const divServicio = document.querySelector(`[data-id-servicio="${id}"]`);

    // Comprobar si un servicio ya fue a agregado
    if(servicios.some(agregado => agregado.id === id)) {
        // Eliminarlo
        cita.servicios = servicios.filter(agregado => agregado.id !== id);
        // Le quitamos una clase al divServicio seleccionado
        divServicio.classList.remove('seleccionado');

    } else {
         // Agregamos los datos de servicios a servicio
        cita.servicios = [...servicios, servicio];
        // Le añadimos una clase al divServicio seleccionado
        divServicio.classList.add('seleccionado');
    }

   

    // console.log(cita);
}

/* FUNCIONES DE CITA */
function idCliente() {
    cita.id = document.querySelector('#id').value;
}

function nombreCliente() {
    cita.nombre = document.querySelector('#nombre').value;
}

function selecccionarFecha() {
    const inputFecha = document.querySelector('#fecha');
    inputFecha.addEventListener('input', function(e) {
        const dia = new Date(e.target.value).getUTCDay();
        if([6, 0].includes(dia)) {
            e.target.value = '';
            mostrarAlerta('Fines de semana no permitidos', 'error', '#paso-2 p');
        } else {
            cita.fecha = e.target.value;
        }
    }) 
}

// Seleccionar hora de la cita
function seleccionarHora() {
    const inputHora = document.querySelector('#hora');
    inputHora.addEventListener('input', function(e) {
        // Agregamos el valor del input a la hora de la cita
        const horaCita = e.target.value;
        // Separamos la hora con dos puntos
        const hora = horaCita.split(":")[0];
        // Si la hora es menor a 10 o mayor a 18 se mostrara un error
        if(hora < 10 || hora >18) {
            e.target.value = "";
            mostrarAlerta("Hora no valida", "error", '#paso-2 p');
        } else {
            // Si la hora no es menor a 10 o mayor a 18 se agregara el valor a la hora de cita
            cita.hora = e.target.value;
            // console.log(cita);
        }
    })
}


/* MOSTRAR ALERTA */

function mostrarAlerta(mensaje, tipo, elemento, desaparece = true) {

    // Previene que se generen mas de una alerta
    const alertaPrevia = document.querySelector('.alerta');
    if(alertaPrevia) {
        alertaPrevia.remove();
    }

    // Scripting para crear la alerta
    const alerta = document.createElement('DIV');
    alerta.textContent = mensaje;
    alerta.classList.add('alerta');
    alerta.classList.add(tipo);
    const referencia = document.querySelector(elemento);
    referencia.appendChild(alerta);

    if(desaparece){
        // Eliminar la la alerta despues de 3 segundos
        setTimeout(() => {
            alerta.remove();
        }, 3000);
    }

}

function mostrarResumen() {
    const resumen = document.querySelector('.contenido-resumen');

    // Limpiar el contenido de resumen
    while(resumen.firstChild) {
        resumen.removeChild(resumen.firstChild);
    }

    if(Object.values(cita).includes('')|| cita.servicios.length === 0) {
        mostrarAlerta('Faltas datos de Servicios, Fecha u Hora', 'error', '.contenido-resumen', false);
        return;
    }
    
    // Formatear div de resumen
    const { nombre, fecha, hora, servicios } = cita;

    // Heading para servicios en resumen
    const headingServicios = document.createElement('H3');
    headingServicios.textContent = 'Resumen de Servicios';
    resumen.appendChild(headingServicios);

    // Iterando y mostrando los servicios
    servicios.forEach(servicio => {
        const { id, precio, nombre } = servicio;
        const contenedorServicio = document.createElement('DIV');
        contenedorServicio.classList.add('contenedor-servicio');
        
        const textoServicio = document.createElement('P');
        textoServicio.textContent = nombre;

        const precioServicio = document.createElement('P');
        precioServicio.innerHTML = `<span>Precio:</span> $${precio}`;

        contenedorServicio.appendChild(textoServicio);
        contenedorServicio.appendChild(precioServicio);
        resumen.appendChild(contenedorServicio);
    });

    // Heading para cita en resumen
    const headingCita = document.createElement('H3');
    headingCita.textContent = 'Resumen de Cita';
    resumen.appendChild(headingCita);

    const nombreCliente = document.createElement('P');
    nombreCliente.innerHTML = `<span>Nombre:</span> ${nombre}`;

    // Formatear la fecha en español
    const fechaObj = new Date(fecha);
    const mes = fechaObj.getMonth();
    const dia = fechaObj.getDate() + 2;
    const year = fechaObj.getFullYear();

    const fechaUTC = new Date(Date.UTC(year, mes, dia));
    const opciones = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'};
    const fechaFormateada = fechaUTC.toLocaleDateString('ex-MX', opciones);
    
    const fechaCita = document.createElement('P');
    fechaCita.innerHTML = `<span>Fecha:</span> ${fechaFormateada}`;

    const horaCita = document.createElement('P');
    horaCita.innerHTML = `<span>Hora:</span> ${hora} Horas`;

    // Boton para crear una cita
    const botonReservar = document.createElement('BUTTON');
    botonReservar.classList.add('boton');
    botonReservar.textContent = 'Reservar Cita';
    botonReservar.onclick = reservarCita;

    resumen.appendChild(nombreCliente);
    resumen.appendChild(fechaCita);
    resumen.appendChild(horaCita);

    resumen.appendChild(botonReservar);
}

async function reservarCita() {
    const { nombre, fecha, hora, servicios, id } = cita;
    const idServicios = servicios.map(servicio => servicio.id);

    const datos = new FormData();
    datos.append('fecha', fecha);
    datos.append('hora', hora);
    datos.append('usuarioId', id);
    datos.append('servicios', idServicios);

    try {
        // Peticion hacia la API
        const url = '/api/citas';
        const respuesta = await fetch(url, {
            method: 'POST',
            body: datos
        });

        const resultado = await respuesta.json();
        console.log(resultado.resultado);

        if(resultado.resultado) {
            Swal.fire({
                icon: "success",
                title: "Cita Creada",
                text: "Tu cita fue creada correctamente",
                button: "OK"
            }).then(() => {
                setTimeout(() => {
                    window.location.reload();
                }, 3000);
            })
    }
    } catch (error) {
        Swal.fire({
            icon: "error",
            title: "Error",
            text: "Hubo un error al guadar la cita"
        });
    }

    
    // console.log([...datos]);
}