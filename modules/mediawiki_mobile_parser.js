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

  fixPaths: function(html) {
    return html.replace(/src="(\/\/[^"]*)"/g, 'data-fakesrc="http://\\$1"');
  },

};

module.exports = MediawikiMobileParser;
