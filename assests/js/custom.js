var editor = new MediumEditor('.editable', {
  buttonLabels: 'fontawesome',
  paste: {
      cleanPastedHTML: true,
      forcePlainText: false
  }
});

$(function () {
  $('.editable').mediumInsert({
      editor: editor
  });
});