var loadDestination = require('./modules/load_destination');
var DestinationTabs = require('./modules/destination_tabs');
var Photos = require('./modules/photos');
var Youtube = require('./modules/youtube_videos');
var videoTemplate = require('./templates/videos.hbs');
var weatherTemplate = require('./templates/weather.hbs');
var Weather = require('./modules/weather');
var moment = require('moment');
var settings = require('./modules/settings');
var AppHistory = require('./modules/history');

$(document).ready(function initApp() {

  var currentDestination = {};
  var $destination = $('#destination').hammer(settings.hammer);

  function showDestination(path, options) {
    options = options || {};
    options.addHistoryEntry = typeof options.addHistoryEntry !== 'undefined'
                                ? options.addHistoryEntry
                                : true;
    currentDestination.title = decodeURIComponent(path.replace(/^\/wiki\//, '').replace(/_/g, ' '));

    // Back history management
    if ( options.addHistoryEntry ) {
      AppHistory.push({url:path, popHandler: 'loadDestination'}, currentDestination.title);
    }

    loadDestination($destination, path, currentDestination.title, function wikivoyageLoaded() {
      // We need to parse climate table from wikivoyage html
      // already at this stage, because otherwise we might not
      // be able to access the DOM when weather tab is loaded
      // (because the DOM is removed and instead just the html
      // is preserved when changing tabs)
      try {
        Weather.setClimateTable($destination);
      }
      catch(e) {
        console.log(e);
      }
    });

    DestinationTabs.clearCache();
  }

  AppHistory.init();

  AppHistory.addPopHandler('loadDestination', function(state) {
    showDestination(state.url, {addHistoryEntry:false});
  });

  // Prevent default behavior for links
  $destination.on('click', 'a', function(e) {
    e.preventDefault();
  });
  // Handle them with the tap-event instead
  $destination.on('tap', 'a', function(e) {

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
  $destination.on('tap', '#videos_tab img', function(e) {
    window.open($(this).attr('data-href'), '_system');
  });

  // Accordion for wikivoyage articles
  $destination.on('tap', '#destination_content > h2', function(e) {
    var $title = $(this);
    $title.toggleClass('expanded');
  });

  // Fullscreen gallery functionality for photos
  AppHistory.addPopHandler('galleryFullscreen', function(state) {
    Photos.fullscreenGallery.close();
  });

  $destination.on('tap', '#photos_tab div.photo', function(e) {
    AppHistory.pushAction({popHandler:'galleryFullscreen'}, 'Photos');
    Photos.fullscreenGallery.open({$photos: $(this).parent().find('.photo'), index: $(this).index()});
  });


  // Tabs
  DestinationTabs.setElement($destination);
  $destination.on('tap', 'nav #tabs_menu li', function(e) {
    DestinationTabs.focusToTab($(this).index());
  });

  // Need to prevent drag event from firing tab change multiple times
  var tabSwitchRequested = false;
  $destination.on('dragleft dragright', function(e) {
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
    Photos.showTab({
      keyword:currentDestination.title,
      $tab:$tab,
      $wikiTab: $destination.find('#destination_content'),
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
          climateTable: Weather.climateTable,
        }));
      },
    });
  }),

  // TODO: for this test just init with Helsinki
  showDestination('/wiki/Helsinki');
});
