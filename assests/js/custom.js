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
              mediaAction: {
                  url: node.getAttribute("media-url") || "media",
              },
          },
          actions: {
            actionsOption: {
              uploadURL: node.getAttribute("content-url") || "contentSave",
            },
            elementId: index,
          },
          emoji : {
            showTab: false,
            animation: 'slide',
            position: 'topLeft',
            icons: [{
                name: "custom",
                path: "assests/img/emoji/",
                maxNum: 91,
                excludeNums: [41, 45, 54],
                file: ".gif"
            }],
            elementId: index,
          }
      },
    });
    // $(node).emoji({
    //   showTab: false,
    //   animation: 'slide',
    //   position: 'topLeft',
    //   icons: [{
    //       name: "custom",
    //       path: "assests/img/emoji/",
    //       maxNum: 91,
    //       excludeNums: [41, 45, 54],
    //       file: ".gif"
    //   }]
    // });
  })
});
