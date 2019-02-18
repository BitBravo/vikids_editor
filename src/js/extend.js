;(function ($, window, document) {

  'use strict';
  /**
   * Extend 
   * Creates a new instance using content parse.
   *
  
   *
   * @name Extend
   * 
   */

   function Extend () {
      this.templates = window.MediumInsert.Templates;
   }

   Extend.prototype.getFind = function (str) {
    const regex = /\[\!\[(.*?)\]\((.+\.(png|jpg|jpeg))\)\]/g;
    const matches = regex.exec(str);

    if(matches) {
      const startPos = matches.index;
      const lastPos = matches.index + matches[0].length;
      const preText = str.slice(0, startPos);
      const lastText = str.slice(lastPos);
      const data = {url: matches[2], alt: matches[1]};
      return {preText: preText, lastText: lastText, data: data};
    }
  };
  
  Extend.prototype.createContent = function (dt) {
    let node = document.createElement("div");  
    node.className = "medium-insert-images"; 
    
    const imgTag = this.templates['src/js/templates/images-image.hbs']({
      img: dt.data.url,
    });
      
    let imgTagEl = document.createElement("div");
    node.append(imgTagEl);
    imgTagEl.outerHTML = imgTag;

    if (dt.data.alt.length > 0) {
      const captionTag = this.templates['src/js/templates/core-caption.hbs']({
        text: dt.data.alt,
        placeholder: null
      });

      $("figure", node)[0].innerHTML += captionTag;
      let $el = $("figcaption", node);
      $el.removeClass('medium-insert-caption-placeholder')
      .removeAttr('data-placeholder');
      $el[0].innerHTML = dt.data.alt;
    }

    let preElement = document.createElement("p");
    preElement.innerHTML = dt.preText;
  
    let lastElement = document.createElement("p");
    lastElement.innerHTML = dt.lastText;
 
    const newElement =  preElement.outerHTML + node.outerHTML + lastElement.outerHTML;
    return newElement;
  };

  Extend.prototype.updateContent = function (el, element) {
    var that = this, $image;
    if (typeof element === 'string') {
      el.innerHTML = element;
    } else {
      el.appendChild(element);
    }
  };


  Extend.prototype.checkCustomPattern = function () {
    var an = window.getSelection().anchorNode;
    var pe = an.parentElement;
    
    var peC = pe.innerHTML;
    const parseData = this.getFind(peC);

    if (parseData) {
      const elements = this.createContent(parseData);
      this.updateContent(pe, elements);
    }
  };

  Extend.prototype.capturePattern = function () {
    if(ctTime) {
      window.clearTimeout(ctTime);
      ctTime = null;
    } else {
      ctTime = window.setTimeout(() => {
        this.checkCustomPattern();
      }, 100);
    }
  };

  window.Extend = Extend;
})($, window, document);

