var settings = require('../settings');

var Youtube = {

  get: function(options, callback) {
    $.ajax({
      // Connect to my AWS instance
      url: settings.youtubeApiURI + '/search',
      data: {
        q: options.keyword,
      },
      type: 'GET',
      dataType: 'json',
      success: function(data) {

        if ( data.items ) {
          var videos = [];
          $.each(data.items, function(i, video) {
            videos.push(video);
          });
          callback(null, videos);
        }

        else {
          callback('unknown_response');
        }

      },
      error: function(msg) {
        callback(msg);
      },
    });
  },

};

module.exports = Youtube;
