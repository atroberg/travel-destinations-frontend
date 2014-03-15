var WikivoyageService= require('./wikivoyage');
var MediawikiMobileParser = require('../mediawiki_mobile_parser');

// TODO: this must probably be changed to work some other way
// because we must be able to support other languages as well
// (and their base url is different)
var BASE_URL = 'http://en.m.wikivoyage.org';

var SavedPages = {

    init: function() {
      this.db = window.sqlitePlugin.openDatabase({name: 'savedDestinations'});
      this.createDatabaseIfNeeded();
    },

    closeDB: function() {
      //this.db.close();
    },

    executeSql: function(sql, data, callback) {
      this.init();

      this.db.transaction(function(tx) {

        this.executeSql(sql, data, callback);

      }, function(e) {
        console.error(e);
      });

      this.closeDB();
    },

    createDatabaseIfNeeded: function() {
      this.db.transaction(function(tx) {
        tx.executeSql(
          'CREATE TABLE IF NOT EXISTS savedDestinations (uri text primary key, title text, html text)',
          null,
          function dbCreated(rx, res) {
            console.log("DB created", res);
          }
        );
      }, function(e) {
        SavedPages.dbError(e);
      });
    },

    dbError: function(msg) {
      // TODO
      // something went wrong. Just say that offline storage not available on this device?
      console.error("DBERROR");
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

          console.log('Results callback', results);
          console.log(results.rows.item(0));

          if ( results.rows ) {

            var destinations = [];

            for ( var i = 0; i < results.rows.length; i ++ ) {
              var destination = results.rows.item(i);
              destinations.push(destination);
            }

            console.log(destinations);

            options.callback(null, destinations);
          }
        };

        // Return only matching row
        if ( options.uri ) {
          console.log('URI=' + options.uri);
          tx.executeSql('SELECT uri, title, html FROM savedDestinations WHERE uri=?', [options.uri], resultsCallback);
        }

        // Return all rows
        else {
          tx.executeSql('SELECT uri, title FROM savedDestinations ORDER BY title ASC', null, resultsCallback);
        }

      },function(e) {
        console.error(e);
      });

      this.closeDB();
    },

    deleteDestination: function(options) {

      if ( options.tx ) {
        options.tx.executeSql(
          'DELETE FROM savedDestinations WHERE uri = ?',
          [options.uri],
          function rowDeleted(tx, res) {
            console.log("Row deleted", res);
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

        }, function(e) {
          console.error(e);
        });

        this.closeDB();

      }
    },

    saveDestination: function(destination) {
      this.init();

      console.log("Save: ", destination);

      try {
        this.db.transaction(function(tx) {

          SavedPages.deleteDestination({
            uri: destination.uri,
            tx: tx
          });

          //destination.html = destination.html.substring(0, Math.round(destination.html.length / 2));

          tx.executeSql(
            'INSERT INTO savedDestinations (uri,title,html) VALUES (?,?,?)',
            [destination.uri, destination.title, destination.html],
            function rowInserted(tx, res) {
              console.log("Row inserted ", res);
            }
          );
        }, function(e) {
          console.error(e);
        });
      }
      catch(e) {
        console.error(e);
      }

      this.closeDB();
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
};

module.exports = SavedPages;
window.lorem = SavedPages;
