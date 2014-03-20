var NearbyDataProvider = require('../../data_services/nearby');
var template = require('../../../templates/nearby_tab.hbs');
var Map = require('../../map');
var AppHistory = require('../../history');

var Nearby = {

  activate: function(options) {
    this.$el = options.$el;
    this.Destination = options.Destination;
    this.initEventHandlers();

    // If user navigates back, the nearby places
    // are already stored in the history
    if ( this.html ) {
      this.$el.html(this.html);
    }

    // Need to actually fetch the nearby places
    else {
      var coordinates = Map.getCoordinates();

      if ( coordinates ) {

        NearbyDataProvider.get(coordinates, function(error, nearbyDestinations) {

          if ( error ) {
            options.onError();
            return;
          }

          var destinations = [];

          // Make sure we don't show the current destination in the nearby list
          $.each(nearbyDestinations, function(i, destination) {
            if ( destination.title !== Nearby.Destination.destination.title ) {
              destinations.push(destination);
            }
          });

          var html = template({
            destinations: destinations
          });
          Nearby.$el.html(html);
        });
      }
      else {
        Nearby.$el.html(template());
      }
    }
  },

  initEventHandlers: function() {
    this.$el.on('tap', 'li > span', function(e) {
      var $li = $(this).parent();

      // Remember that this tab was activated
      AppHistory.extendState({
        nearbyHtml: Nearby.$el.html(),
      }, 'Nearby');

      Nearby.Destination.show($li.attr('data-uri'));
    });
  },

  setCached: function(html) {
    this.html = html;
  },

  clearCached: function() {
    this.html = null;
  }

};

module.exports = Nearby;
