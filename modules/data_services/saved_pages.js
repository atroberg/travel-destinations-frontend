var WikivoyageService= require('./wikivoyage');
var MediawikiMobileParser = require('../mediawiki_mobile_parser');

// TODO: this must probably be changed to work some other way
// because we must be able to support other languages as well
// (and their base url is different)
var BASE_URL = 'http://en.m.wikivoyage.org';

var SavedPages = {

    save: function(options) {
      // Save only wikivoyage
      this.getWikivoyagePage(options.destination.uri, function(error, html) {
        if ( error ) {
          options.callback(error);
        }
        else {
          // Replace all photos with dataURL
          var images = html.match(/src="(https?:)\/\/[^"]+\.(jpe?g|gif|png)"/gi);
          var handledImages = 0;

          $.each(images, function(i, img)  {
            var src = img.substring('src="'.length, img.length - 1);

            SavedPages.imageToDataURL(src, function(error, dataURL) {
              handledImages += 1;

              if (typeof dataURL !== 'undefined') {
                html = html.replace(src, dataURL);
              }

              // All images processed
              if ( handledImages >= images.length ) {
                var keyName = SavedPages.storeOnDisk({
                  uri: options.destination.uri,
                  type: 'wikivoyage',
                  data: html,
                });

                SavedPages.index.addDestination({
                  destination: options.destination,
                  keyName: keyName
                });

                options.callback(null, true);
              }
            });
          });
        }
      });
    },

    get: function(options) {

      // Destination provided => add additional fields etc
      if ( options.savedDestination ) {
        var savedDestination = options.savedDestination;
      }
      // Destination not provided => need to fetch all and
      // search for matching destination
      else {
        var savedDestinations = this.index.getDestinations();

        if ( savedDestinations[options.destination.uri] ) {
          var savedDestination = savedDestinations[options.destination.uri];
        }
        else {
          throw 'not_found';
        }
      }

      savedDestination = $.extend(savedDestination, {});
      savedDestination.html = localStorage.getItem(savedDestination.html);
      return savedDestination;
    },

    getAll: function() {
      var savedDestinationsIndex = this.index.getDestinations();

      var savedDestinations = [];

      $.each(savedDestinationsIndex, function(key, destination) {
        savedDestinations.push(SavedPages.get({
          savedDestination: destination
        }));
      });

      return savedDestinations;
    },

    storeOnDisk: function(options) {
      var keyName = 'savedPage_' + options.type + '_' + options.uri;
      localStorage.setItem(keyName, options.data);
      return keyName;
    },

    getWikivoyagePage: function(uri, callback) {
      WikivoyageService.get({
        url: BASE_URL + uri,
        callback: function(error, data) {
          if ( error ) {
            callback(error);
          }
          else {
            try {
              var parser = MediawikiMobileParser.setHtml(data).getActualContent()
                            .removeBanner().removeEmptySections();
              var html = parser.getHtml();

              callback(null, html);
            }
            catch(e) {
              callback(e);
            }
          }
        },
      });
    },

    imageToDataURL: function(src, callback) {

      if ( typeof this.canvas === 'undefined' ) {
        this.canvas = document.createElement('canvas');
      }

      var context = this.canvas.getContext('2d');

      var img = new Image();
      img.src = src;
      img.onload = function() {
        // Make sure canvas is clean (adjusting dimensions will clean it)
        SavedPages.canvas.width = img.width;
        SavedPages.canvas.height = img.height;

        context.drawImage(img, 0, 0);

        if ( img.src.match(/\.jpe?g/i) ) {
          var mime = 'image/jpeg';
        }
        else {
          var mime = 'image/png';
        }

        callback(null, SavedPages.canvas.toDataURL(mime));
      };
      img.onerror = function(e) {
        callback(e);
      };

    },

    index: {
      localStorageKey: 'savedDestinations',

      addDestination: function(options) {
        this.getDestinations();
        this.savedDestinations[options.destination.uri] = {
          html: options.keyName,
          destination: options.destination
        };
        this.save();
      },

      save: function() {
        localStorage.setItem(this.localStorageKey, JSON.stringify(this.savedDestinations));
      },

      getDestinations: function() {
        var savedDestinations = JSON.parse(localStorage.getItem(this.localStorageKey));

        if ( savedDestinations === null ) {
          savedDestinations = {};
        }

        this.savedDestinations = savedDestinations;

        return savedDestinations;
      },
    },

};

module.exports = SavedPages;
