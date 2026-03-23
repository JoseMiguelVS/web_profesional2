const data = [
  {
    id: "p01",
    title: "Nublado",
    desc: "Niebla en un bosque",
    src: "https://picsum.photos/id/630/1200/675",
  },
  {
    id: "p02",
    title: "Montaña",
    desc: "Rocas y niebla",
    src: "https://picsum.photos/id/1015/1200/675",
  },
  {
    id: "p03",
    title: "Playa",
    desc: "Atardecer en el mar",
    src: "https://picsum.photos/id/100/1200/675",
  },
  {
    id: "p04",
    title: "Bosque",
    desc: "Verde profundo",
    src: "https://picsum.photos/id/10/1200/675",
  },
  {
    id: "p05",
    title: "Mar",
    desc: "Horizonte y calma",
    src: "https://picsum.photos/id/1011/1200/675",
  },
  {
    id: "p06",
    title: "Ruta",
    desc: "Camino en perspectiva",
    src: "https://picsum.photos/id/220/1200/675",
  },
];

//Recuperar elementos del DOM
const frame = document.querySelector(".frame");
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
const AUTO_TIME = 2500; //Tiempo entre cambios en autoplay (2.5 segundos)

// dost y tracks no existen en el DOM actual
// se intentan buscar, pero si no estan se crearan usando JS
let dots = document.querySelector("#dots");
let track = document.querySelector(".track");

// variables para detectar swipe (deslizamiento)
let startX = 0;
let currentX = 0;
let isDragging = false;
let moved = false;
//Distancia mínima para considerar un swipe
const SWIPE_THRESHOLD = 50;

//Para usar el modal
let modal = null;
let modalImg = null;
let modalDesc = null;
let modalTitle = null;
let modalCounter = null;
let modalPrevBtn = null;
let modalNextBtn = null;
let modalCloseBtn = null;
let zoomInBtn = null;
let zoomOutBtn = null;
let zoomResetBtn = null;
let modalScale = 1;

//crear un tack del carrusel
//crea un contenedor .tack que tendra todas las imagenes del carrusel, y se movera para mostrar la imagen actual
function createTrack() {
  //Si el track ya existe, no hacer nada
  if (track) return;

  //si no existe, crear el track
  track = document.createElement("div");
  track.classList.add("track");

  data.forEach((item) => {
    const img = document.createElement("img");
    img.src = item.src;
    img.alt = item.title;
    track.appendChild(img);
  });
  frame.prepend(track); //Agregar el track al principio del contenedor del carrusel
}

//Crear los dots de navegación
//Cear los botones indicadores del carrusel
//cada dot representar una imagen
// el dot activo debe coincidir con el currentIndex
function createDots() {
  if (!dots) {
    dots = document.createElement("div");
    dots.id = "dots";
    dots.className = "dots";
    frame.appendChild(dots);
  }
  dots.innerHTML = data
    .map((_, index) => {
      // el _ indica que no se necesita el item, solo el index
      return `
    <button class="dot ${index === currentIndex ?? "active"}" type="button"
    data-index="${index}" aria-label="Ir a la imagen ${index + 1}">
    </button>`;
    })
    .join(""); //Unir los botones en un solo string para insertarlo en el DOM
}

function updatetrack(animate = true) {
  if (!track) return; //Si el track no existe, salir

  track.style.transition = animate ? "transform 0.5s ease" : "none"; //Aplicar transición solo si se desea animar
  track.style.transform = `translateX(-${currentIndex * 100}%)`; //Mover el track para mostrar la imagen actual basada en el currentIndex
}

function updateMeta() {
  const item = data[currentIndex]; //Obtener el item actual basado en el currentIndex
  heroTitle.textContent = item.title; //Actualizar el título
  heroDesc.textContent = item.desc; //Actualizar la descripción
  counter.textContent = `${currentIndex + 1} / ${data.length}`; //Actualizar el contador
}

function updateThumbs() {
  document.querySelectorAll(".thumb").forEach((thumb, index) => {
    thumb.classList.toggle("active", index === currentIndex); //Agregar o quitar la clase "active" según el índice actual
  });
}

function updateDots() {
  document.querySelectorAll(".dot").forEach((dot, index) => {
    dot.classList.toggle("active", index === currentIndex); //Agregar o quitar la clase "active" según el índice actual
    dot.setAttribute("aria.pressed", index === currentIndex); //Actualizar el atributo aria-pressed para accesibilidad
  });
}

function updateLikeButton() {
  const currentItem = data[currentIndex];
  const isLiked = likes[currentItem.id];
  likeBtn.textContent = isLiked ? "❤️" : "🤍"; //Actualizar el símbolo del botón
  likeBtn.classList.toggle("on", isLiked); //Actualizar la clase visual del botón
  likeBtn.setAttribute("aria-pressed", isLiked); //Actualizar el atributo aria-pressed para accesibilidad
}

//Renderizar la gelería de miniaturas
function renderThumbs() {
  thumbs.innerHTML = data
    .map((item, index) => {
      return `
      <article class="thumb ${index === currentIndex ? "active" : ""}" data-index="${index}">
        <span class="badge">${index + 1}</span>
        <img src="${item.src}" alt="${item.title}" />
      </article>
    `;
    })
    .join("");
}

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
}

// Listener para clicks en las miniaturas
thumbs.addEventListener("click", (e) => {
  const thumb = e.target.closest(".thumb");
  if (!thumb) return; //Si no se hizo click en una miniatura, salir
  currentIndex = Number(thumb.dataset.index); //Actualizar el índice actual
  renderHero(currentIndex); //Renderizar la imagen principal con el nuevo índice
});

likeBtn.addEventListener("click", () => {
  const currentItem = data[currentIndex];
  //Alternar el estado de "me gusta" para la imagen actual
  likes[currentItem.id] = !likes[currentItem.id];

  updateLikeButton();
});

//Cambiar el boton de play a pause y viceversa
function updatePlayButton() {
  playBtn.textContent = isPlaying ? "⏸" : "▶";
  playBtn.dataset.state = isPlaying ? "pause" : "play";
}

function changeSlide(newIndex) {
  heroImg.classList.add("fade-out"); //Agregar clase de animación

  setTimeout(() => {
    currentIndex = newIndex; //Actualizar el índice actual
    renderHero(currentIndex); //Renderizar la nueva imagen principal
    heroImg.classList.remove("fade-out"); //Quitar la clase de animación para mostrar la nueva imagen
  }, 350); //Actualizar el indice actual
}

function nextSlide() {
  const newIndex = (currentIndex + 1) % data.length; //Calcular el índice de la siguiente imagen (con wrap-around)
  changeSlide(newIndex); //Cambiar a la siguiente imagen
}

function prevSlide() {
  const newIndex = (currentIndex - 1 + data.length) % data.length; //Calcular el índice de la imagen anterior (con wrap-around)
  changeSlide(newIndex); //Cambiar a la imagen anterior
}

function startAutoPlay() {
  autoPlayId = setInterval(() => {
    nextSlide(); //Cambiar a la siguiente imagen cada intervalo
  }, AUTO_TIME);
  isPlaying = true; //Actualizar el estado de reproducción automática
  updatePlayButton(); //Actualizar el botón de reproducción para reflejar el nuevo estado
}

function stopAutoPlay() {
  clearInterval(autoPlayId); //Detener
  autoPlayId = null; //Limpiar el id del intervalo
  isPlaying = false; //Actualizar el estado de reproducción automática
  updatePlayButton(); //Actualizar el botón de reproducción para reflejar el nuevo estado
}

function toggleAutoPlay() {
  if (isPlaying) {
    stopAutoPlay(); //Si ya se está reproduciendo, detenerlo
  } else {
    startAutoPlay(); //Si no se está reproduciendo, iniciarlo
  }
}

function renderAll(animate = true) {
  updatetrack(animate);
  updateMeta();
  updateThumbs();
  updateDots();
  updateLikeButton();
}

nextBtn.addEventListener("click", nextSlide); //Listener para el botón de siguiente
prevBtn.addEventListener("click", prevSlide); //Listener para el botón de anterior
playBtn.addEventListener("click", toggleAutoPlay); //Listener para el botón de reproducción automática

document.addEventListener("keydown", (e) => {
  if (e.key === "ArrowRight") {
    nextSlide(); //Si se presiona la flecha derecha, ir a la siguiente imagen
  } else if (e.key === "ArrowLeft") {
    prevSlide(); //Si se presiona la flecha izquierda, ir a la imagen anterior
  }
}); //Listener para eventos de teclado (pendiente de implementación)

renderThumbs(); //Llamar a la función para mostrar las miniaturas
renderHero(currentIndex); //Mostrar la imagen principal
