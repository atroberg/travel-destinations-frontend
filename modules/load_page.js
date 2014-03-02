var Wikivoyage = require('./wikivoyage');
var MediawikiMobileParser = require('./mediawiki_mobile_parser.js');
var destinationTemplate = require('./../templates/destination.hbs');
var accordion = require('./accordion');
var autohideNav = require('./autohide_nav');
var destinationTabs = require('./destination_tabs');

var BASE_URL = 'http://en.m.wikivoyage.org';

module.exports = function loadPage($destination, path, title) {
    title = title || decodeURIComponent(path.replace(/^\/wiki\//, '').replace(/_/g, ' '));

    $destination.html(destinationTemplate({destination:{title:title}}));

    var $loadingStatus = $destination.find('.loading_status');
    $loadingStatus.css('width', '0%');

    autohideNav($destination.find('nav:first'));
    destinationTabs($destination, title);

    Wikivoyage.getPage({
      url: BASE_URL + path,
      callback: function(error, data) {

        // Show 100% loading status
        $loadingStatus.css('width', '100%');

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

          $destinationContent = $destination.find('#destination_content');

          $destinationContent.hide().html(destination.html);
          
          accordion($destination);

          $destinationContent.show();
        }

      },
      progressCallback: function(error, progress) {
        if ( error ) {
          // TODO: show spinner etc.
        }
        else {
          $loadingStatus.css('width', progress + '%');
        }
      },
    });
};
