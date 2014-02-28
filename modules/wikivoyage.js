var $ = require('../lib/jquery.min.js');

var Wikivoyage = {

  getPage: function(params) {

    $.ajax({
      url: params.url,

      // Just to be sure that jQuery doesn't do
      // any HTML magick with the response
      dataType: 'text',

      success: function(data) {
        // TODO: return in structured form (title, stripped body etc)
        params.callback(null, data);
      },
    });

  },

};

module.exports = Wikivoyage;
