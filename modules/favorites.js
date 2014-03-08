var Favorites = {

  init: function() {
    if ( typeof(this.favorites) === 'undefined' ) {
      this.favorites = JSON.parse(localStorage.getItem('favorites')) || {};
    }
  },

  isFavorite: function(destination) {
    this.init();
    return typeof this.favorites[destination.uri] !== 'undefined';
  },

  add: function(destination) {
    this.init();
    this.favorites[destination.uri] = destination;
    this.save();
  },

  remove: function(destination) {
    this.init();
    delete this.favorites[destination.uri];
    this.save();
  },

  save: function() {
    localStorage.setItem('favorites', JSON.stringify(this.favorites));
  },

};

module.exports = Favorites;
