/*global MediumEditor*/

; (function ($, window, document, Util, undefined) {

    'use strict';

    /** Default values */
    var pluginName = 'mediumInsert',
        addonName = 'Images', // first char is uppercase
        defaults = {
            label: '<span class="fa fa-camera"></span>',
            preview: false,
            captions: true,
            captionPlaceholder: 'Type caption for image (optional)',
            autoGrid: 3,
            fileUploadOptions: {
                url: null,
                type: 'POST',
                acceptFileTypes: /(\.|\/)(gif|jpe?g|png)$/i,
                sequentialUploads: true,
            },
            fileDeleteOptions: {
                type: 'DELETE'
            },
            styles: {
                wide: {
                    label: '<span class="fa fa-align-justify"></span>'
                    // added: function ($el) {},
                    // removed: function ($el) {}
                },
                left: {
                    label: '<span class="fa fa-align-left"></span>'
                    // added: function ($el) {},
                    // removed: function ($el) {}
                },
                right: {
                    label: '<span class="fa fa-align-right"></span>'
                    // added: function ($el) {},
                    // removed: function ($el) {}
                },
                grid: {
                    label: '<span class="fa fa-th"></span>'
                    // added: function ($el) {},
                    // removed: function ($el) {}
                }
            },
            actions: {
                remove: {
                    label: '<span class="fa fa-times"></span>',
                    clicked: function () {
                        var $event = $.Event('keydown');

                        $event.which = 8;
                        $(document).trigger($event);
                    }
                }
            },
            sorting: function () {
                var that = this;

                $('.medium-insert-images').sortable({
                    group: 'medium-insert-images',
                    containerSelector: '.medium-insert-images',
                    itemSelector: 'figure',
                    placeholder: '<figure class="placeholder">',
                    handle: 'img',
                    nested: false,
                    vertical: false,
                    afterMove: function () {
                        that.core.triggerInput();
                    }
                });
            },
            messages: {
                acceptFileTypesError: 'This file is not in a supported format: ',
                maxFileSizeError: 'This file is too big: '
            },
            enableButton: true,

            // uploadError: function($el, data) {}
            // uploadCompleted: function ($el, data) {}
        };
    function ucfirst(str) {
        return str.charAt(0).toUpperCase() + str.slice(1);
    }


    /**
     * Images object
     *
     * Sets options, variables and calls init() function
     *
     * @constructor
     * @param {DOM} el - DOM element to init the plugin on
     * @param {object} options - Options to override defaults
     * @return {void}
     */

    function Images(el, options) {
        this.el = el;
        this.$el = $(el);
        this.$currentImage = null;
        this.templates = window.MediumInsert.Templates;
        this.core = this.$el.data('plugin_' + pluginName);

        this.options = $.extend(true, {}, defaults, options);

        this._defaults = defaults;
        this._name = pluginName;

        // Allow image preview only in browsers, that support's that
        if (this.options.preview && !window.FileReader) {
            this.options.preview = false;
        }

        // Extend editor's functions
        if (this.core.getEditor()) {
            this.core.getEditor()._serializePreImages = this.core.getEditor().serialize;
            this.core.getEditor().serialize = this.editorSerialize;
        }

        this.init();
    }

    /**
     * Initialization
     *
     * @return {void}
     */

    Images.prototype.init = function () {
        var $images = this.$el.find('.medium-insert-images');

        $images.find('figcaption').attr('contenteditable', true);
        $images.find('figure').attr('contenteditable', false);

        this.events();
        this.backwardsCompatibility();
        this.sorting();
    };

    /**
     * Event listeners
     *
     * @return {void}
     */

    Images.prototype.events = function () {
        $(document)
            .on('click', $.proxy(this, 'unselectImage'))
            .on('keydown', $.proxy(this, 'removeImage'))
            .on('click', '.medium-insert-images-toolbar .medium-editor-action', $.proxy(this, 'toolbarAction'))
            .on('click', '.medium-insert-images-toolbar2 .medium-editor-action', $.proxy(this, 'toolbar2Action'));

        this.$el
            .on('click', '.medium-insert-images img', $.proxy(this, 'selectImage'));

        $(window)
            .on('resize', $.proxy(this, 'autoRepositionToolbars'));
    };

    /**
     * Replace v0.* class names with new ones
     *
     * @return {void}
     */

    Images.prototype.backwardsCompatibility = function () {
        this.$el.find('.mediumInsert')
            .removeClass('mediumInsert')
            .addClass('medium-insert-images');

        this.$el.find('.medium-insert-images.small')
            .removeClass('small')
            .addClass('medium-insert-images-left');
    };

    /**
     * Extend editor's serialize function
     *
     * @return {object} Serialized data
     */

    Images.prototype.editorSerialize = function () {
        var data = this._serializePreImages();

        $.each(data, function (key) {
            var $data = $('<div />').html(data[key].value);

            $data.find('.medium-insert-images').find('figcaption, figure').removeAttr('contenteditable');
            $data.find('.medium-insert-images-progress').remove();

            data[key].value = $data.html();
        });

        return data;
    };

    /**
     * Add image
     *
     * @return {void}
     */

    Images.prototype.add = function (mediaData) {
        console.log("mediaData", mediaData);
        if(mediaData) {
            var that = this,
                $file = this.$el.find('input:file'),
                fileUploadOptions = {
                    dataType: 'json',
                    replaceFileInput: true,
                    dropZone: $(this.$el),
                    drop: function (e, data) {
                        // e.preventDefault();
                    },
                    add: function (e, data) {
                        $.proxy(that, 'uploadAdd', e, data)();
                    },
                    done: function (e, data) {
                        $.proxy(that, 'uploadDone', e, data)();
                    }
                };

            // Only add progress callbacks for browsers that support XHR2,
            // and test for XHR2 per:
            // http://stackoverflow.com/questions/6767887/
            // what-is-the-best-way-to-check-for-xhr2-file-upload-support
            if (new XMLHttpRequest().upload) {
                console.log("new XMLHttpRequest().upload");
                fileUploadOptions.progress = function (e, data) {
                    $.proxy(that, 'uploadProgress', e, data)();
                };

                fileUploadOptions.progressall = function (e, data) {
                    $.proxy(that, 'uploadProgressall', e, data)();
                };
            }
            $(this.$el).bind('drop dragover', function (e) {
                e.preventDefault();
            });
            console.log("Going to $file.fileupload");
            console.log("this.options.fileUploadOptions", this.options.fileUploadOptions);
            console.log("fileUploadOptions", fileUploadOptions);
            $file.fileupload($.extend(true, {}, this.options.fileUploadOptions, fileUploadOptions));
        } else {
            console.log("clicking the input:file shit", this.$el);
            var $file = this.$el.find('input:file');
            $file.click();
        }
    };

    /**
     * Callback invoked as soon as files are added to the fileupload widget - via file input selection, drag & drop or add API call.
     *
     * @param {Event} e
     * @param {object} data
     * @return {void}
     */

    Images.prototype.uploadAdd = function (e, data) {
        console.log("Images.prototype.uploadAdd this", this);
        console.log("Images.prototype.uploadAdd e", e);
        console.log("Images.prototype.uploadAdd data", data);
        var $place = this.$el.find('.medium-insert-active'),
            that = this,
            uploadErrors = [],
            file = data.files? data.files[0] : '',
            acceptFileTypes = this.options.fileUploadOptions.acceptFileTypes,
            maxFileSize = this.options.fileUploadOptions.maxFileSize,
            reader;

        if (acceptFileTypes && !acceptFileTypes.test(file.type)) {
            uploadErrors.push(this.options.messages.acceptFileTypesError + file.name);
        } else if (maxFileSize && file.size > maxFileSize) {
            uploadErrors.push(this.options.messages.maxFileSizeError + file.name);
        }

        if (uploadErrors.length > 0) {
            if (this.options.uploadFailed && typeof this.options.uploadFailed === "function") {
                this.options.uploadFailed(uploadErrors, data);
                return;
            }

            alert(uploadErrors.join("\n"));
            return;
        }

        this.core.hideButtons();

        //  Replace paragraph with div, because figure elements can't be inside paragraph,
        if ($place.is('p')) {
            $place.replaceWith('<div class="medium-insert-active">' + $place.html() + '</div>');
            $place = this.$el.find('.medium-insert-active');
            if ($place.next().is('p')) {
                this.core.moveCaret($place.next());
            } else {
                $place.after('<p><br></p>'); // add empty paragraph so we can move the caret to the next line.
                this.core.moveCaret($place.next());
            }
        }

        this.$el.find('.medium-insert-active').map((element)=>{
            element && element.removeClass('medium-insert-active');
        });
        this.$el.find('.medium-insert-embeds-active').map((element)=>{
            element && element.removeClass('medium-insert-embeds-active');
        });

        $place.addClass('medium-insert-images medium-insert-active');

        if (this.options.preview === false && $place.find('progress').length === 0 && (new XMLHttpRequest().upload)) {
            $place.append(this.templates['src/js/templates/images-progressbar.hbs']());
        }

        if (data.autoUpload || (data.autoUpload !== false && $(e.target).fileupload('option', 'autoUpload'))) {

            data.process().done(function () {
                // If preview is set to true, let the showImage handle the upload start
                if (that.options.preview) {
                    reader = new FileReader();

                    reader.onload = function (e) {
                        // first parameter is File content (data:image/jpeg;base64)
                        $.proxy(that, 'showImage', e.target.result, data)();
                    };

                    reader.readAsDataURL(data.files[0]);
                } else {
                    // If preview is set to false, then do force upload
                    data.submit();
                }
            });
        }
    };

    /**
     * Callback for global upload progress events
     * https://github.com/blueimp/jQuery-File-Upload/wiki/Options#progressall
     *
     * @param {Event} e
     * @param {object} data
     * @return {void}
     */

    Images.prototype.uploadProgressall = function (e, data) {
        var progress, $progressbar;

        if (this.options.preview === false) {
            progress = parseInt(data.loaded / data.total * 100, 10);
            $progressbar = this.$el.find('.medium-insert-active').find('progress');

            $progressbar
                .attr('value', progress)
                .text(progress);

            if (progress === 100) {
                $progressbar.remove();
            }
        }
    };

    /**
     * Callback for upload progress events.
     * https://github.com/blueimp/jQuery-File-Upload/wiki/Options#progress
     *
     * @param {Event} e
     * @param {object} data
     * @return {void}
     */

    Images.prototype.uploadProgress = function (e, data) {

        var progress, $progressbar;

        if (this.options.preview) {
            progress = 100 - parseInt(data.loaded / data.total * 100, 10);
            $progressbar = data.context.find('.medium-insert-images-progress');

            $progressbar.css('width', progress + '%');

            if (progress === 0) {
                $progressbar.remove();
            }
        }
    };

    /**
     * Callback for successful upload requests.
     * https://github.com/blueimp/jQuery-File-Upload/wiki/Options#done
     *
     * @param {Event} e
     * @param {object} data
     * @return {void}
     */

    Images.prototype.uploadDone = function (e, data) {
        console.log("Images.prototype.uploadDone this", this);
        console.log("Images.prototype.uploadDone e", e);
        console.log("Images.prototype.uploadDone data", data);
        if(data.result) {
            if(data.result.type ==='img') {
                $.proxy(this, 'showImage', data.result, data)();
            } else {
                // this.$el.data('plugin_' + pluginName + ucfirst('embeds'))['oembed'](data.result.url);
                // this.$el.data('plugin_' + pluginName + ucfirst('embeds'))['oembed']('https://www.youtube.com/watch?v=2Lwd46qBrqU');
            }
        }
        this.core.clean();
        this.sorting();
    };

    /**
     * Add uploaded / preview image to DOM
     *
     * @param {string} img   // File data or File URL
     * @returns {void}
     */

    Images.prototype.showImage = function (img, data) {
        console.log("Images.prototype.showImage img", img);
        console.log("Images.prototype.showImage data", data);

        var $place = this.$el.find('.medium-insert-active'),
            domImage,
            that;

        // Hide editor's placeholder
        $place.click();

        // If preview is allowed and preview image already exists,
        // replace it with uploaded image
        that = this;
        if (this.options.preview && data.context) {
            domImage = this.getDOMImage();
            const fileUrl = img.url.match(/(http|https):\/\//)? img.url: `http://${img.url}`;

            domImage.onload = function () {
                data.context.find('img').attr('src', fileUrl);

                if (this.options.uploadCompleted) {
                    this.options.uploadCompleted(data.context, data);
                }

                that.core.triggerInput();
            }.bind(this);
            domImage.src = fileUrl;

        } else {
            console.log(img, data, this.options.uploadCompleted)

            data.context = $(this.templates['src/js/templates/images-image.hbs']({
                img: typeof img === 'object'? img.url : img,
                progress: this.options.preview
            })).appendTo($place);

            $place.find('br').remove();

            if (this.options.autoGrid && $place.find('figure').length >= this.options.autoGrid) {
                $.each(this.options.styles, function (style, options) {
                    var className = 'medium-insert-images-' + style;

                    $place.removeClass(className);

                    if (options.removed) {
                        options.removed($place);
                    }
                });

                $place.addClass('medium-insert-images-grid');

                if (this.options.styles.grid.added) {
                    this.options.styles.grid.added($place);
                }
            }

            // Preview is to set as true, then upload media files here
            if (this.options.preview) {
                data.submit();
            } else if (this.options.uploadCompleted) {
                // this.options.uploadCompleted(data.context, data);
                data.submit();

            }
        }

        this.core.triggerInput();

        return data.context;
    };

     /**
     * Display image to DOM
     *
     * @param {string} img   // File data or File URL
     * @returns {void}
     */
    Images.prototype.showImageByURL = function (img) {
        console.log("Images.prototype.showImageByURL");
        var $place = this.$el.find('.medium-insert-active').length? this.$el.find('.medium-insert-active') : this.$el.find('.medium-insert-embeds-active'),
            that = this;

        $place.attr('class', 'medium-insert-active medium-insert-images');
        $place.click();

        $place[0].innerHTML = this.templates['src/js/templates/images-image.hbs']({
            img: typeof img === 'object'? img.url : img,
            progress: this.options.preview
        });

        $place.find('br').remove();

        if (typeof img === 'object' && that.options.captions) {
            const $image = $place.find('img');

            img.alt?
                (()=>{
                    that.core.addCaption($image.closest('figure'), that.options.captionPlaceholder);
                    that.core.addCaptionContent($place, img.alt);
                })()
                :
                null;
        }

        if (this.options.autoGrid && $place.find('figure').length >= this.options.autoGrid) {
            $.each(this.options.styles, function (style, options) {
                var className = 'medium-insert-images-' + style;

                $place.removeClass(className);

                if (options.removed) {
                    options.removed($place);
                }
            });

            $place.addClass('medium-insert-images-grid');

            if (this.options.styles.grid.added) {
                this.options.styles.grid.added($place);
            }
        }
        this.core.triggerInput();
    };

    Images.prototype.getDOMImage = function () {
        return new window.Image();
    };

    /**
     * Select clicked image
     *
     * @param {Event} e
     * @returns {void}
     */

    Images.prototype.selectImage = function (e) {
        console.log("Images.prototype.selectImage");
        var that = this,
            $image;

        if (this.core.options.enabled) {
            $image = $(e.target);

            this.$currentImage = $image;

            // Hide keyboard on mobile devices
            this.$el.blur();

            $image.addClass('medium-insert-image-active');
            $image.closest('.medium-insert-images').addClass('medium-insert-active');

            setTimeout(function () {
                that.addToolbar();

                if (that.options.captions) {
                    that.core.addCaption($image.closest('figure'), that.options.captionPlaceholder);
                }
            }, 50);
        }
    };

    /**
     * Unselect selected image
     *
     * @param {Event} e
     * @returns {void}
     */

    Images.prototype.unselectImage = function (e) {

        var $el = $(e.target),
            $image = this.$el.find('.medium-insert-image-active');

        if ($el.is('img') && $el.hasClass('medium-insert-image-active')) {
            $image.not($el).removeClass('medium-insert-image-active');
            $('.medium-insert-images-toolbar, .medium-insert-images-toolbar2').remove();
            this.core.removeCaptions($el);
            return;
        }

        $image.removeClass('medium-insert-image-active');
        $('.medium-insert-images-toolbar, .medium-insert-images-toolbar2').remove();

        if ($el.is('.medium-insert-caption-placeholder')) {
            this.core.removeCaptionPlaceholder($image.closest('figure'));
        } else if ($el.is('figcaption') === false) {
            this.core.removeCaptions();
        }
        this.$currentImage = null;
    };

    /**
     * Remove image
     *
     * @param {Event} e
     * @returns {void}
     */

    Images.prototype.removeImage = function (e) {

        var images = [],
            $selectedImage = this.$el.find('.medium-insert-image-active'),
            $parent, $empty, selection, range, current, caretPosition, $current, $sibling, selectedHtml, i;

        if (e.which === 8 || e.which === 46) {
            if ($selectedImage.length) {
                images.push($selectedImage);
            }

            // Remove image even if it's not selected, but backspace/del is pressed in text
            selection = window.getSelection();
            if (selection && selection.rangeCount) {
                range = selection.getRangeAt(0);
                current = range.commonAncestorContainer;
                $current = current.nodeName === '#text' || current.nodeName === 'BR' ? $(current).parent() : $(current);
                caretPosition = MediumEditor.selection.getCaretOffsets(current).left;

                // Is backspace pressed and caret is at the beginning of a paragraph, get previous element
                if (e.which === 8 && caretPosition === 0) {
                    $sibling = $current.prev();
                // Is del pressed and caret is at the end of a paragraph, get next element
                } else if (e.which === 46 && caretPosition === $current.text().length) {
                    $sibling = $current.next();
                }

                if ($sibling && $sibling.hasClass('medium-insert-images')) {
                    images.push($sibling.find('img'));
                }

                // If text is selected, find images in the selection
                selectedHtml = MediumEditor.selection.getSelectionHtml(document);
                if (selectedHtml) {
                    $('<div></div>').html(selectedHtml).find('.medium-insert-images img').each(function () {
                        images.push($(this));
                    });
                }
            }

            if (images.length) {
                for (i = 0; i < images.length; i++) {
                    this.deleteFile(images[i].attr('src'), images[i]);

                    $parent = images[i].closest('.medium-insert-images');
                    images[i].closest('figure').remove();

                    if ($parent.find('figure').length === 0) {
                        $empty = $parent.next();
                        if ($empty.is('p') === false || $empty.text() !== '') {
                            $empty = $(this.templates['src/js/templates/core-empty-line.hbs']().trim());
                            $parent.before($empty);
                        }
                        $parent.remove();
                    }
                }

                // Hide addons
                this.core.hideAddons();
                if (!selectedHtml && $empty) {
                    e.preventDefault();
                    this.core.moveCaret($empty);
                }

                $('.medium-insert-images-toolbar, .medium-insert-images-toolbar2').remove();
                this.core.triggerInput();
            }
        }
    };

    /**
     * Makes ajax call to deleteScript
     *
     * @param {string} file The name of the file to delete
     * @param {jQuery} $el The jQuery element of the file to delete
     * @returns {void}
     */

    Images.prototype.deleteFile = function (file, $el) {
        const { url } = this.options.fileUploadOptions;

        $.ajax($.extend(true, {}, {
            url: url,
            data: { file: file }
        }, this.options.fileDeleteOptions))
        .then(res => console.log(res.msg))

    };

    /**
     * Adds image toolbar to editor
     *
     * @returns {void}
     */

    Images.prototype.addToolbar = function () {
        var $image = this.$el.find('.medium-insert-image-active'),
            $p = $image.closest('.medium-insert-images'),
            active = false,
            mediumEditor = this.core.getEditor(),
            toolbarContainer = mediumEditor.options.elementsContainer || 'body',
            $toolbar, $toolbar2;

        $(toolbarContainer).append(this.templates['src/js/templates/images-toolbar.hbs']({
            styles: this.options.styles,
            actions: this.options.actions
        }).trim());

        $toolbar = $('.medium-insert-images-toolbar');
        $toolbar2 = $('.medium-insert-images-toolbar2');

        $toolbar.find('button').each(function () {
            if ($p.hasClass('medium-insert-images-' + $(this).data('action'))) {
                $(this).addClass('medium-editor-button-active');
                active = true;
            }
        });

        if (active === false) {
            $toolbar.find('button').first().addClass('medium-editor-button-active');
        }

        this.repositionToolbars();

        $toolbar.fadeIn();
        $toolbar2.fadeIn();
    };

    Images.prototype.autoRepositionToolbars = function () {
        setTimeout(function () {
            this.repositionToolbars();
            this.repositionToolbars();
        }.bind(this), 0);
    };

    Images.prototype.repositionToolbars = function () {
        var $toolbar = $('.medium-insert-images-toolbar'),
            $toolbar2 = $('.medium-insert-images-toolbar2'),
            $image = this.$el.find('.medium-insert-image-active'),
            elementsContainer = this.core.getEditor().options.elementsContainer,
            elementsContainerAbsolute = ['absolute', 'fixed'].indexOf(window.getComputedStyle(elementsContainer).getPropertyValue('position')) > -1,
            elementsContainerBoundary = elementsContainerAbsolute ? elementsContainer.getBoundingClientRect() : null,
            containerWidth = $(window).width(),
            position = {};

        if ($toolbar2.length) {
            position.top = $image.offset().top + 2;
            position.left = $image.offset().left + $image.width() - $toolbar2.width() - 4; // 4px - distance from a border

            if (elementsContainerAbsolute) {
                position.top += elementsContainer.scrollTop - elementsContainerBoundary.top;
                position.left -= elementsContainerBoundary.left;
                containerWidth = $(elementsContainer).width();
            }

            if (position.left + $toolbar2.width() > containerWidth) {
                position.left = containerWidth - $toolbar2.width();
            }

            $toolbar2.css(position);
        }

        if ($toolbar.length) {
            if ($image.closest('.medium-insert-images-grid-active').length) {
                $image = $image.closest('.medium-insert-images-grid-active');
            }

            position.top = $image.offset().top - $toolbar.height() - 8 - 2 - 5; // 8px - hight of an arrow under toolbar, 2px - height of an image outset, 5px - distance from an image
            position.left = $image.offset().left + $image.width() / 2 - $toolbar.width() / 2;

            if (elementsContainerAbsolute) {
                position.top += elementsContainer.scrollTop - elementsContainerBoundary.top;
                position.left -= elementsContainerBoundary.left;
            }

            if (position.top < 0) {
                position.top = 0;
            }

            $toolbar.css(position);
        }
    };

    /**
     * Fires toolbar action
     *
     * @param {Event} e
     * @returns {void}
     */

    Images.prototype.toolbarAction = function (e) {
        var that = this,
            $button, $li, $ul, $lis, $p;

        if (this.$currentImage === null) {
            return;
        }

        $button = $(e.target).is('button') ? $(e.target) : $(e.target).closest('button');
        $li = $button.closest('li');
        $ul = $li.closest('ul');
        $lis = $ul.find('li');
        $p = this.$el.find('.medium-insert-active');

        $button.addClass('medium-editor-button-active');
        $li.siblings().find('.medium-editor-button-active').removeClass('medium-editor-button-active');

        $lis.find('button').each(function () {
            var className = 'medium-insert-images-' + $(this).data('action');

            if ($(this).hasClass('medium-editor-button-active')) {
                $p.addClass(className);

                if (that.options.styles[$(this).data('action')].added) {
                    that.options.styles[$(this).data('action')].added($p);
                }
            } else {
                $p.removeClass(className);

                if (that.options.styles[$(this).data('action')].removed) {
                    that.options.styles[$(this).data('action')].removed($p);
                }
            }
        });

        this.core.hideButtons();

        this.core.triggerInput();
    };

    /**
     * Fires toolbar2 action
     *
     * @param {Event} e
     * @returns {void}
     */

    Images.prototype.toolbar2Action = function (e) {
        var $button, callback;

        if (this.$currentImage === null) {
            return;
        }

        $button = $(e.target).is('button') ? $(e.target) : $(e.target).closest('button');
        callback = this.options.actions[$button.data('action')].clicked;

        if (callback) {
            callback(this.$el.find('.medium-insert-image-active'));
        }

        this.core.hideButtons();

        this.core.triggerInput();
    };

    /**
     * Initialize sorting
     *
     * @returns {void}
     */

    Images.prototype.sorting = function () {
        $.proxy(this.options.sorting, this)();
    };

    /** Plugin initialization */

    $.fn[pluginName + addonName] = function (options) {
        return this.each(function () {
            if (!$.data(this, 'plugin_' + pluginName + addonName)) {
                $.data(this, 'plugin_' + pluginName + addonName, new Images(this, options));
            }
        });
    };

})(jQuery, window, document, MediumEditor.util);
