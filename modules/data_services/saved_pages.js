var WikivoyageService= require('./wikivoyage');
var MediawikiMobileParser = require('../mediawiki_mobile_parser');

// TODO: this must probably be changed to work some other way
// because we must be able to support other languages as well
// (and their base url is different)
var BASE_URL = 'http://en.m.wikivoyage.org';

var SavedPages = {

    init: function() {

      if ( typeof this.storageEngine === 'undefined' ) {

        // Enable testing on computer (which doesn't have webkit-sqlite adapter)
        var adapter = typeof window.sqlitePlugin === 'undefined'
                        ? 'dom'
                        : 'webkit-sqlite';

        this.storageEngine = new Lawnchair({
          name: 'offlinePages',
          adapter: adapter,
        }, function(ref) {
          // don't need to do anything with this
        });

        window.storageEngine = this.storageEngine;

      }
    },

    save: function(options) {

      this.init();

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

                console.log("Keyname: " + keyName);

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
      this.index.getDestinations({
        callback: function(error, savedDestinations) {
          if ( savedDestinations[options.destination.uri] ) {
            var savedDestination = savedDestinations[options.destination.uri];
          }
          else {
            throw 'not_found';
          }

          SavedPages.getHtml({
            destination: savedDestination,
            callback: function(error, html) {
              savedDestination.html = html;
              options.callback(savedDestination);
            },
          });
        },
      });
    },

    getHtml: function(options) {
      console.log("Get html: " + options.destination.html);

      try {
        this.storageEngine.get(options.destination.html, function(rows) {
          var html = rows.data;
          console.log("Return: " + options.destination.html);
          options.callback(null, html);
        });
      }
      catch(e) {
        console.log(e);
      }
    },

    getAll: function(options) {
      this.init();

      this.index.getDestinations({
        callback: function(error, savedDestinationsIndex) {

          if ( $.isEmptyObject(savedDestinationsIndex) ) {
            options.callback(null, []);
          }

          var savedDestinations = [];
          var savedDestinationsCount = 0;

          $.each(savedDestinationsIndex, function(key, destination) {
            savedDestinationsCount += 1;

            SavedPages.getHtml({
              destination: destination,
              callback: function(error, html) {
                destination.html = html;
                savedDestinations.push(destination);

                console.log("target: " + savedDestinationsCount + ", now: " + savedDestinations.length);

                // All destinations fetched => return the results
                if ( savedDestinationsCount <= savedDestinations.length ) {
                  console.log(savedDestinations);
                  options.callback(null, savedDestinations);
                }
              },
            });
          });
        }
      });
    },

    storeOnDisk: function(options) {
      var keyName = 'savedPage_' + options.type + '_' + options.uri;

      try {
        this.storageEngine.save({key: keyName, data: options.data});
      }
      catch(e) {
        console.error(e);
      }

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

      addDestination: function(options) {
        this.getDestinations({
          callback: function(error, savedDestinations) {

            console.log(savedDestinations);

            savedDestinations[options.destination.uri] = {
              html: options.keyName,
              destination: options.destination,
            };

            console.log(savedDestinations);

            SavedPages.storageEngine.save({key: 'savedDestinations', data: savedDestinations});
          },
        });
      },

      getDestinations: function(options) {
        SavedPages.storageEngine.get('savedDestinations', function(rows) {

          if ( rows === null || rows.data === null ) {
            var savedDestinations = {};
          }
          else {
            var savedDestinations = rows.data;
          }

          console.log(savedDestinations);

          options.callback(null, savedDestinations);
        });
      },
    },

};

module.exports = SavedPages;
