/**
 * Used in SaaS.html demo.
 * This script places mockups used on that demo when view on mobile devices. Check docs for more information
 */
const $perspectiveMockups = $(".perspective-mockups");
const $topReference = $(".learn-more", ".lightweight-template");

const setMockupsTop = () => {
  // check if the perspective mockups elements are on the page, if you're not going to use them, you can remove all its references
  if (!$perspectiveMockups.length) return;

  if ($(window).outerWidth() < 768) {
    $perspectiveMockups.css({ top: $topReference.offset().top + "px" });
    return;
  }

  $perspectiveMockups.removeAttr("style");
};

$perspectiveMockups.removeClass("hidden-preload");

$(window).on("resize", setMockupsTop);

setMockupsTop();
