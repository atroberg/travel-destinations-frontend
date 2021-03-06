var Favorites = require('../../data_services/favorites');
var Toast = require('../../toast');
var SavedPages = require('../../data_services/saved_pages');
var autohideNav = require('../../autohide_nav');
var AppHistory = require('../../history');
var Map = require('../../map');
var settings = require('../../settings');
var Analytics = require('../../analytics');
var Search = require('../../search');


var ActionBar = {

  init: function(options) {
    this.Destination = options.Destination;
    this.destination = this.Destination.destination;
    this.$el = options.$el.find('nav:first');
    this.$menu = options.$el.find('#destinationMenu');

    autohideNav(this.$el);

    this.$el.on('tap', '.back', function(e) {
      AppHistory.gotoShortcut('closeDestination');
    });

    this.$el.on('tap', '.searchBtn', function(e) {

      ActionBar.$el.addClass('search');

      $searchInput = ActionBar.$el.find('.searchInput');
      Search.init({
        $el: $searchInput,
        callback: function(uri) {
          ActionBar.Destination.show(uri);
        },
        deactivateCallback: function() {
          ActionBar.$el.removeClass('search');
        },
        analyticsLabel: 'focus_destinationPage_search'
      });
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
        Analytics.trackEvent('ui_action', 'button_press', 'save_destination');

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
              alert("Error saving destination.");
            }
            else {
              Toast.show(ActionBar.destination.title + ' saved');
            }
          },
        });
      },

      showOnMap: function() {
        Analytics.trackEvent('ui_action', 'button_press', 'show_on_map');
        Map.openExternalApp();
      },

      share: function() {
        Analytics.trackEvent('ui_action', 'button_press', 'share_destination');

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
        Analytics.trackEvent('ui_action', 'button_press', 'open_in_browser');
        window.open(ActionBar.destination.uri, '_system');
      },

      favorite: function() {
        ActionBar.$el.parent().find('#destinationMenu').addClass('isFavorite');
        Favorites.add(ActionBar.destination);
        Toast.show(ActionBar.destination.title + " added to favorites");
      },

      unfavorite: function() {
        ActionBar.$el.parent().find('#destinationMenu').removeClass('isFavorite');
        Favorites.remove(ActionBar.destination);
        Toast.show(ActionBar.destination.title + " removed from favorites");
      },
    }
  }

};

module.exports = ActionBar;
