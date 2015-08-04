/* global define */

define([
    'jquery',
    'underscore'

], function ($, _ ) {

    'use strict';

    var domUtils = {
        regexs: {
            'just-numbers' : /[^\/\d]/g,
            'just-floats' :  /[^\/\d]+\./g,
            'just-lower-case' : /[^a-z]/,
            'just-upper-case' : /[^A-Z]/,
            'upper-and-lower-case' : /[^a-zA-Z]/
        }
    };

    /*
     * if element has id, return sid and true flag
     * if element doesn't have id, uses DataUtils to create unique id, sets element id to that value and returns id and false flag
     */
    domUtils.getElementID = function ( elem ) {
        var attr = 'id';
        var idExisted = true;
        var id = elem.attr(attr);
        if (typeof id === 'undefined') {
            idExisted = false;
            id = DataUtils.makeID();
            elem.attr(attr, id);
        }
        return { 'id': id, 'idExisted': idExisted };
    };

    /*
     * returns an object with the width and height of the viewport
     */
    domUtils.getViewportSize = function () {
        var e = window;
        var a = 'inner';
        if ( !( 'innerWidth' in window ) )
        {
            a = 'client';
            e = document.documentElement || document.body;
        }
        return { width : e[a + 'Width'] , height: e[a + 'Height'] };
    };

    domUtils.element = function(e) {
        return (e instanceof jQuery ? e[0] : e);
    };

    domUtils.existsOnDOM = function( el, containter ) {
        var cont = containter || $('body');
        try {
            return $.contains( domUtils.element(cont), domUtils.element(el) );
        }
        catch ( error ) {
            console.error('ERROR! existsOnDOM, error:',error);
        }
    };

    domUtils.onAddedToDOM = function( options ) {
        console.assert(_.isObject(options), 'Options is not an object');
        var opts = {
            callback: function() {},
            container: $('body')
        };
        _.extend(opts, options);
        opts.el = domUtils.element(opts.el);
        var observer = new MutationObserver( function(mutations) {
            _.each(mutations, function(mutation) {
                var foundNode = _.find(mutation.addedNodes, function(node) {
                    return node === opts.el || $.contains(node, opts.el);
                });
                if (!_.isUndefined(foundNode)) {
                    opts.callback();
                    observer.disconnect();
                }
            });
        });
        observer.observe( domUtils.element(opts.container), {childList: true, subtree: true } );
    };

    domUtils.setSelection = function( $elem, start, end ) {
        // if passed jquery wrapped elem in not defined, return
        if ( _.isUndefined($elem) ) {
            return false;
        }
        // get ref to DOM element. if undefined, return
        var elem = $elem[0];
        if ( _.isUndefined(elem) ) {
            return false;
        }
        // start minimum value is 0
        if ( !_.isNumber(start) || start < 0 ) {
            start = 0;
        }
        // if end is undefined, set it to the start value
        if ( _.isUndefined(end) ) {
            end = start;
        }
        // if elem had setSelectionRange method, use that
        if ( _.isFunction(elem.setSelectionRange) ) {
            elem.setSelectionRange( start, end );
            return true;
        }
        // else if elem had createTextRange method, use that
        else if ( _.isFunction(elem.createTextRange) ) {
            var range = elem.createTextRange();
            range.collapse(true);
            range.moveEnd('character', end);
            range.moveStart('character', start);
            range.select();
            return true;
        }
        return false;
    };

    domUtils.getCursorPosition = function( $elem ) {
        if ( _.isUndefined($elem) ) {
            return false;
        }
        // get ref to DOM element. if undefined, return
        var elem = $elem[0];
        if ( _.isUndefined(elem) ) {
            return false;
        }
        // if elem had setSelectionRange method, use that
        if ( elem.selectionStart ) {
            return elem.selectionStart;
        } else if ( document.selection ) {
            elem.focus();
            var r = document.selection.createRange();
            if ( _.isNull(r) ) {
                return 0;
            }
            var re = elem.createTextRange();
            var rc = re.duplicate();
            re.moveToBookmark( r.getBookmark() );
            rc.setEndPoint('EndToStart', re);
            return rc.text.length;
        }
        return 0;
    };

    return domUtils;
});