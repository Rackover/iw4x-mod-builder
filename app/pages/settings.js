$("button[aria-for='cod4-folder']").click(function () {
  $("label[for='cod4-folder']").click();
});

$('#cod4-folder').on('change', function () {
  var value = $(this).val();
  if (value.length != 0) {
    var textbox = $("input[aria-for='cod4-folder'][type='text']")
    textbox.val(value);
    textbox.change();
  }
});

$("input[aria-for='cod4-folder'][type='text']").on('input change', function () {
  var textbox = $(this);
  textbox.removeClass("error");
  textbox.removeClass("warning");
  textbox.removeClass("success");

  if (global.game.cod4.validate(textbox.val())) {
    textbox.addClass("success");
  }
  else {
    textbox.addClass(global.game.isValid(textbox.val()) ? "warning" : "error");
  }

  $("button[id='save']").addClass("pending");
});

$("button[aria-for='mw2-folder']").click(function () {
  $("label[for='mw2-folder']").click();
});

$('#mw2-folder').on('change', function () {
  var value = $(this).val();
  if (value.length != 0) {
    var textbox = $("input[aria-for='mw2-folder'][type='text']");
    textbox.val(value);
    textbox.change();
  }
});

$("input[aria-for='mw2-folder'][type='text']").on('input change', function () {
  var textbox = $(this);
  textbox.removeClass("error");
  textbox.removeClass("warning");
  textbox.removeClass("success");
  textbox.addClass(global.game.mw2.validate(textbox.val()) ? "success" : "error");

  $("button[id='save']").addClass("pending");
});

$("button[id='save']").click(function () {
  var mw2val = $("input[aria-for='mw2-folder'][type='text']").val();
  var cod4val = $("input[aria-for='cod4-folder'][type='text']").val();

  if (!global.game.mw2.validate(mw2val)) {
    if (!confirm("The Modern Warfare 2 directory you specified is invalid.\n" +
      "It does not contain the full game including the IW4x client!\n" +
      "Are you sure you want to save?")) return;
  }

  if (!global.game.cod4.validate(cod4val)) {
    if (!global.game.isValid(cod4val)) {
      if (!confirm("The Call of Duty 4 directory you specified is invalid.\n" +
        "It does not contain the full game!\n" +
        "Are you sure you want to save?")) return;
    }
    else {
      if (confirm("The Call of Duty 4 directory you specified does not contain the export tool.\n" +
        "Do you want to install it?")) {
        setTimeout(global.updateIW3, 1);
      }
    }
  }

  global.game.mw2.setPath(mw2val);
  global.game.cod4.setPath(cod4val);

  $("input[type='text']").removeClass("error");
  $("input[type='text']").removeClass("success");
  $("input[type='text']").removeClass("warning");
  $(this).removeClass("pending");
});

$("input[aria-for='mw2-folder'][type='text']").val(global.game.mw2.getPath());
$("input[aria-for='cod4-folder'][type='text']").val(global.game.cod4.getPath());
