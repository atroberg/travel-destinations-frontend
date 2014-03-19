var Destination = require('./modules/views/destination');
var Frontpage = require('./modules/views/frontpage');

var Analytics = require('./modules/analytics');
var AppHistory = require('./modules/history');
var settings = require('./modules/settings');
var PageUtils = require('./modules/page_utils');
var Ajax = require('./modules/ajax');


$(document).ready(function initApp() {

  PageUtils.buttonTouchFeedback();

  AppHistory.init();

  Ajax.init();

  document.addEventListener('resume', function onResume() {
    $('.opening_external_app').removeClass('opening_external_app');
  }, false);

  Frontpage.init($('#frontpage').hammer(settings.hammer));

  Destination.init({
    $el: $('#destination').hammer(settings.hammer)
  });

});

document.addEventListener('deviceready', function deviceReady() {
  Analytics.init();
}, false);
