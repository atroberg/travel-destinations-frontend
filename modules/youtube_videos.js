var settings = require('./settings');

var YoutubeVideos = {

  /*
  search: function(query, callback) {
    $.ajax({
      url: 'https://www.googleapis.com/youtube/v3/search',
      data: {
        part: 'snippet',
        q: query,
        key: settings.youtubeApiKey,
      },
      type: 'GET',
      dataType: 'json',
      sucess: function(data) {
        alert(JSON.stringify(data));
      },
      error: function(msg) {
        alert(JSON.stringify(msg));
      },
    });
  },
  */

  search: function(query, callback) {
    $.ajax({
      // Connect to my AWS instance
      url: 'http://54.200.137.96:8888/search',
      data: {
        q: query,
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

module.exports = YoutubeVideos;
