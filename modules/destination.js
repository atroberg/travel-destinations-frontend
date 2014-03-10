var loadDestination = require('./load_destination');
var DestinationTabs = require('./destination_tabs');
var Photos = require('./photos');
var Videos = require('./videos');

var Weather = require('./weather');
var moment = require('moment');
var settings = require('./settings');
var AppHistory = require('./history');
var ActionBar = require('./action_bar');

var Destination = {

  init: function($destination) {

    this.$destination = $destination;
    this.destination = {};

    ActionBar.init(this.destination, $destination);

    AppHistory.addPopHandler('loadDestination', function(state) {
      Destination.show(state.url, {addHistoryEntry:false});
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

        Destination.show(url);
      }

      // open in external browser
      else {
        window.open(url, '_system');
      }
    });

    // Accordion for wikivoyage articles
    $destination.on('tap', '#destination_content > h2', function(e) {
      var $title = $(this);
      $title.toggleClass('expanded');
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
      Photos.activate({
        $el: $tab,
        keyword: Destination.getTitle(),

        // TODO: must be better way to do this
        $wikiTab: $destination.find('#destination_content'),
      });
    });

    DestinationTabs.bindTabFunction('videos', function($tab) {
      Videos.activate({
        $el: $tab,
        keyword: Destination.getTitle(),
      });
    });

    DestinationTabs.bindTabFunction('weather', function($tab) {
      Weather.activate({
        $el: $tab,
        keyword: Destination.getTitle(),
      });
    });

  },

  getTitle: function() {
    return this.destination.title;
  },

  activate: function() {
    this.$destination.addClass('active');
  },

  deactivate: function() {
    this.$destination.removeClass('active');
  },

  show: function(path, options) {
    options = options || {};
    options.addHistoryEntry = typeof options.addHistoryEntry !== 'undefined'
                                ? options.addHistoryEntry
                                : true;

    this.activate();

    // TODO: fix URI
    Destination.destination.uri = path;
    Destination.destination.title = decodeURIComponent(path.replace(/^\/wiki\//, '').replace(/_/g, ' '));

    // Back history management
    if ( options.addHistoryEntry ) {
      AppHistory.push({url:path, popHandler: 'loadDestination'}, Destination.destination.title);
    }

    loadDestination(Destination.destination, Destination.$destination, function wikivoyageLoaded() {
      // We need to parse climate table from wikivoyage html
      // already at this stage, because otherwise we might not
      // be able to access the DOM when weather tab is loaded
      // (because the DOM is removed and instead just the html
      // is preserved when changing tabs)
      try {
        Weather.setClimateTable(Destination.$destination);
        Photos.setWikiPhotos(Destination.$destination);
      }
      catch(e) {
        console.log(e);
      }
    });

    DestinationTabs.clearCache();
  }

};

module.exports = Destination;
