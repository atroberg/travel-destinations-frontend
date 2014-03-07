var Favorites = require('./favorites');

var ActionBar = {

  init: function($actionBar) {
    this.$actionBar = $actionBar;

    this.$actionBar.on('tap', '.favoriteBtn', function(e) {
      var $btn = $(this);

      var favoriteClass = 'fa-star';
      var notFavoriteClass = 'fa-star-o';
      var isFavorite = $btn.hasClass(favoriteClass);

      if ( isFavorite ) {
        var addClass = notFavoriteClass;
        var removeClass = favoriteClass;
      }
      else {
        var addClass = favoriteClass;
        var removeClass = notFavoriteClass;
      }

      $btn.removeClass(removeClass).addClass(addClass);
    })

    .on('tap', '.menuBtn', function(e) {

    });
  },

};

module.exports = ActionBar;
