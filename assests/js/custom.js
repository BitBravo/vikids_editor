$(function () {
  $('.editable').each(index => {
    var node = $(".editable")[index];
    new MediumEditor(node, {
        buttonLabels: 'fontawesome',
        enabled: true,
        addons: {
            images: {
                fileDeleteOptions: {
                  url: node.getAttribute("data-delete-url") || "/delete",
                },
                fileUploadOptions: {
                    url: node.getAttribute("data-upload-url") || "/upload",
                },
            }
        },
        paste: {
            cleanPastedHTML: true,
            forcePlainText: false
        }
    });
  });
});
