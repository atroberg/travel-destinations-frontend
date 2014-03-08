var Destination = require('./modules/destination');
var AppHistory = require('./modules/history');
var settings = require('./modules/settings');

$(document).ready(function initApp() {

  AppHistory.init();

  Destination.init($('#destination').hammer(settings.hammer));

  document.addEventListener("resume", function onResume() {
    $('.opening_external_app').removeClass('opening_external_app');
  }, false);

  // TODO: for this test just init with Helsinki
  Destination.show('/wiki/Helsinki');

});
