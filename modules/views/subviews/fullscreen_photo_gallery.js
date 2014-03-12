var fullscreenGalleryTemplate = require('../../../templates/fullscreen_photo_gallery.hbs');
var settings = require('../../settings');

var FullscreenPhotoGallery = {

  activate: function(options) {

    var currentIndex = options.index || 0;

    var photos = options.$photos.map(function(i, img) {
      return {
        src: $(this).attr('data-big-src'),
        title: $(this).attr('title'),
        xbigSrc: $(this).attr('data-xbig-src'),
      };
    }).get();

    var html = fullscreenGalleryTemplate({photos: photos});

    var popup = $('<div id="popup_gallery_fullscreen" />').html(html);

    var popupWidth = photos.length * 100;
    popup.css({
      'width': popupWidth + '%',
      'top': $(window).scrollTop(),
    })
    .find('div.photo_container').css('width', 100 / photos.length + '%');

    popup.appendTo('body');

    // Make sure we focus to correct photo on init
    focusToPhoto(currentIndex);

    popup.on('touchmove', function(e) {
      e.preventDefault();
    });

    popup.hammer(settings.hammer).on('tap', '.external_link', function(e) {
      e.stopPropagation();
      var $photoContainer = $(this).parents('div:first');
      var xbigSrc = $photoContainer.attr('data-xbig-src');
      if ( xbigSrc ) {
        $photoContainer.addClass('opening_external_app');
        window.open(xbigSrc, '_system');
      }
    })

    // Show hide image text
    popup.on('tap', function(e) {
      $(this).toggleClass('hide_photo_title');
    });

    popup.trobisHammer().on('trobisHammer.swiperight', function(e) {
      focusToPhoto(currentIndex + 1);
    })
    .on('trobisHammer.swipeleft', function(e) {
      focusToPhoto(currentIndex - 1);
    });

    function focusToPhoto(index) {

      if ( index < 0 ) index = 0;
      else if ( index > photos.length - 1 ) index = photos.length - 1;

      currentIndex = index;

      var translateX = -(100 / photos.length) * currentIndex + '%';
      popup.css('transform', 'translate3d('+translateX+',0,0)');
    }

  },

  deactivate: function() {
    $('#popup_gallery_fullscreen').remove();
  },

};

module.exports = FullscreenPhotoGallery;
