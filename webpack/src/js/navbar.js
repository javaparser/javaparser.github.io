/**
 * Navbar interaction
 */
class Navigation {
  constructor(mainNav) {
    this.navigation = mainNav;
    this.toggler = this.navigation.querySelector(".navbar-toggler");

    // navbar toggler, for mobile interaction
    this.toggler.addEventListener("click", () => {
      if (!this.navigation.matches(".st-nav")) {
        this.navigation.classList.toggle("navbar-expanded");
      }
    });

    // windows scroll event, toggle between sticky and non-sticky navbar
    window.addEventListener("scroll", () => {
      this.handleScroll();
    });
  }

  handleScroll() {
    const navTop = this.navigation.offsetTop + this.navigation.offsetHeight;

    if (window.scrollY >= navTop) {
      this.navigation.classList.add("navbar-sticky");
    } else {
      this.navigation.classList.remove("navbar-sticky");
    }
  }
}

const navigation = document.querySelector(".main-nav");

if (navigation) {
  new Navigation(navigation);
}
