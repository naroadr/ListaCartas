// ¡Olvídate de los códigos raros! 
// Ahora solo pones el Nombre y el Link de la imagen que te dé la gana.
const misCartasDeseadas = [
    {
        nombre: "Alakazam ex (151)",
        imagen: "https://images.pokemontcg.io/sv3pt5/201.png"
    },
    {
        nombre: "Zoroark ex de N",
        imagen: "https://assets.pokemon.com/static-assets/content-assets/cms2/img/cards/web/ME2PT5/ME2PT5_EN_286.png"
        
    },
    {
        nombre: "Charizard ex Oscuro",
        imagen: "https://images.pokemontcg.io/sv3pt5/199.png"
    },
    {
        nombre: "Chespin",
        imagen: "https://dz3we2x72f7ol.cloudfront.net/expansions/chaos-rising/en-us/SN54_EN_87-2x.png"
    }
];

const contenedor = document.getElementById('wishlist');

// Función ultra simple: lee tu lista y dibuja las imágenes directo
function cargarWishlist() {
    // Limpiamos el contenedor por si acaso
    contenedor.innerHTML = "";

    misCartasDeseadas.forEach(carta => {
        const cartaHTML = `
            <div class="carta-contenedor">
                <img class="carta-img" src="${carta.imagen}" alt="${carta.nombre}">
                <div class="carta-info">
                    <strong>${carta.nombre}</strong>
                </div>
            </div>
        `;
        contenedor.innerHTML += cartaHTML;
    });
}

// Ejecutar al cargar la página
cargarWishlist();