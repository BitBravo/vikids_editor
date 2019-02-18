var r_uploadURL = typeof uploadURL !=='undefined'? uploadURL : 'http://localhost:3000/upload';
var r_deleteURL = typeof deleteURL !=='undefined'? deleteURL : 'http://localhost:3000/delete';
var r_admin_permission = typeof admin_permission !=='undefined'? admin_permission : false;

if (!r_admin_permission) {
  $("p").removeClass("intro");
}

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
