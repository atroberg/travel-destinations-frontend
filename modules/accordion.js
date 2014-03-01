var $ = require('../lib/jquery.min.js');

module.exports = function accordion($el) {
  $el.find('#destination_content > h2')
  .prepend('<i class="fa fa-chevron-right"></i>')
  .on('click', function(e) {
    var $title = $(this);
    $title.toggleClass('expanded');
  });
};
