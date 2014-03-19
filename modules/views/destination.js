var Photos = require('./subviews/photos');
var Videos = require('./subviews/videos');
var Weather = require('./subviews/weather');
var Wikivoyage = require('./subviews/wikivoyage');

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
      Destination.show(state.url, {addHistoryEntry:false, state: state.wikivoyageState});
    });

    // Tabs
    DestinationTabs.setElement(this.$el);

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
          var $wikivoyageTab = Destination.$el.find('#wikivoyage_tab');
          Weather.setClimateTable($wikivoyageTab);

          Photos.setWikiPhotos($wikivoyageTab);
          Destination.destination.photos = Photos.wikiPhotos;
          Destination.destination.firstP = $wikivoyageTab.find('p:first').text();

          // Add to recently viewed
          // not added in Wikivoyage.show-function, because we want to
          // include images and those are available only after wikivoyage is loaded
          RecentlyViewed.add(Destination.destination);

          Map.setCoordinates({
            destination: Destination.destination,
            $el: $wikivoyageTab
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
      destination: Destination.destination
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
    this.$el.removeClass('active');
    this.$el.addClass('animate');
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

    // Init default tab
    DestinationTabs.focusToTab(0, {forceRefresh: true});

  },

  setDestinationFromPath: function(path) {
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
    $activeTab.addClass('loadingFailed');
    $activeTab.html(html);

    $activeTab.on('tap', '.retryBtn', function(e) {
      DestinationTabs.focusToTab(DestinationTabs.currentTab, {forceRefresh: true});
    });
  },

};

module.exports = Destination;
