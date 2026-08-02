let videoPortadaReproducido = false;

function reproducirVideoPortada() {
  const video =
    document.getElementById("videoAnimacion");

  if (
    !video ||
    videoPortadaReproducido
  ) {
    return;
  }

  videoPortadaReproducido = true;

  video.muted = true;
  video.defaultMuted = true;
  video.playsInline = true;

  const iniciarVideo = () => {
    video.currentTime = 0;

    video.play()
      .catch((error) => {
        videoPortadaReproducido = false;

        console.warn(
          "No se pudo reproducir el video:",
          error
        );
      });
  };

  if (video.readyState >= 2) {
    iniciarVideo();
  } else {
    video.addEventListener(
      "loadeddata",
      iniciarVideo,
      {
        once: true
      }
    );

    video.load();
  }

  video.addEventListener(
    "ended",
    () => {
      video.pause();
    },
    {
      once: true
    }
  );
}


/*  */

function iniciarVideoAnillo() {
  const video = document.getElementById("videoAnillo");

  if (!video) {
    return;
  }

  let yaSeReprodujo = false;

  video.muted = true;
  video.defaultMuted = true;
  video.playsInline = true;
  video.preload = "auto";

  // Hace que la animación avance un poco más rápido.
  video.playbackRate = 1.15;

  // Empieza a cargarlo desde que abre la página.
  video.load();

  const reproducirVideo = () => {
    if (yaSeReprodujo) {
      return;
    }

    yaSeReprodujo = true;
    video.currentTime = 0;

    video.play().catch((error) => {
      yaSeReprodujo = false;

      console.warn(
        "No se pudo reproducir el video:",
        error
      );
    });
  };

  const observer = new IntersectionObserver(
    (entradas) => {
      entradas.forEach((entrada) => {
        if (
          entrada.isIntersecting &&
          entrada.intersectionRatio >= 0.05
        ) {
          reproducirVideo();
          observer.unobserve(video);
        }
      });
    },
    {
      threshold: [0, 0.05],
      rootMargin: "0px 0px 15% 0px"
    }
  );

  observer.observe(video);

  video.addEventListener(
    "ended",
    () => {
      video.pause();

      if (
        Number.isFinite(video.duration) &&
        video.duration > 0.05
      ) {
        video.currentTime =
          video.duration - 0.05;
      }
    },
    {
      once: true
    }
  );
}


/* ====================================
   SLIDER DE FOTOS
==================================== */

function iniciarSliderPrincipal() {
  const slider = document.querySelector(".slider");

  if (!slider) {
    return;
  }

  const sliderTrack = slider.querySelector(".slider-track");
  const pointsContainer = slider.querySelector(".slider-points");

  if (!sliderTrack || !pointsContainer) {
    return;
  }

  const originalSlides = Array.from(
    sliderTrack.querySelectorAll(".slide")
  );

  const totalSlides = originalSlides.length;

  if (totalSlides === 0) {
    return;
  }

  const transitionDuration = 800;
  const autoPlayTime = 8000;

  let currentIndex = 1;
  let startX = 0;
  let dragMovement = 0;

  let isDragging = false;
  let isAnimating = false;

  let autoPlayTimer;
  let transitionTimer;

  /* Clones para hacer el slider infinito */

  const firstClone = originalSlides[0].cloneNode(true);

  const lastClone =
    originalSlides[totalSlides - 1].cloneNode(true);

  firstClone.setAttribute("aria-hidden", "true");
  lastClone.setAttribute("aria-hidden", "true");

  sliderTrack.appendChild(firstClone);

  sliderTrack.insertBefore(
    lastClone,
    originalSlides[0]
  );

  /* Crear los puntos inferiores */

  originalSlides.forEach((slide, index) => {
    const point = document.createElement("button");

    point.classList.add("slider-point");
    point.type = "button";

    point.setAttribute(
      "aria-label",
      `Ir a la imagen ${index + 1}`
    );

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

  function getSliderWidth() {
    return slider.getBoundingClientRect().width;
  }

  function getSliderGap() {
    const estilosTrack =
      window.getComputedStyle(sliderTrack);

    return (
      parseFloat(estilosTrack.columnGap) ||
      parseFloat(estilosTrack.gap) ||
      0
    );
  }

  function getSlideStep() {
    const slideActual =
      sliderTrack.querySelector(".slide");

    if (!slideActual) {
      return getSliderWidth();
    }

    const anchoSlide =
      slideActual.getBoundingClientRect().width;

    return anchoSlide + getSliderGap();
  }

  function getRealIndex() {
    return (
      (currentIndex - 1 + totalSlides) %
      totalSlides
    );
  }

  function updatePoints() {
    const realIndex = getRealIndex();

    points.forEach((point, index) => {
      point.classList.toggle(
        "active",
        index === realIndex
      );
    });
  }

  function setSliderPosition(position, animated) {
    sliderTrack.style.transition = animated
      ? `transform ${transitionDuration}ms cubic-bezier(0.22, 1, 0.36, 1)`
      : "none";

    sliderTrack.style.transform =
      `translate3d(${position}px, 0, 0)`;
  }

  function moveToSlide(index, animated = true) {
    currentIndex = index;
    dragMovement = 0;
    isAnimating = animated;

    clearTimeout(transitionTimer);

    const position =
      -(currentIndex * getSlideStep());

    setSliderPosition(position, animated);
    updatePoints();

    if (animated) {
      transitionTimer = window.setTimeout(
        finishTransition,
        transitionDuration + 100
      );
    }
  }

  function finishTransition() {
    clearTimeout(transitionTimer);

    if (currentIndex === 0) {
      currentIndex = totalSlides;
    }

    if (currentIndex === totalSlides + 1) {
      currentIndex = 1;
    }

    const position =
      -(currentIndex * getSlideStep());

    setSliderPosition(position, false);

    isAnimating = false;

    updatePoints();
  }

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

  function nextSlide() {
    if (isDragging || isAnimating) {
      return;
    }

    moveToSlide(currentIndex + 1, true);
  }

  function startAutoPlay() {
    stopAutoPlay();

    autoPlayTimer = window.setTimeout(() => {
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
    slider.classList.add("dragging");

    if (slider.setPointerCapture) {
      slider.setPointerCapture(event.pointerId);
    }
  }

  function dragSlider(event) {
    if (!isDragging) {
      return;
    }

    dragMovement =
      event.clientX - startX;

    const currentPosition =
      -(currentIndex * getSlideStep());

    setSliderPosition(
      currentPosition + dragMovement,
      false
    );
  }

  function stopDragging(event) {
    if (!isDragging) {
      return;
    }

    isDragging = false;

    slider.classList.remove("dragging");

    const minimumMovement =
      Math.min(
        getSliderWidth() * 0.15,
        100
      );

    if (dragMovement <= -minimumMovement) {
      moveToSlide(
        currentIndex + 1,
        true
      );
    } else if (
      dragMovement >= minimumMovement
    ) {
      moveToSlide(
        currentIndex - 1,
        true
      );
    } else {
      moveToSlide(
        currentIndex,
        true
      );
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

  window.addEventListener(
    "resize",
    finishTransition
  );

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

  moveToSlide(1, false);
  startAutoPlay();
}

/* ====================================
   SLIDER DE TRANSPORTE
==================================== */

function iniciarSliderTransporte() {
  const sliderTrack2 =
    document.getElementById("sliderTrack2");

  const previousButton2 =
    document.getElementById("prevButton2");

  const nextButton2 =
    document.getElementById("nextButton2");

  const sliderDots2 =
    document.querySelectorAll(".slider2-dot");

  const sliderBoxes2 =
    document.querySelectorAll(".slider2-box");

  if (
    !sliderTrack2 ||
    !previousButton2 ||
    !nextButton2 ||
    sliderBoxes2.length === 0
  ) {
    return;
  }

  const totalSlides2 =
    sliderBoxes2.length;

  let currentSlide2 = 0;

  function showSlide2(index2) {
    if (index2 >= totalSlides2) {
      currentSlide2 = 0;
    } else if (index2 < 0) {
      currentSlide2 =
        totalSlides2 - 1;
    } else {
      currentSlide2 = index2;
    }

    sliderTrack2.style.transform =
      `translateX(-${currentSlide2 * 100}%)`;

    sliderDots2.forEach(
      (dot2, dotIndex2) => {
        dot2.classList.toggle(
          "active",
          dotIndex2 === currentSlide2
        );
      }
    );
  }

  nextButton2.addEventListener(
    "click",
    () => {
      showSlide2(currentSlide2 + 1);
    }
  );

  previousButton2.addEventListener(
    "click",
    () => {
      showSlide2(currentSlide2 - 1);
    }
  );

  sliderDots2.forEach((dot2) => {
    dot2.addEventListener(
      "click",
      () => {
        const selectedSlide2 =
          Number(dot2.dataset.slide2);

        showSlide2(selectedSlide2);
      }
    );
  });

  document.addEventListener(
    "keydown",
    (event) => {
      if (event.key === "ArrowRight") {
        showSlide2(
          currentSlide2 + 1
        );
      }

      if (event.key === "ArrowLeft") {
        showSlide2(
          currentSlide2 - 1
        );
      }
    }
  );
}

/* ====================================
   COPIAR NÚMEROS DE CUENTA
==================================== */

async function copiarCuenta(
  idElemento,
  textoAlternativo
) {
  try {
    const elemento =
      document.getElementById(idElemento);

    const valor =
      elemento?.innerText.trim() ||
      textoAlternativo;

    await navigator.clipboard.writeText(
      valor
    );
  } catch (error) {
    console.error(
      "No fue posible copiar el número de cuenta.",
      error
    );
  }
}

window.copiarTexto1 = () => {
  copiarCuenta(
    "text-pichincha",
    "2206236571"
  );
};

window.copiarTexto2 = () => {
  copiarCuenta(
    "text-guayaquil",
    "0023455221"
  );
};

window.copiarTexto3 = () => {
  copiarCuenta(
    "text-ci",
    "0941930661"
  );
};

/* ====================================
   APARICIONES AL DESLIZAR
==================================== */

let revealObserver;

function prepararAnimacionesDeEntrada() {
  const elementos = [];

  const agregar = (
    selector,
    claseExtra = ""
  ) => {
    document
      .querySelectorAll(selector)
      .forEach((elemento) => {
        /*
          No se agregan animaciones a los
          elementos que forman parte del sobre.
        */

        if (elemento.closest(".boda-sobre")) {
          return;
        }

        const opacidadOriginal =
          getComputedStyle(elemento).opacity;

        elemento.style.setProperty(
          "--reveal-final-opacity",
          opacidadOriginal
        );

        elemento.classList.add(
          "reveal-item"
        );

        if (claseExtra) {
          elemento.classList.add(
            ...claseExtra.split(" ")
          );
        }

        elementos.push(elemento);
      });
  };

  /*
    No agregamos .img-1 ni .hero-contenido.

    De esta manera, la primera pantalla de la
    invitación aparece inmediatamente después
    de que el sobre termina de abrirse.
  */

  agregar(".frase p");

  agregar(
    ".img-ceremonia",
    "reveal-left"
  );

  agregar(
    ".content-tarjeta",
    "reveal-right"
  );

  agregar(
    ".slider2",
    "reveal-scale"
  );

  agregar(
    ".foto-ancha",
    "reveal-scale"
  );


  agregar(
    ".divisor",
    "reveal-scale"
  );

  agregar(
    ".backgroundflores",
    "reveal-scale reveal-float"
  );

  agregar(
    ".cloudpink",
    "reveal-scale reveal-float"
  );

  agregar(
    ".cloudbig",
    "reveal-scale reveal-float"
  );

  agregar(".rosas-final");
  agregar(".teesperamos");

  document
    .querySelectorAll(".evento")
    .forEach((evento, index) => {
      evento.classList.add(
        "reveal-item",
        index % 2 === 0
          ? "reveal-left"
          : "reveal-right"
      );

      evento.style.transitionDelay =
        `${Math.min(index * 90, 270)}ms`;

      elementos.push(evento);
    });

  return [...new Set(elementos)];
}

const elementosRevelables =
  prepararAnimacionesDeEntrada();

function iniciarAnimacionesDeEntrada() {
  if (
    window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches
  ) {
    elementosRevelables.forEach(
      (elemento) => {
        elemento.classList.add(
          "is-visible"
        );
      }
    );

    return;
  }

  if (
    !("IntersectionObserver" in window)
  ) {
    elementosRevelables.forEach(
      (elemento) => {
        elemento.classList.add(
          "is-visible"
        );
      }
    );

    return;
  }

  revealObserver =
    new IntersectionObserver(
      (entries, observer) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) {
            return;
          }

          entry.target.classList.add(
            "is-visible"
          );

          observer.unobserve(
            entry.target
          );
        });
      },
      {
        threshold: 0.14,
        rootMargin:
          "0px 0px -8% 0px"
      }
    );

  elementosRevelables.forEach(
    (elemento) => {
      revealObserver.observe(elemento);
    }
  );
}

/* ====================================
   HACER VISIBLE LA PORTADA
==================================== */

function mostrarPortadaInmediatamente() {
  const elementosPortada = [
    document.querySelector(".img-1"),
    document.querySelector(".hero-contenido")
  ];

  elementosPortada.forEach((elemento) => {
    if (!elemento) {
      return;
    }

    elemento.classList.remove(
      "reveal-item",
      "reveal-scale",
      "reveal-left",
      "reveal-right",
      "reveal-float"
    );

    elemento.classList.add(
      "is-visible"
    );

    elemento.style.opacity = "1";
    elemento.style.visibility = "visible";
    elemento.style.transform = "none";
    elemento.style.transition = "none";
  });
}

/* ====================================
   APERTURA DEL SOBRE
==================================== */

function iniciarSobre() {
  const bodaSobre =
    document.getElementById("bodaSobre");

  const bodaSello =
    document.getElementById("bodaSello");

  const bodaSuperior =
    bodaSobre?.querySelector(
      ".boda-superior"
    );

  const contenidoInvitacion =
    document.getElementById(
      "contenidoInvitacion"
    );

  const audioInvitacion =
    document.getElementById("audio");

  const botonMusicaInvitacion =
    document.getElementById("botonMusica");

  let musicaPreparada = false;
  let temporizadorVolumen;

  /*
    Empieza a reproducir la canción en silencio
    desde el clic del usuario.

    Esto evita el bloqueo de reproducción
    automática de los navegadores.
  */

  function prepararMusica() {
    if (!audioInvitacion || musicaPreparada) {
      return;
    }

    audioInvitacion.currentTime = 0;
    audioInvitacion.volume = 0;

    audioInvitacion
      .play()
      .then(() => {
        musicaPreparada = true;
      })
      .catch((error) => {
        console.warn(
          "El navegador bloqueó la música:",
          error
        );
      });
  }

  /*
    Cuando aparece la invitación,
    aumenta suavemente el volumen.
  */

  function activarMusica() {
    if (!audioInvitacion) {
      return;
    }

    clearInterval(temporizadorVolumen);

    if (audioInvitacion.paused) {
      audioInvitacion
        .play()
        .catch((error) => {
          console.warn(
            "No se pudo iniciar la música:",
            error
          );
        });
    }

    let volumenActual =
      audioInvitacion.volume;

    const volumenFinal = 0.7;

    temporizadorVolumen =
      window.setInterval(() => {
        volumenActual = Math.min(
          volumenActual + 0.08,
          volumenFinal
        );

        audioInvitacion.volume =
          volumenActual;

        if (
          volumenActual >= volumenFinal
        ) {
          clearInterval(
            temporizadorVolumen
          );
        }
      }, 30);

    if (botonMusicaInvitacion) {
      botonMusicaInvitacion.textContent =
        "❚❚";
    }
  }

  /*
    Si falta algún elemento del sobre,
    muestra directamente la invitación.
  */

  if (
    !bodaSobre ||
    !bodaSello ||
    !bodaSuperior ||
    !contenidoInvitacion
  ) {
    mostrarPortadaInmediatamente();

    document.body.classList.remove(
      "sobre-bloqueado"
    );

    document.body.classList.add(
      "invitacion-visible"
    );

    iniciarAnimacionesDeEntrada();

    return;
  }

  let aperturaTerminada = false;
  let temporizadorSeguridad;

  function mostrarInvitacion() {
    if (aperturaTerminada) {
      return;
    }

    aperturaTerminada = true;

    clearTimeout(
      temporizadorSeguridad
    );

    mostrarPortadaInmediatamente();

    contenidoInvitacion.setAttribute(
      "aria-hidden",
      "false"
    );

    document.body.classList.add(
      "invitacion-visible"
    );

    bodaSobre.classList.add(
      "oculto"
    );

    bodaSobre.setAttribute(
      "aria-hidden",
      "true"
    );

    document.body.classList.remove(
      "sobre-bloqueado"
    );

    window.scrollTo({
      top: 0,
      left: 0,
      behavior: "auto"
    });

    /*
      La canción se vuelve audible justo
      cuando aparece la invitación.
    */



    activarMusica();

    iniciarAnimacionesDeEntrada();

    requestAnimationFrame(() => {
      reproducirVideoPortada();
    });
  }

  bodaSello.addEventListener(
    "click",
    () => {
      /*
        Debe ejecutarse inmediatamente dentro
        del clic para que el navegador permita
        reproducir el audio.
      */

      prepararMusica();

      bodaSobre.classList.add(
        "abierto"
      );

      bodaSello.setAttribute(
        "aria-expanded",
        "true"
      );

      bodaSello.setAttribute(
        "aria-label",
        "Invitación abierta"
      );

      bodaSuperior.addEventListener(
        "transitionend",
        (event) => {
          if (
            event.target !== bodaSuperior ||
            event.propertyName !== "transform"
          ) {
            return;
          }

          mostrarInvitacion();
        },
        {
          once: true
        }
      );

      temporizadorSeguridad =
        window.setTimeout(
          mostrarInvitacion,
          1300
        );
    },
    {
      once: true
    }
  );
}

function prepararVideoPortada() {
  const video =
    document.getElementById("videoAnimacion");

  if (!video) {
    return;
  }

  video.muted = true;
  video.defaultMuted = true;
  video.playsInline = true;
  video.preload = "auto";

  video.load();
}

/* ====================================
   INICIO
==================================== */

/* iniciarSliderPrincipal();
iniciarSliderTransporte();
iniciarSobre(); */

/* ====================================
   INICIO
==================================== */

document.addEventListener("DOMContentLoaded", () => {
  if (
    typeof iniciarSliderPrincipal === "function"
  ) {
    iniciarSliderPrincipal();
  }

  if (
    typeof iniciarSliderTransporte === "function"
  ) {
    iniciarSliderTransporte();
  }

  if (
    typeof prepararVideoPortada === "function"
  ) {
    prepararVideoPortada();
  }

  if (
    typeof iniciarVideoAnillo === "function"
  ) {
    iniciarVideoAnillo();
  }

  if (
    typeof iniciarSobre === "function"
  ) {
    iniciarSobre();
  }
});
