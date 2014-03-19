var DestinationHelper = require('../destination_helper');
var settings = require('../settings');

var RecentlyViewed = {

  init: function() {
    if ( typeof(this.destinations) === 'undefined' ) {
      this.destinations = JSON.parse(localStorage.getItem('recentlyViewed')) || [];
    }
  },

  get: function() {
    this.init();

    var destinations = $.extend([], this.destinations);

    destinations.reverse();

    return destinations;
  },

  add: function(destination) {

    destination = DestinationHelper.getDestinationForStoring(destination);

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
