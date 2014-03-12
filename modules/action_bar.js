var Favorites = require('./favorites');
var Toast = require('./toast');
var autohideNav = require('./autohide_nav');
var AppHistory = require('./history');

var ActionBar = {

  init: function(options) {
    this.destination = options.destination;
    this.$el = options.$el;
    this.$menu = this.$el.find('#destinationMenu');

    autohideNav(this.$el);

    this.$el.on('tap', '.back', function(e) {
      AppHistory.gotoShortcut('closeDestination');
    });

    this.$el.on('tap', '.favoriteBtn', function(e) {
      var $btn = $(this);

      var favoriteClass = 'fa-star';
      var notFavoriteClass = 'fa-star-o';
      var isFavorite = Favorites.isFavorite(ActionBar.destination);

      if ( isFavorite ) {
        var addClass = notFavoriteClass;
        var removeClass = favoriteClass;
        var msg = ActionBar.destination.title + " removed from favorites";
        Favorites.remove(ActionBar.destination);
      }
      else {
        var addClass = favoriteClass;
        var removeClass = notFavoriteClass;
        var msg = ActionBar.destination.title + " added to favorites";
        Favorites.add(ActionBar.destination);
      }

      Toast.show(msg);

      $btn.removeClass(removeClass).addClass(addClass);
    });

    this.initMenu();
  },

  initMenu: function() {

    // Show/Hide menu

    this.$el.on('touchstart click', '.menuBtn', function(e) {
      // Need to prevent event from bubbling, because
      // otherwise the menu will be immediately closed
      // by the body event listener
      e.stopPropagation();
    })

    .on('tap', '.menuBtn', function(e) {
      if ( ActionBar.$menu.hasClass('active') ) {
        ActionBar.hideMenu();
      }
      else {
        ActionBar.showMenu();
      }
    });

    // Add listener that closes menu when user touches
    // outside of menu
    $('body').on('touchdown click', function(e) {
      if ( ActionBar.$menu.hasClass('active') ) {
        ActionBar.hideMenu();
      }
    });
  },

  showMenu: function() {
    ActionBar.$menu.addClass('active');
  },

  hideMenu: function() {
    ActionBar.$menu.removeClass('active');
  },

};

module.exports = ActionBar;
