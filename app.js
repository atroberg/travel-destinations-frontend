var loadDestination = require('./modules/load_destination');
var DestinationTabs = require('./modules/destination_tabs');
var flickrPhotoSearch = require('./modules/flickr_photo_search');
var Youtube = require('./modules/youtube_videos');
var videoTemplate = require('./templates/videos.hbs');
var weatherTemplate = require('./templates/weather.hbs');
var Weather = require('./modules/weather');
var moment = require('moment');
var settings = require('./modules/settings');

$(document).ready(function initApp() {
  var currentDestination = {};
  var $destination = $('#destination');

  // History management
  window.onpopstate = function(event) {
    if ( event.state ) {
      showDestination(event.state.url, {addHistoryEntry:false});
    }
  };

  // Reference to climateTable that is parsed
  // from the wikivoyage article. It's a bit ugly
  // to have kind of a "global" variable, but the
  // current architecture doesn't allow better solutions?
  var climateTable;

  function showDestination(path, options) {

    options = options || {};
    options.addHistoryEntry = typeof options.addHistoryEntry !== 'undefined'
                                ? options.addHistoryEntry
                                : true;

    currentDestination.title = decodeURIComponent(path.replace(/^\/wiki\//, '').replace(/_/g, ' '));

    // Back history management
    if ( options.addHistoryEntry ) {
      history.pushState({url:path}, currentDestination.title);
    }

    loadDestination($destination, path, currentDestination.title, function wikivoyageLoaded() {
      // We need to parse climate table from wikivoyage html
      // already at this stage, because otherwise we might not
      // be able to access the DOM when weather tab is loaded
      // (because the DOM is removed and instead just the html
      // is preserved when changing tabs)
      try {
        climateTable = Weather.getClimateTable($destination);
      }
      catch(e) {
        console.log(e);
      }
    });
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

  // Need to prevent drag event from firing tab change multiple times
  var tabSwitchRequested = false;
  $destination.hammer().on('dragleft dragright', '#destination_tabs', function(e) {
    e.gesture.preventDefault();

    if ( !tabSwitchRequested && e.gesture.velocityX > settings.tabSwipeVelocity ) {

      if ( e.gesture.direction === 'left' ) {
        DestinationTabs.nextTab();
      }
      else {
        DestinationTabs.prevTab();
      }

      tabSwitchRequested = true;
    }
  })
  .on('dragend', function(e) {
    tabSwitchRequested = false;
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

  DestinationTabs.bindTabFunction('weather', function($tab) {
    Weather.getForecast({
      q: currentDestination.title,
      callback: function(error, forecastList) {
        $.each(forecastList, function(i, day) {
          day.dayLabel = moment.unix(day.dt).format('ddd D.M');
          day.temp.day = Math.round(day.temp.day);
          day.temp.night = Math.round(day.temp.night);
        });
        $tab.html(weatherTemplate({
          forecast: forecastList,
          climateTable: climateTable,
        }));
      },
    });
  }),


  // TODO: for this test just init with Helsinki
  showDestination('/wiki/Berne');
});
