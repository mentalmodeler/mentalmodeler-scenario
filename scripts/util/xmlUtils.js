/* global define */

define([
    'jquery',
    'underscore'

], function ($, _) {

    'use strict';

    var xmlUtils = {};

    // used for parsing nested lists
    xmlUtils.nestedLists = ['relationships', 'concepts'];

    xmlUtils.parseMmpFile = function( xmlString, excludeArray ) {
        if ( typeof excludeArray === 'undefined' ) {
            excludeArray = [];
        }
        var o = {};
        var xmlDoc = $.parseXML( xmlString );
        var childNodes = xmlDoc.firstChild.childNodes;
        for (var i=0; i<childNodes.length; i++ ) {
            var node = childNodes[i];
            switch ( node.localName ) {
                case 'info':
                    if ( excludeArray.indexOf( 'info' ) === -1 ) {
                        o.info = this.getJSONFromNode( node );    
                    }
                    break;
                case 'concepts':
                    if ( excludeArray.indexOf( 'concepts' ) === -1 ) {
                        o.concepts = this.getJSONFromArray( this.getChildNodes( node ) );
                    }
                    break;
                case 'scenarios':
                    if ( excludeArray.indexOf( 'scenario' ) === -1 ) {
                        o.scenarios = this.getJSONFromArray( this.getChildNodes( node ) );
                    }
                    break;        
            }
        }
        return o;
    };

    xmlUtils.getChildNodes = function( xml ) {
        var nodes = [];
        var childNodes = xml.childNodes;
        for (var i=0; i<childNodes.length; i++ ) {
            var node = childNodes[i];
            if ( node.nodeType === 1 ) { // element node
                nodes.push( node );
            }
        }
        return nodes;
    };

    xmlUtils.getJSONFromNode = function( xmlNode ) {
        var props = xmlNode.childNodes;
        var o = {};
        for ( var j=0; j<props.length; j++ ) {
            var prop = props[j];
            if ( prop.nodeType === 1) {
                //if ( prop.localName === 'relationships') {
                if ( this.nestedLists.indexOf( prop.localName ) > -1 ) {
                    o[ prop.localName ] = this.getJSONFromArray( this.getChildNodes( prop ) );
                }
                else {
                    o[ prop.localName ] = prop.textContent;
                }
            }
        }
        return o;
    };

    xmlUtils.getJSONFromArray = function( xmlArray ) {
        var a = [];
        for (var i=0; i<xmlArray.length; i++ ) {
            a.push( this.getJSONFromNode( xmlArray[i] ) );
        }
        return a;
    };

    xmlUtils.replaceConceptsNode = function ( modifiedXMLString, sourceXMLString ) {
        var concepts = this.getConceptsNode( modifiedXMLString );
        var xml = $.parseXML( sourceXMLString );
        var childNodes = xml.firstChild.childNodes;
        for (var i=0; i<childNodes.length; i++) {
            var node = childNodes[i];
            if (node.localName === 'concepts') {
                node.parentNode.replaceChild( concepts, node );
            }
        }
        return (new XMLSerializer()).serializeToString( xml );
    };

    xmlUtils.getConceptsNode = function( xmlString ) {
        var concepts = $.parseXML( '<concepts></concepts>' );
        var xmlDoc = $.parseXML( xmlString );
        var childNodes = xmlDoc.firstChild.childNodes;
        for (var i=0; i<childNodes.length; i++ ) {
            var node = childNodes[i];
            if ( node.localName === 'concepts') {
                concepts = node;
            }
        }
        return concepts;
    };

    return xmlUtils;
});


