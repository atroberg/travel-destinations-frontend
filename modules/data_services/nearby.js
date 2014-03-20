var settings = require('../settings');

var Nearby = {

  getUserPosition: function(callback) {
    navigator.geolocation.getCurrentPosition(
      function geolocationSuccess(position) {
        callback(null, position);
      },
      function geoLocationError(error) {
        callback(error);
      },
      settings.geoLocationSettings
    );
  },

  get: function(callback) {

    this.getUserPosition(function(error, position) {
      if ( error ) {
        callback(error);
      }
      else {
        var origoCoords = position.coords;

        $.ajax({
          url: 'http://en.m.wikivoyage.org/w/api.php',
          data: {
            format: 'json',
            action: 'query',
            colimit: 'max',
            prop: 'info|coordinates',
            inprop: 'url',
            generator: 'geosearch',
            ggscoord: '' + origoCoords.latitude + '|' + origoCoords.longitude,
            ggsradius: settings.nearbySearch.radius,
            ggsnamespace: 0,
            ggslimit: settings.nearbySearch.limit,
          },
          type: 'GET',
          dataType: 'json',
          success: function(data) {

            var destinations = [];

            if ( data.query && data.query.pages ) {

              $.each(data.query.pages, function(id, page) {

                var coords = {
                  latitude: page.coordinates[0].lat,
                  longitude: page.coordinates[0].lon,
                };

                var distance = Nearby.distanceBetweenTwoPoints(origoCoords, coords);

                distanceInKm = distance / 1000;
                // Round into two decimals
                distanceInKm = Math.round(distanceInKm * 10) / 10;

                destinations.push({
                  uri: page.fullurl,
                  distanceInKm: distanceInKm,
                  distance: Nearby.getShownDistance(distanceInKm),
                  title: page.title,
                });
              });
            }

            destinations = Nearby.sortDestinations(destinations);

            callback(null, destinations);
          },
          error: function(e, textStatus) {
            if ( textStatus === 'abort' ) return;
            callback('error_fetching_popular');
          }
        });
      }
    });
  },

  // Return latitude, longitude delta between two points in meters
  deltaCoordinates: function(pointA, pointB) {

    function asRadians(degrees) {
      return degrees * Math.PI / 180;
    }

    var deltaLatitude = pointB.latitude - pointA.latitude;
    var deltaLongitude = pointB.longitude - pointA.longitude;
    var latitudeCircumference = 40075160 * Math.cos(asRadians(pointA.latitude));
    var resultX = deltaLongitude * latitudeCircumference / 360;
    var resultY = deltaLatitude * 40008000 / 360;

    return {
      deltaX: resultX,
      deltaY: resultY,
    };
  },

  // Return distance between two points in meters
  distanceBetweenTwoPoints: function(pointA, pointB) {
    var delta = this.deltaCoordinates(pointA, pointB);
    return Math.sqrt( Math.pow(delta.deltaX, 2) + Math.pow(delta.deltaY, 2) );
  },

  sortDestinations: function(destinations) {
    var destinations = $.extend([], destinations);

    destinations.sort(function(a,b) {
      if ( a.distanceInKm < b.distanceInKm ) {
        return -1;
      }
      if ( a.distanceInKm > b.distanceInKm ) {
        return 1;
      }
      else {
        return 0;
      }
    });

    return destinations;
  },

  // Return the string that is actually shown to the user
  getShownDistance: function(distanceInKm) {
    // TODO: support the user's preferred unit
    return distanceInKm + ' km';
  }

};

module.exports = Nearby;
