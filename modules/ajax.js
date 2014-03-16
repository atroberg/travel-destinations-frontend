var settings = require('./settings');

var Ajax = {

  init: function() {

    this.cache = {};
    this.cacheChronological = [];

    $(document).ajaxSend(function(e, jqXHR, ajaxOptions) {

      var cacheEntry = Ajax.cache[ajaxOptions.url];

      if ( !cacheEntry || new Date().getTime() / 1000 - cacheEntry.timestamp > settings.ajaxCache.lifetime ) {
        return;
      }

      if ( ajaxOptions.dataType === 'json' ) {
        cacheEntry.response = JSON.parse(cacheEntry.response);
      }

      // Returning the answer directly might include
      // (afterwards) heavy DOM manipulations making the
      // UI unresponsive. Instead, show briefly loading
      // indicator, before starting the heavy work
      // (not optimat solution though...)
      setTimeout(function() {
        ajaxOptions.success(cacheEntry.response);
      }, 50);

      jqXHR.abort();

    })

    .ajaxSuccess(function(event, XMLHttpRequest, ajaxOptions) {

      ajaxOptions.dataType = ajaxOptions.dataType || 'GET';

      // Only cache GET requests
      if ( ajaxOptions.dataType === 'GET' ) return;

      var responseText = XMLHttpRequest.responseText.trim();

      // Don't cache responseText if response is too short
      // (because it's higly probable that response was wrong...)
      if ( responseText.length < 50 ) {
        return;
      }

      if ( Ajax.cacheChronological.length >= settings.ajaxCache.pageCount ) {
        var url = Ajax.cacheChronological.shift();
        delete Ajax.cache[url];
      }

      Ajax.cache[ajaxOptions.url] = {
        timestamp: new Date().getTime() / 1000,
        response: responseText.trim()
      };

      Ajax.cacheChronological.push(ajaxOptions.url);
    });
  },

};

module.exports = Ajax;
