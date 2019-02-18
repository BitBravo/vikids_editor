var r_uploadURL = typeof uploadURL !=='undefined'? uploadURL : 'http://localhost:3000/upload';
var r_deleteURL = typeof deleteURL !=='undefined'? deleteURL : 'http://localhost:3000/delete';
var r_admin_permission = typeof admin_permission !=='undefined'? admin_permission : false;

if (!r_admin_permission) {
  document.querySelectorAll('figcaption').forEach((element) => {
    element.removeAttribute('contenteditable');
  });

  document.querySelectorAll('.editable').forEach((element) => {
    element.removeClass('give-me-editor');
  })
}

var editor = new MediumEditor('.give-me-editor', {
  buttonLabels: 'fontawesome',
  paste: {
      cleanPastedHTML: true,
      forcePlainText: false
  }
});

$(function () {
  $('.give-me-editor').mediumInsert({
      editor: editor,
      enabled: r_admin_permission, 
      addons: { 
          images: { 
              fileDeleteOptions: {
                url: r_deleteURL,
              }, 
              fileUploadOptions: { 
                  url: r_uploadURL, 
              },
          }
      }
  });
});
