$('a[target=_blank]').on('click', function () {
  require('nw.gui').Shell.openExternal(this.href);
  return false;
});

$("button[aria-button-link]").click(function () {
  require('nw.gui').Shell.openExternal($(this).attr("aria-button-link"));
});
