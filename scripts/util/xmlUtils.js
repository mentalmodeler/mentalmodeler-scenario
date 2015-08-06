/* global define */

define([
    'jquery',
    'underscore',
    'models/app',
    'x2js'

], function ( $, _, AppModel ) {

    'use strict';

    var xmlUtils = {};
    xmlUtils.JOIN_STR = '\n';
    xmlUtils.header = '<?xml version="1.0" encoding="UTF-8"?>';

    // used for parsing nested lists
    xmlUtils.nestedLists = ['relationships', 'concepts'];

    // x2js
    var config = {
        escapeMode: true, // true|false - Escaping XML characters. Default is true from v1.1.0+
        attributePrefix: '_', // "<string>" - Prefix for XML attributes in JSon model. Default is "_"
        arrayAccessForm: 'none', // "none"|"property" - The array access form (none|property). Use this property if you want X2JS generates an additional property <element>_asArray to access in array form for any XML element. Default is none from v1.1.0+
        emptyNodeForm: 'text', // "text"|"object" - Handling empty nodes (text|object) mode. When X2JS found empty node like <test></test> it will be transformed to test : '' for 'text' mode, or to Object for 'object' mode. Default is 'text'
        enableToStringFunc: true, // true|false - Enable/disable an auxiliary function in generated JSON objects to print text nodes with text/cdata. Default is true
        arrayAccessFormPaths: ['mentalModeler.concepts'], // [] - Array access paths. Use this option to configure paths to XML elements always in "array form". You can configure beforehand paths to all your array elements based on XSD or your knowledge. Every path could be a simple string (like 'parent.child1.child2'), a regex (like /.*\.child2/), or a custom function. Default is empty
        skipEmptyTextNodesForObj: true, // true|false - Skip empty text tags for nodes with children. Default is true.
        stripWhitespaces: true //true|false - Strip whitespaces (trimming text nodes). Default is true.
        //datetimeAccessFormPaths: [], // [] - Datetime access paths. Use this option to configure paths to XML elements for "datetime form". You can configure beforehand paths to all your array elements based on XSD or your knowledge. Every path could be a simple string (like 'parent.child1.child2'), a regex (like /.*\.child2/), or a custom function. Default is empty
    };
    xmlUtils.x2js = new X2JS( config );

    xmlUtils.elementsFromJSON = function ( json, exclude, cdata, options ) {
        if ( typeof exclude === 'undefined' ) {
            exclude = [];
        }
        options = options || {};
        var attr = options.attr;
        var xml = [ xmlUtils.JOIN_STR ];
        for ( var key in json ) {
            if ( exclude.indexOf(key) === -1 ) {
                var nodeName = options.nodeName === undefined ? key : options.nodeName;
                var attrs;
                if ( attr !== undefined ) {
                    attrs = [ {name:attr, value:key} ];
                }
                var node = this.elementNL(nodeName, json[key], cdata, attrs);
                xml.push( node );
            }
        }
        return  xml.join('');
    };

    xmlUtils.element = function ( name, content, cdata, attrs  ) {
        attrs = attrs || [];
        var xml;
        var sAttrs = ' ';
        _.each( attrs, function( attr ) {
            sAttrs += attr.name + '="' + attr.value + '"'
        });
        if ( typeof content === 'undefined' ){
            xml='<' + name + sAttrs + '/>';
        }
        else {
            if ( typeof cdata !== 'undefined' && cdata === true ) {
                xml='<'+ name + sAttrs +  '><![CDATA[' + content + ']]></' + name + '>';
            }
            else {
                xml='<'+ name + sAttrs + '>' + content + '</' + name + '>';
            }

        }
        return xml;
    };

    xmlUtils.elementNL = function ( name, content, cdata, attrs ) {
        return this.element( name, content, cdata, attrs ) + '\n';
    };

    xmlUtils.parseMmpFile = function( xmlString, excludeArray ) {
        // var json = this.x2js.xml_str2json( xmlString );
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
                 case 'groupNames':
                    if ( excludeArray.indexOf( 'group' ) === -1 ) {
                        o.groupNames = this.getJSONFromNode( node );
                    }
                    break;
                case 'concepts':
                    if ( excludeArray.indexOf( 'concepts' ) === -1 ) {
                        o.concepts = this.getJSONFromArray( this.getChildNodes( node ) );
                    }
                    break;
                case 'scenarios':
                    if ( excludeArray.indexOf( 'scenarivo' ) === -1 ) {
                        o.scenarios = this.getJSONFromArray( this.getChildNodes( node ) );
                    }
                    //console.log('o.scenarios:',o.scenarios);
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

    xmlUtils.updateInfluenceValue = function( innerHTML ) {
        var valueMap = window.mentalmodeler.appModel.values;
        if ( innerHTML.indexOf('<![CDATA[') > -1 ) {
            innerHTML = innerHTML.replace('<![CDATA[', '').replace(']]>', '');
        }
        if ( valueMap[innerHTML] !== undefined ) {
            innerHTML = valueMap[innerHTML];
        }
        if ( isNaN(innerHTML) ) {
            innerHTML = parseFloat( innerHTML );
        }
        return innerHTML;
    };

    xmlUtils.getJSONFromNode = function( xmlNode ) {
        var props = xmlNode.childNodes;
        // console.log('xmlUtils.getJSONFromNode, xmlNode:',xmlNode);
        var o = {};
        for ( var j=0; j<props.length; j++ ) {
            var prop = props[j];
            if ( prop.nodeType === 1) {
                if ( prop.localName === 'influence' ) {
                    prop.textContent= xmlUtils.updateInfluenceValue( prop.textContent );
                    //prop.innerHTML= xmlUtils.updateInfluenceValue( prop.innerHTML );
                }
                if ( prop.localName === 'groupName' ) {
                    var idx = prop.getAttribute('index');
                    o[ idx ] = prop.textContent;
                    // console.log('     prop:',prop,', o[ ',idx,' ]:',o[ idx ]);
                    continue;
                }
                if ( this.nestedLists.indexOf( prop.localName ) > -1 ) {
                    o[ prop.localName ] = this.getJSONFromArray( this.getChildNodes( prop ) );
                }
                else {
                    o[ prop.localName ] = prop.textContent;
                }
                // console.log('     o[ ',prop.localName,' ]:',o[ prop.localName ]);
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


