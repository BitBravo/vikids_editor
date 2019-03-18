/*global MediumEditor*/

; (function ($, window, document, Util, undefined) {

    'use strict';

    /** Default values */
    var pluginName = 'mediumInsert',
        addonName = 'Actions',
        defaults = {
            enableButton: false,
        };
    
    function ucfirst(str) {
        return str.charAt(0).toUpperCase() + str.slice(1);
    }

    /**
     * Actions object
     *
     * Sets options, variables and calls init() function
     *
     * @constructor
     * @param {DOM} el - DOM element to init the plugin on
     * @param {object} options - Options to override defaults
     * @return {void}
     */

    function Actions(el, options) {
        this.el = el;
        this.$el = $(el);
        this.$currentImage = null;
        this.templates = window.MediumInsert.Templates;
        this.core = this.$el.data('plugin_' + pluginName);
        this.options = $.extend(true, {}, defaults, options);
        this._name = pluginName;
        this.elementId = `medium-content-${options.elementId}`;
        this.validNavigation = false;
        // console.log(this.options)


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

    Actions.prototype.init = function (content) {
        this.exceptionEvents();
        this.windowsCloseEvent();
        window.setInterval(() => {
            this.saveStorage(this.el.innerHTML)
       }, 2000)
    };

    /**
     * Exception Closing Events
     *
     * @return {void}
     */

    Actions.prototype.exceptionEvents = function () {
        $(document).on('keypress', function(e) {
            if (e.keyCode == 116){
                this.validNavigation = true;
            }
        });

        $(document).on("click", "a" , function() {
            this.validNavigation = true;

        });

        $(document).on("submit", "form" , function() {
            this.validNavigation = true;
        });

        $(document).bind("click", "input[type=submit]" , function() {
            this.validNavigation = true;
        });

        $(document).bind("click", "button[type=submit]" , function() {
            this.validNavigation = true;
        });
    };

    /**
     * Windows Closing Events
     *
     * @return {void}
     */

    Actions.prototype.windowsCloseEvent = function () {
        window.onbeforeunload = function() {
            localStorage.clear();
            // return '';
          };
    };

    /**
     * Save all content data to local storage if there is any changes and request saveAction.
     *
     * @returns {void}
     */
    Actions.prototype.saveStorage = function (content) {
        if (content !== window.localStorage.getItem(this.elementId)) {
            window.localStorage.setItem(this.elementId, content);
            console.log(`Content updated for ${this.elementId}`);

            // Request content saveACtion
            this.actionRequest('put', this.options.actionsOption.uploadURL, JSON.stringify({ "content" : content }));
        }
    }

    /**
     * Remove all content data from local storage
     *
     * @returns {void}
     */
    Actions.prototype.destoryStorage = function () {
        if (window.localStorage.getItem(this.elementId)) {
            window.localStorage.removeItem(this.elementId)
            console.log(`Content removed for ${this.elementId} from localstorage`);
        }
    }

     /**
     * Request Action
     *
     * @returns {void}
     */
    Actions.prototype.actionRequest = function (method='get', url, data) {
        $.ajax({
            url: url,
            headers: {
                'Accept' : 'application/json',
                'Content-Type': 'application/json'
            },
            type: method,
            data: data,
            success: function(d) {
                console.log('Your request successfully')
            }
        });
    }

    /** Plugin initialization */
    $.fn[pluginName + addonName] = function (options) {
        return this.each(function () {
            if (!$.data(this, 'plugin_' + pluginName + addonName)) {
                $.data(this, 'plugin_' + pluginName + addonName, new Actions(this, options));
            }
        });
    };

})(jQuery, window, document, MediumEditor.util);
