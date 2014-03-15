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
    this.$el.addClass('savedPages animate');

    if ( options.addHistoryEntry ) {
      AppHistory.push({}, 'Saved Pages');
    }

    this.$el.on('tap', 'nav .back', function(e) {
      AppHistory.gotoShortcut('closeSavedPages');
    });

    this.$el.on('tap', '.savedPagesList li', function(e) {

      var $li = $(this);

      AppHistory.addPopHandler('closeDestination', function() {
        SavedPages.activate({addHistoryEntry: false});
        Destination.deactivate();
      });

      AppHistory.push({popHandler: 'closeDestination'}, 'Saved Pages', {shortcut: 'closeDestination', replaceState: true});

      var uri = $li.attr('data-uri');

      if ( $(e.target).hasClass('remove') ) {

        var index = $li.index();

        if ( confirm('Delete ' + $(this).text().trim() + '?') ) {
          SavedPages.deleteDestination(uri, index);
        }
      }

      else {
        Destination.show(uri);
        SavedPages.deactivate();
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
        console.log(result);

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

  deactivate: function() {
    this.$el.addClass('animate');
    this.$el.removeClass('active');

    setTimeout(function(){
      SavedPages.$el.removeClass('animate');

      // Clear the element and listeners
      SavedPages.$el.off().html('');

    }, settings.animationDurations.page);
  },

};

module.exports = SavedPages;
