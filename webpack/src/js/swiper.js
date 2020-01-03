/**
 * All about using swiper plugin
 */
import Swiper from "swiper";
import "swiper/dist/css/swiper.css";
import {
  toInt,
  isDef,
  toBool,
  removeClass,
  addClass,
  hasClass,
  siblings
} from "./utils.js";

const swipers = document.querySelectorAll(".swiper-container");

const configure = container => {
  // Reading from data attributes
  const boolData = {
    breakpoints: container.dataset.swBreakpoints,
    activeSelector: container.dataset.swActiveSelector,
    coverFlow: container.dataset.swCoverflow,
    autoPlay: container.dataset.swAutoplay,
    loop: container.dataset.swLoop,
    centered: container.dataset.swCenteredSlides,
    pagination: container.dataset.swPagination,
    navArrows: container.dataset.swNavArrows
  };

  const breakPoints = boolData.breakpoints
    ? JSON.parse(boolData.breakpoints)
    : false;
  const autoPlay = isDef(boolData.autoPlay) ? toBool(boolData.autoPlay) : false;
  const speed = toInt(container.dataset.swSpeed) || 1100;
  const effect = container.dataset.swEffect || "slide";

  const showItems = toInt(container.dataset.swShowItems) || 1;
  const loop = isDef(boolData.loop) ? toBool(boolData.loop) : true;
  const centered = isDef(boolData.centered) ? toBool(boolData.centered) : true;
  const spaceBetween =
    toInt(container.dataset.swSpaceBetween) || (showItems > 1 ? 20 : 0);
  const scrollItems = toInt(container.dataset.swScrollItems) || 1;
  const navigationElementId = container.dataset.swNavigation;
  const navigationActiveClass =
    container.dataset.swNavigationActive || "active";
  const navigationActiveSelector = isDef(boolData.activeSelector)
    ? toBool(boolData.activeSelector)
    : false;
  const paginationCss = isDef(boolData.pagination)
    ? boolData.pagination
    : ".swiper-pagination";
  const navigationCss = isDef(boolData.navArrows)
    ? boolData.navArrows
    : ".swiper-button";

  // Setting swiper options based on data attributes
  const coverflow = boolData.coverFlow
    ? {
        coverflowEffect: Object.assign(
          {
            stretch: 0,
            depth: 0,
            modifier: 1,
            rotate: 0,
            slideShadows: false
          },
          JSON.parse(boolData.coverFlow)
        )
      }
    : {};

  const autoplay = autoPlay
    ? {
        autoplay: {
          delay: autoPlay,
          disableOnIteration: false
        },
        speed: speed
      }
    : {};

  let pagination = {};

  if (paginationCss) {
    pagination.pagination = {
      el: paginationCss,
      clickable: true,
      dynamicBullets: true
    };
  }

  if (navigationCss) {
    pagination.navigation = {
      nextEl: navigationCss + "-next",
      prevEl: navigationCss + "-prev"
    };
  }

  const navigationElement = navigationElementId
    ? document.getElementById(navigationElementId.slice(1))
    : null;

  // Events
  let events = {};
  if (navigationElement) {
    events = {
      transitionEnd: () => {
        if (!navigationElement) return;

        if (navigationActiveSelector) {
          const activeElement = navigationElement.querySelector(
            `${navigationActiveSelector} .${navigationActiveClass}`
          );

          removeClass(activeElement, navigationActiveClass);
        } else {
          const activeElement = navigationElement.querySelector(
            `.${navigationActiveClass}`
          );
          const realElement = navigationElement.querySelectorAll(".nav-item");

          removeClass(activeElement, navigationActiveClass);
          addClass(realElement[swiper.realIndex], navigationActiveClass);
        }
      }
    };
  }

  const options = Object.assign(
    {
      loop: loop,
      slidesPerGroup: scrollItems,
      spaceBetween: spaceBetween,
      centeredSlides: centered,
      breakpoints: breakPoints,
      slidesPerView: showItems,
      parallax: true,
      effect: effect
    },
    pagination,
    autoplay,
    coverflow
  );

  // THE MAIN SWIPER ELEMENT
  let swiper = new Swiper(container, options);

  Object.keys(events).forEach(e => {
    swiper.on(e, events[e]);
  });

  if (navigationElement) {
    navigationElement.querySelectorAll(".nav-item").forEach(item =>
      item.addEventListener("click", evt => {
        evt.preventDefault();
        var item = evt.currentTarget;
        var activeItem = item;

        if (navigationActiveSelector) {
          activeItem = item.querySelector(navigationActiveSelector);
        }

        if (hasClass(activeItem, navigationActiveClass)) {
          return false;
        }

        var index =
          item.dataset.step || item.querySelector(".nav-link").dataset.step;
        swiper.slideTo(index);

        if (navigationActiveSelector) {
          siblings(item).forEach(item => {
            removeClass(
              item.querySelector(navigationActiveSelector),
              navigationActiveClass
            );
          });

          addClass(activeItem, navigationActiveClass);
        } else {
          siblings(item, `.${navigationActiveClass}`).forEach(item =>
            removeClass(item, navigationActiveClass)
          );
          addClass(item, navigationActiveClass);
        }

        evt.stopPropagation();
        return false;
      })
    );
  }

  container.dataset.swiperInstance = swiper;
};

if (swipers) {
  swipers.forEach(container => configure(container));
}
