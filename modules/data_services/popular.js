var settings = require('../settings');

var Popular = {

  get: function(callback) {
    $.ajax({
      url: settings.popularURI,
      type: 'GET',
      dataType: 'json',
      success: function(data) {
        callback(null, data);
      },
      error: function(e, textStatus) {
        if ( textStatus === 'abort' ) return;
        callback('error_fetching_popular');
      }
    })
  },

};

module.exports = Popular;
