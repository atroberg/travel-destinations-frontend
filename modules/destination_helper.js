var DestinationHelper = {

  getDestinationForStoring: function(destination) {
    var entry = {
      title: destination.title,
      firstP: destination.firstP,
      uri: destination.uri,
    };

    // Only store 1st photo
    if ( destination.photos && destination.photos.length > 0 ) {
      entry.photo = destination.photos[0].src;
    }

    return entry;
  },

};

module.exports = DestinationHelper;
