$(function () {
  var uploadURL = '';
  $('.editable').each((index, node) => {
    $(node).mediumInsert({
      editor: new MediumEditor(node, {
        buttonLabels: 'fontawesome',
        paste: {
            cleanPastedHTML: true,
            forcePlainText: false
        }
      }),
      enabled: node.className.includes('content')? (() => {
        uploadURL = node.getAttribute("data-upload-url") || "/upload";
        return true;
      })() : false,
      addons: { 
          images: { 
              fileDeleteOptions: {
                url: node.getAttribute("data-delete-url") || "/delete",
              }, 
              fileUploadOptions: { 
                  url: node.getAttribute("data-upload-url") || "/upload", 
              },
          }
      }
    });
  })

  setInterval(()=>{
    console.log(document.body)
    $.ajax({
      type: "POST",
      url: uploadURL,
      context: document.body
    }).done(function() {
      console.log('Saved all document successfully')
    });
  }, 5000)
});
