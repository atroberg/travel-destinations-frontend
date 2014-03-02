module.exports = function accordion($el) {
  $el.find('#destination_content > h2')
  .prepend('<i class="fa fa-chevron-right"></i>');

  $el.hammer().on('tap', '#destination_content > h2', function(e) {
    var $title = $(this);
    $title.toggleClass('expanded');
  });
};
