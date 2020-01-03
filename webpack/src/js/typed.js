/**
 * Using typed.js plugin
 * Here is where you will change the words used for the plugin
 */
import Typed from "typed.js";

const options = {
  strings: ["Invoicing", "Subscriptions", "Mailing", "Reporting"],
  typeSpeed: 150,
  backDelay: 500,
  backSpeed: 50,
  loop: true
};

const typed = document.querySelector(".typed");

typed && new Typed(typed, options);
