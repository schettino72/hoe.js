/** @license
 *   hoe.js - [http://schettino72.github.com/hoe.js]
 *   MIT license - Copyright (c) 2012 Eduardo Naufel Schettino
 *
 * Supports IE 9+ (needs CustomEvent polyfill)
 */


/**
 * @namespace creates new DOM elements
 * @param {String} tag name of tag to be created
 * @param {Object} [attrs] set as html element attributes
 * @param {DOMElement|string} append as nodes into element
 * @returns {DOMElement}
 */
var hoe = function(tag, attrs){
    // create element
    var $ele = document.createElement(tag);

    // add attributes
    if (attrs){
        for(var name in attrs){
            $ele.setAttribute(name, attrs[name]);
        }
    }

    // add child nodes
    for(var i=2, max=arguments.length; i<max; i++){
        var param = arguments[i];
        if(param instanceof Node){
            $ele.appendChild(param);
        }
        else {
            $ele.appendChild(document.createTextNode(param));
        }
    }

    // CustomElements integration
    // createdCallback should be called only after content and attributes are set
    if('createdCallback' in $ele){
        $ele.createdCallback(true);
    }
    return $ele;
};


/**
 * @param {DOMElement} $ele element that will contain append elements
 * @param {DOMElement|string} append as nodes into element
 */
hoe.append = function($ele){
    for(var i=1, max=arguments.length; i<max; i++){
        var param = arguments[i];
        if(typeof(param) === "string"){
            $ele.appendChild(document.createTextNode(param));
        }
        else {
            $ele.appendChild(param);
        }
    }
};

/**
 * Shortcut to replace content of a node
 */
hoe.html = function($ele){
    $ele.innerHTML = '';
    for(var i=1, max=arguments.length; i<max; i++){
        var param = arguments[i];
        if(typeof(param) === "string"){
            $ele.appendChild(document.createTextNode(param));
        }
        else {
            $ele.appendChild(param);
        }
    }
};


/**
 * Remove element from DOM
 */
hoe.remove = function($ele){
    if ($ele.parentNode !== null){
        $ele.parentNode.removeChild($ele);
        return true;
    }
    else {
        return false;
    }
};


/**
 * Creates a DocumentFragment from a list of nodes
 */
hoe.fragment = function(nodes){
    var $ele = document.createDocumentFragment();
    for(var i=0, max=nodes.length; i<max; i++){
        var param = nodes[i];
        if(typeof(param) === "string"){
            $ele.appendChild(document.createTextNode(param));
        }
        else {
            $ele.appendChild(param);
        }
    }
    return $ele;
};



// extend object with other objects
hoe.extend = function(out) {
    var keys, arg;
    for (var i = 1; i < arguments.length; i++) {
        arg = arguments[i];
        if (!arg){
            continue;
        }
        keys = Object.keys(arg);
        for (var j=0, max=keys.length; j<max; j++) {
            out[keys[j]] = arg[keys[j]];
        }
    }
    return out;
};


/**
 * Similar to `hoe()` but instead of returning an element returns
 * a function that creates new elements including the parameters
 * passed to partial
 * @param {String} tag name of tag to be created
 * @returns function
 */
hoe.partial = function(tag, partial_attrs){
    var partial_nodes = Array.prototype.slice.call(arguments, 2);
    return function(this_attrs){
        var attrs = hoe.extend({}, partial_attrs, this_attrs);
        var $ele = hoe(tag, attrs, hoe.fragment(partial_nodes),
                       hoe.fragment(Array.prototype.slice.call(arguments, 1)));
        return $ele;
    };
};


/**
 * build functions to create hoe objcts on namespace
 * by default add most common tags to window object
 * @constant
 */
hoe.init_default_tags = [
    'body', 'div','span', 'pre', 'p', 'a', 'ul', 'ol', 'li',
    'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'strong',
    'section', 'header', 'footer', 'br',
    'form', 'label', 'input', 'textarea', 'select', 'option', 'button',
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
    for (var i=0, max=tags.length; i<max; i++){
        namespace[tags[i]] = hoe.partial(tags[i]);
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
    new_type.prototype = Object.create(base_type.prototype);
    new_type.prototype.constructor = new_type;
    hoe.extend(new_type, base_type);
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
 * Attach/listen a callback on this object scope for event from observed
 * @param {HTMLElement|hoe.Type} observed object that trigger events
 * @param {String} event name of the event
 * @param {Function} callback to be executed when event is triggered.
 *                      this will be bound to current object.
 */
hoe.Type.prototype.listen = function(observed, event_name, callback){
    if (observed instanceof window.HTMLElement){
        observed.addEventListener(event_name, callback.bind(this));
        return;
    }
    // hoe's crappy event manager
    else {
        if (typeof observed._hoe_obs === 'undefined'){
            observed._hoe_obs = {};
        }
        if (!(event_name in observed._hoe_obs)){
            observed._hoe_obs[event_name] = [];
        }
        observed._hoe_obs[event_name].push({scope:this, fn:callback});
    }
};

/**
 * Trigger/Fire an event for this object
 * @param {String} event name of the event
 * @param [arguments] other arguments will be passed to the callback
 */
hoe.Type.prototype.fire = function(event_name, detail){
    if(this instanceof window.HTMLElement){
        var event = new CustomEvent(event_name, {detail:detail});
        this.dispatchEvent(event);
        return;
    }
    if (this._hoe_obs && this._hoe_obs[event_name]){
        var callbacks = this._hoe_obs[event_name];
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
hoe.Type.prototype.forArray = function(seq, fn){
    for(var i = 0, len = seq.length; i < len; ++i) {
        fn.call(this, seq[i], i, seq);
    }
};

// smilar to in each but iterate over key/values
hoe.Type.prototype.forDict = function(seq, fn){
    for (var key in seq){
        fn.call(this, seq[key], key, seq);
    }
};

/**
 * Create an Array iterating through Arrays or plain objects keeping the scope
 * @param {Array|Object} seq contains items that will be iterated
 * @param {Function} callback to be called for each item.
          The callback return value will be inserted in the returned Array
          The callback the 3 paramaters:
          1) value
          2) index/key
          3) reference to the whole sequence
 * @return Array
 */
hoe.Type.prototype.mapArray = function(seq, fn){
    var result = [];
    for(var i = 0, len = seq.length; i < len; ++i) {
        result.push(fn.call(this, seq[i], i, seq));
    }
    return result;
};


hoe.Type.prototype.mapDict = function(seq, fn){
    var result = [];
    for (var key in seq){
        result.push(fn.call(this, seq[key], key, seq));
    }
    return result;
};



/**
 * Return function to execute original function in objects scope/context.
 * Similar to jQuery.proxy().
 */
hoe.Type.prototype.scope = function(func){
    var args = [this].concat(Array.prototype.slice.call(arguments, 1));
    return func.bind.apply(func, args);
};


/**
 * UI has a single "render" method that can remember its container element
 * in the DOM.

 * DEPRECATED - use hoe.Component

 * To use create a type and define a "_render()" method where the DOM
 * content is returned. Typically the container for this UI is only
 * specified in the first time it is rendered.
 * The object has an attribute "$container" with a reference to the container
 * element.
 *
 */
hoe.UI = hoe.Type();
hoe.UI.prototype.render = function($container){
    if (typeof $container !== 'undefined'){
        this.$container = $container;
    }
    var content = this._render();
    if (this.$container && content !== null){
        hoe.html(this.$container, content);
    }
    return content;
};


// creates a web-component
// init_func must be used for initialization and creating the
// initial content for the element/component

// TODO: clearly define init_func. maybe split in two
// where one of them is used only if from_html not used
hoe.Component = function(tag_name, init_func){
    var proto = Object.create(window.HTMLElement.prototype);
    hoe.extend(proto, hoe.Type.prototype);

    // to be subclassed to get info from HTML when creating object
    // note it is called BEFORE init_func
    proto.from_html = function(){
        return;
    };

    // from web-components specification.
    // this wrapper is used to detect whether the element is being created
    // by parsing a HTML tag or programatically in js.
    //
    // If created by js it doesnt do anything, because creating its content
    // should be done with a "init" function that are able to
    // take new parameters.
    // See the "New" function below
    proto.createdCallback = function(force_ready){
        if (this.parentNode || force_ready){
            this.from_html();
            // this info might be useful for components
            this.__loaded_html__ = true;
            if (init_func){
                init_func.call(this);
            }
        }
     };

    // helper to create new elements from js
    proto.New = function (args) {
        var obj = new proto.Constructor();
        if (init_func){
            init_func.call(obj, args);
        }
        return obj;
	};

    // register tag/element and save reference to constructor
    // TODO - why not hoe.constructor?
    proto.Constructor = document.registerElement(tag_name, {prototype: proto});
    return proto;
};
