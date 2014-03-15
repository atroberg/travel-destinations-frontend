var WikivoyageService= require('./wikivoyage');
var MediawikiMobileParser = require('../mediawiki_mobile_parser');
var settings = require('../settings');

// TODO: this must probably be changed to work some other way
// because we must be able to support other languages as well
// (and their base url is different)
var BASE_URL = 'http://en.m.wikivoyage.org';

var SavedPages = {

    init: function() {
      this.db = window.openDatabase('savedDestinations', '1.0', 'savedDestinations', settings.databaseInitSize);
      this.createDatabaseIfNeeded();
    },

    createDatabaseIfNeeded: function() {
      this.db.transaction(function(tx) {
        tx.executeSql('CREATE TABLE IF NOT EXISTS savedDestinations (uri unique, title, html)');
      }, function transactionError(e) {
        SavedPages.dbError(e);
      });
    },

    dbError: function(msg) {
      // TODO
      // something went wrong. Just say that offline storage not available on this device?
      console.error("DBERROR", msg);
    },

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
                options.destination.html = html;
                SavedPages.saveDestination(options.destination);

                options.callback(null, true);
              }
            });
          });
        }
      });
    },

    get: function(options) {
      this.init();

      this.db.transaction(function(tx) {

        var resultsCallback = function resultsCallback(tx, results) {

          if ( results.rows ) {
            var destinations = [];

            for ( var i = 0; i < results.rows.length; i ++ ) {
              var destination = results.rows.item(i);
              destinations.push(destination);
            }

            options.callback(null, destinations);
          }
        };

        // Return only matching row
        if ( options.uri ) {
          tx.executeSql('SELECT uri, title, html FROM savedDestinations WHERE uri=?', [options.uri], resultsCallback);
        }

        // Return all rows
        else {
          tx.executeSql('SELECT uri, title FROM savedDestinations ORDER BY title ASC', null, resultsCallback);
        }

      }, function transactionError(e) {
        SavedPages.dbError(e);
      });
    },

    deleteDestination: function(options) {

      if ( options.tx ) {
        options.tx.executeSql(
          'DELETE FROM savedDestinations WHERE uri=?',
          [options.uri],
          function rowDeleted(tx, res) {
            if ( options.callback ) {
              options.callback({success: res.rowsAffected === 1});
            }
          }
        );
      }

      else {
        this.init();

        this.db.transaction(function(tx) {
          options.tx = tx;
          SavedPages.deleteDestination(options);
        }, function transactionError(e) {
          SavedPages.dbError(e);
        });
      }
    },

    saveDestination: function(destination) {
      this.init();

      try {
        this.db.transaction(function(tx) {

          // Delete previous record (if it exists)
          SavedPages.deleteDestination({
            uri: destination.uri,
            tx: tx
          });

          tx.executeSql(
            'INSERT INTO savedDestinations (uri,title,html) VALUES (?,?,?)',
            [destination.uri, destination.title, destination.html]
          );
        }, function transactionError(e) {
          SavedPages.dbError(e);
        });
      }

      catch(e) {
        SavedPages.dbError(e);
      }
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
              var html = MediawikiMobileParser.getCleanPage(data);
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
};

module.exports = SavedPages;
window.lorem = SavedPages;
