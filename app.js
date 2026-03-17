const data = [
  { id: "p01", title: "Nubluado", desc: "Niebla en un bosque", src: "https://picsum.photos/id/630/1200/675" },
  { id: "p02", title: "Montaña", desc: "Rocas y niebla", src: "https://picsum.photos/id/1015/1200/675" },
  { id: "p03", title: "Playa", desc: "Atardecer en el mar", src: "https://picsum.photos/id/100/1200/675" },
  { id: "p04", title: "Bosque", desc: "Verde profundo", src: "https://picsum.photos/id/10/1200/675" },
  { id: "p05", title: "Mar", desc: "Horizonte y calma", src: "https://picsum.photos/id/1011/990/675" },
  { id: "p06", title: "Ruta", desc: "Camino en perspectiva", src: "https://picsum.photos/id/220/1200/675" }
];

//Recuperar elementos del DOM
const thumbs = document.querySelector("#thumbs");
const heroImg = document.querySelector("#heroImg");
const heroTitle = document.querySelector("#heroTitle");
const heroDesc = document.querySelector("#heroDesc");
const counter = document.querySelector("#counter");

const likeBtn = document.querySelector("#likeBtn");
const prevBtn = document.querySelector("#prevBtn");
const nextBtn = document.querySelector("#nextBtn");
const playBtn = document.querySelector("#playBtn");

//Trabajar con el estado de la aplicación
let currentIndex = 0; //Indice de la imagen actual
const likes = {}; //Objeto para almacenar los estados de "me gusta" por imagen

let autoPlayId = null; //Variable para almacenar el id de intervalo de autoplay
let isPlaying = false; //Estado de reproducción automática
const AUTO_TIME = 1500; //Tiempo entre cambios en autoplay (1.5 segundos)

//Renderizar la gelería de miniaturas
function renderThumbs() {
  thumbs.innerHTML = data.map((item, index) => {
    return `
      <article class="thumb ${index === currentIndex ? "active" : ""}" data-index="${index}">
        <span class="badge">${index + 1}</span>
        <img src="${item.src}" alt="${item.title}" />
      </article>
    `;
  }).join("");
};

function renderHero(index) {
  const item = data[index];

  //Actualizar la imagen principal, título, descripción y contador
  heroImg.src = item.src;
  heroImg.alt = item.title;

  //Actualizar el título y la descripción
  heroTitle.textContent = item.title;
  heroDesc.textContent = item.desc;

  //Actualizar el contador
  counter.textContent = `${index + 1} / ${data.length}`;

  //Recorre miniaturas para marcar la activa
  document.querySelectorAll(".thumb").forEach((thumb, i) => {
    thumb.classList.toggle("active", i === index);
  });

  //Revisar si la imagen actual tiene "me gusta"
  const isLiked = likes[item.id] === true;

  //Cambiar el simbolo del boton
  likeBtn.textContent = isLiked ? "❤️" : "🤍";

  //Aplicar o quitar la clase visual
  likeBtn.classList.toggle("on", isLiked);
};

// Listener para clicks en las miniaturas
thumbs.addEventListener("click", (e) =>{
  const thumb = e.target.closest(".thumb");
  if (!thumb) return; //Si no se hizo click en una miniatura, salir
  currentIndex = Number(thumb.dataset.index); //Actualizar el índice actual
  renderHero(currentIndex); //Renderizar la imagen principal con el nuevo índice
});

likeBtn.addEventListener("click", () => {
  const currentItem = data[currentIndex];
  //Alternar el estado de "me gusta" para la imagen actual
  likes[currentItem.id] = !likes[currentItem.id];

  const isLiked = likes[currentItem.id];
  likeBtn.textContent = isLiked ? "❤️" : "🤍"; //Actualizar el símbolo del botón
  likeBtn.classList.toggle("on", isLiked); //Actualizar la clase visual del botón
  likeBtn.setAttribute("aria-pressed", isLiked); //Actualizar el atributo aria-pressed para accesibilidad
});

//Cambiar el boton de play a pause y viceversa
function updatePlayButton(){
  playBtn.textContent = isPlaying ? "⏸️" : "▶️";
  playBtn.dataset.state = isPlaying ? "pause" : "play";
};

renderThumbs(); //Llamar a la función para mostrar las miniaturas
renderHero(currentIndex); //Mostrar la imagen principal