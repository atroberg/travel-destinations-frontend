var settings = require('./settings');

var Map = {

    setCoordinates: function(options) {
      this.destination = options.destination;

      try {
        var coordinates = options.$el.find('#geodata').text().split(';');
        var latitude = parseFloat(coordinates[0]);
        var longitude = parseFloat(coordinates[1]);

        this.coordinates = {
          latitude: latitude,
          longitude: longitude
        };
      }
      catch(e) {
        // Coordinates not found, use title instead
        this.coordinates = null;
      }
    },

    getCoordinates: function() {
      return this.coordinates;
    },

    openExternalApp: function() {
      if ( this.coordinates ) {
        var url = 'geo:' + this.coordinates.latitude + ',' + this.coordinates.longitude
                    + '?z=' + settings.map.defaultZoomLevel;
                    //+ '?q=' + this.coordinates.latitude + ',' + this.coordinates.longitude
                    //+ '(' + encodeURIComponent(this.destination.title) + ')'
                    //+ '&z=' + settings.map.defaultZoomLevel;
      }
      else {
        var url = 'geo:?q=' + encodeURIComponent(this.destination.title);
      }
      window.open(url, '_system');
    },

};

module.exports = Map;
