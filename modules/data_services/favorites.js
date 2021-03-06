var DestinationHelper = require('../destination_helper');

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
    this.favorites[destination.uri] = DestinationHelper.getDestinationForStoring(destination);
    this.save();
  },

  remove: function(destination) {

    var uri = typeof destination === 'string' ? destination : destination.uri;

    this.init();
    delete this.favorites[uri];
    this.save();
  },

  save: function() {
    localStorage.setItem('favorites', JSON.stringify(this.favorites));
  },

  // Return all favorites
  get: function() {
    this.init();

    // We need to return a sorted array
    var sortedFavorites = [];

    $.each(this.favorites, function(uri, item) {
      item.uri = uri;
      sortedFavorites.push(item);
    });

    sortedFavorites.sort(function(a, b) {
      if ( a.title < b.title ) {
        return -1;
      }
      if ( a.title > b.title ) {
        return 1;
      }
      else {
        return 0;
      }
    });

    return sortedFavorites;
  },

};

module.exports = Favorites;
