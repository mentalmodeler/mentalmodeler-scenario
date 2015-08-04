/* global define */

define([
    'jquery',
    'underscore',
    'backbone',
    'util/domUtils',
    'util/dataUtils'

], function ($, _, Backbone, DomUtils, DataUtils ) {

    'use strict';

    var inputUtils = {
        cursorPos: null,
        '$input': null,
        regexs: {
            // counting numbers {1, 2, 3, ...}
            'natural' : /[^\d]+/g, // /[^1-9]+/g
            // counting numbers {1, 2, 3, ...} including zero
            'whole' : /[^\d]+/g,
            // positive and negative counting numbers, as well as zero. {...,-2,-1,0,1,2,...}
            'integer' : /[^\d-]+/g, // /^[-]?[^\/\d]/g,
            // positive numbers not including zero
            'positive' : /[^\d.]+/g,
            // positive numbers and zero
            'non-negative' : /[^\d.]/g,
            // negative numbers not including zero
            'negative' : /[^\d.-]+/g,
            // negative numbers and zero
            'non-positive' : /[^\d.-]+/g,
            // real numbers - positive/negative decimals and zero
            'float': /[^\d.-]+/g,
            // real numbers - positive/negative decimals and zero
            'float-positive': /[^\d.]+/g,
            // lowercase alphabetic characters
            'lower-case' : /[^a-z]/g,
            // uppercase alphabetic characters
            'upper-case' : /[^A-Z]/g,
            // upper and lowercase alphabetic characters
            'upper-lower-case' : /[^a-zA-Z]/g,
            // comma-separated list of numbers
            'comma-number-list' : /[^0-9,]/g,
            // remove all quotes
            'no-double-quotes' : /["]+/g,
            // remove all quotes
            'equation-graph' : /[^0-9abceglnostpixy.+()=*\^\-\/]/g,
            // remove all spaces
            'no-spaces' : /[\s]+/g,
            // remove XML entities and spaces
            'no-xml-no-spaces': /[&"<>\s]+/g,
            // match group - only letters, number, underscore, and hyphens. first character must be a letter
            'match-group': /[^A-Za-z\d_-]/g,
            // float-fraction - supports a fraction with option floats as numerator and denominator
            'float-fraction': /[^\d.\-\/]+/g,
            // alphabetic
            'alphabetic' : /[^A-Za-z]/g,
            // alpha numberic
            'alpha-numeric': /[^A-Za-z\d]/g
        }
    };

    /**
     * Method: filterInput
     *
     * 1. takes an input[type="text"]
     * 2. gets its value
     * 3. runs it through a regex to filter
     * 4. [optional] if on focusout/blur, runs it through a validation method
     * 5. sets that value in the input, having the input flash red if that value has changed
     * 6. returns the value
     *
     * @param $input            jquery - $ wrapped input[type="text"]
     * @param type        string - used for the regex filter and min/max default generation
     * @param eventType         string - only validate on focusout/blur
     * @param validationOptions object - {
     *                                      default: default value if validation fails (isNaN)
     *                                      min: min value for valid type
     *                                      max: max value for valid type
     *                                      canBeEmpty: can be left empty
     *                                   }
     */
    inputUtils.filterInput = function( $input, type, eventType, validationOptions ) {
        //console.log('InputUtils > filterInput, $input:',$input,', type:',type,', eventType:',eventType,', validationOptions:',validationOptions );

        inputUtils['$input'] = $input;
        var input = $input.get(0);
        var validationFunc;
        var blurEventsTypes = ['blur', 'focusout'];
        // if the event type matches one of the blurEventTypes, do validation
        if ( blurEventsTypes.indexOf(eventType) !== -1 ) {
            validationFunc = inputUtils.getValidationFunc( type, validationOptions );
        }

        var value = inputUtils.filterInputValue( $input, inputUtils.regexs[type], type, validationFunc);

        // position cursor - work in progress
        inputUtils.updateCursorPosition( $input );
        inputUtils['$input'] = null;

        return value;
    };

    inputUtils.clearValidationChangedValue = function( $elem ) {
        $elem.removeClass( 'validation-changed-value' );
        $elem.find( 'input' ).removeClass( 'validation-changed-value' );
    };

    /********************************************************************
     *             helper functions- don't call directly
     ********************************************************************/

    inputUtils.filterInputValue = function( $input, pattern, type, validationFunc ) {
        $input.removeClass('validation-changed-value');
        var s = $input.val();
        s = inputUtils.filterString( s, pattern );
        s = inputUtils.cleanString( s, type, $input );
        // if a function is passed to deal with execptions of required default values, run it now
        if ( !_.isUndefined(validationFunc) && _.isFunction(validationFunc) ) {
            var o = validationFunc( s );
            s = o.value;
            if ( o.valueChanged ) {
                $input.addClass('validation-changed-value');
            }
        }
        $input.val( s );
        return s;
    };

    inputUtils.updateCursorPosition = function( $input ) {
        var cursorPos = inputUtils.cursorPos;
        if ( !_.isNull(cursorPos) && !isNaN(cursorPos) ) {
            DomUtils.setSelection( $input, cursorPos);
        }
        inputUtils.cursorPos = null;
    };

    inputUtils.replaceString = function( s, regex ) {
        // store cursor position after new characters are inserted (none/some/all of which may be removed)
        var cursorPos = DomUtils.getCursorPosition( inputUtils['$input'] );
        // store text before removal for length comparision to text after removal (if applicable)
        var sBefore = s;
        // only does string replacement if regex is defined and regex test proves there are string to be replaced
        if ( !_.isUndefined(regex) ) {
            // run regex test to see if a removal is needed for invalid characters
            var removalNeeded = regex.test(s);
            if ( removalNeeded ) {
                // remove invalid characters
                s = s.replace( regex, '' );
            }
        }
        // calculate the new cursor position
        inputUtils.calculateCursorPosition( cursorPos, sBefore, s);
        // return value
        return s;
    };

    inputUtils.calculateCursorPosition = function( cursorPos, sBefore, sAfter ) {
        // new cursor position is cursor position after insertion (cursorPos) but before removal
        // minus the difference in length of before/after text (essentially minus the characters removed)
        var diff = sBefore.length - sAfter.length;
        //console.log('inputUtils.calculateCursorPosition, cursorPos:',cursorPos,', diff:',diff );
        var newCursorPos = cursorPos - diff;
        if ( _.isNumber(newCursorPos) && newCursorPos >= 0 ) {
            // if the new cursor position is a number greater than or equal to zero, set it
            inputUtils.cursorPos = newCursorPos;
        }
    };

    inputUtils.filterString = function( s, pattern ) {
        var regex;
        if ( !_.isUndefined(pattern) ) {
            if ( pattern instanceof RegExp ) {
                regex = pattern;
            }
            else if ( _.isString(pattern) && this.regexs.hasOwnProperty(pattern) ) {
                regex = this.regexs[pattern];
            }
        }
        return inputUtils.replaceString( s, regex );
    };

    inputUtils.cleanString = function( s, type, $input ) {
        //console.log( 'InputUtils > cleanString, s:',s,',type:',type );
        switch (type) {
        case 'match-group':
            s = inputUtils.removeLeadingNonAlphabeticChars( s, $input );
            break;
        case 'natural':
            s = inputUtils.removeLeadingZero( s );
            break;
        case 'positive':
            s = inputUtils.removeLeadingZero( s );
            s = inputUtils.removeMultipleDecimals( s );
            break;
        case 'integer':
            s = inputUtils.removeNonLeadingNegatives( s );
            break;
        case 'non-negative':
            s = inputUtils.removeMultipleDecimals( s );
            break;
        case 'negative':
            s = inputUtils.removeMultipleDecimals( s );
            s = inputUtils.removeLeadingZero( s );
            s = inputUtils.removeNonLeadingNegatives( s );
            s = inputUtils.addLeadingNegative( s, false );
            break;
        case 'non-positive':
            s = inputUtils.removeMultipleDecimals( s );
            s = inputUtils.removeNonLeadingNegatives( s );
            s = inputUtils.addLeadingNegative( s, true );
            break;
        case 'float':
            s = inputUtils.removeMultipleDecimals( s );
            s = inputUtils.removeNonLeadingNegatives( s );
            break;
        case 'equation-graph':
            break;
        }
        return s;
    };

    inputUtils.removeLeadingNonAlphabeticChars = function( s, $input ) {
        // remove leading non-alphabetic characters
        var regex = /^[^a-zA-Z]+/;
        if ( regex.test(s) ) {
            s = s.replace( regex, '' );
            inputUtils.cursorPos = 0;
        }
        return s;
    };

    inputUtils.removeLeadingZero = function( s ) {
        // removes leading zero
        s = s.replace(/^\-?0+(?!\.)/g,'');
        //console.log('removeLeadingZero, s:',s );
        return s;
    };

    inputUtils.removeMultipleDecimals = function( s ) {
        // leaves the initial decimal but removes all others
        if ( s.indexOf('.') > -1 ) {
            var a = s.split('.');
            var addZero = a[0] === '' || a[0] === '-' ;
            //console.log('removeMultipleDecimals, a:',a,' s:',s,', addZero:',addZero );
            a[0] = a[0].concat( addZero ? '0' : '' , '.' );
            s = a.join('');
            /*
            this.adjCount +=  ( 2 - a.length ) + ( addZero ? 1 : 0 );
            console.log( '    this.adjCount:',this.adjCount );
            */
        }
        return s;
        //return s.split('.').slice(0,2).join('.');
    };

    inputUtils.removeNonLeadingNegatives = function( s ) {
        if ( s.indexOf('-') > -1) {
            var hasLeadingNegative = s.indexOf('-') === 0;
            var a = s.split('-');
            //console.log('removeNonLeadingNegatives, a:',a,' s:',s );
            if ( hasLeadingNegative ) {
                a[0] = '-'.concat( a[0] );
            }
            s = a.join('');
            /*
            this.adjCount += 1 - a.length + ( hasLeadingNegative ? 1 : 0 );
            console.log( '    this.adjCount:',this.adjCount );
            */
        }
        return s;
    };

    inputUtils.addLeadingNegative = function( s, canBeZero ) {
        if ( s.length > 0 ) {
            if ( s.indexOf('-') !== 0 && parseFloat(s) > 0 ) {
                s = '-'.concat( s );
                //this.adjCount += 1;
            } else if ( canBeZero && s.indexOf('-') === 0 && parseFloat(s) === 0 ) {
                s = s.substr( 1 );
                //this.adjCount -= 1;
            }
            /*
            console.log('addLeadingNegative, s:',s );
            console.log( '    this.adjCount:',this.adjCount );
            */
        }
        return s;
    };

    inputUtils.getValidationFunc = function( type, valueOptions ) {
        valueOptions = valueOptions || {};
        var isNumberType = false;

        switch ( type ) {
        case 'natural': // counting numbers {1, 2, 3, ...}
        case 'whole': // counting numbers {1, 2, 3, ...} including zero
        case 'integer': // positive and negative counting numbers, as well as zero. {...,-2,-1,0,1,2,...}
            valueOptions.type = 'integer';
            isNumberType = true;
            break;
        case 'positive': // positive numbers not including zero
        case 'non-negative': // positive numbers and zero
        case 'negative': // negative numbers not including zero
        case 'non-positive': // negative numbers and zero
        case 'float':
            valueOptions.type = 'float';
            isNumberType = true;
            break;
        }

        if ( isNumberType ) {
            // if min value isn't defined, get it based on the number type
            if ( !_.has( valueOptions, 'min' ) ) {
                valueOptions.min = inputUtils.getMinValue( type );
            }
            // if max value isn't defined, get it based on the number type
            if ( !_.has( valueOptions, 'max' ) ) {
                valueOptions.max = inputUtils.getMaxValue( type );
            }
        }

        // if default value isn't defined, get it based on the type
        if ( !_.has( valueOptions, 'default' ) ) {
            valueOptions.default = inputUtils.getDefaultValue( type );
        }

        var validationFunc = function( val ) {
            var value = valueOptions.default;
            var valueChanged = true;
            var canBeEmpty = DataUtils.getProperty( valueOptions, 'canBeEmpty' ) || valueOptions.default === '';

            if ( canBeEmpty === true && _.isEmpty(val) ) {
                // its empty and can be empty
                value = val;
                valueChanged = false;
            } else if ( isNumberType ) {
                // is a number
                if ( valueOptions.type === 'integer' ) {
                    val = parseInt( val, 10);
                } else if ( valueOptions.type === 'float' ){
                    val = parseFloat( val );
                    /*
                    if ( val.toString().indexOf('e') > -1 ) {
                        val = val.toFixed();
                    }
                    */
                }
                if ( !_.isNaN(val) ) {
                    // we have a valid int - check to make sure it is within the min/max bounds
                    if ( val < valueOptions.min ) {
                        value = valueOptions.min;
                    } else if ( val > valueOptions.max ) {
                        value = valueOptions.max;
                    } else {
                        value = val;
                        valueChanged = false;
                    }
                }
            } else {
                // is not empty and is not just a number. string validation here?
                value = val;
                valueChanged = false;
            }

            return { value: value, valueChanged: valueChanged };
        };
        return validationFunc;
    };

    inputUtils.getMinValue = function( type ) {
        var lowestMin = -9007199254740992; //-99999999999999999999;
        var minValue;
        switch ( type ) {
        case 'natural': // counting numbers {1, 2, 3, ...}
            minValue = 1;
            break;
        case 'whole': // counting numbers {1, 2, 3, ...} including zero
        case 'non-negative': // positive numbers and zero
            minValue = 0;
            break;
        case 'positive': // positive numbers not including zero
            minValue = 0.000001; //0.000000000000000000000001;
            break;
        case 'integer': // positive and negative counting numbers, as well as zero. {...,-2,-1,0,1,2,...}
        case 'negative': // negative numbers not including zero
        case 'non-positive': // negative numbers and zero
        case 'float': // real numbers - positive/negative decimals and zero
            minValue = lowestMin;
            break;
        }
        return minValue;
    };

    inputUtils.getMaxValue = function( type ) {
        var highestMax = 9007199254740992; //99999999999999999999;
        var maxValue;
        switch ( type ) {
        case 'natural': // counting numbers {1, 2, 3, ...}
        case 'whole': // counting numbers {1, 2, 3, ...} including zero
        case 'integer': // positive and negative counting numbers, as well as zero. {...,-2,-1,0,1,2,...}
        case 'positive': // positive numbers not including zero
        case 'non-negative': // positive numbers and zero
        case 'float': // real numbers - positive/negative decimals and zero
            maxValue = highestMax;
            break;
        case 'negative': // negative numbers not including zero
            maxValue = -0.000001; //-0.0000000000000000001;
            break;
        case 'non-positive': // negative numbers and zero
            maxValue = 0;
            break;
        }
        return maxValue;
    };

    inputUtils.getDefaultValue = function( type ) {
        var defaultValue = '';
        switch ( type ) {
        case 'natural': // counting numbers {1, 2, 3, ...}
        case 'whole': // counting numbers {1, 2, 3, ...} including zero
        case 'integer': // positive and negative counting numbers, as well as zero. {...,-2,-1,0,1,2,...}
        case 'positive': // positive numbers not including zero
        case 'non-negative': // positive numbers and zero
        case 'float': // real numbers - positive/negative decimals and zero
            defaultValue = 1;
            break;
        case 'negative': // negative numbers not including zero
        case 'non-positive': // negative numbers and zero
            defaultValue = -1;
            break;
        }
        return defaultValue;
    };

    return inputUtils;
});