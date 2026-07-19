const slider = document.querySelector(".slider");
const sliderTrack = document.querySelector(".slider-track");
const pointsContainer = document.querySelector(".slider-points");

const originalSlides = Array.from(
  sliderTrack.querySelectorAll(".slide")
);

const totalSlides = originalSlides.length;
const transitionDuration = 500;
const autoPlayTime = 10000;

let currentIndex = 1;
let startX = 0;
let dragMovement = 0;

let isDragging = false;
let isAnimating = false;

let autoPlayTimer;
let transitionTimer;

/* Clonar la primera y la última imagen */

const firstClone = originalSlides[0].cloneNode(true);
const lastClone = originalSlides[totalSlides - 1].cloneNode(true);

sliderTrack.appendChild(firstClone);
sliderTrack.insertBefore(lastClone, originalSlides[0]);

/* Crear los puntos */

originalSlides.forEach((slide, index) => {
  const point = document.createElement("button");

  point.classList.add("slider-point");
  point.setAttribute("type", "button");
  point.setAttribute("aria-label", `Ir a la imagen ${index + 1}`);

  point.addEventListener("click", () => {
    if (isAnimating || isDragging) {
      return;
    }

    moveToSlide(index + 1, true);
    restartAutoPlay();
  });

  pointsContainer.appendChild(point);
});

const points = Array.from(
  pointsContainer.querySelectorAll(".slider-point")
);

/* Obtener el ancho actual del slider */

function getSliderWidth() {
  return slider.getBoundingClientRect().width;
}

/* Obtener el índice real sin contar los clones */

function getRealIndex() {
  return (
    (currentIndex - 1 + totalSlides) %
    totalSlides
  );
}

/* Actualizar los puntos */

function updatePoints() {
  const realIndex = getRealIndex();

  points.forEach((point, index) => {
    point.classList.toggle(
      "active",
      index === realIndex
    );
  });
}

/* Mover físicamente el contenedor */

function setSliderPosition(position, animated) {
  sliderTrack.style.transition = animated
    ? `transform ${transitionDuration}ms ease`
    : "none";

  sliderTrack.style.transform =
    `translate3d(${position}px, 0, 0)`;
}

/* Mover a una imagen */

function moveToSlide(index, animated = true) {
  currentIndex = index;
  dragMovement = 0;
  isAnimating = animated;

  clearTimeout(transitionTimer);

  const position =
    -(currentIndex * getSliderWidth());

  setSliderPosition(position, animated);
  updatePoints();

  /*
    Temporizador de seguridad.

    Si transitionend no se ejecuta por algún motivo,
    esta función corrige la posición igualmente.
  */

  if (animated) {
    transitionTimer = setTimeout(() => {
      finishTransition();
    }, transitionDuration + 100);
  }
}

/* Corregir la posición cuando llegamos a un clon */

function finishTransition() {
  clearTimeout(transitionTimer);

  if (currentIndex === 0) {
    currentIndex = totalSlides;
  }

  if (currentIndex === totalSlides + 1) {
    currentIndex = 1;
  }

  const position =
    -(currentIndex * getSliderWidth());

  setSliderPosition(position, false);

  isAnimating = false;
  updatePoints();
}

/* Escuchar el final de la animación */

sliderTrack.addEventListener(
  "transitionend",
  (event) => {
    if (
      event.target !== sliderTrack ||
      event.propertyName !== "transform"
    ) {
      return;
    }

    finishTransition();
  }
);

/* Siguiente imagen */

function nextSlide() {
  if (isDragging || isAnimating) {
    return;
  }

  moveToSlide(currentIndex + 1, true);
}

/* Imagen anterior */

function previousSlide() {
  if (isDragging || isAnimating) {
    return;
  }

  moveToSlide(currentIndex - 1, true);
}

/* Reproducción automática */

function startAutoPlay() {
  stopAutoPlay();

  autoPlayTimer = setTimeout(() => {
    if (!document.hidden) {
      nextSlide();
    }

    startAutoPlay();
  }, autoPlayTime);
}

function stopAutoPlay() {
  clearTimeout(autoPlayTimer);
}

function restartAutoPlay() {
  stopAutoPlay();
  startAutoPlay();
}

/* Comenzar a arrastrar */

function startDragging(event) {
  if (isAnimating) {
    return;
  }

  if (
    event.pointerType === "mouse" &&
    event.button !== 0
  ) {
    return;
  }

  isDragging = true;
  startX = event.clientX;
  dragMovement = 0;

  stopAutoPlay();

  sliderTrack.style.transition = "none";

  if (slider.setPointerCapture) {
    slider.setPointerCapture(event.pointerId);
  }
}

/* Arrastrar el slider */

function dragSlider(event) {
  if (!isDragging) {
    return;
  }

  dragMovement = event.clientX - startX;

  const currentPosition =
    -(currentIndex * getSliderWidth());

  setSliderPosition(
    currentPosition + dragMovement,
    false
  );
}

/* Terminar de arrastrar */

function stopDragging(event) {
  if (!isDragging) {
    return;
  }

  isDragging = false;

  const minimumMovement =
    Math.min(getSliderWidth() * 0.15, 100);

  if (dragMovement <= -minimumMovement) {
    moveToSlide(currentIndex + 1, true);
  } else if (dragMovement >= minimumMovement) {
    moveToSlide(currentIndex - 1, true);
  } else {
    moveToSlide(currentIndex, true);
  }

  if (
    event &&
    slider.hasPointerCapture &&
    slider.hasPointerCapture(event.pointerId)
  ) {
    slider.releasePointerCapture(
      event.pointerId
    );
  }

  restartAutoPlay();
}

/* Eventos del mouse y del teléfono */

slider.addEventListener(
  "pointerdown",
  startDragging
);

slider.addEventListener(
  "pointermove",
  dragSlider
);

slider.addEventListener(
  "pointerup",
  stopDragging
);

slider.addEventListener(
  "pointercancel",
  stopDragging
);

slider.addEventListener(
  "lostpointercapture",
  (event) => {
    if (isDragging) {
      stopDragging(event);
    }
  }
);

slider.addEventListener(
  "dragstart",
  (event) => {
    event.preventDefault();
  }
);

/* Corregir el tamaño al cambiar la pantalla */

window.addEventListener("resize", () => {
  finishTransition();
});

/* Pausar cuando se cambia de pestaña */

document.addEventListener(
  "visibilitychange",
  () => {
    if (document.hidden) {
      stopAutoPlay();
    } else {
      restartAutoPlay();
    }
  }
);

/* Iniciar el slider */

moveToSlide(1, false);
startAutoPlay();