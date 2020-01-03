/**
 * Add an event handler to tags with .scrollto css class, when clicked the script will transitions moothly at its anchor
 */
document.querySelectorAll(".scrollto").forEach(anchor => {
  anchor.addEventListener("click", e => {
    e.preventDefault();

    document.querySelector(anchor.hash).scrollIntoView({
      behavior: "smooth",
      block: "start"
    });
  });
});
