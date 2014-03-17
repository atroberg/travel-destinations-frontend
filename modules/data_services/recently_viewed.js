var settings = require('../settings');

var RecentlyViewed = {

  init: function() {
    if ( typeof(this.destinations) === 'undefined' ) {
      this.destinations = JSON.parse(localStorage.getItem('recentlyViewed')) || [];
    }
  },

  get: function() {
    this.init();
    return this.destinations;
  },

  add: function(destination) {

    destination = $.extend({}, destination);

    // Only save 1st photo
    if ( destination.photos ) {
      destination.photo = destination.photos[0];
      delete destination.photos;
    }

    this.init();

    // Don't add destination multiple times
    if ( this.hasDestination(destination) ) {
      return;
    }

    while ( this.destinations.length >= settings.recentlyViewed.limit ) {
      this.destinations.shift();
    }

    this.destinations.push(destination);

    localStorage.setItem('recentlyViewed', JSON.stringify(this.destinations));
  },

  // Check if destination exists already in list
  hasDestination: function(destination) {

    this.init();

    for ( var i = 0; i < this.destinations.length; i ++ ) {
      var tmp = this.destinations[i];

      if ( tmp.uri === destination.uri ) {
        return true;
      }
    }

    return false;
  },

};

module.exports = RecentlyViewed;
