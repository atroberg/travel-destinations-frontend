var Favorites = require('./favorites');
var Toast = require('./toast');
var autohideNav = require('./autohide_nav');

var ActionBar = {

  init: function(options) {
    this.destination = options.destination;
    this.$el = options.$el;

    autohideNav(this.$el);

    this.$el.on('tap', '.back', function(e) {
      history.back();
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
    })

    .on('tap', '.menuBtn', function(e) {
      alert(currentDestination.title);
    });
  },

};

module.exports = ActionBar;
