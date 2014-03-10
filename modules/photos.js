var photosTabTemplate = require('../templates/photos.hbs');
var Flickr = require('./data_services/flickr');
var MediawikiMobileParser = require('./mediawiki_mobile_parser');
var AppHistory = require('./history');
var FullscreenPhotoGallery = require('./fullscreen_photo_gallery');

var Photos = {

  photos: [],

  init: function() {
    if ( typeof this.$el.attr('data-inited') === 'undefined' ) {
      AppHistory.addPopHandler('galleryFullscreen', function(state) {
        FullscreenPhotoGallery.deactivate();
      });

      this.$el.on('tap', '.photo', function(e) {
        AppHistory.pushAction({popHandler:'galleryFullscreen'}, 'Photos');
        FullscreenPhotoGallery.activate({$photos: $(this).parent().find('.photo'), index: $(this).index()});
      });
    }
  },

  activate: function(options) {
    this.$el = options.$el;
    this.init();
    this.updateView();
    this.searchFlickr(options.keyword);
  },

  updateView: function() {
    var html = photosTabTemplate({photos:this.photos});
    this.$el.html(html);
  },

  setWikiPhotos: function($wiki) {
    this.photos = this.photos.concat(MediawikiMobileParser.parsePhotos($wiki));
  },

  searchFlickr: function(keyword) {

    Flickr.search({keyword: keyword}, function(error, photos) {
      if ( error ) {
        // TODO
      }
      else if ( photos.length > 0 ) {
        Photos.photos = Photos.photos.concat(photos);
        Photos.updateView();
      }
      else {
        // TODO
        // Alert no photos?
      }
    });
  },

};

module.exports = Photos;
