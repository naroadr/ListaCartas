let misCartasDeseadas = JSON.parse(localStorage.getItem('misCartasPokemon')) || [];

let indiceEditando = null;

const contenedor = document.getElementById('wishlist');
const formulario = document.getElementById('formulario-carta');
const botonSubmit = document.getElementById('btn-submit');
const selectSet = document.getElementById('form-set-select');
const inputSetNuevo = document.getElementById('form-set-nuevo');

let paginaIzquierdaActual = 1; 
let datosBinder = JSON.parse(localStorage.getItem('misCartasBinder')) || {};
let modoEdicionBinder = true;  

// ==========================================
// PERSISTENCIA Y MEMORIA 
// ==========================================
function guardarEnMemoria() {
    localStorage.setItem('misCartasPokemon', JSON.stringify(misCartasDeseadas));
    localStorage.setItem('misCartasBinder', JSON.stringify(datosBinder));
}

// ==========================================
// GESTIÓN DE DESPLEGABLES Y SETS
// ==========================================
function actualizarDesplegableSets(setSeleccionado = "") {
    if (!selectSet) return;
    const setsUnicos = [...new Set(misCartasDeseadas.map(c => c.set))].sort((a, b) => a.localeCompare(b));
    let opcionesHTML = `<option value="" disabled ${!setSeleccionado ? 'selected' : ''}>-- Selecciona un Set (Inglés - Español) --</option>`;
    
    setsUnicos.forEach(setName => {
        opcionesHTML += `<option value="${setName}" ${setSeleccionado === setName ? 'selected' : ''}>${setName}</option>`;
    });
    
    opcionesHTML += `<option value="NUEVO_SET" ${setSeleccionado === "NUEVO_SET" ? 'selected' : ''}>➕ Crear nuevo set...</option>`;
    selectSet.innerHTML = opcionesHTML;
    
    if (inputSetNuevo) {
        if (setSeleccionado === "NUEVO_SET") {
            inputSetNuevo.style.display = "block";
            inputSetNuevo.setAttribute("required", "true");
        } else {
            inputSetNuevo.style.display = "none";
            inputSetNuevo.removeAttribute("required");
        }
    }
}

if (selectSet) {
    selectSet.addEventListener('change', function() {
        if (inputSetNuevo) {
            if (this.value === "NUEVO_SET") {
                inputSetNuevo.style.display = "block";
                inputSetNuevo.setAttribute("required", "true");
                inputSetNuevo.placeholder = "Ej: Perfect Order - Orden Perfecto";
                inputSetNuevo.focus();
            } else {
                inputSetNuevo.style.display = "none";
                inputSetNuevo.removeAttribute("required");
            }
        }
    });
}

// ==========================================
// FORMULARIO DE REGISTRO / EDICIÓN
// ==========================================
if (formulario) {
    formulario.addEventListener('submit', function(e) {
        e.preventDefault();

        let nombreSetFinal = selectSet ? selectSet.value : "";
        if (nombreSetFinal === "NUEVO_SET" && inputSetNuevo) {
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
            if (botonSubmit) {
                botonSubmit.textContent = "Agregar a la Lista";
                botonSubmit.style.backgroundColor = "#3b4cca";
            }
        } else {
            const cartaDuplicada = misCartasDeseadas.some(carta => 
                carta.nombre.toLowerCase() === datosCarta.nombre.toLowerCase() &&
                carta.numero === datosCarta.numero &&
                carta.set.toLowerCase() === datosCarta.set.toLowerCase()
            );

            if (cartaDuplicada) {
                alert(`Ya está registrada esta carta de "${datosCarta.nombre}" con el número ${datosCarta.numero} en el set "${datosCarta.set}"`);
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
}

window.prepararEdicion = function(numeroCarta, nombreSet) {
    const numeroReal = Number(numeroCarta);
    const carta = misCartasDeseadas.find(c => c.numero === numeroReal && c.set === nombreSet);
    
    if (carta) {
        indiceEditando = misCartasDeseadas.indexOf(carta);

        document.getElementById('form-nombre').value = carta.nombre;
        document.getElementById('form-imagen').value = carta.imagen;
        document.getElementById('form-numero').value = carta.numero;

        actualizarDesplegableSets(carta.set);

        if (botonSubmit) {
            botonSubmit.textContent = "💾 Guardar Cambios";
            botonSubmit.style.backgroundColor = "#e67e22";
        }

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
                if (formulario) formulario.reset();
                if (botonSubmit) {
                    botonSubmit.textContent = "Agregar a la Lista";
                    botonSubmit.style.backgroundColor = "#3b4cca";
                }
            }
            
            guardarEnMemoria();
            cargarWishlist();
            actualizarDesplegableSets();
        }
    }
}

// =====================
// IMPORTAR / EXPORTAR 
// =====================
const btnExportar = document.getElementById('btn-exportar');
if (btnExportar) {
    btnExportar.addEventListener('click', function() {
        const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(misCartasDeseadas));
        const downloadAnchor = document.createElement('a');
        downloadAnchor.setAttribute("href", dataStr);
        downloadAnchor.setAttribute("download", "mis_cartas_pokemon.txt");
        document.body.appendChild(downloadAnchor);
        downloadAnchor.click();
        downloadAnchor.remove();
    });
}

const btnImportar = document.getElementById('btn-importar');
if (btnImportar) {
    btnImportar.addEventListener('click', function() {
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
}

// =============
// INTERFAZ
// =============
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
    if (!contenedor) return;
    contenedor.innerHTML = "";
    misCartasDeseadas.sort((a, b) => a.numero - b.numero);

    const pendientes = misCartasDeseadas.filter(carta => !carta.obtenida);
    const obtenidas = misCartasDeseadas.filter(carta => carta.obtenida);

    contenedor.innerHTML = `
        <div class="super-contenedor" id="zona-drop-eliminar">
            <h2 class="gran-titulo titulo-pendientes">Lista de deseos</h2>
            ${generarHTMLBloque(pendientes)}
        </div>
        <div class="super-contenedor" style="margin-top: 60px;">
            <h2 class="gran-titulo titulo-obtenidas">Cartas Obtenidas</h2>
            ${generarHTMLBloque(obtenidas)}
        </div>
    `;

    hacerCartasArrastrables();
    dibujarBinder();
    actualizarEstilosBotonesModo();
    configurarZonaEliminarBinder();
}

function configurarZonaEliminarBinder() {
    const zonaDrop = document.getElementById('zona-drop-eliminar');
    if (!zonaDrop) return;
    zonaDrop.addEventListener('dragover', (e) => e.preventDefault());
    zonaDrop.addEventListener('drop', function(e) {
        try {
            const data = JSON.parse(e.dataTransfer.getData('text/plain'));
            if (data.origenHueco) {
                delete datosBinder[data.origenHueco];
                guardarEnMemoria();
                dibujarBinder();
            }
        } catch(err) {}
    });
}

// =====================
// BOTÓN LIMPIAR TODO
// =====================
const btnLimpiar = document.getElementById('btn-limpiar');
if (btnLimpiar) {
    btnLimpiar.addEventListener('click', function() {
        if (confirm("¿Quieres vaciar la lista actual y el álbum para cargar otra colección? (Esto no borrará tus archivos .txt guardados en tu PC)")) {
            misCartasDeseadas = []; 
            datosBinder = {};
            guardarEnMemoria();        
            cargarWishlist();          
            actualizarDesplegableSets(); 
            alert("¡Todo despejado! Ya puedes importar un nuevo archivo .txt o empezar tu colección desde cero.");
        }
    });
}

// ============
// ZOOM CARTA
// ============
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

// ========
// BINDER 
// ========
function hacerCartasArrastrables() {
    const imagenesCartas = document.querySelectorAll('.grid-cartas .carta-img');
    imagenesCartas.forEach(img => {
        if (modoEdicionBinder) {
            img.setAttribute('draggable', 'true');
            img.style.cursor = 'grab';
        } else {
            img.setAttribute('draggable', 'false');
            img.style.cursor = 'pointer';
        }

        img.ondragstart = function(e) {
            if (!modoEdicionBinder) {
                e.preventDefault();
                return;
            }
            const contenedorCarta = img.closest('.carta-contenedor');
            const checkbox = contenedorCarta.querySelector('input[type="checkbox"]');
            
            if (checkbox) {
                const infoOnclick = checkbox.getAttribute('onclick');
                const match = infoOnclick.match(/cambiarEstadoCarta\(([^,]+),\s*'([^']+)'\)/);
                
                if (match) {
                    const datosArrastre = {
                        numero: match[1],
                        set: match[2],
                        imagen: img.src,
                        nombre: contenedorCarta.querySelector('strong').innerText,
                        origenHueco: null 
                    };
                    e.dataTransfer.setData('text/plain', JSON.stringify(datosArrastre));
                }
            }
        };
    });
}

function construirSubGridPagina(numeroPagina) {
    const subGridHTML = document.createElement('div');
    subGridHTML.style.display = 'grid';
    subGridHTML.style.gridTemplateColumns = 'repeat(3, 1fr)';
    subGridHTML.style.gap = '12px';
    subGridHTML.style.background = '#1e1e1e';
    subGridHTML.style.padding = '15px';
    subGridHTML.style.borderRadius = '12px';
    subGridHTML.style.width = '48%';
    subGridHTML.style.minWidth = '290px';
    subGridHTML.style.boxSizing = 'border-box';

    for (let i = 1; i <= 9; i++) {
        const claveHueco = `${numeroPagina}_${i}`;
        const cartaEnHueco = datosBinder[claveHueco];

        const hueco = document.createElement('div');
        hueco.className = `hueco-binder ${cartaEnHueco ? 'carta-contenedor' : ''}`;
        hueco.style.aspectRatio = '2/3';
        hueco.style.display = 'flex';
        hueco.style.flexDirection = 'column';
        hueco.style.alignItems = 'center';
        hueco.style.justifyContent = 'center';
        hueco.style.position = 'relative';
        hueco.style.borderRadius = '12px';
        hueco.style.boxSizing = 'border-box';
        hueco.style.overflow = 'hidden';

        if (modoEdicionBinder) {
            hueco.style.border = cartaEnHueco ? 'none' : '2px dashed #444';
            hueco.style.backgroundColor = cartaEnHueco ? 'transparent' : '#151515';
        } else {
            hueco.style.border = cartaEnHueco ? 'none' : '1px solid #151515';
            hueco.style.backgroundColor = cartaEnHueco ? 'transparent' : '#111';
        }

        if (cartaEnHueco) {
            const nombreEscapado = cartaEnHueco.nombre.replace(/'/g, "\\'");
            const imgEscapada = cartaEnHueco.imagen.replace(/'/g, "\\'");

            hueco.innerHTML = `
                <img class="carta-img" src="${cartaEnHueco.imagen}" alt="${cartaEnHueco.nombre}" 
                     draggable="${modoEdicionBinder}" 
                     style="width:100%; height:100%; object-fit:cover; cursor:${modoEdicionBinder ? 'pointer' : 'pointer'};"
                     title="${modoEdicionBinder ? 'Haz clic para eliminar esta carta del binder' : 'Haz clic para ampliar'}">
            `;

            const imgInterna = hueco.querySelector('.carta-img');

            imgInterna.addEventListener('click', function() {
                if (modoEdicionBinder) {
                    delete datosBinder[claveHueco];
                    guardarEnMemoria();
                    dibujarBinder(); 
                } else {
                    ampliarCarta(imgEscapada, nombreEscapado);
                }
            });

            imgInterna.addEventListener('dragstart', function(e) {
                if (!modoEdicionBinder) {
                    e.preventDefault();
                    return;
                }
                const datosReArrastre = {
                    ...cartaEnHueco,
                    origenHueco: claveHueco
                };
                e.dataTransfer.setData('text/plain', JSON.stringify(datosReArrastre));
            });

        } else {
            hueco.innerHTML = modoEdicionBinder 
                ? `<span style="color:#3a3a3a; font-weight:bold; font-size:1.2rem; font-family:sans-serif;">${i}</span>` 
                : '';
        }

        hueco.addEventListener('dragover', function(e) {
            if (!modoEdicionBinder) return;
            e.preventDefault();
            if (!cartaEnHueco) hueco.style.backgroundColor = '#252525';
        });

        hueco.addEventListener('dragleave', function() {
            if (!modoEdicionBinder) return;
            if (!cartaEnHueco) hueco.style.backgroundColor = '#151515';
        });

        hueco.addEventListener('drop', function(e) {
            if (!modoEdicionBinder) return;
            e.preventDefault();

            try {
                const datosObtenidos = JSON.parse(e.dataTransfer.getData('text/plain'));
                
                if (datosObtenidos.origenHueco) {
                    delete datosBinder[datosObtenidos.origenHueco];
                }

                datosBinder[claveHueco] = {
                    nombre: datosObtenidos.nombre,
                    imagen: datosObtenidos.imagen,
                    set: datosObtenidos.set,
                    numero: datosObtenidos.numero
                };

                guardarEnMemoria();
                dibujarBinder();
            } catch(err) {
                console.log("Error drag-drop");
            }
        });

        subGridHTML.appendChild(hueco);
    }

    return subGridHTML;
}

function dibujarBinder() {
    const gridBinderContenedor = document.getElementById('grid-binder');
    if (!gridBinderContenedor) return;

    let contenedorBotonesModo = document.getElementById('control-modos-dinamico');
    if (!contenedorBotonesModo) {
        contenedorBotonesModo = document.createElement('div');
        contenedorBotonesModo.id = 'control-modos-dinamico';
        contenedorBotonesModo.style.cssText = 'margin-bottom: 20px; display: flex; gap: 15px; justify-content: center; width: 100%;';
        gridBinderContenedor.parentNode.insertBefore(contenedorBotonesModo, gridBinderContenedor);
    }

    contenedorBotonesModo.innerHTML = `
        <button id="btn-vista-dinamico" style="padding: 10px 20px; font-weight: bold; font-size: 1rem; border-radius: 8px; border: none; cursor: pointer; transition: 0.2s; 
            background-color: ${!modoEdicionBinder ? '#27ae60' : '#ddd'}; color: ${!modoEdicionBinder ? 'white' : '#333'}; box-shadow: ${!modoEdicionBinder ? '0 4px 10px rgba(39,174,96,0.4)' : 'none'};">
            Modo Vista
        </button>
        <button id="btn-edicion-dinamico" style="padding: 10px 20px; font-weight: bold; font-size: 1rem; border-radius: 8px; border: none; cursor: pointer; transition: 0.2s; 
            background-color: ${modoEdicionBinder ? '#e74c3c' : '#ddd'}; color: ${modoEdicionBinder ? 'white' : '#333'}; box-shadow: ${modoEdicionBinder ? '0 4px 10px rgba(231,76,60,0.4)' : 'none'};">
            Modo Edición
        </button>
    `;

    document.getElementById('btn-vista-dinamico').onclick = function() {
        modoEdicionBinder = false;
        hacerCartasArrastrables();
        dibujarBinder();
    };

    document.getElementById('btn-edicion-dinamico').onclick = function() {
        modoEdicionBinder = true;
        hacerCartasArrastrables();
        dibujarBinder();
    };

    gridBinderContenedor.innerHTML = '';
    
    let paginaDerecha = paginaIzquierdaActual + 1;
    const infoPagina = document.getElementById('info-pagina');
    if (infoPagina) infoPagina.innerText = `${paginaIzquierdaActual} - ${paginaDerecha}`;

    const renderPaginaIzquierda = construirSubGridPagina(paginaIzquierdaActual);
    const renderPaginaDerecha = construirSubGridPagina(paginaDerecha);

    gridBinderContenedor.appendChild(renderPaginaIzquierda);
    gridBinderContenedor.appendChild(renderPaginaDerecha);
}

const btnAnt = document.getElementById('btn-pagina-anterior');
const btnSig = document.getElementById('btn-pagina-siguiente');

if (btnAnt) {
    btnAnt.addEventListener('click', function() {
        if (paginaIzquierdaActual > 1) {
            paginaIzquierdaActual -= 2;
            dibujarBinder();
        }
    });
}

if (btnSig) {
    btnSig.addEventListener('click', function() {
        paginaIzquierdaActual += 2;
        dibujarBinder();
    });
}

// ========================
// MODOS VISTA / EDICIÓN
// ========================
const btnModoVista = document.getElementById('btn-modo-vista');
const btnModoEdicion = document.getElementById('btn-modo-edicion');

if (btnModoVista) {
    btnModoVista.addEventListener('click', function() {
        modoEdicionBinder = false;
        hacerCartasArrastrables(); 
        dibujarBinder();          
        actualizarEstilosBotonesModo();
    });
}

if (btnModoEdicion) {
    btnModoEdicion.addEventListener('click', function() {
        modoEdicionBinder = true;
        hacerCartasArrastrables(); 
        dibujarBinder();          
        actualizarEstilosBotonesModo();
    });
}

function actualizarEstilosBotonesModo() {
    if (!btnModoVista || !btnModoEdicion) return;
    
    if (modoEdicionBinder) {
        btnModoEdicion.style.backgroundColor = "#e74c3c";
        btnModoEdicion.style.color = "white";
        btnModoVista.style.backgroundColor = "#ddd";
        btnModoVista.style.color = "#333";
    } else {
        btnModoVista.style.backgroundColor = "#27ae60";
        btnModoVista.style.color = "white";
        btnModoEdicion.style.backgroundColor = "#ddd";
        btnModoEdicion.style.color = "#333";
    }
}

// ==========================================
// INICIALIZACIÓN DE LA APLICACIÓN
// ==========================================
cargarWishlist();
actualizarDesplegableSets();