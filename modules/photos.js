var settings = require('./settings');
var fullscreenGalleryTemplate = require('../templates/fullscreen_photo_gallery.hbs');
var photosTabTemplate = require('../templates/photos.hbs');

var Photos = {

  updateTemplate: function() {
    var html = photosTabTemplate({photos:this.photos});
    this.$tab.html(html);
  },

  showTab: function(options) {

    this.$tab = options.$tab;

    // Automatically parse photos from wikivoyage article
    if ( options.$wikiTab ) {
      this.photos = options.$wikiTab.find('.thumbinner').map(function(i, el) {
        $el = $(el);

        var $img = $el.find('img:first');
        if ( $img.attr('src').match(/\.jpe?g$/i) ) {

          try {
            var title = $el.find('.thumbcaption').text().trim();
          }
          catch(e){
            var title = '';
          }

          var src = $img.attr('src');
          var sizes = $img.attr('srcset')
                        ? $img.attr('srcset').split(/,\s+/g)
                        : null;

          var photo = {
            src: src,
            title: title,
            bigSrc: src,
          };

          if ( sizes && sizes.length > 0 ) {
            var parsedSizes = {};

            $.each(sizes, function(i, entry) {
              entry = entry.match(/(.*?)\s+([0-9]{1}(\.[0-9]{1})?x)/i);

              if ( entry ) {
                parsedSizes[entry[2]] = entry[1].replace(/^\/\//, 'http://');
              }

            });

            if ( parsedSizes['2x'] ) {
              photo.bigSrc = parsedSizes['2x'];
            }
            else if ( parsedSizes['1.5x'] ) {
              photo.bigSrc = parsedSizes['1.5x'];
            }

          }

          return photo;
        }
      }).get();

      if ( this.photos.length > 0 ) {
        this.updateTemplate()
      }
    }

    this.flickrPhotoSearch(options.keyword, function flickrPhotoCallback(error, photos) {
      if ( error ) {
        // TODO
      }
      else if ( photos.length > 0 ) {
        Photos.photos = Photos.photos.concat(photos);
        Photos.updateTemplate();
      }
      else {
        // TODO
        // Alert no photos?
      }
    });
  },

  flickrPhotoSearch: function flickrPhotoSearch(keywords, callback) {

    function getImgSrc(photo, size) {
      return 'http://farm'+photo.farm+'.staticflickr.com/'+photo.server+'/'+photo.id+'_'+photo.secret+'_'+size+'.jpg';
    }

    keywords = typeof keywords === 'string'
                ? keywords
                : keywords.join(' ');

    // Fetch photos from Google image search
    $.ajax({
      url: 'http://api.flickr.com/services/rest/?method=flickr.photos.search',
      type: 'GET',
      data: {
        api_key: settings.flickrApiKey,
        text: keywords,
        per_page: 8,
        sort: 'relevance',
        //license: 7,
        format: 'json',
        nojsoncallback: 1
      },
      dataType: 'json',
      success: function(data) {

        if ( data.stat !== 'ok' ) {
          callback('error_fetching_photos');
          return;
        }

        var photos = $.map(data.photos.photo, function(photo) {
          return {
            src: getImgSrc(photo, 'q'),
            bigSrc: getImgSrc(photo, 'z'),
            xbigSrc: getImgSrc(photo, 'b'),
            title: photo.title,
          };
        });

        callback(null, photos);
      },
      error: function() {
        callback('error_fetching_photos');
      }
    });
  },

  fullscreenGallery: {

    open: function(options) {

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

      var photoSwitchRequested = false;

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
      .on('dragleft dragright', function(e) {
        e.gesture.preventDefault();

        if ( !photoSwitchRequested && e.gesture.velocityX > settings.tabSwipeVelocity ) {

          if ( e.gesture.direction === 'left' ) {
            focusToPhoto(currentIndex + 1);
          }
          else {
            focusToPhoto(currentIndex - 1);
          }

          photoSwitchRequested = true;
        }
      })
      .on('dragend', function(e) {
        photoSwitchRequested = false;
      })

      // Show hide image text
      .on('tap', function(e) {
        $(this).toggleClass('hide_photo_title');
      });

      function focusToPhoto(index) {

        if ( index < 0 ) index = 0;
        else if ( index > photos.length - 1 ) index = photos.length - 1;

        currentIndex = index;

        var translateX = -(100 / photos.length) * currentIndex + '%';
        popup.css('transform', 'translate3d('+translateX+',0,0)');
      }

    },

    close: function() {
      $('#popup_gallery_fullscreen').remove();
    },

  },

};

module.exports = Photos;
