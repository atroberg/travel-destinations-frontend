var Wikivoyage = require('./modules/wikivoyage');
var MediawikiMobileParser = require('./modules/mediawiki_mobile_parser.js');

var testHBS = require('./templates/test.hbs');

console.log(testHBS({test: "LOTEM IPSUM"}));

Wikivoyage.getPage({
  url: 'http://en.wikivoyage.org/wiki/Helsinki',
  callback: function(error, data) {

    if ( error ) {

    }

    else {
      var html;

      try {
        html = MediawikiMobileParser.setHtml(data)
                    .getActualContent().removeTags(['script', 'noscript'])
                    .fixPaths().getHtml();
      }
      catch (e) {
        // TODO
      }

    }

  },
});
