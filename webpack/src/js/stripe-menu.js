/**
 * Stripe menu like
 */
import { queryArray, touch } from "./utils";

/**
 * Main events used to enable interaction with menu
 **/
const events = global.PointerEvent
  ? {
      end: "pointerup",
      enter: "pointerenter",
      leave: "pointerleave"
    }
  : {
      end: "touchend",
      enter: "mouseenter",
      leave: "mouseleave"
    };

class StripeMenu {
  constructor(menuElement) {
    /**
     * The main navigation element.
     **/
    this.container = document.querySelector(menuElement);
    this.container.classList.add("no-dropdown-transition");

    /**
     * Element holding the menu options, not the dropdown
     **/
    this.root = this.container.querySelector(".st-nav-menu");

    /**
     * Those elements used to show the dropdown animation and transitioning
     **/
    this.dropdownBackground = this.container.querySelector(".st-dropdown-bg");
    this.dropdownBackgroundAlt = this.container.querySelector(".st-alt-bg");
    this.dropdownContainer = this.container.querySelector(
      ".st-dropdown-container"
    );
    this.dropdownArrow = this.container.querySelector(".st-dropdown-arrow");

    /**
     * Elements which will have the dropdown content to be shown
     **/
    this.hasDropdownLinks = queryArray(".st-has-dropdown", this.root);

    /**
     * Each dropdown section to be displayed on mouse interactions
     **/
    this.dropdownSections = queryArray(
      ".st-dropdown-section",
      this.container
    ).map(el => {
      return {
        el,
        name: el.getAttribute("data-dropdown"),
        content: el.querySelector(".st-dropdown-content"),
        width: el.querySelector(".st-dropdown-content").offsetWidth
      };
    });

    /**
     * Menu link interaction
     **/
    this.hasDropdownLinks.forEach(el => {
      el.addEventListener(events.enter, evt => {
        if (evt.pointerType === "touch") return;

        this.stopCloseTimeout();
        this.openDropdown(el);
      });

      el.addEventListener(events.leave, evt => {
        if (evt.pointerType === "touch") return;
        this.startCloseTimeout();
      });

      el.addEventListener(events.end, evt => {
        evt.preventDefault();
        evt.stopPropagation();
        this.toggleDropdown(el);
      });
    });

    /**
     * Menu container interaction with content
     **/
    this.dropdownContainer.addEventListener(events.enter, evt => {
      if (evt.pointerType === "touch") return;
      this.stopCloseTimeout();
    });

    this.dropdownContainer.addEventListener(events.leave, evt => {
      if (evt.pointerType === "touch") return;
      this.startCloseTimeout();
    });

    this.dropdownContainer.addEventListener(events.end, evt => {
      evt.stopPropagation();
    });

    document.body.addEventListener(events.end, () => {
      touch().isDragging || this.closeDropdown();
    });
  }

  openDropdown(hasDropDownLink) {
    if (this.activeDropdown === hasDropDownLink) return;

    this.activeDropdown = hasDropDownLink;

    this.container.classList.add("overlay-active");
    this.container.classList.add("dropdown-active");

    /**
     * Setting the default menu active equals to this link
     **/
    this.hasDropdownLinks.forEach(link => {
      link.classList.remove("active");
    });
    hasDropDownLink.classList.add("active");

    /**
     * Next section to show
     **/
    var nextSection = hasDropDownLink.getAttribute("data-dropdown"),
      position = "left";

    var dropdown = {
      width: 0,
      height: 0,
      content: null
    };

    this.dropdownSections.forEach(dropDownSection => {
      dropDownSection.el.classList.remove("active");
      dropDownSection.el.classList.remove("left");
      dropDownSection.el.classList.remove("right");

      if (dropDownSection.name === nextSection) {
        dropDownSection.el.classList.add("active");
        position = "right";

        dropdown = {
          width: dropDownSection.content.offsetWidth,
          height: dropDownSection.content.offsetHeight,
          content: dropDownSection.content
        };
      } else {
        dropDownSection.el.classList.add(position);
      }
    });

    var u = 520,
      a = 400,
      scaleX = dropdown.width / u,
      scaleY = dropdown.height / a,
      ddCr = hasDropDownLink.getBoundingClientRect(),
      translateX = ddCr.left + ddCr.width / 2 - dropdown.width / 2;

    translateX = Math.round(Math.max(translateX, 10));

    clearTimeout(this.disableTransitionTimeout);
    this.enableTransitionTimeout = setTimeout(() => {
      this.container.classList.remove("no-dropdown-transition");
    }, 50);

    this.dropdownBackground.style.transform = `translateX(${translateX}px) scaleX(${scaleX}) scaleY(${scaleY})`;
    this.dropdownContainer.style.transform = `translateX(${translateX}px)`;

    this.dropdownContainer.style.width = dropdown.width + "px";
    this.dropdownContainer.style.height = dropdown.height + "px";

    const arrowPosX = Math.round(ddCr.left + ddCr.width / 2);
    this.dropdownArrow.style.transform = `translateX(${arrowPosX}px) rotate(45deg)`;

    if (dropdown.content) {
      const d = dropdown.content.children[0].offsetHeight / scaleY;
      this.dropdownBackgroundAlt.style.transform = `translateY(${d}px)`;
    }
  }

  closeDropdown() {
    if (!this.activeDropdown) return;

    this.hasDropdownLinks.forEach((link, t) => {
      link.classList.remove("active");
    });

    clearTimeout(this.enableTransitionTimeout);

    this.disableTransitionTimeout = setTimeout(() => {
      this.container.classList.add("no-dropdown-transition");
    }, 50);

    this.container.classList.remove("overlay-active");
    this.container.classList.remove("dropdown-active");
    this.activeDropdown = undefined;
  }

  toggleDropdown(e) {
    this.activeDropdown === e ? this.closeDropdown() : this.openDropdown(e);
  }

  startCloseTimeout() {
    this.closeDropdownTimeout = setTimeout(() => {
      this.closeDropdown();
    }, 50);
  }

  stopCloseTimeout() {
    clearTimeout(this.closeDropdownTimeout);
  }
}

class StripeMenuPopup {
  //activeClass = "st-popup-active";

  constructor(element) {
    this.root = document.querySelector(element);
    this.activeClass = "st-popup-active";

    const eventTrigger = touch().isSupported ? "touchend" : "click";
    const link = this.root.querySelector(".st-root-link");
    const popup = this.root.querySelector(".st-popup");
    const closeButton = this.root.querySelector(".st-popup-close-button");

    link.addEventListener(eventTrigger, evt => {
      evt.stopPropagation();
      this.togglePopup();
    });

    popup.addEventListener(eventTrigger, evt => {
      evt.stopPropagation();
    });

    closeButton &&
      closeButton.addEventListener(eventTrigger, evt => {
        this.closeAllPopups();
      });

    document.body.addEventListener(
      eventTrigger,
      evt => {
        touch().isDragging || this.closeAllPopups();
      },
      false
    );
  }

  togglePopup() {
    const isActive = this.root.classList.contains(this.activeClass);

    this.closeAllPopups(true);
    isActive || this.root.classList.add(this.activeClass);
  }

  closeAllPopups(e) {
    const activeLinks = document.getElementsByClassName(this.activeClass);

    for (let i = 0; i < activeLinks.length; i++)
      activeLinks[i].classList.remove(this.activeClass);
  }
}

const stripeNavigation = document.querySelector(".st-nav");

if (stripeNavigation) {
  new StripeMenu(".st-nav");
  new StripeMenuPopup(".st-nav .st-nav-section.st-nav-mobile");
}
