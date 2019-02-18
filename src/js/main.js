window.onload = function () {
  var myEditor = new MediumEditor(".editable", {
      buttons: [
        //   "bold"
        // , "italic"
        // , "underline"
        // , "anchor"
        // , "header1"
        // , "header2"
        // , "quote"
        "customHtml"
      ], 
      extensions: {
          "customHtml": new CustomHtml({
              buttonText: "<hr>"
            , htmlToInsert: "<hr class='someclass'>"
          }),
      },
  });
};