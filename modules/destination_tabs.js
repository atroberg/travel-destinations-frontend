var flickrPhotoSearch = require('./flickr_photo_search');
var Youtube = require('./youtube_videos');

var videoTemplate = require('../templates/videos.hbs');

module.exports = function destinationTabs($el, title) {

  var $viewport = $el.find('#destination_tabs');
  var $menu = $el.find('#tabs_menu');
  var tabCount = $menu.find('li').length;
  var currentTab = 0;

  var htmlCache = {};

  var tabFunctions = {
    // Photos
    1: function($tab) {
      flickrPhotoSearch(title, function flickrPhotoCallback(error, photos) {

        if ( error ) {
          // TODO
        }

        else {
          try {
            var imgHtml = '';
            $.each(photos, function(index, photo) {
              imgHtml += '<img src="' + photo.url + '">';
            });
            $tab.html(imgHtml);
          }
          catch (e) {
            // TODO: no images found msg
          }
        }

      });
    },

    // Videos
    2: function($tab) {
      Youtube.search(title, function(error, videos) {
        $tab.html(videoTemplate({videos: videos}));
      });
    },
  };

  function focusToTab(index) {

    if ( index > tabCount - 1 )
      index = tabCount - 1;
    else if ( index < 0 )
      index = 0;

    var value = 100 / tabCount * index;
    $viewport.css('transform', 'translate3d(' + (-value) + '%,0,0)');

    if ( index !== currentTab ) {
        $menu.find('.active').removeClass('active');
        $menu.find('li:eq(' + index + ')').addClass('active');

        var $prevTab = $viewport.find('.tab:eq(' + currentTab + ')');
        htmlCache[currentTab] = $prevTab.html();
        $prevTab.html('');

        if ( htmlCache[index] ) {
          var $nextTab = $viewport.find('.tab:eq(' + index + ')');
          $nextTab.html(htmlCache[index]);
        }

        else {
          if ( tabFunctions[index] ) {
            var $targetTab = $viewport.find('> .tab:eq(' + index + ')');
            console.log($targetTab);
            tabFunctions[index]($targetTab);
          }
        }

        currentTab = index;
    }
  }

  $menu.hammer().on('tap', 'li', function(e) {
    focusToTab($(this).index());
  });

  $viewport.hammer({swipe_velocity: 0.1}).on('swipeleft', function(e) {
    focusToTab(currentTab + 1);
  })
  .on('swiperight', function(e) {
    focusToTab(currentTab - 1);
  });

};
