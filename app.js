var loadPage = require('./modules/load_page');

$(document).ready(function initApp() {
  var $destination = $('#destination');

  $destination.on('click', function(e) {
    e.preventDefault();
  }).hammer().on('tap', 'a', function(e) {
    
    $el = $(this);
    var url = $el.attr('href');

    // Check if relative url => load from wikivoyage
    if ( url.match(/^\/\//) === null
          && url.match(/:\/\//) === null ) {
      e.preventDefault();

      loadPage($destination, url);
    }

    // open in external browser
    else {
      window.open(url, '_system');
    }
  });

  $destination.hammer().on('tap', '#videos_tab img', function(e) {
    window.open($(this).attr('data-href'), '_system');
  });

  loadPage($destination, '/wiki/Helsinki');
});
