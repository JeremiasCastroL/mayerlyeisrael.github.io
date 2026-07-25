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

  const transitionDuration = 500;
  const autoPlayTime = 10000;

  let currentIndex = 1;
  let startX = 0;
  let dragMovement = 0;
  let isDragging = false;
  let isAnimating = false;
  let autoPlayTimer;
  let transitionTimer;

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
      ? `transform ${transitionDuration}ms ease`
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
      -(currentIndex * getSliderWidth());

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
      -(currentIndex * getSliderWidth());

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
    if (!isDragging && !isAnimating) {
      moveToSlide(currentIndex + 1, true);
    }
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
      -(currentIndex * getSliderWidth());

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
        showSlide2(
          Number(dot2.dataset.slide2)
        );
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
   COPIAR CUENTAS
==================================== */

async function copiarCuenta(
  idElemento,
  texto
) {
  try {
    const elemento =
      document.getElementById(idElemento);

    const valor =
      elemento?.innerText.trim() ||
      texto;

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

window.copiarTexto1 = () =>
  copiarCuenta(
    "text-pichincha",
    "2206236571"
  );

window.copiarTexto2 = () =>
  copiarCuenta(
    "text-guayaquil",
    "0023455221"
  );

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
        if (
          elemento.closest(".boda-sobre")
        ) {
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

  agregar(
    ".img-1",
    "reveal-scale"
  );

  agregar(
    ".hero-contenido",
    "reveal-scale"
  );

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
    ".slider",
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

  if (
    !bodaSobre ||
    !bodaSello ||
    !bodaSuperior ||
    !contenidoInvitacion
  ) {
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

    contenidoInvitacion.setAttribute(
      "aria-hidden",
      "false"
    );

    document.body.classList.add(
      "invitacion-visible"
    );

    /*
      La pantalla permanece blanca
      durante este momento.

      En el siguiente fotograma empieza
      el fundido corto que muestra
      la invitación.
    */

    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        bodaSobre.classList.add(
          "finalizando"
        );
      });
    });

    window.setTimeout(() => {
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

      iniciarAnimacionesDeEntrada();
    }, 100);
  }

  bodaSello.addEventListener(
    "click",
    () => {
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
            event.propertyName ===
            "transform"
          ) {
            mostrarInvitacion();
          }
        },
        {
          once: true
        }
      );

      /*
        Respaldo por si algún navegador
        no ejecuta transitionend.
      */

      temporizadorSeguridad =
        window.setTimeout(
          mostrarInvitacion,
          1450
        );
    },
    {
      once: true
    }
  );
}

/* ====================================
   INICIO
==================================== */

iniciarSliderPrincipal();
iniciarSliderTransporte();
iniciarSobre();
