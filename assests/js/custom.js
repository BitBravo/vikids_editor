$(function () {
  $('.editable').each((index, node) => {
    $(node).mediumInsert({
      editor: new MediumEditor(node, {
        buttonLabels: 'fontawesome',
        paste: {
            cleanPastedHTML: true,
            forcePlainText: false
        }
      }),
      enabled: (node.getAttribute("media-upload") === "enable"),
      addons: {
          images: {
              fileDeleteOptions: {
                url: node.getAttribute("data-delete-url") || "/delete",
              },
              fileUploadOptions: {
                  url: node.getAttribute("data-upload-url") || "/upload",
              },
          },
          actions: {
            actionsOption: {
              uploadURL: node.getAttribute("data-save-url") || "/contentSave",
            },
            elementId: index,
          }
      },
    });
  })
});
