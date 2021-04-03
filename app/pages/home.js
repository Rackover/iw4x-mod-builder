$("a.nav-trigger").click(function () {
  $(".nav > a[href='" + $(this).attr("href") + "']").click();
  return false;
});

(function () {
  var cod4Valid = global.game.cod4.validate(global.game.cod4.getPath());
  var mw2Valid = global.game.mw2.validate(global.game.mw2.getPath());

  if (cod4Valid) $("#cod4-setting").hide();
  if (mw2Valid) $("#mw2-setting").hide();
  if (cod4Valid && mw2Valid) $("#setting-box").hide();

  global.getChangelog(function (data, error) {
    if (error) {
      $("#news-box").html(error);
    }
    else {
      $("#news-box").html(data);
    }
  });
})();
