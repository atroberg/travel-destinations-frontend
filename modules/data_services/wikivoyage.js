var Wikivoyage = {

  get: function(params) {

    var ajaxObj = {
      url: params.url,
      // Just to be sure that jQuery doesn't do
      // any HTML magick with the response
      dataType: 'text',
      success: function(data) {
        // TODO: return in structured form (title, stripped body etc)
        params.callback(null, data);
      },
      error: function(msg) {
        // TODO

        // For debugging with mobile chrome
        $.get('/helsinki_debug.html', function(data) {
          params.callback(null, data);
        });
      }
    };

    if ( params.progressCallback ) {
      ajaxObj.xhr = function(){
        // get the native XmlHttpRequest object
        var xhr = $.ajaxSettings.xhr();

        var totalSize = 0;

        // set the onprogress event handler
        xhr.onprogress = function(e){
          if ( totalSize === 0 ) {
            if ( e.lengthComputable ) {
              totalSize = e.total;
            }
            // Try parsing content length manually
            else {
              totalSize = parseInt(xhr.getResponseHeader("Content-Length"));
              // Manual parsing also failed
              if ( totalSize <= 0 ) {
                totalSize = -1;

                params.progressCallback("no_totalsize_for_ajax_request");
              }

              // For some strange reason, the size parsed from header
              // doesn't match the total size we should get from
              // progress event. The size we get from header is about 3-4x smaller
              else {
                totalSize *= 3.5;
              }
            }
          }

          if ( totalSize > 0 ) {
            var progress = Math.round(e.loaded / totalSize * 100);
            if ( progress > 100 )
              progress = 100;
            params.progressCallback(null, progress);
          }
        };

        // return the customized object
        return xhr ;
      };
    }

    $.ajax(ajaxObj);

  },

};

module.exports = Wikivoyage;
