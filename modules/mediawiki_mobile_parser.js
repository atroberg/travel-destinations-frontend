var MediawikiMobileParser = {

  setHtml: function(html) {
    this.html = html;
    return this;
  },

  getHtml: function() {
    return this.html;
  },

  getActualContent: function() {
    var matches = this.html.match(/<div[^>]*id="content"[^>]*>([^]*?)<\/div>\s*<\/div>\s*<div[^>]*id="footer/);
    this.html = matches[1];

    // TODO: add checks if something went wrong

    return this;
  },

  removeTags: function(tags) {
    var parentObj = this;

    tags.forEach(function(tag) {
      var regex = new RegExp('<' + tag + '[^>]*>.*?</\\s*' + tag + '\\s*>', 'g');
      parentObj.html = parentObj.html.replace(regex, '');
    });

    return this;
  },

  fixPaths: function() {
    // TODO
    // this.html = "";
    return this;
  },

};

module.exports = MediawikiMobileParser;
