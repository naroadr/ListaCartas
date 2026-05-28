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
    let opcionesHTML = `<option value="" disabled ${!setSeleccionado ? 'selected' : ''}>-- Selecciona un Set --</option>`;
    
    setsUnicos.forEach(setName => {
        opcionesHTML += `<option value="${setName}" ${setSeleccionado === setName ? 'selected' : ''}>${setName}</option>`;
    });
    
    opcionesHTML += `<option value="NUEVO_SET" ${setSeleccionado === "NUEVO_SET" ? 'selected' : ''}>➕ Añadir nuevo set</option>`;
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
                inputSetNuevo.placeholder = "Ej: Obsidian Flames";
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
                alert(`Ya existe: ${datosCarta.nombre} (${datosCarta.numero}) en ${datosCarta.set}`);
                return;
            }

            datosCarta.obtenida = false;
            misCartasDeseadas.push(datosCarta);
            alert("¡Carta añadida!");
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
    if (confirm("¿Eliminar carta de la lista?")) {
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

// ==========================================
// IMPORTAR / EXPORTAR
// ==========================================
const btnExportar = document.getElementById('btn-exportar');
if (btnExportar) {
    btnExportar.addEventListener('click', function() {
        const exportarTodo = { wishlist: misCartasDeseadas, binder: datosBinder };
        const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(exportarTodo, null, 2));
        const downloadAnchor = document.createElement('a');
        downloadAnchor.setAttribute("href", dataStr);
        downloadAnchor.setAttribute("download", "mis_cartas_y_binder_pokemon.txt");
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
                    
                    if (contenido && contenido.wishlist !== undefined && contenido.binder !== undefined) {
                        misCartasDeseadas = Array.isArray(contenido.wishlist) ? contenido.wishlist : [];
                        datosBinder = (contenido.binder && typeof contenido.binder === 'object') ? contenido.binder : {};
                        guardarEnMemoria();
                        cargarWishlist();
                        actualizarDesplegableSets();
                        alert("¡Importación completa realizada con éxito!");
                    } 
                    else if (Array.isArray(contenido)) {
                        misCartasDeseadas = contenido;
                        guardarEnMemoria();
                        cargarWishlist();
                        actualizarDesplegableSets();
                        alert("¡Lista antigua cargada! El Binder se ha mantenido intacto.");
                    } else {
                        alert("El archivo no tiene el formato correcto.");
                    }
                } catch (error) {
                    alert("Error al procesar el archivo.");
                }
            }
        }
        inputOculto.click();
    });
}

// ==========================================
// GESTIÓN DE RENDER DE LA WISHLIST
// ==========================================
function generarHTMLBloque(cartas) {
    if (cartas.length === 0) return `<p style="color: #666; margin-left: 20px;">No hay cartas en este bloque.</p>`;
    const cartasPorSet = {};
    cartas.forEach(carta => {
        if (!cartasPorSet[carta.set]) cartasPorSet[carta.set] = [];
        cartasPorSet[carta.set].push(carta);
    });

    const setsOrdenados = Object.keys(cartasPorSet).sort((a, b) => a.localeCompare(b));
    let htmlResultado = "";
    setsOrdenados.forEach(nombreSet => {
        const setEscapado = nombreSet.replace(/'/g, "\\'");
        
        htmlResultado += `
            <div class="seccion-set">
                <h3 class="titulo-set">${nombreSet}</h3>
                <div class="grid-cartas">
                    ${cartasPorSet[nombreSet].map(carta => {
                        const nombreEscapado = carta.nombre.replace(/'/g, "\\'");
                        return `
                        <div class="carta-contenedor ${carta.obtenida ? 'carta-obtenida' : ''}">
                            <img class="carta-img" src="${carta.imagen}" alt="${carta.nombre}" onclick="ampliarCarta('${carta.imagen.replace(/'/g, "\\'")}', '${nombreEscapado}')">
                            <div class="carta-info">
                                <strong>${carta.nombre}</strong>
                                <div style="color: #888; font-size: 0.8rem; margin: 4px 0 8px 0;">Nº ${carta.numero}</div>
                                <div class="controles-carta" style="display: flex; flex-direction: column; gap: 8px; align-items: center;">
                                    <label class="checkbox-contenedor">
                                        <input type="checkbox" ${carta.obtenida ? 'checked' : ''} onclick="cambiarEstadoCarta(${carta.numero}, '${setEscapado}')">
                                        <span>¿La tengo?</span>
                                    </label>
                                    <div style="display: flex; gap: 6px; width: 100%; justify-content: center;">
                                        <button onclick="prepararEdicion(${carta.numero}, '${setEscapado}')" class="btn-editar" style="width: 48%; padding: 4px;">Editar</button>
                                        <button onclick="eliminarCarta(${carta.numero}, '${setEscapado}')" class="btn-eliminar" style="width: 48%; padding: 4px;">Borrar</button>
                                    </div>
                                </div>
                            </div>
                        </div>
                        `;
                    }).join('')}
                </div>
            </div>
        `;
    });
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
            <h2 class="gran-titulo titulo-pendientes">Lista de deseos (Arrastra aquí desde el álbum para quitar)</h2>
            ${generarHTMLBloque(pendientes)}
        </div>
        <div class="super-contenedor" style="margin-top: 50px;">
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
    
    zonaDrop.addEventListener('dragover', (e) => {
        e.preventDefault();
        zonaDrop.classList.add('drag-over-eliminar');
    });
    
    zonaDrop.addEventListener('dragleave', () => {
        zonaDrop.classList.remove('drag-over-eliminar');
    });

    zonaDrop.addEventListener('drop', function(e) {
        zonaDrop.classList.remove('drag-over-eliminar');
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

// ==========================================
// BOTÓN LIMPIAR TODO
// ==========================================
const btnLimpiar = document.getElementById('btn-limpiar');
if (btnLimpiar) {
    btnLimpiar.addEventListener('click', function() {
        if (confirm("¿Quieres vaciar por completo la App local actual?")) {
            misCartasDeseadas = []; datosBinder = {};
            guardarEnMemoria(); cargarWishlist(); actualizarDesplegableSets();
        }
    });
}

// ==========================================
// MODAL DE ZOOM DE CARTAS
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

document.addEventListener('DOMContentLoaded', () => {
    const botonCerrar = document.querySelector('.modal-cerrar');
    const modalContenedor = document.getElementById('modal-carta');
    if (botonCerrar) botonCerrar.addEventListener('click', () => modalContenedor.style.display = "none");
    if (modalContenedor) {
        modalContenedor.addEventListener('click', (e) => {
            if (e.target.id === 'modal-carta') modalContenedor.style.display = "none";
        });
    }
});

// ==========================================
// RENDER DEL BINDER Y EVENTOS DRAG
// ==========================================
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
            if (!modoEdicionBinder) { e.preventDefault(); return; }
            const contenedorCarta = img.closest('.carta-contenedor');
            const checkbox = contenedorCarta.querySelector('input[type="checkbox"]');
            
            if (checkbox) {
                const infoOnclick = checkbox.getAttribute('onclick');
                const match = infoOnclick.match(/cambiarEstadoCarta\(([^,]+),\s*'([^']+)'\)/);
                
                if (match) {
                    const datosArrastre = {
                        numero: match[1], set: match[2], imagen: img.src,
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
    subGridHTML.style.cssText = 'display:grid; grid-template-columns: repeat(3, 1fr); gap:12px; background:#1e1e1e; padding:15px; border-radius:12px; width:48%; min-width:280px; box-sizing:border-box;';

    for (let i = 1; i <= 9; i++) {
        const claveHueco = `${numeroPagina}_${i}`;
        const cartaEnHueco = datosBinder[claveHueco];

        const hueco = document.createElement('div');
        hueco.className = `hueco-binder ${cartaEnHueco ? 'carta-contenedor' : ''}`;
        hueco.style.cssText = `aspect-ratio:2/3; display:flex; flex-direction:column; align-items:center; justify-content:center; position:relative; border-radius:12px; box-sizing:border-box; overflow:hidden;`;

        if (modoEdicionBinder) {
            hueco.classList.add('hueco-binder-vacio-edicion');
        } else {
            hueco.classList.add('hueco-binder-vacio-vista');
        }

        if (cartaEnHueco) {
            hueco.classList.remove('hueco-binder-vacio-edicion', 'hueco-binder-vacio-vista');
            hueco.innerHTML = `
                <img class="carta-img" src="${cartaEnHueco.imagen}" alt="${cartaEnHueco.nombre}" 
                     draggable="${modoEdicionBinder}" style="width:100%; height:100%; object-fit:cover; cursor:pointer;"
                     title="${modoEdicionBinder ? 'Clic para quitar del álbum' : 'Clic para zoom'}">
            `;

            const imgInterna = hueco.querySelector('.carta-img');
            imgInterna.addEventListener('click', function() {
                if (modoEdicionBinder) {
                    delete datosBinder[claveHueco];
                    guardarEnMemoria();
                    dibujarBinder(); 
                } else {
                    ampliarCarta(cartaEnHueco.imagen, cartaEnHueco.nombre);
                }
            });

            imgInterna.addEventListener('dragstart', function(e) {
                if (!modoEdicionBinder) { e.preventDefault(); return; }
                e.dataTransfer.setData('text/plain', JSON.stringify({ ...cartaEnHueco, origenHueco: claveHueco }));
            });

        } else {
            hueco.innerHTML = modoEdicionBinder ? `<span>${i}</span>` : '';
        }

        hueco.addEventListener('dragover', function(e) {
            if (!modoEdicionBinder) return;
            e.preventDefault();
            hueco.classList.add('drag-over');
        });

        hueco.addEventListener('dragleave', function() {
            if (!modoEdicionBinder) return;
            hueco.classList.remove('drag-over');
        });

        hueco.addEventListener('drop', function(e) {
            if (!modoEdicionBinder) return;
            e.preventDefault();
            hueco.classList.remove('drag-over');
            try {
                const datosObtenidos = JSON.parse(e.dataTransfer.getData('text/plain'));
                if (datosObtenidos.origenHueco) delete datosBinder[datosObtenidos.origenHueco];
                
                datosBinder[claveHueco] = {
                    nombre: datosObtenidos.nombre, imagen: datosObtenidos.imagen,
                    set: datosObtenidos.set, numero: datosObtenidos.numero
                };
                guardarEnMemoria();
                dibujarBinder();
            } catch(err) {}
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
        <button id="btn-vista-dinamico" style="padding: 10px 20px; font-weight: bold; border-radius: 8px; border: none; cursor: pointer; transition: 0.2s; 
            background-color: ${!modoEdicionBinder ? '#27ae60' : '#ddd'}; color: ${!modoEdicionBinder ? 'white' : '#333'};">
            Modo Vista
        </button>
        <button id="btn-edicion-dinamico" style="padding: 10px 20px; font-weight: bold; border-radius: 8px; border: none; cursor: pointer; transition: 0.2s; 
            background-color: ${modoEdicionBinder ? '#e74c3c' : '#ddd'}; color: ${modoEdicionBinder ? 'white' : '#333'};">
            Modo Edición
        </button>
    `;

    document.getElementById('btn-vista-dinamico').onclick = function() {
        modoEdicionBinder = false; hacerCartasArrastrables(); dibujarBinder(); actualizarEstilosBotonesModo();
    };
    document.getElementById('btn-edicion-dinamico').onclick = function() {
        modoEdicionBinder = true; hacerCartasArrastrables(); dibujarBinder(); actualizarEstilosBotonesModo();
    };

    gridBinderContenedor.innerHTML = '';
    let paginaDerecha = paginaIzquierdaActual + 1;
    
    const infoPagina = document.getElementById('info-pagina');
    if (infoPagina) infoPagina.innerText = `${paginaIzquierdaActual} - ${paginaDerecha}`;

    // Construimos las subgrids de las páginas de forma explícita
    const subGridIzquierda = construirSubGridPagina(paginaIzquierdaActual);
    const subGridDerecha = construirSubGridPagina(paginaDerecha);

    gridBinderContenedor.appendChild(subGridIzquierda);
    gridBinderContenedor.appendChild(subGridDerecha);
}

// ==========================================
// CONTROL DE PÁGINAS CON ANIMACIÓN 3D
// ==========================================
const btnAnt = document.getElementById('btn-pagina-anterior');
const btnSig = document.getElementById('btn-pagina-siguiente');

if (btnAnt) {
    btnAnt.addEventListener('click', function() {
        if (paginaIzquierdaActual > 1) {
            const gridBinderContenedor = document.getElementById('grid-binder');
            if (gridBinderContenedor && gridBinderContenedor.children.length === 2) {
                // Ejecutamos las animaciones del CSS
                gridBinderContenedor.children[0].classList.add('animacion-pasar-ant-izquierda');
                gridBinderContenedor.children[1].classList.add('animacion-pasar-ant-derecha');

                // Esperamos los 400ms a que termine el volteo antes de actualizar datos
                setTimeout(() => {
                    paginaIzquierdaActual -= 2;
                    dibujarBinder();
                }, 400);
            } else {
                paginaIzquierdaActual -= 2; 
                dibujarBinder();
            }
        }
    });
}

if (btnSig) {
    btnSig.addEventListener('click', function() {
        const gridBinderContenedor = document.getElementById('grid-binder');
        if (gridBinderContenedor && gridBinderContenedor.children.length === 2) {
            // Ejecutamos las animaciones del CSS
            gridBinderContenedor.children[0].classList.add('animacion-pasar-sig-izquierda');
            gridBinderContenedor.children[1].classList.add('animacion-pasar-sig-derecha');

            // Esperamos los 400ms a que termine el volteo antes de actualizar datos
            setTimeout(() => {
                paginaIzquierdaActual += 2;
                dibujarBinder();
            }, 400);
        } else {
            paginaIzquierdaActual += 2; 
            dibujarBinder();
        }
    });
}

// ==========================================
// SINCRONIZACIÓN DE BOTONES FIJOS/MÓVILES
// ==========================================
const btnModoVista = document.getElementById('btn-modo-vista');
const btnModoEdicion = document.getElementById('btn-modo-edicion');

if (btnModoVista) btnModoVista.addEventListener('click', () => { modoEdicionBinder = false; hacerCartasArrastrables(); dibujarBinder(); actualizarEstilosBotonesModo(); });
if (btnModoEdicion) btnModoEdicion.addEventListener('click', () => { modoEdicionBinder = true; hacerCartasArrastrables(); dibujarBinder(); actualizarEstilosBotonesModo(); });

function actualizarEstilosBotonesModo() {
    if (modoEdicionBinder) {
        if(btnModoEdicion) { btnModoEdicion.style.backgroundColor = "#e74c3c"; btnModoEdicion.style.color = "white"; }
        if(btnModoVista) { btnModoVista.style.backgroundColor = "#ddd"; btnModoVista.style.color = "#333"; }
    } else {
        if(btnModoVista) { btnModoVista.style.backgroundColor = "#27ae60"; btnModoVista.style.color = "white"; }
        if(btnModoEdicion) { btnModoEdicion.style.backgroundColor = "#ddd"; btnModoEdicion.style.color = "#333"; }
    }
}

// Inicialización automática de la app al cargar el script
cargarWishlist();
actualizarDesplegableSets();