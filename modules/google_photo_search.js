// NOT CURRENTLY USED!

module.exports = function googlePhotoSearch(keyword, callback) {
  // Fetch images from Google image search
  $.ajax({
    'url': 'https://ajax.googleapis.com/ajax/services/search/images?v=1.0',
    'type': 'GET',
    'data': {
      'q': keyword,
      'imgsz': 'small|medium',
      'rsz': 8 // results per page
    },
    'dataType': 'json',
    'success': function(data) {
      callback(null, data);
    },
    'error': function() {
      callback("error_fetching_photos");
    }
  });
};
