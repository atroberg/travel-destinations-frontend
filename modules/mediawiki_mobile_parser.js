var MediawikiMobileParser = {

  setHtml: function(html) {
    html = this.removeTags(html, ['script', 'noscript']);
    html = this.fixPaths(html);
    this.$el = $('<div />').html(html);
    this.title = this.getTitle();
    return this;
  },

  // Return cleaned html
  getHtml: function() {
    return this.$el.html().replace(/data-fakesrc=/g, 'src=');
  },

  getTitle: function() {
    if ( this.title )
      return this.title;
    else
      return this.$el.find('div.name:first').text();
  },

  getActualContent: function() {
    this.$el.html(this.$el.find('#content').html());
    return this;

    // TODO: checks if parsing worked
  },

  removeBanner: function() {
    this.$el.find('#mf-pagebanner').remove();
    return this;
  },

  removeTags: function(html, tags) {
    tags.forEach(function(tag) {
      var regex = new RegExp('<' + tag + '[^>]*>.*?</\\s*' + tag + '\\s*>', 'g');
      html = html.replace(regex, '');
    });

    return html;
  },

  removeEmptySections: function() {
    this.$el.find('> div').each(function(i, div) {
      if ( div.innerHTML.trim() === '' ) {
        var $div = $(div);
        $div.prev('h2').remove();
        $div.remove();
      }
    });
    return this;
  },

  fixPaths: function(html) {
    return html.replace(/src="(\/\/[^"]*)"/g, 'data-fakesrc="http:\$1"');
  },

  parseSrcSet: function(srcset) {
    srcset = srcset || '';

    var sizes = srcset.split(/,\s+/g);
    var photo = {};

    if ( sizes && sizes.length > 0 ) {
      var parsedSizes = {};

      $.each(sizes, function(i, entry) {
        entry = entry.match(/(.*?)\s+([0-9]{1}(\.[0-9]{1})?x)/i);

        if ( entry ) {
          parsedSizes[entry[2]] = entry[1].replace(/^\/\//, 'http://');
        }

      });

      if ( parsedSizes['2x'] ) {
        photo.bigSrc = parsedSizes['2x'];
      }

      else if ( parsedSizes['1.5x'] ) {
        photo.bigSrc = parsedSizes['1.5x'];
      }
    }

    return photo;
  },

  parsePhotos: function($el) {
    return $el.find('.thumbinner').map(function(i, thumbinner) {
      $thumbinner = $(thumbinner);
      var $img = $thumbinner.find('img:first');

      try {
        var matches = $img.attr('src').match(/(\.jpe?g$)|(^data:image\/jpeg)/i);
      }
      catch(e) {
        var matches = null;
      }

      if ( matches ) {

        var isDataURLPhoto = typeof(matches[2]) !== 'undefined';

        try {
          var title = $thumbinner.find('.thumbcaption').text().trim();
        }
        catch(e){
          var title = '';
        }

        var src = $img.attr('src');

        var photo = {
          src: src,
          title: title,
          bigSrc: src,
        };

        if ( isDataURLPhoto ) {
          return photo;
        }

        $.extend(photo, window.MediawikiMobileParser.parseSrcSet($img.attr('srcset')));

        return photo;
      }
    }).get();
  },

  getCleanPage: function(rawHtml) {
    var parser = this.setHtml(rawHtml).getActualContent().removeBanner().removeEmptySections();
    return parser.getHtml();
  },

};

module.exports = MediawikiMobileParser;

// Expose this also in the global scope, so that
// it can easily be overriden by another script
// (which is important if wikvoyage changes the markup etc.
// and we need new parsing rules)
window.MediawikiMobileParser = MediawikiMobileParser;
