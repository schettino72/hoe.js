/** @license
 *   hoe.js - [http://schettino72.github.com/hoe.js]
 *   MIT license - Copyright (c) 2012 Eduardo Naufel Schettino
 */

/**
 * @namespace creates new DOM elements
 * @param {String} tag name of tag to be created
 * @param [param[]] can take any number of params, {@link hoe.jquery_plugin}
 * @returns {jQuery}
 */
var hoe = function(tag){
    var $ele = jQuery(document.createElement(tag));
    return $ele.hoe.apply($ele, Array.prototype.slice.call(arguments, 1));
};

/**
 * Exposed to any jQuery object as 'hoe' plugin.
 * Guess which jQuery method should be applied to object,
 * operation depends on param type.
 * @param {String} [param] append as text to element content
 * @param {Object} [param] set as html element attributes
 * @param {DOMElement[]|jQuery[]} [param] append param into element content
 * @returns {jQuery}
 */
hoe.jquery_plugin = function() {
    /*
       to arguments based on type:
       - string: append text
       - plain object: set html attributes
       - DOM element & jQuery object: append elements
       - array: append elements
    */

    function _guess_apply($ele, param){
        var type = jQuery.type(param);
        if(type === "string"){
            $ele.append(param);
        }
        else if(type === "array"){
            for(var i=0, max=param.length; i<max; i++) {
                $ele.append(param[i]);
            }
        }
        else if (type === "object") {
            if (jQuery.isPlainObject(param)){
                for(var name in param){
                    $ele.attr(name, param[name]);
                }
            }
            else if((param instanceof jQuery) || (param instanceof Element)){
                $ele.append(param);
            }
            else {
                throw Error("Invalid object: " + param);
            }
        }
        else {
            throw Error("Invalid type: " + type);
        }
    }

    for(var i=0, max=arguments.length; i<max; i++) {
        _guess_apply(this, arguments[i]);
    }
    return this;
};

jQuery.fn.hoe = hoe.jquery_plugin;


/**
 * build functions to create hoe objcts on namespace
 * by default add most common tags to window object
 * @constant
 */
hoe.init_default_tags = [
    'body', 'div','span', 'pre', 'p', 'a', 'ul', 'ol', 'li',
    'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'strong',
    'section', 'header', 'footer',
    'form', 'label', 'input', 'select', 'button',
    'table', 'thead', 'tbody', 'tfoot', 'tr', 'th','td'
];

/**
 * define factory functions to create DOM elements
 * @param {Object} [namespace=window] namespace where functions will be created
 * @param {String[]} [tags=hoe.init_default_tags] functions will be created
          for given tags
 */
hoe.init = function(namespace, tags){
    namespace = namespace || window;
    tags = tags || hoe.init_default_tags;

    function _create_function(tag){
        return function(){
            var $ele = jQuery(document.createElement(tag));
            return $ele.hoe.apply($ele, arguments);
        };
    }
    for (var i=0, max=tags.length; i<max; i++){
        namespace[tags[i]] = _create_function(tags[i]);
    }
};


/**
 * create new type by inheriting from other types
 * @param {Object} base_type Type to inherit from
 * @param {Function} [constructor] over-write constructor from base_type
 * @return {Type} new Type/constructor
 */
hoe.inherit = function (base_type, constructor){
    var new_type;
    if (constructor){
        new_type = constructor;
    }
    else{
        new_type = function(){return base_type.apply(this, arguments);};
    }
    $.extend(new_type, base_type);
    $.extend(new_type.prototype, base_type.prototype);
    return new_type;
};

/**
 * Base Type with helpers that bind scope to object.
 * Constructor can be used to create new types.
 * @constructor
 * @param {Function} constructor constructor of a new Type
 * @returns {Function/Type} new Type that inherit from hoe.Type
 */
hoe.Type = function(constructor){
    return hoe.inherit(hoe.Type, constructor);
};


/**
 * Attach a callback on this object scope for event from observed
 * @param {jQuery|hoe.Type} observed object that trigger events
 * @param {String} event name of the event
 * @param {Function} callback to be executed when event is triggered.
 *                      this will be bound to current object.
 */
hoe.Type.prototype.on = function(observed, event, callback){
    if(observed instanceof jQuery){
        observed.bind(event, $.proxy(callback, this));
    }
    else{
        if (typeof observed._hoe_obs === 'undefined'){
            observed._hoe_obs = {};
        }
        if (!(event in observed._hoe_obs)){
            observed._hoe_obs[event] = [];
        }
        observed._hoe_obs[event].push({scope:this, fn:callback});
    }
};

/**
 * Trigger an event for this object
 * @param {String} event name of the event
 * @param [arguments] other arguments will be passed to the callback
 */
hoe.Type.prototype.trigger = function(event){
    if (this._hoe_obs && this._hoe_obs[event]){
        var callbacks = this._hoe_obs[event];
        for (var i=0, max=callbacks.length; i<max; i++){
            callbacks[i].fn.apply(callbacks[i].scope,
                                  Array.prototype.slice.call(arguments, 1));
        }
    }
};

/**
 * Iterate through Arrays or plain objects keeping the scope
 * @param {Array|Object} seq contains items that will be iterated
 * @param {Function} callback to be called for each item.
          The callback the 3 paramaters:
          1) value
          2) index/key
          3) reference to the whole sequence
 */
hoe.Type.prototype.forEach = function(seq, fn){
    if (jQuery.type(seq) == 'array'){
        for(var i = 0, len = seq.length; i < len; ++i) {
            fn.call(this, seq[i], i, seq);
        }
    }
    else { // must be an object
        for (var key in seq){
            fn.call(this, seq[key], key, seq);
        }
    }
};


/** @exports */
if (typeof exports !== 'undefined'){
    exports.hoe = hoe;
}
