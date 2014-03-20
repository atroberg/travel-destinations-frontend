var Photos = require('./subviews/photos');
var Videos = require('./subviews/videos');
var Weather = require('./subviews/weather');
var Wikivoyage = require('./subviews/wikivoyage');
var Nearby = require('./subviews/nearby');

var DestinationTabs = require('../destination_tabs');
var AppHistory = require('../history');
var ActionBar = require('./subviews/action_bar');
var Favorites = require('../data_services/favorites');
var RecentlyViewed = require('../data_services/recently_viewed');
var settings = require('../settings');
var Map = require('../map');

var ajaxErrorTemplate = require('../../templates/ajax_failed.hbs');
var destinationTemplate = require('../../templates/destination.hbs');


var Destination = {

  init: function(options) {

    this.$el = options.$el;
    this.destination = {};

    AppHistory.addPopHandler('loadDestination', function(state) {

      var options = {
        addHistoryEntry:false,
        state: state.wikivoyageState,
        nearbyHtml: state.nearbyHtml,
      };

      Destination.show(state.url, options);
    });

    // Tabs
    DestinationTabs.setElement(this.$el);
    DestinationTabs.setDestinationObject(this);

    var onError = function onError(e) {
      Destination.showAjaxFailed();
    };

    DestinationTabs.bindTabFunction('wikivoyage', function($tab) {
      Wikivoyage.activate({
        $el: $tab,
        Destination: Destination
      });

      // Ensure we never show photos for prev destinations
      Photos.clear();

      Wikivoyage.showDestination({
        destination: Destination.destination,
        onError: onError,
        pageLoaded: function() {
          // We need to parse climate table from wikivoyage html
          // already at this stage, because otherwise we might not
          // be able to access the DOM when weather tab is loaded
          // (because the DOM is removed and instead just the html
          // is preserved when changing tabs)
          Weather.setClimateTable($tab);

          Photos.setWikiPhotos($tab);
          Destination.destination.photos = Photos.wikiPhotos;
          Destination.destination.firstP = $tab.find('p:first').text();

          // Add to recently viewed
          // not added in Wikivoyage.show-function, because we want to
          // include images and those are available only after wikivoyage is loaded
          RecentlyViewed.add(Destination.destination);

          Map.setCoordinates({
            destination: Destination.destination,
            $el: $tab
          });
        },
      });
    });

    // Photo tab
    DestinationTabs.bindTabFunction('photos', function($tab) {
      Photos.activate({
        $el: $tab,
        keyword: Destination.getTitle(),
        onError: onError,
      });
    });

    // Video tab
    DestinationTabs.bindTabFunction('videos', function($tab) {
      Videos.activate({
        $el: $tab,
        keyword: Destination.getTitle(),
        onError: onError,
      });
    });

    // Weather tab
    DestinationTabs.bindTabFunction('weather', function($tab) {
      Weather.activate({
        $el: $tab,
        keyword: Destination.getTitle(),
        onError: onError,
      });
    });

    // Nearby tab
    DestinationTabs.bindTabFunction('nearby', function($tab) {
      Nearby.activate({
        $el: $tab,
        Destination: Destination,
        onError: onError,
      });
    });

  },

  updateView: function() {
    this.$el.html(destinationTemplate({
      destination:{
        title: Destination.getTitle(),
        isFavorite: Favorites.isFavorite(Destination.destination),
      }
    }));
    ActionBar.init({
      $el: this.$el,
      Destination: Destination
    });
  },

  getTitle: function() {
    return this.destination.title;
  },

  activate: function() {
    // If already activated
    if ( this.$el.hasClass('active') ) {
      return;
    }

    this.$el.addClass('animate active');
    setTimeout(function(){
      Destination.$el.removeClass('animate');
    }, settings.animationDurations.page);
  },

  deactivate: function() {
    this.$el.attr('class', 'animate');

    setTimeout(function(){
      Destination.$el.off().html('');
      Destination.$el.removeClass('animate');
    }, settings.animationDurations.page);
  },

  show: function(path, options) {
    options = options || {};
    options.addHistoryEntry = typeof options.addHistoryEntry !== 'undefined'
                                ? options.addHistoryEntry
                                : true;

    Wikivoyage.setState(options.state);

    this.activate();

    this.setDestinationFromPath(path);

    DestinationTabs.init();

    this.updateView();

    // Back history management
    if ( options.addHistoryEntry ) {
      AppHistory.push({url:path, popHandler: 'loadDestination'}, Destination.destination.title);
    }


    if ( options.nearbyHtml ) {
      var initTab = 4;
      Nearby.setCached(options.nearbyHtml);
      // Need to clear wiki photos and weather, because wikivoyage tab hasn't
      // loaded and therefore some info is still from previous page
      Photos.clear();
      Weather.clearClimateTable();
    }
    else {
      var initTab = 0;
      Nearby.clearCached();
    }

    // Init tab
    DestinationTabs.focusToTab(initTab, {forceRefresh: true, forceAnalyticsTrack: true});
  },

  setDestinationFromPath: function(path) {

    // Ensure we are using mobile wikivoyage
    path = path.replace(/\/\/en\.wikivoyage\.org/, '//en.m.wikivoyage.org');

    Destination.destination.uri = path;

    var parts = path.split('/');
    var pagePart = parts[parts.length - 1];

    var baseURI = parts[0] + '/' + parts[1] + '/' + parts[2];

    Destination.baseURI = baseURI;

    Destination.destination.title = decodeURIComponent(pagePart.replace(/^\/wiki\//, '').replace(/_/g, ' '));
  },

  showAjaxFailed: function() {
    var html = ajaxErrorTemplate();
    var $activeTab = this.$el.find('#destination_tabs > .tab:eq('
                        + DestinationTabs.currentTab + ')');
    $activeTab.html(html);

    $activeTab.on('tap', '.retryBtn', function(e) {
      $activeTab.html('<p class="ajax_loading"><i class="ajax_spinner fa fa-spinner fa-spin"></i></p>');
      DestinationTabs.focusToTab(DestinationTabs.currentTab, {forceRefresh: true});
    });
  },

};

module.exports = Destination;
