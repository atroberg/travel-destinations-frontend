var settings = require('../settings');

var Youtube = {

  search: function(options, callback) {
    $.ajax({
      // Connect to my AWS instance
      url: settings.youtubeApiURI + '/search',
      data: {
        q: options.keyword + ' travel',
        type: 'video',
        maxResults: 10,
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
      error: function(msg, textStatus) {
        if ( textStatus === 'abort' ) return;
        callback(msg);
      },
    });
  },

};

module.exports = Youtube;
