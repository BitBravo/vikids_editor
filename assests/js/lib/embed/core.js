;(function ($, window, document, undefined) {

    'use strict';

    /** Default values */
    var pluginName = 'mediumInsert',
        defaults = {
            editor: null,
            enabled: true,
            addons: {
                images: true, // boolean or object containing configuration
                embeds: true,
                actions: true,
                emoji: true,
            },
        };


    /**
     * Capitalize first character
     *
     * @param {string} str
     * @return {string}
     */

    function ucfirst(str) {
        return str.charAt(0).toUpperCase() + str.slice(1);
    }

    /**
     * Core plugin's object
     *
     * Sets options, variables and calls init() function
     *
     * @constructor
     * @param {DOM} el - DOM element to init the plugin on
     * @param {object} options - Options to override defaults
     * @return {void}
     */

    function Core(el, options) {
        var editor;

        this.el = el;
        this.$el = $(el);
        this.templates = window.MediumInsert.Templates;
        this.extend = new Extend();
        this.targetEl = '',
        this.ctTime = null;

        if (options) {
            // Fix #142
            // Avoid deep copying editor object, because since v2.3.0 it contains circular references which causes jQuery.extend to break
            // Instead copy editor object to this.options manually
            editor = options.editor;
            options.editor = null;
        }
        this.options = $.extend(true, {}, defaults, options);
        this.options.editor = editor;
        if (options) {
            options.editor = editor; // Restore original object definition
        }

        this._defaults = defaults;
        this._name = pluginName;
        // Extend editor's functions
        if (this.options && this.options.editor) {
            if (this.options.editor._serialize === undefined) {
                this.options.editor._serialize = this.options.editor.serialize;
            }
            if (this.options.editor._destroy === undefined) {
                this.options.editor._destroy = this.options.editor.destroy;
            }
            if (this.options.editor._setup === undefined) {
                this.options.editor._setup = this.options.editor.setup;
            }
            this.options.editor._hideInsertButtons = this.hideButtons;

            this.options.editor.serialize = this.editorSerialize;
            this.options.editor.destroy = this.editorDestroy;
            this.options.editor.setup = this.editorSetup;

            if (this.options.editor.getExtensionByName('placeholder') !== undefined) {
                this.options.editor.getExtensionByName('placeholder').updatePlaceholder = this.editorUpdatePlaceholder;
            }
        }
    }

    /**
     * Initialization
     *
     * @return {void}
     */

    Core.prototype.init = function () {
        this.$el.addClass('medium-editor-insert-plugin');

        if (typeof this.options.addons !== 'object' || Object.keys(this.options.addons).length === 0) {
            this.disable();
        }

        this.initAddons();
        this.clean();
        this.events();
    };

    /**
     * Event listeners
     *
     * @return {void}
     */

    Core.prototype.events = function () {
        var that = this;


        this.$el
            .on('drop', function (e) {
                e.preventDefault();
                $.proxy(that, 'dragDropAction')(e);
            })
            .on('keyup click', $.proxy(this, 'toggleButtons'))
            .on('selectstart mousedown', '.medium-insert, .medium-insert-buttons', $.proxy(this, 'disableSelection'))
            .on('click', '.medium-insert-buttons-show', $.proxy(this, 'toggleAddons'))
            .on('click', '.medium-insert-action', $.proxy(this, 'addonAction'))
            .on('paste', '.medium-insert-caption-placeholder', function (e) {
                $.proxy(that, 'removeCaptionPlaceholder')($(e.target));
            });

        $(window).on('resize', $.proxy(this, 'positionButtons', null));
    };

    /**
     * Return editor instance
     *
     * @return {object} MediumEditor
     */

    Core.prototype.getEditor = function () {
        return this.options.editor;
    };

    /**
     * Extend editor's serialize function
     *
     * @return {object} Serialized data
     */

    Core.prototype.editorSerialize = function () {
        var data = this._serialize();

        $.each(data, function (key) {
            var $data = $('<div />').html(data[key].value);

            $data.find('.medium-insert-buttons').remove();
            $data.find('.medium-insert-active').removeClass('medium-insert-active');

            // Restore original embed code from embed wrapper attribute value.
            $data.find('[data-embed-code]').each(function () {
                var $this = $(this),
                    html = $('<div />').html($this.attr('data-embed-code')).text();
                $this.html(html);
            });

            data[key].value = $data.html();
        });

        return data;
    };

    /**
     * Extend editor's destroy function to deactivate this plugin too
     *
     * @return {void}
     */

    Core.prototype.editorDestroy = function () {
        $.each(this.elements, function (key, el) {
            if ($(el).data('plugin_' + pluginName) instanceof Core) {
                $(el).data('plugin_' + pluginName).disable();
            }
        });

        this._destroy();
    };

    /**
     * Extend editor's setup function to activate this plugin too
     *
     * @return {void}
     */

    Core.prototype.editorSetup = function () {
        this._setup();

        $.each(this.elements, function (key, el) {
            if ($(el).data('plugin_' + pluginName) instanceof Core) {
                $(el).data('plugin_' + pluginName).enable();
            }
        });
    };

    /**
     * Extend editor's placeholder.updatePlaceholder function to show placeholder dispite of the plugin buttons
     *
     * @return {void}
     */

    Core.prototype.editorUpdatePlaceholder = function (el, dontShow) {
        var contents = $(el).children()
            .not('.medium-insert-buttons').contents();

        if (!dontShow && contents.length === 1 && contents[0].nodeName.toLowerCase() === 'br') {
            this.showPlaceholder(el);
            this.base._hideInsertButtons($(el));
        } else {
            this.hidePlaceholder(el);
        }
    };

    /**
     * Trigger editableInput on editor
     *
     * @return {void}
     */

    Core.prototype.triggerInput = function () {
        if (this.getEditor()) {
            this.getEditor().trigger('editableInput', null, this.el);
        }
    };

    /**
     * Deselects selected text
     *
     * @return {void}
     */

    Core.prototype.deselect = function () {
        document.getSelection().removeAllRanges();
    };

    /**
     * Disables the plugin
     *
     * @return {void}
     */

    Core.prototype.disable = function () {
        this.options.enabled = false;

        this.$el.find('.medium-insert-buttons').addClass('hide');
    };

    /**
     * Enables the plugin
     *
     * @return {void}
     */

    Core.prototype.enable = function () {
        this.options.enabled = true;

        this.$el.find('.medium-insert-buttons').removeClass('hide');
    };

    /**
     * Disables selectstart mousedown events on plugin elements except images
     *
     * @return {void}
     */

    Core.prototype.disableSelection = function (e) {
        var $el = $(e.target);

        if ($el.is('img') === false || $el.hasClass('medium-insert-buttons-show')) {
            e.preventDefault();
        }
    };

    /**
     * Initialize addons
     *
     * @return {void}
     */

    Core.prototype.initAddons = function () {
        var that = this;

        if (!this.options.addons || this.options.addons.length === 0) {
            return;
        }

        $.each(this.options.addons, function (addon, options) {
            var addonName = pluginName + ucfirst(addon);

            if (options === false) {
                delete that.options.addons[addon];
                return;
            }

            that.$el[addonName](options);
            that.options.addons[addon] = that.$el.data('plugin_' + addonName).options;
        });

        if (this.options.enabled) {
            this.$el.append(this.templates['src/js/templates/images-fileupload.hbs']());
            this.$el.find('input:file').hide();
            this.$el.data('plugin_' + pluginName + ucfirst('images'))['add'](true);
        }
    };

    /**
     * Cleans a content of the editor
     *
     * @return {void}
     */

    Core.prototype.clean = function () {
        var that = this,
            $buttons, $lastEl, $text;

        if (this.options.enabled === false) {
            return;
        }

        if (this.$el.html().length === 0) {
            this.$el.html(this.templates['src/js/templates/core-empty-line.hbs']().trim());
        }

        // Fix #29
        // Wrap content text in <p></p> to avoid Firefox problems
        $text = this.$el
            .contents()
            .filter(function () {
                return (this.nodeName === '#text' && $.trim($(this).text()) !== '') || this.nodeName.toLowerCase() === 'br';
            });

        $text.each(function () {
            $(this).wrap('<p />');

            // Fix #145
            // Move caret at the end of the element that's being wrapped
            that.moveCaret($(this).parent(), $(this).text().length);
        });

        this.addButtons();

        $buttons = this.$el.find('.medium-insert-buttons');
        $lastEl = $buttons.prev();
        if ($lastEl.attr('class') && $lastEl.attr('class').match(/medium\-insert(?!\-active)/)) {
            $buttons.before(this.templates['src/js/templates/core-empty-line.hbs']().trim());
        }
    };

    /**
     * Returns HTML template of buttons
     *
     * @return {string} HTML template of buttons
     */

    Core.prototype.getButtons = function () {
        if (this.options.enabled === false) {
            return;
        }

        const filteredAddons =
            Object.keys(this.options.addons)
                .filter(key => (
                    this.options.addons[key].enableButton === 'undefined' || this.options.addons[key].enableButton
                ))
            .reduce((obj, key) => {
                obj[key] = this.options.addons[key];
                return obj;
            }, {});

        return this.templates['src/js/templates/core-buttons.hbs']({
            addons: filteredAddons
        }).trim();
    };

    /**
     * Appends buttons at the end of the $el
     *
     * @return {void}
     */

    Core.prototype.addButtons = function () {
        if (this.$el.find('.medium-insert-buttons').length === 0) {
            this.$el.append(this.getButtons());
        }
    };

    /**
     * Move buttons to current active, empty paragraph and show them
     *
     * @return {void}
     */

    Core.prototype.toggleButtons = function (e) {
        this.capturePattern();

        var $el = $(e.target),
        selection = window.getSelection(),
        that = this,
        range, $current, $p, activeAddon;

        if (this.options.enabled === false) {
            return;
        }

        if (!selection || selection.rangeCount === 0) {
            $current = $el;
        } else {
            range = selection.getRangeAt(0);
            $current = $(range.commonAncestorContainer);
        }

        // When user clicks on  editor's placeholder in FF, $current el is editor itself, not the first paragraph as it should
        if ($current.hasClass('medium-editor-insert-plugin')) {
            $current = $current.find('p:first');
        }

        $p = $current.is('p') ? $current : $current.closest('p');

        this.clean();

        if ($el.hasClass('medium-editor-placeholder') === false && $el.closest('.medium-insert-buttons').length === 0 && $current.closest('.medium-insert-buttons').length === 0) {

            this.$el.find('.medium-insert-active').removeClass('medium-insert-active');

            $.each(this.options.addons, function (addon) {
                if ($el.closest('.medium-insert-' + addon).length) {
                    $current = $el;
                }

                if ($current.closest('.medium-insert-' + addon).length) {
                    $p = $current.closest('.medium-insert-' + addon);
                    activeAddon = addon;
                    return;
                }
            });

            if ($p.length && (($p.text().trim() === '' && !activeAddon) || activeAddon === 'images')) {
                $p.addClass('medium-insert-active');

                if (activeAddon === 'images') {
                    this.$el.find('.medium-insert-buttons').attr('data-active-addon', activeAddon);
                } else {
                    this.$el.find('.medium-insert-buttons').removeAttr('data-active-addon');
                }

                // If buttons are displayed on addon paragraph, wait 100ms for possible captions to display
                setTimeout(function () {
                    that.positionButtons(activeAddon);
                    that.showButtons(activeAddon);
                }, activeAddon ? 100 : 0);
            } else {
                this.hideButtons();
            }
        }
    };

    /**
     * Show buttons
     *
     * @param {string} activeAddon - Name of active addon
     * @returns {void}
     */

    Core.prototype.showButtons = function (activeAddon) {
        var $buttons = this.$el.find('.medium-insert-buttons');

        $buttons.show();
        $buttons.find('li').show();

        if (activeAddon) {
            $buttons.find('li').hide();
            $buttons.find('button[data-addon="' + activeAddon + '"]').parent().show();
        }
    };

    /**
     * Hides buttons
     *
     * @param {jQuery} $el - Editor element
     * @returns {void}
     */

    Core.prototype.hideButtons = function ($el) {
        $el = $el || this.$el;

        $el.find('.medium-insert-buttons').hide();
        $el.find('.medium-insert-buttons-addons').hide();
        $el.find('.medium-insert-buttons-show').removeClass('medium-insert-buttons-rotate');
    };

    /**
     * Position buttons
     *
     * @param {string} activeAddon - Name of active addon
     * @return {void}
     */

    Core.prototype.positionButtons = function (activeAddon) {
        var $buttons = this.$el.find('.medium-insert-buttons'),
            $p = this.$el.find('.medium-insert-active'),
            $lastCaption = $p.hasClass('medium-insert-images-grid') ? [] : $p.find('figure:last figcaption'),
            elementsContainer = this.getEditor() ? this.getEditor().options.elementsContainer : $('body').get(0),
            elementsContainerAbsolute = ['absolute', 'fixed'].indexOf(window.getComputedStyle(elementsContainer).getPropertyValue('position')) > -1,
            position = {};

        if ($p.length) {
            position.left = $p.position().left;
            position.top = $p.position().top;

            if (activeAddon) {
                position.left += $p.width() - $buttons.find('.medium-insert-buttons-show').width() - 10;
                position.top += $p.height() - 20 + ($lastCaption.length ? -$lastCaption.height() - parseInt($lastCaption.css('margin-top'), 10) : 10);
            } else {
                position.left += -parseInt($buttons.find('.medium-insert-buttons-addons').css('left'), 10) - parseInt($buttons.find('.medium-insert-buttons-addons button:first').css('margin-left'), 10);
                position.top += parseInt($p.css('margin-top'), 10);
            }

            if (elementsContainerAbsolute) {
                position.top += elementsContainer.scrollTop;
            }

            if (this.$el.hasClass('medium-editor-placeholder') === false && position.left < 0) {
                position.left = $p.position().left;
            }

            $buttons.css(position);
        }
    };

    /**
     * Toggles addons buttons
     *
     * @return {void}
     */

    Core.prototype.toggleAddons = function () {
        if (this.$el.find('.medium-insert-buttons').attr('data-active-addon') === 'images') {
            this.$el.find('.medium-insert-buttons').find('button[data-addon="images"]').click();
            return;
        }

        // show the additional insert button
        this.$el.find('.medium-insert-buttons-addons').fadeToggle();
        // rotate the addon toolbar button
        this.$el.find('.medium-insert-buttons-show').toggleClass('medium-insert-buttons-rotate');
    };

    /**
     * Hide addons buttons
     *
     * @return {void}
     */

    Core.prototype.hideAddons = function () {
        this.$el.find('.medium-insert-buttons-addons').hide();
        this.$el.find('.medium-insert-buttons-show').removeClass('medium-insert-buttons-rotate');
    };

    /**
     * Call addon's action
     *
     * @param {Event} e
     * @return {void}
     */

    Core.prototype.addonAction = function (e) {
        var $a = $(e.currentTarget),
            addon = $a.data('addon'),
            action = $a.data('action');
        this.$el.data('plugin_' + pluginName + ucfirst(addon))[action]();
    };


    /**
     * Call drag-drop's action
     *
     * @param {Event} e
     * @return {void}
     */

    Core.prototype.dragDropAction = function (e) {

        var targetElement = e.target;
        if(e.type === 'drop') {
            this.$el.find('.medium-insert-active').removeClass('medium-insert-active');
            this.$el.find('.medium-insert-embeds-active').removeClass('medium-insert-embeds-active');
            e.target.click();

            var newMediaDiv = document.createElement("div");
            newMediaDiv.className = 'medium-insert-active';
            targetElement.after(newMediaDiv);
        }
    };


    /**
     * Move caret at the beginning of the empty paragraph
     *
     * @param {jQuery} $el Element where to place the caret
     * @param {integer} position Position where to move caret. Default: 0
     *
     * @return {void}
     */

    Core.prototype.appendAttribute = function (state) {
        var { tokens } = state;
        for (let i = 0; i < tokens.length; i += 1) {
            if (tokens[i].map) {
            tokens[i].attrJoin('class', `line${String(tokens[i].map[0])} line-block`);
            tokens[i].attrJoin('data-line', `${String([tokens[i].map[0], tokens[i].map[1]])}`);
            }
        }
    };

    Core.prototype.moveCaret = function ($el, position) {
        var range, sel, el, textEl;

        position = position || 0;
        range = document.createRange();
        sel = window.getSelection();
        el = $el.get(0);

        if (!el.childNodes.length) {
            textEl = document.createTextNode(' ');
            el.appendChild(textEl);
        }

        range.setStart(el.childNodes[0], position);
        range.collapse(true);
        sel.removeAllRanges();
        sel.addRange(range);
    };

    /**
     * Add caption
     *
     * @param {jQuery Element} $el
     * @param {string} placeholder
     * @return {void}
     */

    Core.prototype.addCaption = function ($el, placeholder) {
        var $caption = $el.find('figcaption');

        if ($caption.length === 0) {
            $el.append(this.templates['src/js/templates/core-caption.hbs']({
                placeholder: placeholder,
            }));
        }
    };

    /**
     * Remove captions
     *
     * @param {jQuery Element} $ignore
     * @return {void}
     */

    Core.prototype.removeCaptions = function ($ignore) {
        var $captions = this.$el.find('figcaption');

        if ($ignore) {
            $captions = $captions.not($ignore);
        }

        $captions.each(function () {
            if ($(this).hasClass('medium-insert-caption-placeholder') || $(this).text().trim() === '') {
                $(this).remove();
            }
        });
    };


    /**
     * Remove caption placeholder
     *
     * @param {jQuery Element} $el
     * @return {void}
     */

    Core.prototype.removeCaptionPlaceholder = function ($el) {
        var $caption = $el.is('figcaption') ? $el : $el.find('figcaption');

        if ($caption.length) {
            $caption
                .removeClass('medium-insert-caption-placeholder')
                .removeAttr('data-placeholder');
        }
    };

    /**
     * Remove caption placeholder
     *
     * @param {jQuery Element} $el
     * @return {void}
     */

    Core.prototype.addCaptionContent = function ($el, text) {
        var $caption = $el.is('figcaption') ? $el : $el.find('figcaption');

        if ($caption.length) {
            $caption[0].innerHTML = text;
            $caption
                .removeClass('medium-insert-caption-placeholder')
                .removeAttr('data-placeholder');
        }
    };

    /**
     * Create the empty media container
     *
     * @param {object} data
     * @return {void}
     */

    Core.prototype.createEmptyMediaDiv = function (data, className) {

        var newelement = this.targetEl.clone();
        var newMediaDiv = document.createElement("div");
        newMediaDiv.className = className;
        // newMediaDiv.innerHTML = '</br>'

        this.targetEl.before(newelement.innerHTML = data.preText);
        this.targetEl.after(newelement.innerHTML = data.lastText);
        this.targetEl.replaceWith(newMediaDiv);
    };


     /**
     * Media validation's Callback
     *
     * @param {Object} data
     * @param {Object} result
     * @param {jQuery Element} $el
     * @return {void}
     */

    Core.prototype.embedMedia = function(data, that, result) {
        if(result === 'success' && data.type === 'img') {
            that.createEmptyMediaDiv(data, "medium-insert-active");

            that.$el.data('plugin_' + pluginName + ucfirst('images'))['showImageByURL'](data);
        }

        if(result === 'success' && data.type === 'mov') {
            that.createEmptyMediaDiv(data, "medium-insert-embeds-active");
            that.$el.data('plugin_' + pluginName + ucfirst('embeds'))['oembed'](data.url, null, data.alt);
        }
    };


    /**
     * Image file validation by MIME type
     *
     * @param {string} url
     * @param {int} timeoutT
     * @return {function}
     */

    Core.prototype.imageValidate = function (url, timeoutT) {
        return new Promise(function(resolve) {
          var timeout = timeoutT || 2000;
          var timer, img = new Image();
          img.onerror = img.onabort = function() {
              clearTimeout(timer);
              resolve("error");
          };
          img.onload = function() {
               clearTimeout(timer);
               resolve("success");
          };
          timer = setTimeout(function() {
              // reset .src to invalid URL so it stops previous
              // loading, but doens't trigger new load
              img.src = "//!!!!/noexist.jpg";
              resolve("timeout");
          }, timeout);
          img.src = url;
        });
    };


    /**
     * Video file validation by Iframe API (Youtube, Vimemo, Facebook, Linkedin, Instagram)
     *
     * @param {string} url
     * @param {function} callback
     * @return {function}
     */

    Core.prototype.videoValidate = function (src, callback) {
        var xhttp = new XMLHttpRequest();
        xhttp.onreadystatechange = function() {
            if (this.readyState === 4 && this.status === 200) {
                callback('success');
           }
        };
        xhttp.open("GET", `https://iframe.ly/api/iframely?url=${src}&api_key=e9fb88937d4a97e3361b89`, true);
        xhttp.send();
    };


    /**
     *  Media URL Validation by the special URL pattern and Regex.
     *
     * @param {string} mediaTyepe
     * @param {string} mediaPath
     * @return {bool}
     */

    Core.prototype.checkMediaUrlParse = function (mediaType,  mediaPath) {
        return mediaType === 'img' ?
            (()=>{
                var regex = /(.+\.(jpg|png|jpeg))/g;
                var matches = regex.exec(mediaPath);
                return matches ? true: false;
            })()
            :
            (()=>{
                var regex = /(www\..+\..+)/g;
                var matches = regex.exec(mediaPath);
                return matches ? true: false;
            })();
    };


    /**
    *  Pattern validation check
    *
    * @param {html elements} targetEl
    * @return {object}
    */

    Core.prototype.checkTemplateValidate = function () {
        var str = this.targetEl[0].innerText;

        // var regex = /\[\!\[(.*?)\]\((.+\.(png|jpg|jpeg))\)\]/g;
        var regex = /\[(!|@)\[(.*?)\]\((.+)\)\]/g;
        var matches = regex.exec(str);

       return  matches && matches[2] ?
        (()=>{
            var mediaType = matches[1] === '!' ? 'img' : 'mov';
            var altText = matches[2];
            var filePath = matches[3];

            // check if the current file is valid media file
            var fileURLValidate= this.checkMediaUrlParse(mediaType, filePath);
            if (fileURLValidate) {
                var startPos = matches.index;
                var lastPos = matches.index + matches[0].length;
                var preText = str.slice(0, startPos);
                var lastText = str.slice(lastPos);

                return {
                    url: filePath,
                    alt: altText,
                    type: mediaType,
                    preText: preText,
                    lastText: lastText
                };

            } else {
                console.log('File is not valid media file');
                return false;
            }
        })()
        :
        (()=>{
            return false;
        })();
    };

    Core.prototype.getCursorPosition = function (element) {
        element = element || document.querySelector('.editable');
        var caretOffset = 0;
        var preCaretRange = '';
        var doc = element.ownerDocument || element.document;
        var win = doc.defaultView || doc.parentWindow;
        var sel;
        if (typeof win.getSelection !== "undefined") {
            sel = win.getSelection();
            if (sel.rangeCount > 0) {
                var range = win.getSelection().getRangeAt(0);
                preCaretRange = range.cloneRange();
                preCaretRange.selectNodeContents(element);
                preCaretRange.setEnd(range.endContainer, range.endOffset);
                caretOffset = preCaretRange.toString().length;
            }
        } else if ( (sel = doc.selection) && sel.type !=="Control") {
            var textRange = sel.createRange();
            var preCaretTextRange = doc.body.createTextRange();
            preCaretTextRange.moveToElementText(element);
            preCaretTextRange.setEndPoint("EndToEnd", textRange);
            caretOffset = preCaretTextRange.text.length;
        }

        return {point: caretOffset, text: preCaretRange.toString()};
    };

    Core.prototype.getAllTextnodes = function (el) {
        el = el || document.querySelector('.editable');
        var n, a=[], walk=document.createTreeWalker(el,NodeFilter.SHOW_TEXT,null,false);
        while(n=walk.nextNode()) a.push(n);
        return a;
    };

    Core.prototype.getCursorData = function (el, position){
        el = el || document.querySelector('.editable');
        var node, nodes = this.getAllTextnodes(el);
        for(var n = 0; n < nodes.length; n++) {
            if (position > nodes[n].nodeValue.length && nodes[n+1]) {
                // remove amount from the position, go to next node
                position -= nodes[n].nodeValue.length;
            } else {
                node = nodes[n];
                break;
            }
        }
        // you'll need the node and the position (offset) to set the caret
        return { node: node, position: position };
    };

    Core.prototype.setCursorPosition = function (d) {
        var sel = window.getSelection(),
        range = document.createRange();
        range.setStart(d.node, d.position);
        range.collapse(true);
        sel.removeAllRanges();
        sel.addRange(range);
    };

    Core.prototype.checkInputMediaToolbar = function () {
        var cPoint = this.getCursorPosition();
        var cPointDetail = this.getCursorData(null, cPoint.point);
    };

    Core.prototype.checkCustomPattern = function () {
        var an = window.getSelection().anchorNode;
        this.targetEl = $(an.parentElement);

        this.checkInputMediaToolbar();
        // Parsed element data || false
        var templateValidate = this.checkTemplateValidate();
        if (templateValidate) {
            var mediaTyepe = templateValidate.type;
            var mediaPath = templateValidate.url;

            // Check the the media file validation provided by URL
            if(mediaTyepe === 'img') {
                this.imageValidate(mediaPath)
                .then(this.embedMedia.bind(null, templateValidate, this));
            }
            // else {
            //     this.videoValidate(mediaPath, this.embedMedia.bind(null, templateValidate, this))
            // }

        }
    };

    Core.prototype.capturePattern = function () {
        if(this.ctTime) {
            window.clearTimeout(this.ctTime);
            this.ctTime = null;
        }

        this.ctTime = window.setTimeout(() => {
            this.checkCustomPattern();
        }, 500);

    };

    /** Plugin initialization */

    $.fn[pluginName] = function (options) {
        return this.each(function () {
            var that = this,
                textareaId;

            if ($(that).is('textarea')) {
                textareaId = $(that).attr('medium-editor-textarea-id');
                that = $(that).siblings('[medium-editor-textarea-id="' + textareaId + '"]').get(0);
            }

            if (!$.data(that, 'plugin_' + pluginName)) {
                // Plugin initialization
                $.data(that, 'plugin_' + pluginName, new Core(that, options));
                $.data(that, 'plugin_' + pluginName).init();
            } else if (typeof options === 'string' && $.data(that, 'plugin_' + pluginName)[options]) {
                // Method call
                $.data(that, 'plugin_' + pluginName)[options]();
            }
        });
    };

})(jQuery, window, document);
