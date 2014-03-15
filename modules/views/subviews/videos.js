var Youtube = require('../../data_services/youtube');
var videoTemplate = require('../../../templates/videos.hbs');

var Videos = {

  initEventHandlers: function() {
    if ( typeof this.$el.attr('data-inited') === 'undefined' ) {
      this.$el.on('tap', '.video', function(e) {
        // Show loading
        $(this).addClass('opening_external_app');
        window.open($(this).attr('data-href'), '_system');
      });
      this.$el.attr('data-inited', 'true');
    }
  },

  activate: function(options) {
    this.$el = options.$el;
    this.show(options.keyword);
    this.onError = options.onError;
  },

  updateView: function() {
    this.$el.removeClass('not_loaded');
    this.$el.html(videoTemplate({
      videos: this.videos,
    }));
  },

  show: function(keyword) {
    Youtube.search({
      keyword: keyword
    }, function(error, videos) {
      if ( error ) {
        if ( Videos.onError ) {
          Videos.onError();
        }
      }
      else {
        Videos.initEventHandlers();
        Videos.videos = videos;
        Videos.updateView();
      }
    });
  },

};

module.exports = Videos;
