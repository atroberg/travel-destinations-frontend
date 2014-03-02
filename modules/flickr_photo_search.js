var settings = require('./settings');

module.exports = function flickrPhotoSearch(keywords, callback) {
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

      var photos = [];

      $.each(data.photos.photo, function(i, photo) {
        photos.push({
          url: 'http://farm'+photo.farm+'.staticflickr.com/'+photo.server+'/'+photo.id+'_'+photo.secret+'_q.jpg',
          raw: photo,
        });
      });

      callback(null, photos);
    },
    error: function() {
      callback('error_fetching_photos');
    }
  });
};
