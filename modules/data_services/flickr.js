var settings = require('../settings');

var Flickr = {

  getImgSrc: function(photo, size) {
      return 'http://farm'+photo.farm+'.staticflickr.com/'+photo.server+'/'+photo.id+'_'+photo.secret+'_'+size+'.jpg';
  },

  search: function(options, callback) {

    var keyword = typeof options.keyword === 'string'
                ? options.keyword
                : options.keyword.join(' ');

    // Fetch photos from Google image search
    $.ajax({
      url: 'http://api.flickr.com/services/rest/?method=flickr.photos.search',
      type: 'GET',
      data: {
        api_key: settings.flickrApiKey,
        text: keyword,
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
            src: Flickr.getImgSrc(photo, 'q'),
            bigSrc: Flickr.getImgSrc(photo, 'z'),
            xbigSrc: Flickr.getImgSrc(photo, 'b'),
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

};

module.exports = Flickr;
