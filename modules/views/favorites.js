var template = require('../../templates/favorites.hbs');
var FavoritesDataProvider = require('../data_services/favorites');
var settings = require('../settings');
var AppHistory = require('../history');
var Destination = require('./destination');

var Favorites = {
  init: function() {
  },

  activate: function(options) {
    options = options || {addHistoryEntry: true};

    this.$el = $('#actionPage').hammer(settings.hammer);
    this.$el.removeClass();
    this.$el.addClass('favorites destinationsListingPage animate active');

    if ( options.addHistoryEntry ) {
      AppHistory.push({}, 'Favorites');
    }

    this.$el.on('tap', 'nav .back', function(e) {
      AppHistory.gotoShortcut('closeFavorites');
    });

    this.$el.on('tap', '.destinationsList li span', function(e) {

      var $li = $(this).parent();

      AppHistory.addPopHandler('closeDestination', function() {
        Favorites.activate({addHistoryEntry: false});
        Destination.deactivate();
      });

      AppHistory.push({popHandler: 'closeDestination'}, 'Favorites', {shortcut: 'closeDestination', replaceState: true});

      Destination.show($li.attr('data-uri'));
      Favorites.deactivate('active');
    })

    .on('tap', '.destinationsList li .remove', function(e) {
      var $li = $(this).parent();
      if ( confirm('Delete ' + $li.text().trim() + '?') ) {
        Favorites.deleteDestination($li.attr('data-uri'), $li.index());
      }
    });

    this.updateView();
  },

  deleteDestination: function(uri, indexInArray) {
    FavoritesDataProvider.remove(uri);
    this.updateView();
  },

  updateView: function() {
    var html = template({
      destinations: FavoritesDataProvider.get(),
    });
    Favorites.$el.html(html);
  },

  deactivate: function(classes) {
    if ( typeof classes !== 'undefined' ) {
      classes = ' ' + classes;
    }
    else {
      classes = '';
    }

    this.$el.attr('class', 'animate' + classes);

    setTimeout(function(){
      Favorites.$el.removeClass();

      // Clear the element and listeners
      Favorites.$el.off().html('');

    }, settings.animationDurations.page);
  },
};

module.exports = Favorites;
