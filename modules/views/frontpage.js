var frontpageTemplate = require('../../templates/frontpage.hbs');
var destinationsTemplate = require('../../templates/frontpage_destination_list.hbs');

var settings = require('../settings');
var AppHistory = require('../history');
var Destination = require('./destination');
var SavedPages = require('./saved_pages');
var Search = require('../search');
var Favorites = require('../data_services/favorites');
var RecentlyViewed = require('../data_services/recently_viewed');
var FavoritesPage = require('./favorites');


var Frontpage = {

  init: function($frontpage) {
    if ( $frontpage ) {
      this.$frontpage = $frontpage;
    }
    this.updateView();
    this.menu.init();
    this.initSwipeTabs();
    this.initSearch();

    this.$frontpage.on('tap', '.destination', function(e) {
      Frontpage.openDestination($(this).attr('data-url'));
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
        AppHistory.addPopHandler('closeSavedPages', function() {
          Frontpage.activate();
          SavedPages.deactivate();
        });
        AppHistory.push({popHandler: 'closeSavedPages'}, 'Frontpage', {shortcut: 'closeSavedPages'});

        Frontpage.menu.hide();
        Frontpage.deactivate();
        SavedPages.activate();
      },

      destinationFinder: function() {
        // TODO: will be implemented later
      },

      favorites: function() {
        AppHistory.addPopHandler('closeFavorites', function() {
          Frontpage.activate();
          FavoritesPage.deactivate();
        });
        AppHistory.push({popHandler: 'closeFavorites'}, 'Frontpage', {shortcut: 'closeFavorites'});

        Frontpage.menu.hide();
        Frontpage.deactivate();
        FavoritesPage.activate();
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
    this.currentTab = 0;
    this.tabCount = this.$frontpage.find('#frontpage_tabs .tab').length;

    this.$frontpage.on('tap', '#frontpage_tabs_menu li', function(e) {
      Frontpage.focusToTab($(this).index());
    });

    this.$frontpage.trobisHammer().on('trobisHammer.swiperight', function(e) {
      Frontpage.focusToTab(Frontpage.currentTab + 1);
    })
    .on('trobisHammer.swipeleft', function(e) {
      Frontpage.focusToTab(Frontpage.currentTab - 1);
    });

    this.$frontpage.on('tap', '.seeAllBtn', function(e) {
      var action = $(this).attr('data-action');

      if ( action && Frontpage.menu.actions[action] ) {
        Frontpage.menu.actions[action]();
      }
    });
  },

  focusToTab: function(index) {
    if ( index < 0) {
      index = 0;
    }
    else if ( index > this.tabCount - 1) {
      index = this.tabCount - 1;
    }

    if ( index === this.currentTab ) return;

    this.$frontpage.find('#frontpage_tabs_menu li.active').removeClass('active');
    this.$frontpage.find('#frontpage_tabs_menu li:eq(' + index + ')').addClass('active');

    var tabCount = this.$frontpage.find('#frontpage_tabs .tab').length;
    var xpos = -(100 / tabCount * index) + '%';
    this.$frontpage.find('#frontpage_tabs').css('transform', 'translate3d(' + xpos + ',0,0)');

    var $prevTab = this.$frontpage.find('#frontpage_tabs .tab:eq(' + this.currentTab + ')');

    setTimeout(function() {
      $prevTab.removeClass('active');
    }, settings.animationDurations.tabs);

    this.$frontpage.find('#frontpage_tabs .tab:eq(' + index + ')').addClass('active');

    this.currentTab = index;
  },

};

module.exports = Frontpage;
