var Photos = require('./subviews/photos');
var Videos = require('./subviews/videos');
var Weather = require('./subviews/weather');
var Wikivoyage = require('./subviews/wikivoyage');

var DestinationTabs = require('../destination_tabs');
var AppHistory = require('../history');
var ActionBar = require('./subviews/action_bar');
var Favorites = require('../favorites');
var settings = require('../settings');
var Map = require('../map');

var destinationTemplate = require('../../templates/destination.hbs');


var Destination = {

  init: function(options) {

    this.$el = options.$el;
    this.destination = {};

    AppHistory.addPopHandler('loadDestination', function(state) {
      Destination.show(state.url, {addHistoryEntry:false});
    });

    // Tabs
    DestinationTabs.setElement(this.$el);
    this.$el.on('tap', 'nav #tabs_menu li', function(e) {
      DestinationTabs.focusToTab($(this).index());
    });
    this.$el.trobisHammer().on('trobisHammer.swiperight', function(e) {
      DestinationTabs.nextTab();
    })
    .on('trobisHammer.swipeleft', function(e) {
      DestinationTabs.prevTab();
    });

    // Photo tab
    DestinationTabs.bindTabFunction('photos', function($tab) {
      Photos.activate({
        $el: $tab,
        keyword: Destination.getTitle(),
      });
    });

    // Video tab
    DestinationTabs.bindTabFunction('videos', function($tab) {
      Videos.activate({
        $el: $tab,
        keyword: Destination.getTitle(),
      });
    });

    // Weather tab
    DestinationTabs.bindTabFunction('weather', function($tab) {
      Weather.activate({
        $el: $tab,
        keyword: Destination.getTitle(),
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
    this.$el.addClass('animate active');
    setTimeout(function(){
      Destination.$el.removeClass('animate');
    }, settings.animationDurations.page);
  },

  deactivate: function() {
    this.$el.removeClass('active');
    this.$el.addClass('animate');
    setTimeout(function(){
      Destination.$el.removeClass('animate');
    }, settings.animationDurations.page);
  },

  show: function(path, options) {
    options = options || {};
    options.addHistoryEntry = typeof options.addHistoryEntry !== 'undefined'
                                ? options.addHistoryEntry
                                : true;

    this.activate();

    DestinationTabs.init();

    // TODO: fix URI
    Destination.destination.uri = path;
    Destination.destination.title = decodeURIComponent(path.replace(/^\/wiki\//, '').replace(/_/g, ' '));

    this.updateView();

    // Back history management
    if ( options.addHistoryEntry ) {
      AppHistory.push({url:path, popHandler: 'loadDestination'}, Destination.destination.title);
    }

    // Init default tab (Wikivoyage)
    Wikivoyage.activate({
      $el: this.$el.find('#wikivoyage_tab'),
      Destination: this
    });

    Wikivoyage.showDestination({
      destination: this.destination,
      pageLoaded: function() {
        // We need to parse climate table from wikivoyage html
        // already at this stage, because otherwise we might not
        // be able to access the DOM when weather tab is loaded
        // (because the DOM is removed and instead just the html
        // is preserved when changing tabs)
        var $wikivoyageTab = Destination.$el.find('#wikivoyage_tab');
        Weather.setClimateTable($wikivoyageTab);
        Photos.setWikiPhotos($wikivoyageTab);
        Map.setCoordinates({
          destination: Destination.destination,
          $el: $wikivoyageTab
        });
      },
    });

  }

};

module.exports = Destination;
