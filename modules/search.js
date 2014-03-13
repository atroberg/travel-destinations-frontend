var Wikivoyage = require('./data_services/wikivoyage');
var settings = require('./settings');
var template = require('../templates/search_suggest.hbs');

var Search = {

  init: function(options) {
    this.$el = options.$el;
    this.Frontpage = options.Frontpage;

    this.$el.on('focus', 'input', function(e) {
      e.stopPropagation();
      Search.input.activate();
    });

    $('body').hammer(settings.hammer).on('tap', function(e) {
      e.stopPropagation;

      if ( $(e.target).is('input.search') ) {
        return;
      }

      Search.deactivate();
    });

    this.$el.on('tap', '.searchSuggestResults li', function(e) {
      var $li = $(this);
      var destinationTitle = $li.text();
      var destinationURL = '/wiki/' + Wikivoyage.titleToURL(destinationTitle);
      Search.Frontpage.openDestination(destinationURL);
    });

    var searchXHR = null;
    var prevKeyword = null;
    this.$el.on('keyup', 'input', function(e) {
      var keyword = $(this).val().trim();

      // Don't search for the same thing again...
      if ( keyword === prevKeyword ) return;
      else prevKeyword = keyword;

      if ( keyword.length >= settings.autoSuggestMinLength ) {

        // Prevent multiple requests from overriding each other
        if ( searchXHR && searchXHR.readyState !== 4 ) {
          searchXHR.abort();
        }

        searchXHR = Wikivoyage.search({
          keyword: keyword,
          callback: function(error, results) {
            Search.updateView(results);
          }
        });

      }
    });

    // If window size changes, it's probably because
    // keyboard was closen => deactivate input
    var windowHeight = $(window).height();
    $(window).on('resize', function(e) {
      if ( Search.input.isActive && windowHeight < $(window).height() ) {
        Search.deactivate();
      }
      windowHeight = $(window).height();
    });
  },

  deactivate: function() {
    Search.input.deactivate();
    Search.removeSuggestResults();
  },

  updateView: function(results) {
    var html = template({results: results});
    this.removeSuggestResults();

    var height = $(window).height() - this.$el.parent().height();
    this.$el.append(html);
    this.$el.find('.searchSuggestResults').css('max-height', height + 'px');
  },

  removeSuggestResults: function() {
    this.$el.find('.searchSuggestResults').remove();
  },

  input: {
    activate: function() {
      Search.$el.addClass('active');
      this.isActive = true;
    },

    deactivate: function() {
      Search.$el.removeClass('active');
      Search.$el.find('input').val('');
      this.isActive = false;
    },
  }

};

module.exports = Search;
