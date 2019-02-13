var editor = new MediumEditor('.editable', {
  buttonLabels: 'fontawesome',
  paste: {
      cleanPastedHTML: true,
      forcePlainText: false
  }
});

$(function () {
  $('.editable').mediumInsert({
      editor: editor,
      enabled: true, 
      addons: { 
          images: { 
              fileDeleteOptions: {
                url: 'http://localhost:3000/delete'
              }, 
              fileUploadOptions: { 
                  url: 'http://localhost:3000/upload', 
              },
          }
      }
  });
});
