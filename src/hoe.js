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
            else {
                $ele.append(param);
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
 * Similar to `hoe()` but instead of returning an element returns
 * a function that creates new elements including the parameters
 * passed to partial
 * @param {String} tag name of tag to be created
 * @param [param[]] can take any number of params, {@link hoe.jquery_plugin}
 * @returns function
 */
hoe.partial = function(tag){
    var partial_args = Array.prototype.slice.call(arguments, 1);
    return function(){
        var $ele = jQuery(document.createElement(tag));
        $ele.hoe.apply($ele, partial_args);
        return $ele.hoe.apply($ele, arguments);
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
 * Attach/listen a callback on this object scope for event from observed
 * @param {jQuery|hoe.Type} observed object that trigger events
 * @param {String} event name of the event
 * @param {Function} callback to be executed when event is triggered.
 *                      this will be bound to current object.
 */
hoe.Type.prototype.listen = function(observed, event, callback){
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
 * Trigger/Fire an event for this object
 * @param {String} event name of the event
 * @param [arguments] other arguments will be passed to the callback
 */
hoe.Type.prototype.fire = function(event){
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
hoe.Type.prototype.map = function(seq, fn){
    var result = [];
    if (jQuery.type(seq) == 'array'){
        for(var i = 0, len = seq.length; i < len; ++i) {
            result.push(fn.call(this, seq[i], i, seq));
        }
    }
    else { // must be an object
        for (var key in seq){
            result.push(fn.call(this, seq[key], key, seq));
        }
    }
    return result;
};


/**
 * Return function to execute original function in objects scope/context.
 * Similar to jQuery.proxy().
 */
hoe.Type.prototype.scope = function(func){
    var my_scope = this;
    return function () {return func.apply(my_scope, arguments);};
};


/**
 * UI has a single "render" method that can remember its container element
 * in the DOM.

 * To use create a type and define a "_render()" method where the DOM
 * content is returned. Typically the container for this UI is only
 * specified in the first time it is rendered.
 * The object has an attribute "$container" with a reference to the container
 * element.
 *
 */
hoe.UI = hoe.Type();
hoe.UI.prototype.render = function($container){
    var content = this._render();
    if (typeof $container !== 'undefined'){
        this.$container = $container;
    }
    if (this.$container){
        this.$container.html(content);
    }
    return content;
};


//////////////////////////////////////////////////////////////////////
// TODO - split this into a separate file
// Route, Router, App are helpers to create single page apps

// XXX
hoe.Route = hoe.Type(function(template, name, endpoint){
    this.template = template;
    this.name = name;
    this.endpoint = endpoint;

    // convert template into list of parts that can have a 'param' or 'fixed'
    this._parts = this.map(template.substr(1).split('/'), function(part){
        return part[0] === ':' ? {'param': part.substr(1)} : {'fixed': part};
    });
});


// check if a path matches this route
// return an object with param values if matched or null if not matched
hoe.Route.prototype.match = function(path){
    var path_parts = path.substr(1).split('/');
    if (path_parts.length != this._parts.length){
        return null;
    }

    var params = {};
    for(var i=0, max=path_parts.length; i<max; i++){
        if ('fixed' in this._parts[i]){
            if (this._parts[i].fixed != path_parts[i]){
                return null;
            }
        }
        else {
            if (!path_parts[i]){
                return null; // dont accept empty param values
            }
            params[this._parts[i].param] = path_parts[i];
        }
    }
    return params;
};

// create path using given params
hoe.Route.prototype.build = function(params){
    var path = "";
    $.each(this._parts, function(_, part){
        if (part.fixed){
            path += '/' + part.fixed;
        }
        else {
            var part_value = params[part.param];
            if (!part_value){
                throw Error('Missing param: ' + part.param);
            }
            path += '/' + part_value;
        }
    });
    return path;
};


// XXX
hoe.Router = hoe.Type(function(){
    this.routes = {};
});

hoe.Router.prototype.add = function(route){
    this.routes[route.name] = route;
};

// return object with 'router' and 'params'
hoe.Router.prototype.match = function(path){
    var result = null;
    $.each(this.routes, function(_, route){
        var match = route.match(path);
        if (match !== null){
            result = {'route': route, 'params': match};
            return;
        }
    });
    return result;
};

hoe.Router.prototype.build = function(name, params){
    var route = this.routes[name];
    if (!route){
        throw Error('Route not found: ' + name);
    }
    return route.build(params);
};


// single page application - help setting the URL
hoe.App = hoe.Type(function(){
    this.router = new hoe.Router();

    // bind events
    $('body').on('click', 'a', this.scope(this._handle_click));
    $(window).bind('popstate', this.scope(this._popstate));

    // avoid chrome bug
    // https://code.google.com/p/chromium/issues/detail?id=63040
    this._loaded = false;
});


// based on jquery.pjax.js:handleClick
// https://github.com/defunkt/jquery-pjax/blob/master/jquery.pjax.js
hoe.App.prototype._handle_click = function(event) {
    var link = event.currentTarget;

    // Middle click, cmd click, and ctrl click should open
    // links in a new tab as normal.
    if ( event.which > 1 || event.metaKey || event.ctrlKey ||
         event.shiftKey || event.altKey )
        return;

    // Ignore cross origin links
    if ( location.protocol !== link.protocol || location.host !== link.host )
        return;

    // Ignore anchors on the same page
    if (link.hash && link.href.replace(link.hash, '') ===
        location.href.replace(location.hash, ''))
        return;

    // Ignore empty anchor "foo.html#"
    if (link.href === location.href + '#')
        return;

    this.load(link.pathname, true);
    event.preventDefault();
};


hoe.App.prototype._popstate = function() {
    if (this._loaded){ // ignore initial event on chrome (bug)
        this.load(document.location.pathname, false);
    }
};


// find path in router and loads endpoint
hoe.App.prototype.load = function(path, push_state){
    this._loaded = true;
    var match = this.router.match(path);
    if (match){
        match.route.endpoint(match.params);
    }
    else {
        window.alert('404: ' + path);
    }

    if (push_state){
        window.history.pushState({}, null, path);
    }
};



/** @exports */
if (typeof exports !== 'undefined'){
    exports.hoe = hoe;
}
