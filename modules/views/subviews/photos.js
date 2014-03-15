var photosTabTemplate = require('../../../templates/photos.hbs');
var Flickr = require('../../data_services/flickr');
var MediawikiMobileParser = require('../../mediawiki_mobile_parser');
var AppHistory = require('../../history');

var FullscreenPhotoGallery = require('./fullscreen_photo_gallery');


var Photos = {

  init: function(options) {
    this.$el = options.$el;
    this.photos = [];

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

  clear: function() {
    this.photos = [];
    this.wikiPhotos = [];
  },

  activate: function(options) {
    this.init(options);
    this.showWikiPhotos();
    this.showFlickrPhotos(options.keyword);

    this.onError = options.onError;
  },

  updateView: function() {
    var html = photosTabTemplate({photos:this.photos});
    this.$el.html(html);
  },

  setWikiPhotos: function($wiki) {
    this.wikiPhotos = MediawikiMobileParser.parsePhotos($wiki);
  },

  showWikiPhotos: function() {
    if ( typeof this.wikiPhotos !== 'undefined' ) {
      this.photos = this.photos.concat(this.wikiPhotos);
      this.updateView();
    }
  },

  showFlickrPhotos: function(keyword) {

    Flickr.search({keyword: keyword}, function(error, photos) {

      // Only show error, if Flickr failer AND no other photos to show
      if ( error && Photos.photos.length === 0 ) {
        if ( Photos.onError ) {
          Photos.onError();
        }
      }

      else if ( photos.length > 0 ) {
        Photos.photos = Photos.photos.concat(photos);
        Photos.updateView();
      }

    });
  },

};

module.exports = Photos;
