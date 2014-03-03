var loadDestination = require('./modules/load_destination');
var DestinationTabs = require('./modules/destination_tabs');
var flickrPhotoSearch = require('./modules/flickr_photo_search');
var Youtube = require('./modules/youtube_videos');
var videoTemplate = require('./templates/videos.hbs');

$(document).ready(function initApp() {
  var currentDestination = {};
  var $destination = $('#destination');

  function showDestination(path) {
    currentDestination.title = decodeURIComponent(path.replace(/^\/wiki\//, '').replace(/_/g, ' '));
    loadDestination($destination, path, currentDestination.title);
    DestinationTabs.clearCache();
  }

  // Prevent default behavior for links
  $destination.on('click', 'a', function(e) {
    e.preventDefault();
  }).hammer().on('tap', 'a', function(e) {
    
    $el = $(this);
    var url = $el.attr('href');

    // Check if relative url => load from wikivoyage
    if ( url.match(/^\/\//) === null
          && url.match(/:\/\//) === null ) {
      e.preventDefault();

      showDestination(url);
    }

    // open in external browser
    else {
      window.open(url, '_system');
    }
  });

  // Open youtube videos with external app
  $destination.hammer().on('tap', '#videos_tab img', function(e) {
    window.open($(this).attr('data-href'), '_system');
  });

  // Accordion
  $destination.hammer().on('tap', '#destination_content > h2', function(e) {
    var $title = $(this);
    $title.toggleClass('expanded');
  });


  // Tabs
  DestinationTabs.setElement($destination);
  $destination.hammer().on('tap', 'nav #tabs_menu li', function(e) {
    DestinationTabs.focusToTab($(this).index());
  });

  $destination.hammer({swipe_velocity: 0.1}).on('swipeleft', '#destination_tabs', function(e) {
    DestinationTabs.nextTab();
  })
  .on('swiperight', function(e) {
    DestinationTabs.prevTab();
  });

  DestinationTabs.bindTabFunction('photos', function($tab) {
    flickrPhotoSearch(currentDestination.title, function flickrPhotoCallback(error, photos) {
      if ( error ) {
        // TODO
      }
      else {
        try {
          var imgHtml = '';
          $.each(photos, function(index, photo) {
            imgHtml += '<img src="' + photo.url + '">';
          });
          $tab.html(imgHtml);
        }
        catch (e) {
          // TODO: no images found msg
        }
      }
    });
  });

  DestinationTabs.bindTabFunction('videos', function($tab) {
    Youtube.search(currentDestination.title, function(error, videos) {
      $tab.html(videoTemplate({videos: videos}));
    });
  });

  
  // TODO: for this test just init with Helsinki
  showDestination('/wiki/Helsinki');
});
