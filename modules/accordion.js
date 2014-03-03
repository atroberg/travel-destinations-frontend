module.exports = function accordion($el) {
  $el.find('> h2')
  .prepend('<i class="fa fa-chevron-right"></i>');
};
