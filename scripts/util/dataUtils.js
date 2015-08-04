/* global define */

define([
    'jquery',
    'underscore'

], function ($, _) {

    'use strict';

    var dataUtils = {};

    // makes a [length]-character unique string that always begins with an alphabetic character
    dataUtils.makeID = function (moduleType) {
        var id = '';
        var length = 16;
        var possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        var startIndexForNumbers = 53;
        // modified to ensure the first character is always a letter
        for (var i = 0; i < length; i++) {
            if ( i === 0 ) {
                id += possible.charAt(Math.floor(Math.random() * startIndexForNumbers));
            } else {
                id += possible.charAt(Math.floor(Math.random() * possible.length));
            }
        }
        return id;
    };



    dataUtils.setProperty = function (object, dotNotation, value) {
        var propertyTree = [];
        if (_.isString(dotNotation)) {
            propertyTree = dotNotation.split('.');
        }
        if (_.isObject(object)) {
            for (var i = 0; i < propertyTree.length; i++) {
                var property = propertyTree[i];
                if (i < propertyTree.length - 1 && !_.isObject(object[property])) {
                    object[property] = {};
                }
                if (_.isObject(object)) {
                    if (i === propertyTree.length - 1) {
                        object[ property ] = value;
                    } else {
                        object = object[ property ];
                    }
                }
            }
        }
    };

    dataUtils.getProperty = function (object, dotNotation, undefinedValue) {
        var propValue = dataUtils.propertyExist(object, dotNotation, true);
        if (_.isUndefined(undefinedValue)) {
            // undefinedValue was not pased int he function call
            if (_.isObject(object) && _.has(object, 'undefinedValue')) {
                // if the object ahs a property undefinedValue, use that as the default value returned for an undefined value
                undefinedValue = object['undefinedValue'];
            } else {
                // the default value returned for an undefined value is an empty string, unless otherwise specified
                undefinedValue = '';
            }
        }
        // if the returned property is undefined, set it to the undefinedValue
        if (_.isUndefined(propValue)) {
            propValue = undefinedValue;
        }
        return propValue;
    };

    dataUtils.deleteProperty = function (object, dotNotation) {
        var success = dataUtils.propertyExist(object, dotNotation, false, true);
        return success;
    };

    dataUtils.propertyExist = function (object, dotNotation, doReturnProp, deleteProp) {
        if (_.isUndefined(doReturnProp)) {
            doReturnProp = false;
        }
        if (_.isUndefined(deleteProp)) {
            deleteProp = false;
        }
        var propDeleted = false;
        var propValue;
        var propertyExist = false;
        var propertyTree = [];
        if (_.isString(dotNotation)) {
            propertyTree = dotNotation.split('.');
        }
        if (!_.isUndefined(object) && !_.isNull(object)) {
            for (var i = 0; i < propertyTree.length; i++) {
                var property = propertyTree[i];
                if (_.isObject(object) && _.has(object, property) && !_.isNull(object[property])) {
                    if (i === propertyTree.length - 1) {
                        if (deleteProp) {
                            delete object[ property ];
                            propDeleted = true;
                        } else {
                            propValue = object[ property ];
                            propertyExist = true;
                        }
                    } else {
                        object = object[ property ];
                    }
                } else {
                    if (deleteProp) {
                        return propDeleted;
                    } else if (!doReturnProp) {
                        return propertyExist;
                    } else {
                        return propValue;
                    }
                }
            }
        }
        if (deleteProp) {
            return propDeleted;
        } else if (!doReturnProp) {
            return propertyExist;
        } else {
            return propValue;
        }
    };

    dataUtils.stripEmptyProperties = function (object, whitelist) {
        if (whitelist === undefined) {
            whitelist = [];
        }

        for (var property in object) {
            // console.log(property + ' : ' + object[property]);
            if (_.isObject(object[property])) {
                if (_.isEmpty(object[property])) {
                    delete object[property];
                } else {
                    dataUtils.stripEmptyProperties(object[property], whitelist);
                }
            } else {
                var propEmpty = _.isEmpty(object[property]) || (object[property] === 'noColor');
                if (propEmpty && !_.isNumber(object[property]) && !_.isBoolean(object[property])) {
                    // console.log(property + ': blank');
                    if (whitelist.indexOf(property) === -1) {
                        // console.log('deleting ' + property);
                        delete object[property];
                    }
                }
            }
        }

        return object;
    };

    dataUtils.addPropUtils = function (object) {
        object.getProp = function (dotNotation, undefinedValue) {
            return dataUtils.getProperty(this, dotNotation, undefinedValue);
        };
        object.setProp = function (dotNotation, value) {
            return dataUtils.setProperty(this, dotNotation, value);
        };
        object.deleteProp = function (dotNotation) {
            return dataUtils.deleteProperty(this, dotNotation);
        };
        object.propExist = function (dotNotation) {
            return dataUtils.propertyExist(this, dotNotation);
        };
        return object;
    };

    dataUtils.removePropUtils = function (object) {
        if (_.has(object, 'getProp')) {
            delete object.getProp;
        }
        if (_.has(object, 'setProp')) {
            delete object.setProp;
        }
        if (_.has(object, 'deleteProp')) {
            delete object.deleteProp;
        }
        if (_.has(object, 'propExist')) {
            delete object.propExist;
        }
        return object;
    };

    return dataUtils;
});


