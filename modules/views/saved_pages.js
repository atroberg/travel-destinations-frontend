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

      AppHistory.addPopHandler('closeDestination', function() {
        SavedPages.activate({addHistoryEntry: false});
        Destination.deactivate();
      });

      AppHistory.push({popHandler: 'closeDestination'}, 'Saved Pages', {shortcut: 'closeDestination', replaceState: true});

      if ( $(e.target).hasClass('remove') ) {
        alert('TODO');
      }

      else {
        Destination.show($(this).attr('data-uri'));
        SavedPages.deactivate();
      }

    });

    SavedPagesDataProvider.getAll({callback: function(error, destinations) {
      var html = template({
        pages: destinations,
      });

      SavedPages.$el.html(html);
      SavedPages.$el.addClass('active');
    }});
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
