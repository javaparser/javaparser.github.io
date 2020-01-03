/**
 * Adding jquery.smartWizard plugin settings.
 * Please feel free to edit this file according to your needs
 */
import "smartwizard/dist/js/jquery.smartWizard.min.js";
import "smartwizard/dist/css/smart_wizard.css";
import "smartwizard/dist/css/smart_wizard_theme_arrows.css";
import "smartwizard/dist/css/smart_wizard_theme_circles.css";
import "smartwizard/dist/css/smart_wizard_theme_dots.css";

const defaultConfig = {
  showStepURLhash: false, // not show the hash on URL
  theme: "circles",
  anchorSettings: {
    removeDoneStepOnNavigateBack: true // remove the "done" on visited steps when navigating back
  }
};

// 1. BASIC WIZARD
// This is a basic configuration, just setting the theme and default configuration
$("#basic-wizard").smartWizard(defaultConfig);

// 2. AJAX WIZARD
// To load a step content from ajax just add "data-content-url" attribute to the step.
$("#ajax-wizard").smartWizard(defaultConfig);

// 3. FORM WIZARD
// Another way to load content through ajax is set the "contentUrl" via setting
// this will send all requests to the same endpoint, you can take control of it via "step_number" variable sent automatically

// Save the wizard variable, we'll used it below to work with it
var $formWizard = $("#form-wizard");
var options = $.extend({}, defaultConfig, {
  contentURL: "wizard/get-form/",
  ajaxSettings: {
    type: "GET"
  }
});
var ajaxFormWizard = $formWizard.smartWizard(options);
var doAjax = function($form, config) {
  var dfd = new $.Deferred();
  var settings = $.extend(true, {}, config, {
    url: $form.attr("action"),
    type: "POST",
    data: $form.serializeArray(),
    dataType: "json",
    beforeSend: function() {
      $formWizard.smartWizard("block");
    }
  });

  $.ajax(settings)
    .done(function(data) {
      if (data.result) {
        $form.trigger("form.submitted", [data]);

        $("input, textarea", $form).removeClass("error");
        $form.addClass("submitted");
      } else {
        if (data.errors) {
          $.each(data.errors, function(i, v) {
            var $input = $("[name$='[" + i + "]']", $form).addClass("error");
            $input
              .tooltip({ title: v, placement: "bottom", trigger: "manual" })
              .tooltip("show")
              .on("focus", function() {
                $(this).tooltip("destroy");
              });
          });
        }
      }

      $formWizard.smartWizard("unblock");
      dfd.resolve(data.result);
    })
    .fail(function() {
      $formWizard.smartWizard("unblock");

      //show failure message
      dfd.reject();
    });

  return dfd.promise();
};

ajaxFormWizard
  .on("leaveStep", function(evt, anchorObject, stepNumber, stepDirection) {
    var $form = $("#form-step-" + stepNumber, $formWizard);

    // stepDirection === 'forward' :- this condition allows to do the form validation
    // only on forward navigation, that makes easy navigation on backwards still do the validation when going next
    if (stepDirection === "forward" && $form.length) {
      if (!$form.valid()) {
        return false;
      }

      return doAjax($form);
    }

    return true;
  })
  .on("showStep", function(evt, anchorObject, stepNumber, stepDirection) {
    var validateOptions = {
      errorPlacement: function(error, element) {
        var $parent = element.parent();

        if ($parent.hasClass("input-group")) {
          error.insertAfter($parent);
        } else if ($parent.hasClass("has-icon")) {
          error.insertBefore($parent);
        } else if ($parent.hasClass("control")) {
          error.insertAfter(element.next(".control-label"));
        } else {
          error.insertAfter(element);
        }
      }
    };

    var $form = $("#form-step-" + stepNumber, $formWizard);
    $form.validate(validateOptions);

    // some work with step-2 (pricing plans)
    if (stepNumber === 2) {
      $("input[type=radio]", $form).on("change", function(e) {
        $(e.target)
          .closest(".row")
          .find(".card")
          .removeClass("b b-3");

        $(e.target)
          .closest(".card")
          .addClass("b b-3");
      });
    }
  });
