var template = require('../../templates/saved_pages.hbs');
var SavedPagesDataProvider = require('../data_services/saved_pages');
var settings = require('../settings');
var Destination = require('./destination');

var SavedPages = {

  init: function() {
  },

  activate: function() {
    this.$el = $('#actionPage').hammer(settings.hammer);
    this.$el.removeClass();
    this.$el.addClass('savedPages');

    this.$el.on('tap', '.savedPagesList li', function(e) {

      if ( $(e.target).hasClass('remove') ) {
        alert('TODO');
      }

      else {
        Destination.show($(this).attr('data-uri'));
        SavedPages.deactivate();
      }

    });

    var html = template({
      pages: SavedPagesDataProvider.getAll()
    });
    this.$el.html(html);

    this.$el.addClass('active');
  },

  deactivate: function() {
    this.$el.addClass('animate');
    setTimeout(function(){
      SavedPages.$el.removeClass('active animate');
    }, settings.animationDurations.page);
  },

};

module.exports = SavedPages;
