// Tu lista de cartas que se inicializa vacía para nuevos usuarios
let misCartasDeseadas = JSON.parse(localStorage.getItem('misCartasPokemon')) || [];

let indiceEditando = null;

const contenedor = document.getElementById('wishlist');
const formulario = document.getElementById('formulario-carta');
const botonSubmit = document.getElementById('btn-submit');
const selectSet = document.getElementById('form-set-select');
const inputSetNuevo = document.getElementById('form-set-nuevo');

function guardarEnMemoria() {
    localStorage.setItem('misCartasPokemon', JSON.stringify(misCartasDeseadas));
}

function actualizarDesplegableSets(setSeleccionado = "") {
    const setsUnicos = [...new Set(misCartasDeseadas.map(c => c.set))].sort((a, b) => a.localeCompare(b));
    let opcionesHTML = `<option value="" disabled ${!setSeleccionado ? 'selected' : ''}>-- Selecciona un Set (Inglés - Español) --</option>`;
    
    setsUnicos.forEach(setName => {
        opcionesHTML += `<option value="${setName}" ${setSeleccionado === setName ? 'selected' : ''}>${setName}</option>`;
    });
    
    opcionesHTML += `<option value="NUEVO_SET" ${setSeleccionado === "NUEVO_SET" ? 'selected' : ''}>➕ Crear nuevo set...</option>`;
    selectSet.innerHTML = opcionesHTML;
    
    if (setSeleccionado === "NUEVO_SET") {
        inputSetNuevo.style.display = "block";
        inputSetNuevo.setAttribute("required", "true");
    } else {
        inputSetNuevo.style.display = "none";
        inputSetNuevo.removeAttribute("required");
    }
}

selectSet.addEventListener('change', function() {
    if (this.value === "NUEVO_SET") {
        inputSetNuevo.style.display = "block";
        inputSetNuevo.setAttribute("required", "true");
        inputSetNuevo.placeholder = "Ej: Perfect Order - Orden Perfecto";
        inputSetNuevo.focus();
    } else {
        inputSetNuevo.style.display = "none";
        inputSetNuevo.removeAttribute("required");
    }
});

formulario.addEventListener('submit', function(e) {
    e.preventDefault();

    let nombreSetFinal = selectSet.value;
    if (nombreSetFinal === "NUEVO_SET") {
        nombreSetFinal = inputSetNuevo.value.trim();
    }

    const datosCarta = {
        nombre: document.getElementById('form-nombre').value,
        imagen: document.getElementById('form-imagen').value,
        set: nombreSetFinal,
        numero: parseInt(document.getElementById('form-numero').value)
    };

    if (indiceEditando !== null) {
        misCartasDeseadas[indiceEditando].nombre = datosCarta.nombre;
        misCartasDeseadas[indiceEditando].imagen = datosCarta.imagen;
        misCartasDeseadas[indiceEditando].set = datosCarta.set;
        misCartasDeseadas[indiceEditando].numero = datosCarta.numero;
        indiceEditando = null;
        botonSubmit.textContent = "Agregar a la Lista";
        botonSubmit.style.backgroundColor = "#3b4cca";
    } else {
        // Modo Creación: Comprobación de duplicados
        const cartaDuplicada = misCartasDeseadas.some(carta => 
            carta.nombre.toLowerCase() === datosCarta.nombre.toLowerCase() &&
            carta.numero === datosCarta.numero &&
            carta.set.toLowerCase() === datosCarta.set.toLowerCase()
        );

        if (cartaDuplicada) {
            alert(`"Ya está registrada esta carta de "${datosCarta.nombre}" con el número ${datosCarta.numero} en el set "${datosCarta.set}"`);
            return;
        }

        datosCarta.obtenida = false;
        misCartasDeseadas.push(datosCarta);
        alert("¡Se ha añadido la carta con éxito!");
    }
    guardarEnMemoria();
    cargarWishlist();
    formulario.reset();
    actualizarDesplegableSets();
});

window.prepararEdicion = function(numeroCarta, nombreSet) {
    const numeroReal = Number(numeroCarta);
    const carta = misCartasDeseadas.find(c => c.numero === numeroReal && c.set === nombreSet);
    
    if (carta) {
        indiceEditando = misCartasDeseadas.indexOf(carta);

        document.getElementById('form-nombre').value = carta.nombre;
        document.getElementById('form-imagen').value = carta.imagen;
        document.getElementById('form-numero').value = carta.numero;

        actualizarDesplegableSets(carta.set);

        botonSubmit.textContent = "💾 Guardar Cambios";
        botonSubmit.style.backgroundColor = "#e67e22";

        window.scrollTo({ top: 0, behavior: 'smooth' });
    }
}

window.cambiarEstadoCarta = function(numeroCarta, nombreSet) {
    const numeroReal = Number(numeroCarta);
    const carta = misCartasDeseadas.find(c => c.numero === numeroReal && c.set === nombreSet);
    if (carta) {
        carta.obtenida = !carta.obtenida; 
        guardarEnMemoria();              
        cargarWishlist();                
    }
}

window.eliminarCarta = function(numeroCarta, nombreSet) {
    if (confirm("¿Seguro que quieres eliminar esta carta de la lista?")) {
        const numeroReal = Number(numeroCarta);
        const carta = misCartasDeseadas.find(c => c.numero === numeroReal && c.set === nombreSet);
        
        if (carta) {
            const indice = misCartasDeseadas.indexOf(carta);
            misCartasDeseadas.splice(indice, 1);
            
            if (indiceEditando === indice) {
                indiceEditando = null;
                formulario.reset();
                botonSubmit.textContent = "Agregar a la Lista";
                botonSubmit.style.backgroundColor = "#3b4cca";
            }
            
            guardarEnMemoria();
            cargarWishlist();
            actualizarDesplegableSets();
        }
    }
}

// ==========================================
// FUNCIONES DE EXPORTAR E IMPORTAR
// ==========================================

document.getElementById('btn-exportar').addEventListener('click', function() {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(misCartasDeseadas));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", "mis_cartas_pokemon.txt");
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
});

document.getElementById('btn-importar').addEventListener('click', function() {
    const inputOculto = document.createElement('input');
    inputOculto.type = 'file';
    inputOculto.accept = '.txt';
    
    inputOculto.onchange = e => {
        const archivo = e.target.files[0];
        const lector = new FileReader();
        lector.readAsText(archivo, 'UTF-8');
        
        lector.onload = lectorEvent => {
            try {
                const contenido = JSON.parse(lectorEvent.target.result);
                if (Array.isArray(contenido)) {
                    misCartasDeseadas = contenido;
                    guardarEnMemoria();
                    cargarWishlist();
                    actualizarDesplegableSets();
                    alert("¡Lista cargada y sincronizada con éxito!");
                } else {
                    alert("El archivo no tiene el formato correcto.");
                }
            } catch (error) {
                alert("Error al leer el archivo.");
            }
        }
    }
    inputOculto.click();
});

// ==========================================
// FUNCIÓN PARA GENERAR EL HTML
// ==========================================

function generarHTMLBloque(cartas) {
    if (cartas.length === 0) return `<p style="color: #666; text-align: left; margin-left: 20px;">No hay cartas en esta sección.</p>`;
    const cartasPorSet = {};
    cartas.forEach(carta => {
        if (!cartasPorSet[carta.set]) cartasPorSet[carta.set] = [];
        cartasPorSet[carta.set].push(carta);
    });

    let htmlResultado = "";
    for (const nombreSet in cartasPorSet) {
        const setEscapado = nombreSet.replace(/'/g, "\\'");
        
        htmlResultado += `
            <div class="seccion-set">
                <h3 class="titulo-set">${nombreSet}</h3>
                <div class="grid-cartas">
                    ${cartasPorSet[nombreSet].map(carta => {
                        const nombreEscapado = carta.nombre.replace(/'/g, "\\'");
                        const imagenEscapada = carta.imagen.replace(/'/g, "\\'");
                        return `
                        <div class="carta-contenedor ${carta.obtenida ? 'carta-obtenida' : ''}">
                            <img class="carta-img" src="${carta.imagen}" alt="${carta.nombre}" onclick="ampliarCarta('${imagenEscapada}', '${nombreEscapado}')">
                            <div class="carta-info">
                                <strong>${carta.nombre}</strong>
                                <div style="color: #888; font-size: 0.8rem; margin: 4px 0 8px 0;">Nº ${carta.numero}</div>
                                <div class="controles-carta" style="display: flex; flex-direction: column; gap: 8px; align-items: center;">
                                    <label class="checkbox-contenedor">
                                        <input type="checkbox" ${carta.obtenida ? 'checked' : ''} onclick="cambiarEstadoCarta(${carta.numero}, '${setEscapado}')">
                                        <span>¿La tengo?</span>
                                    </label>
                                    
                                    <div style="display: flex; gap: 6px; width: 80%; justify-content: center;">
                                        <button onclick="prepararEdicion(${carta.numero}, '${setEscapado}')" class="btn-editar" style="width: 50%; padding: 4px 6px;">Editar</button>
                                        <button onclick="eliminarCarta(${carta.numero}, '${setEscapado}')" class="btn-eliminar" style="width: 50%; padding: 4px 6px;">Borrar</button>
                                    </div>
                                </div>
                            </div>
                        </div>
                        `;
                    }).join('')}
                </div>
            </div>
        `;
    }
    return htmlResultado;
}

function cargarWishlist() {
    contenedor.innerHTML = "";
    misCartasDeseadas.sort((a, b) => a.numero - b.numero);

    const pendientes = misCartasDeseadas.filter(carta => !carta.obtenida);
    const obtenidas = misCartasDeseadas.filter(carta => carta.obtenida);

    contenedor.innerHTML = `
        <div class="super-contenedor">
            <h2 class="gran-titulo titulo-pendientes">Lista de deseos</h2>
            ${generarHTMLBloque(pendientes)}
        </div>
        <div class="super-contenedor" style="margin-top: 60px;">
            <h2 class="gran-titulo titulo-obtenidas">Cartas Obtenidas</h2>
            ${generarHTMLBloque(obtenidas)}
        </div>
    `;
}

// ==========================================
// FUNCIÓN PARA LIMPIAR LA PANTALLA
// ==========================================
document.getElementById('btn-limpiar').addEventListener('click', function() {
    if (confirm("¿Quieres vaciar la lista actual para cargar otra colección? (Esto no borrará tus archivos .txt guardados en tu PC)")) {
        misCartasDeseadas = []; 
        guardarEnMemoria();        
        cargarWishlist();          
        actualizarDesplegableSets(); 
        alert("¡Lista despejada! Ya puedes importar un nuevo archivo .txt o empezar tu colección desde cero.");
    }
});

// ==========================================
// LÓGICA DE LA VENTANA MODAL (ZOOM CARTA)
// ==========================================
window.ampliarCarta = function(srcImagen, nombreCarta) {
    const modal = document.getElementById('modal-carta');
    const imgAmpliada = document.getElementById('img-ampliada');
    const subtitulo = document.getElementById('modal-subtitulo');

    if (modal && imgAmpliada && subtitulo) {
        modal.style.display = "flex"; 
        imgAmpliada.src = srcImagen;  
        subtitulo.innerText = nombreCarta; 
    }
}

// Eventos para cerrar la ventana del modal
document.addEventListener('DOMContentLoaded', () => {
    const botonCerrar = document.querySelector('.modal-cerrar');
    const modalContenedor = document.getElementById('modal-carta');

    if (botonCerrar) {
        botonCerrar.addEventListener('click', () => {
            modalContenedor.style.display = "none";
        });
    }

    if (modalContenedor) {
        modalContenedor.addEventListener('click', (e) => {
            if (e.target.id === 'modal-carta') {
                modalContenedor.style.display = "none";
            }
        });
    }
});

// Inicialización limpia de la app al cargar la web
cargarWishlist();
actualizarDesplegableSets();