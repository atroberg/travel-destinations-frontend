var template = require('../../templates/destination_list.hbs');
var settings = require('../settings');
var AppHistory = require('../history');
var Destination = require('./destination');
var Analytics = require('../analytics');

var DestinationList = {

  activate: function(options) {

    if ( typeof options.addHistoryEntry === 'undefined' ) {
      options.addHistoryEntry = true;
    }

    Analytics.trackPage('/destination_list/' + options.title);

    DestinationList.options = options;

    this.$el = $('#actionPage').hammer(settings.hammer);
    this.$el.removeClass();
    this.$el.addClass(options.cssClass);
    this.$el.addClass('destinationsListingPage animate');

    if ( options.addHistoryEntry ) {
      AppHistory.push({}, options.title);
    }

    this.$el.on('tap', 'nav .back', function(e) {
      AppHistory.gotoShortcut('closeDestinationList');
    });

    this.$el.on('tap', '.destinationsList li span', function(e) {

      var $li = $(this).parent();

      AppHistory.addPopHandler('closeDestination', function() {
        DestinationList.activate($.extend({}, options, {addHistoryEntry: false}));
        Destination.deactivate();
      });

      AppHistory.push({popHandler: 'closeDestination'}, options.title, {shortcut: 'closeDestination', replaceState: true});

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

    if ( options.showLoading ) {
      this.updateView({showLoading:true});
    }

    options.getDestinations(function(error, destinations) {
      DestinationList.destinations = destinations;
      DestinationList.updateView();
    });
  },

  updateView: function(data) {
    data = $.extend({}, data, {
      destinations: DestinationList.destinations,
      title: DestinationList.options.title,
      noDestinations: DestinationList.options.noDestinations,
      deleteDestinations: typeof DestinationList.options.deleteDestination !== 'undefined',
    });

    var html = template(data);
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
