var WikivoyageService = require('../../data_services/wikivoyage');
var MediawikiMobileParser = require('../../mediawiki_mobile_parser.js');
var SavedPagesDataProvider = require('../../data_services/saved_pages');

// TODO: this must probably be changed to work some other way
// because we must be able to support other languages as well
// (and their base url is different)
var BASE_URL = 'http://en.m.wikivoyage.org';

var Wikivoyage = {

  activate: function(options) {
    this.$el = options.$el;
    this.$loadingStatus = $('#destination nav .loading_status');
    this.$loadingStatus.css('width', '0%');

    // Accordion
    this.$el.on('tap', '> h2', function(e) {
      var $title = $(this);
      $title.toggleClass('expanded');
    });

    // Prevent default behavior for links
    this.$el.on('click', 'a', function(e) {
      e.preventDefault();
    });
    // Handle them with the tap-event instead
    this.$el.on('tap', 'a', function(e) {
      $el = $(this);
      var url = $el.attr('href');

      // Check if relative url => load from wikivoyage
      if ( url.match(/^\/\//) === null
            && url.match(/:\/\//) === null ) {
        e.preventDefault();

        options.Destination.show(url);
      }
      // open in external browser
      else {
        window.open(url, '_system');
      }
    });
  },

  updateView: function() {
    this.$el.hide().html(this.html);
    // Accordion chevron
    this.$el.find('> h2').prepend('<i class="fa fa-chevron-right"></i>');
    this.$el.show();
  },

  showDestination: function(options) {
    WikivoyageService.get({
      url: BASE_URL + options.destination.uri,
      callback: function(error, data) {
        // Show 100% loading status
        Wikivoyage.$loadingStatus.css('width', '100%');

        if ( error ) {
          // Check if we page is saved
          try {
            SavedPagesDataProvider.get({
              uri: options.destination.uri,
              callback: function(error, destinations) {
                if ( destinations && destinations.length > 0 ) {
                  var savedPage = destinations[0];
                  data = savedPage.html;
                  Wikivoyage.parseHtml(data, options);
                }
                else {
                  throw "not_found";
                }
              }
            });
          }
          catch(e) {
            // TODO: some error msg
            console.error(e);
          }
        }

        else {
          Wikivoyage.parseHtml(data, options);
        }

      },
      progressCallback: function(error, progress) {
        if ( !error ) {
          Wikivoyage.$loadingStatus.css('width', progress + '%');
        }
      },
    });
  },

  parseHtml: function(html, options) {
    if ( !html ) {
      return;
    }

    try {
      var parser = MediawikiMobileParser.setHtml(html).getActualContent()
                    .removeBanner().removeEmptySections();
      Wikivoyage.html = parser.getHtml();
      Wikivoyage.updateView();
      if ( options.callback ) {
        options.callback();
      }
    }

    catch (e) {
      // TODO
      console.log(e);
    }

  },

};

module.exports = Wikivoyage;
