var Favorites = require('../../data_services/favorites');
var Toast = require('../../toast');
var SavedPages = require('../../data_services/saved_pages');
var autohideNav = require('../../autohide_nav');
var AppHistory = require('../../history');
var Map = require('../../map');
var settings = require('../../settings');


var ActionBar = {

  init: function(options) {
    this.destination = options.destination;
    this.$el = options.$el.find('nav:first');
    this.$menu = options.$el.find('#destinationMenu');

    autohideNav(this.$el);

    this.$el.on('tap', '.back', function(e) {
      AppHistory.gotoShortcut('closeDestination');
    });

    this.$el.on('tap', '.favoriteBtn', function(e) {
      var $btn = $(this);

      var favoriteClass = 'fa-star';
      var notFavoriteClass = 'fa-star-o';
      var isFavorite = Favorites.isFavorite(ActionBar.destination);

      if ( isFavorite ) {
        var addClass = notFavoriteClass;
        var removeClass = favoriteClass;
        var msg = ActionBar.destination.title + " removed from favorites";
        Favorites.remove(ActionBar.destination);
      }
      else {
        var addClass = favoriteClass;
        var removeClass = notFavoriteClass;
        var msg = ActionBar.destination.title + " added to favorites";
        Favorites.add(ActionBar.destination);
      }

      Toast.show(msg);

      $btn.removeClass(removeClass).addClass(addClass);
    });

    this.menu.init();
  },

  menu: {

    isVisible: false,

    init: function() {

      // Show/Hide menu
      ActionBar.$el.on('tap', '.menuBtn', function(e) {
        if ( ActionBar.menu.isVisible ) {
          ActionBar.menu.hide();
        }
        else {
          ActionBar.menu.show();
        }
      });

      // Add listener that closes menu when user touches
      // outside of menu
      $('body').on('touchstart click', function(e) {
        if ( ActionBar.menu.isVisible ) {

          var $target = $(e.target);

          if ( $target.hasClass('menuBtn') === false
                && $target.parent().is('#destinationMenu') === false ) {
            ActionBar.menu.hide();
          }
        }
      });

      ActionBar.$menu.on('tap', 'i', function(i) {
        ActionBar.menu.hide();

        var action = $(this).attr('data-action');

        if ( action && ActionBar.menu.actions[action] ) {
          ActionBar.menu.actions[action]();
        }
      });
    },

    show: function() {
      ActionBar.$menu.addClass('active');
      setTimeout(function() {
        ActionBar.menu.isVisible = true;
      }, 200);
    },

    hide: function() {
      ActionBar.$menu.removeClass('active');
      ActionBar.menu.isVisible = false;
    },

    actions: {
      save: function() {
        var destination = $.extend({}, ActionBar.destination);

        // Don't save photos
        if ( typeof destination.photos !== 'undefined' ) {
          delete destination.photos;
        }

        Toast.show('Saving page');

        SavedPages.save({
          destination: destination,
          callback: function (error, success) {
            if ( error ) {
              // TODO
              console.log(error);
            }
            else {
              Toast.show(ActionBar.destination.title + ' saved');
            }
          },
        });
      },

      showOnMap: function() {
        Map.openExternalApp();
      },

      share: function() {
        var link = ActionBar.destination.uri;
        var msg = ActionBar.destination.title + ': ' + link;
        var subject = 'Travel Destination: ' + ActionBar.destination.title;

        msg += '\n\nShared via: ' + settings.playStoreLink;

        var shareIntentSent = false;

        function shareWithoutImg() {
          if ( !shareIntentSent ) {
            window.plugins.socialsharing.share(msg, subject, null, null);
            shareIntentSent = true;
          }
        }

        if ( ActionBar.destination.photos && ActionBar.destination.photos.length > 0) {
          img = ActionBar.destination.photos[0].src;

          // Allow maximum 1 second for converting image to dataURL
          setTimeout(function() {
            shareWithoutImg();
          }, 1000);

          SavedPages.imageToDataURL(img, function(error, dataURL) {
            if ( error ) {
              shareWithoutImg();
            }
            else {
              if ( !shareIntentSent ) {
                img = dataURL;
                shareIntentSent = true;
                window.plugins.socialsharing.share(msg, subject, img, null);
              }
            }
          });
        }
        else {
          shareWithoutImg();
        }
      },

      openInBrowser: function() {
        window.open(ActionBar.destination.uri, '_system');
      },
    }
  }

};

module.exports = ActionBar;
