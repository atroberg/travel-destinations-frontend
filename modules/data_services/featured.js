var settings = require('../settings');

var Featured = {

  get: function(callback) {
    $.ajax({
      url: settings.featuredURI,
      type: 'GET',
      dataType: 'json',
      success: function(data) {
        callback(null, data);
      },
      error: function(e, textStatus) {
        if ( textStatus === 'abort' ) return;
        callback('error_fetching_photos');
      }
    })
  },

};

module.exports = Featured;
