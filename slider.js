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


/* SLIDER 2  */

const sliderTrack2 = document.getElementById("sliderTrack2");
const previousButton2 = document.getElementById("prevButton2");
const nextButton2 = document.getElementById("nextButton2");
const sliderDots2 = document.querySelectorAll(".slider2-dot");
const sliderBoxes2 = document.querySelectorAll(".slider2-box");

const totalSlides2 = sliderBoxes2.length;

let currentSlide2 = 0;

function showSlide2(index2) {
  if (index2 >= totalSlides2) {
    currentSlide2 = 0;
  } else if (index2 < 0) {
    currentSlide2 = totalSlides2 - 1;
  } else {
    currentSlide2 = index2;
  }

  sliderTrack2.style.transform =
    `translateX(-${currentSlide2 * 100}%)`;

  sliderDots2.forEach((dot2, dotIndex2) => {
    dot2.classList.toggle(
      "active",
      dotIndex2 === currentSlide2
    );
  });
}

nextButton2.addEventListener("click", () => {
  showSlide2(currentSlide2 + 1);
});

previousButton2.addEventListener("click", () => {
  showSlide2(currentSlide2 - 1);
});

sliderDots2.forEach((dot2) => {
  dot2.addEventListener("click", () => {
    const selectedSlide2 = Number(dot2.dataset.slide2);

    showSlide2(selectedSlide2);
  });
});

document.addEventListener("keydown", (event2) => {
  if (event2.key === "ArrowRight") {
    showSlide2(currentSlide2 + 1);
  }

  if (event2.key === "ArrowLeft") {
    showSlide2(currentSlide2 - 1);
  }
});
