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
      // addons: {
      //     images: {
      //         fileUploadOptions: {
      //             url: 'upload.php'
      //         }
      //     }
      // }
  });
});


// $('#edit').on('click', function() {
//   // this is the innermost *node*
//   var an = window.getSelection().anchorNode;

//   var pe = an.parentElement;
//   var peC = pe.innerHTML;

//   const parseData = getFind(peC);
//   if (parseData) {
//     const elements = createContent(parseData)
//     updateContent(pe, elements);
//   }
// });
