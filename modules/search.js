var Wikivoyage = require('./data_services/wikivoyage');
var settings = require('./settings');
var template = require('../templates/search_suggest.hbs');
var Analytics = require('./analytics');

var Search = {

  init: function(options) {
    this.$el = options.$el;
    this.callback = options.callback;
    this.deactivateCallback  = options.deactivateCallback;
    this.analyticsLabel = options.analyticsLabel;

    // Remove previous event listeners
    this.$el.off();

    this.$el.on('focus', 'input', function(e) {
      e.stopPropagation();
      Search.input.activate();
    });

    if ( !this.hasBeenInited ) {
      this.hasBeenInited = true;

      $('body').hammer(settings.hammer).on('tap', function(e) {
        e.stopPropagation;

        if ( $(e.target).is('input.search') ) {
          return;
        }

        Search.deactivate();
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
    }

    this.$el.on('tap', '.searchSuggestResults li', function(e) {
      var $li = $(this);

      if ( $li.hasClass('noResults') ) {
        return;
      }

      var destinationTitle = $li.text();
      var destinationURL = 'http://en.m.wikivoyage.org/wiki/' + Wikivoyage.titleToURL(destinationTitle);

      Search.callback(destinationURL);
    });

    var searchXHR = null;
    Search.prevKeyword = null;
    this.$el.on('keyup', 'input', function(e) {

      var keyword = $(this).val().trim();

      var enterPress = e.keyCode === 13;
      var forceSearch = enterPress && keyword.length > 0;

      // Don't search for the same thing again...
      if ( keyword === Search.prevKeyword ) return;

      if ( forceSearch || keyword.length >= settings.autoSuggestMinLength ) {

        Search.prevKeyword = keyword;

        // Prevent multiple requests from overriding each other
        if ( searchXHR && searchXHR.readyState !== 4 ) {
          searchXHR.abort();
        }

        Search.input.showLoading();

        searchXHR = Wikivoyage.search({
          keyword: keyword,
          callback: function(error, results) {
            Search.updateView(results);
            Search.input.hideLoading();
          }
        });

      }
    });
  },

  deactivate: function() {
    if ( !this.input.isActive ) {
      return;
    }

    if ( this.deactivateCallback ) {
      this.deactivateCallback();
    }
    Search.prevKeyword = null;
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
      Analytics.trackEvent('ui_action', 'button_press', Search.analyticsLabel);
    },

    deactivate: function() {
      Search.$el.removeClass('active');
      Search.$el.find('input').val('').blur();
      this.isActive = false;
    },

    showLoading: function() {
      Search.$el.find('input').addClass('loading');
    },

    hideLoading: function() {
      Search.$el.find('input').removeClass('loading');
    },
  }

};

module.exports = Search;
