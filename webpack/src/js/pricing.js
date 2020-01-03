/**
 * Pricing stuff
 */
import "odometer/odometer.min.js";
import "odometer/themes/odometer-theme-minimal.css";

$(".pricing-table-basis").on(
  "change",
  'input[name="pricing-value"]',
  function() {
    var period = this.value;

    $(".odometer").each(function() {
      this.innerHTML = $(this).data(period + "-price");
    });
  }
);
