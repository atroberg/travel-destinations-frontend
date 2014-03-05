var settings = require('./settings');
var fullscreenGalleryTemplate = require('../templates/fullscreen_photo_gallery.hbs');
var photosTabTemplate = require('../templates/photos.hbs');

var Photos = {

  flickrPhotoSearch: function flickrPhotoSearch(keywords, callback) {

    function getImgSrc(photo, size) {
      return 'http://farm'+photo.farm+'.staticflickr.com/'+photo.server+'/'+photo.id+'_'+photo.secret+'_'+size+'.jpg';
    }

    keywords = typeof keywords === 'string'
                ? keywords
                : keywords.join(' ');

    // Fetch images from Google image search
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

        callback(null, photosTabTemplate({photos:photos}));
      },
      error: function() {
        callback('error_fetching_photos');
      }
    });
  },

  fullscreenGallery: function(options) {

    var images = options.$images.map(function(i, img) {
      return {
        src: $(this).attr('data-big-src'),
        title: $(this).attr('title'),
      };
    }).get();

    return fullscreenGalleryTemplate({images: images});
  }

};

module.exports = Photos;
