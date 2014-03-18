var template = require('../../templates/saved_pages.hbs');
var SavedPagesDataProvider = require('../data_services/saved_pages');
var settings = require('../settings');
var AppHistory = require('../history');
var Destination = require('./destination');

var SavedPages = {

  init: function() {
  },

  activate: function(options) {
    options = options || {addHistoryEntry: true};

    this.$el = $('#actionPage').hammer(settings.hammer);
    this.$el.removeClass();
    this.$el.addClass('savedPages destinationsListingPage animate');

    if ( options.addHistoryEntry ) {
      AppHistory.push({}, 'Saved Pages');
    }

    this.$el.on('tap', 'nav .back', function(e) {
      AppHistory.gotoShortcut('closeSavedPages');
    });

    this.$el.on('tap', '.destinationsList li span', function(e) {

      var $li = $(this).parent();

      AppHistory.addPopHandler('closeDestination', function() {
        SavedPages.activate({addHistoryEntry: false});
        Destination.deactivate();
      });

      AppHistory.push({popHandler: 'closeDestination'}, 'Saved Pages', {shortcut: 'closeDestination', replaceState: true});

      Destination.show($li.attr('data-uri'));
      SavedPages.deactivate('active');
    })

    .on('tap', '.destinationsList li .remove', function(e) {
      var $li = $(this).parent();
      if ( confirm('Delete ' + $li.text().trim() + '?') ) {
        SavedPages.deleteDestination($li.attr('data-uri'), $li.index());
      }
    });

    SavedPagesDataProvider.get({callback: function(error, destinations) {
      SavedPages.destinations = destinations;
      SavedPages.updateView();
    }});
  },

  updateView: function() {
    var html = template({
      destinations: SavedPages.destinations,
    });
    SavedPages.$el.html(html);
    SavedPages.$el.addClass('active');
  },

  deleteDestination: function(uri, indexInArray) {
    SavedPagesDataProvider.deleteDestination({
      uri: uri,
      callback: function(result) {
        if ( result.success ) {
          SavedPages.destinations.splice(indexInArray, 1);
          SavedPages.updateView();
        }
        else {
          // TODO
          console.error("error");
        }
      }
    });
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
      SavedPages.$el.removeClass();

      // Clear the element and listeners
      SavedPages.$el.off().html('');

    }, settings.animationDurations.page);
  },

};

module.exports = SavedPages;
