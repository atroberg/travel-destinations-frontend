var frontpageTemplate = require('../../templates/frontpage.hbs');
var destinationsTemplate = require('../../templates/frontpage_destination_list.hbs');

var settings = require('../settings');
var AppHistory = require('../history');
var Destination = require('./destination');
var Search = require('../search');
var DestinationList = require('./destination_list');

var Popular = require('../data_services/popular');
var Featured = require('../data_services/featured');
var Favorites = require('../data_services/favorites');
var RecentlyViewed = require('../data_services/recently_viewed');
var SavedPagesDataProvider = require('../data_services/saved_pages');

var Frontpage = {

  currentTab: 0,

  init: function($frontpage) {
    if ( $frontpage ) {
      this.$frontpage = $frontpage;
    }
    this.updateView();
    this.menu.init();
    this.initSwipeTabs();
    this.initSearch();
    this.initEventHandlers();
  },

  initEventHandlers: function() {
    this.$frontpage.on('tap', '.destination', function(e) {
      Frontpage.openDestination($(this).attr('data-url'));
    });
    this.$frontpage.on('tap', '#featuredDestinations .retryBtn', function(e) {
      Frontpage.updateViewFeatured();
    });
  },

  openDestination: function(url) {
    AppHistory.addPopHandler('closeDestination', function() {
      Frontpage.activate();
      Destination.deactivate();
    });

    AppHistory.push({popHandler: 'closeDestination'}, 'Frontpage', {shortcut: 'closeDestination'});

    Frontpage.deactivate();
    Destination.show(url);
  },

  initSearch: function() {
    Search.init({
      $el: this.$frontpage.find('.searchInput'),
      Frontpage: Frontpage,
    });
  },

  activate: function() {
    this.init();
    this.$frontpage.removeClass('inactive');
  },

  deactivate: function() {
    setTimeout(function() {
      Frontpage.$frontpage.addClass('inactive');
      Frontpage.$frontpage.off().html('');
    }, settings.animationDurations.page);
  },

  updateViewFeatured: function() {

    var $el = Frontpage.$frontpage.find('#featuredDestinations');

    // Show loading
    $el.html('<p class="ajax_loading"><i class="ajax_spinner fa fa-spinner fa-spin"></i></p>');

    Featured.get(function(error, featured) {

      if (error) {
        $el.html(require('../../templates/ajax_failed.hbs')());
      }
      else {
        // TODO: ensure frontpage is active while inserting the DOM
        var html = destinationsTemplate({destinations: featured});
        $el.html(html);
      }
    });
  },

  updateView: function() {

    var favorites = Favorites.get();
    if ( favorites.length > settings.frontpage.destinationListLimit ) {
      var favoritesCount = favorites.length;
      favorites = favorites.slice(0, settings.frontpage.destinationListLimit);
    }
    else {
      var favoritesCount = null;
    }

    var recent = RecentlyViewed.get();
    if ( recent.length > settings.frontpage.destinationListLimit ) {
      recent = recent.slice(0, settings.frontpage.destinationListLimit);
    }

    var html = frontpageTemplate({

      recent: destinationsTemplate({
        destinations: recent,
        noDestinationsMsg: "Your recently viewed destinations will appear here.",
      }),

      favorites: destinationsTemplate({
        destinations: favorites,
        destinationCount: favoritesCount,
        dataAction: 'favorites',
        noDestinationsMsg: "You don't currently have any favorited destinations."
                            + " You can add destinations to your favorites by clicking"
                            + " the star icon on a destination's page.",
      }),

    });
    this.$frontpage.html(html);

    this.updateViewFeatured();
  },

  addDestinationListHistory: function() {
    AppHistory.addPopHandler('closeDestinationList', function() {
      Frontpage.activate();
      DestinationList.deactivate();
    });
    AppHistory.push({popHandler: 'closeDestinationList'}, 'Frontpage', {shortcut: 'closeDestinationList'});
  },

  menu: {
    isVisible: false,

    init: function() {
      Frontpage.$frontpage.on('tap', 'nav .menuBtn', this.show);
      Frontpage.$frontpage.on('touchstart click', '.overlay', function(e) {
        if ( Frontpage.menu.isVisible ) {
          Frontpage.menu.hide();
        }
      });
      this.initActions();
    },

    actions: {
      savedPages: function() {
        Frontpage.addDestinationListHistory();
        Frontpage.menu.hide();
        Frontpage.deactivate();

        DestinationList.activate({
          title: 'Saved Pages',
          getDestinations: function(callback) {
            SavedPagesDataProvider.get({
              callback: function(error, destinations) {
                callback(error, destinations);
              },
            });
          },
          deleteDestination: function(uri, callback) {
            SavedPagesDataProvider.deleteDestination({
              uri: uri,
              callback: function(result) {
                callback(null, result.success);
              }
            })
          },
          noDestinations: {
            title: 'No Saved Pages',
            text: "You can save pages from the menu when you are viewing a destination."
                  + " Saved pages are available also when you don't have internet connectivity.",
          }
        });
      },

      destinationFinder: function() {
        // TODO: will be implemented later
      },

      favorites: function() {
        Frontpage.addDestinationListHistory();
        Frontpage.menu.hide();
        Frontpage.deactivate();

        DestinationList.activate({
          title: 'Favorites',
          getDestinations: function(callback) {
            callback(null, Favorites.get());
          },
          deleteDestination: function(uri, callback) {
            Favorites.remove(uri);
            callback(null, true);
          },
          noDestinations: {
            title: 'No Favorites',
            text: "You can favorite destinations by clicking the star icon on a destination's page.",
          }
        });
      },

      popular: function() {
        Frontpage.addDestinationListHistory();
        Frontpage.menu.hide();
        Frontpage.deactivate();

        DestinationList.activate({
          title: 'Popular',
          getDestinations: function(callback) {
            Popular.get(function(error, popular) {
              callback(error, popular);
            });
          }
        });
      },
    },

    initActions: function() {
      Frontpage.$frontpage.on('tap', '#drawerMenu i', function(e) {
        var action = $(this).attr('data-action');

        if ( action && Frontpage.menu.actions[action] ) {
          Frontpage.menu.actions[action]();
        }
      });
    },

    show: function() {
      Frontpage.$frontpage.addClass('menuActive');

      // Need timeout, because otherwise menu will immediately
      // hide again (see event binded to .overlay)
      setTimeout(function() {
        Frontpage.menu.isVisible = true;
      }, 200);
    },

    hide: function() {
      Frontpage.$frontpage.removeClass('menuActive');
      Frontpage.menu.isVisible = false;
    },
  },

  initSwipeTabs: function() {

    // Remember which tab was active
    if ( this.currentTab > 0 ) {
      this.focusToTab(this.currentTab, true);
    }

    this.tabCount = this.$frontpage.find('#frontpage_tabs .tab').length;

    this.$frontpage.on('tap', '#frontpage_tabs_menu li', function(e) {
      Frontpage.focusToTab($(this).index());
    });

    this.$frontpage.on('dragleft dragright', function(e) {
      e.gesture.preventDefault();
    })
    .on('swipeleft', function(e) {
      Frontpage.focusToTab(Frontpage.currentTab + 1);
    })
    .on('swiperight', function(e) {
      Frontpage.focusToTab(Frontpage.currentTab - 1);
    });

    this.$frontpage.on('tap', '.seeAllBtn', function(e) {
      var action = $(this).attr('data-action');

      if ( action && Frontpage.menu.actions[action] ) {
        Frontpage.menu.actions[action]();
      }
    });
  },

  focusToTab: function(index, force) {

    var force = typeof force === 'undefined' ? false : force;

    if ( index < 0) {
      index = 0;
    }
    else if ( index > this.tabCount - 1) {
      index = this.tabCount - 1;
    }

    if ( force ) {
      this.$frontpage.find('#frontpage_tabs').addClass('noAnimation');
    }
    else if ( index === this.currentTab ) {
      return;
    }

    this.$frontpage.find('#frontpage_tabs_menu li.active').removeClass('active');
    this.$frontpage.find('#frontpage_tabs_menu li:eq(' + index + ')').addClass('active');

    var tabCount = this.$frontpage.find('#frontpage_tabs .tab').length;
    var xpos = -(100 / tabCount * index) + '%';
    this.$frontpage.find('#frontpage_tabs').css('transform', 'translate3d(' + xpos + ',0,0)');

    var $prevTab = this.$frontpage.find('#frontpage_tabs .tab:eq(' + this.currentTab + ')');

    if ( force ) {
      this.$frontpage.find('#frontpage_tabs').removeClass('noAnimation');
    }
    else {
      setTimeout(function() {
        $prevTab.removeClass('active');
      }, settings.animationDurations.tabs);
    }

    this.$frontpage.find('#frontpage_tabs .tab:eq(' + index + ')').addClass('active');

    this.currentTab = index;
  },

};

module.exports = Frontpage;
