var WikivoyageService = require('../../data_services/wikivoyage');
var MediawikiMobileParser = require('../../mediawiki_mobile_parser.js');
var SavedPagesDataProvider = require('../../data_services/saved_pages');
var UserSettings = require('../../user_settings');
var AppHistory = require('../../history');

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

    this.initTextZooming();

    // Prevent default behavior for links
    this.$el.on('click', 'a', function(e) {
      e.preventDefault();
    });

    // Handle them with the tap-event instead
    this.$el.on('tap', 'a', function(e) {
      e.preventDefault();

      $el = $(this);

      var url = $el.attr('href');

      // Check if link to an image
      if ( url.match(/\.(jpe?g|gif|png|tiff|svg)$/i) ) {

        // Parse srcset and open full size image with external browser
        var $img = $(this).find('img');

        if ( $img.length > 0 ) {
          var photo = window.MediawikiMobileParser.parseSrcSet($img.attr('srcset'));
          if ( photo.bigSrc ) {
            url = photo.bigSrc;
          }
        }

        // Open with external browser
        window.open(url, '_system');
        return;
      }

      // Check if relative url => load from wikivoyage
      if ( url.match(/^\/\//) === null && url.match(/^[a-z]+:/i) === null
            && url.match(/:\/\//) === null ) {

        // Check if section link
        var matches = null;
        if ( matches = url.match(/#.+/) ) {
          var $target = $(matches[0]);

          if ( $target.length > 0 ) {
            $(window).scrollTop($target.offset().top);
            $target.parents('h2:first').addClass('expanded');
          }

          // Shouldn't happen, so open with external browser?
          else {
            window.open(options.Destination.baseURI + url, '_system');
          }

          return;
        }

        // Remember state (= scrollTop and open divs)
        // for this article
        var openSections = [];
        Wikivoyage.$el.find('> h2').each(function(i) {
          if ( $(this).hasClass('expanded') ) {
            openSections.push(i);
          }
        });

        AppHistory.extendState({
          wikivoyageState: {
            scrollTop: $(window).scrollTop(),
            openSections: openSections,
          },
        }, options.Destination.destination.title);

        options.Destination.show(options.Destination.baseURI + url);

        return;
      }

      // Default open in external browser

      // ensure path contains protocol
      if ( url.substring(0, 2) === '//' ) {
        url = 'http:' + url;
      }

      window.open(url, '_system');
    });

    // Touch feedback
    this.$el.on('touchstart', 'a', function(e) {
      var $link = $(this).addClass('touchdown');
      setTimeout(function() {
        $link.removeClass('touchdown');
      }, 500);
    });
  },

  initTextZooming: function() {

    var savedTextSize = UserSettings.get('textSize') || 'textNormal';
    var textSizeClasses = ['textXSmall', 'textSmall', 'textNormal', 'textBig', 'textXBig'];
    var prevTextSizeClassIndex = textSizeClasses.indexOf(savedTextSize);

    Wikivoyage.$el.addClass(textSizeClasses[prevTextSizeClassIndex]);

    function textSize(jump) {

      var newIndex = prevTextSizeClassIndex + jump;

      if ( newIndex < 0 ) newIndex = 0;
      else if ( newIndex > textSizeClasses.length - 1) newIndex = textSizeClasses.length - 1;

      if ( newIndex === prevTextSizeClassIndex ) return;

      Wikivoyage.$el.removeClass(textSizeClasses[prevTextSizeClassIndex]).addClass(textSizeClasses[newIndex]);

      prevTextSizeClassIndex = newIndex;

      UserSettings.set('textSize', textSizeClasses[newIndex]);
    }

    var prevScale = 1.0;

    // Text zooming (change font size)
    this.$el.on('touchstart touchmove', function(e) {
      if ( e.originalEvent.touches.length === 2 ) {
        e.preventDefault();
      }
      else {
        prevScale = 1.0;
      }
    })
    .on('pinch', function(e) {

      if ( e.gesture.scale > 1.4 * prevScale ) {
        textSize(1);
        prevScale = e.gesture.scale;
      }
      else if ( e.gesture.scale < 0.71 * prevScale ) {
        textSize(-1);
        prevScale = e.gesture.scale;
      }

    });
  },

  setState: function(state) {
    this.state = state;
  },

  getLicenceText: function() {
    return '<div id="wikiLicence">'
              + 'Content on this page is available under the '
              + '<a href="http://creativecommons.org/licenses/by-sa/3.0/">'
              + 'Creative Commons Attribution-ShareAlike 3.0 licence</a>.</div>';
  },

  updateView: function() {

    this.$el.hide().html(this.html + this.getLicenceText());

    // Accordion chevron
    this.$el.find('> h2').prepend('<i class="fa fa-chevron-right"></i>');

    if ( this.state ) {
      if ( this.state.openSections ) {
        $.each(this.state.openSections, function(key, val) {
          Wikivoyage.$el.find('> h2:eq(' + val + ')').addClass('expanded');
        });
      }
    }

    if ( this.state && this.state.scrollTop ) {
      this.$el.css('visibility', 'hidden').show();

      // Need a small timeout, because otherwise it seems
      // like DOM isn't always ready and therefore the document
      // isn't long enough to go to wanted scrollTop
      setTimeout(function() {
        Wikivoyage.$el.css('visibility', 'visible');
        $(window).scrollTop(Wikivoyage.state.scrollTop);
      }, 10);
    }

    else {
      this.$el.show();
    }
  },

  showDestination: function(options) {
    WikivoyageService.get({
      url: options.destination.uri,
      callback: function(error, data) {
        // Show 100% loading status
        Wikivoyage.$loadingStatus.css('width', '100%');

        if ( error ) {
          // Check if page is saved
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
                  if ( options.onError ) {
                    options.onError();
                  }
                }
              }
            });
          }
          catch(e) {
            if ( options.onError ) {
              options.onError();
            }
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
      Wikivoyage.html = window.MediawikiMobileParser.getCleanPage(html);
      Wikivoyage.updateView();

      if ( options.pageLoaded ) {
        options.pageLoaded();
      }
    }

    catch (e) {
      // Parsing failed, but still better to show the page as it is...
      Wikivoyage.html = html;
      if ( options.pageLoaded ) {
        options.pageLoaded();
      }
    }

  },

};

module.exports = Wikivoyage;
