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
                url: node.getAttribute("media-delete-url") || "media/delete",
              },
              fileUploadOptions: {
                  url: node.getAttribute("media-upload-url") || "media/upload",
              },
          },
          actions: {
            actionsOption: {
              uploadURL: node.getAttribute("content-save-url") || "contentSave",
            },
            elementId: index,
          }
      },
    });
  })
});
