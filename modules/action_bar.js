var Favorites = require('./favorites');
var Toast = require('./toast');

var ActionBar = {

  init: function(destination, $destination) {
    this.destination = destination;
    this.$destination = $destination;
    var that = this;

    this.$destination.on('tap', 'nav .favoriteBtn', function(e) {
      var $btn = $(this);

      var favoriteClass = 'fa-star';
      var notFavoriteClass = 'fa-star-o';
      var isFavorite = Favorites.isFavorite(that.destination);

      if ( isFavorite ) {
        var addClass = notFavoriteClass;
        var removeClass = favoriteClass;
        var msg = that.destination.title + " removed from favorites";
        Favorites.remove(that.destination);
      }
      else {
        var addClass = favoriteClass;
        var removeClass = notFavoriteClass;
        var msg = that.destination.title + " added to favorites";
        Favorites.add(that.destination);
      }

      Toast.show(msg);

      $btn.removeClass(removeClass).addClass(addClass);
    })

    .on('tap', 'nav .menuBtn', function(e) {
      alert(currentDestination.title);
    });
  },

};

module.exports = ActionBar;
