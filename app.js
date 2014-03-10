var Destination = require('./modules/destination');
var Frontpage = require('./modules/frontpage');
var AppHistory = require('./modules/history');
var trobisHammer = require('./modules/trobis.hammer.js');
var settings = require('./modules/settings');

$(document).ready(function initApp() {

  AppHistory.init();

  document.addEventListener("resume", function onResume() {
    $('.opening_external_app').removeClass('opening_external_app');
  }, false);

  Frontpage.init($('#frontpage').hammer(settings.hammer));

  Destination.init({
    $el: $('#destination').hammer(settings.hammer)
  });
  //Destination.show('/wiki/Helsinki');

});
