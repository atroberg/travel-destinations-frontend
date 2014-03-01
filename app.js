var $ = require('./lib/jquery.min.js');
var Wikivoyage = require('./modules/wikivoyage');
var MediawikiMobileParser = require('./modules/mediawiki_mobile_parser.js');
var destinationTemplate = require('./templates/destination.hbs');
var accordion = require('./modules/accordion');

$(document).ready(function initApp() {
  var $destination = $('#destination');

  Wikivoyage.getPage({
    url: 'http://en.m.wikivoyage.org/wiki/Helsinki',
    callback: function(error, data) {

      if ( error ) {

      }

      else {
        var destination = {};

        try {
          var parser = MediawikiMobileParser.setHtml(data)
                        .getActualContent().removeBanner();
          destination.title = parser.getTitle();
          destination.html = parser.getHtml();
        }
        catch (e) {
          // TODO
          console.log(e);
        }

        $destination.hide().html(destinationTemplate({destination: destination}));
        accordion($destination);
        $destination.show();
      }

    },
  });
});
