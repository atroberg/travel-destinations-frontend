var template = require('../../templates/destination_list.hbs');
var settings = require('../settings');
var AppHistory = require('../history');
var Destination = require('./destination');

var DestinationList = {

  activate: function(options) {
    options = options || {addHistoryEntry: true};

    DestinationList.options = options;

    this.$el = $('#actionPage').hammer(settings.hammer);
    this.$el.removeClass();
    this.$el.addClass(options.cssClass);
    this.$el.addClass('destinationsListingPage animate');

    if ( options.addHistoryEntry ) {
      AppHistory.push({}, options.title);
    }

    var historyShortcut = options.title;

    this.$el.on('tap', 'nav .back', function(e) {
      AppHistory.gotoShortcut(historyShortcut);
    });

    this.$el.on('tap', '.destinationsList li span', function(e) {

      var $li = $(this).parent();

      AppHistory.addPopHandler('closeDestination', function() {
        DestinationList.activate($.extend({}, options, {addHistoryEntry: false}));
        Destination.deactivate();
      });

      AppHistory.push({popHandler: 'closeDestination'}, options.title, {shortcut: historyShortcut, replaceState: true});

      Destination.show($li.attr('data-uri'));
      DestinationList.deactivate('active');
    });

    if ( options.deleteDestination ) {

      this.$el.on('tap', '.destinationsList li .remove', function(e) {

        var $li = $(this).parent();
        var indexInArray = $li.index();

        if ( confirm('Delete ' + $li.text().trim() + '?') ) {
          options.deleteDestination($li.attr('data-uri'), function(error, success) {
            if ( error ) {
              // TODO
              console.error(error);
            }
            else {
              DestinationList.destinations.splice(indexInArray, 1);
              DestinationList.updateView();
            }
          });
        }
      });
    }

    options.getDestinations(function(error, destinations) {
      DestinationList.destinations = destinations;
      DestinationList.updateView();
    });
  },

  updateView: function() {
    var html = template({
      destinations: DestinationList.destinations,
      title: DestinationList.options.title,
      noDestinations: DestinationList.options.noDestinations,
    });
    DestinationList.$el.html(html);
    DestinationList.$el.addClass('active');
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
      DestinationList.$el.removeClass();

      // Clear the element and listeners
      DestinationList.$el.off().html('');

    }, settings.animationDurations.page);
  },

};

module.exports = DestinationList;
