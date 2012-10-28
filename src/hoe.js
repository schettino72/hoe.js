// create new object and apply arguments
// hoe(tag [, param ...]
var hoe = function(tag){
    var $ele = jQuery(document.createElement(tag));
    return $ele.hoe.apply($ele, Array.prototype.slice.call(arguments, 1));
};

hoe.jquery_plugin = function() {
    /*
      Guess which jQuery method should be applied to arguments based on type:
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

// build functions to create hoe objcts on namespace
// by default add most common tags to window object
hoe.init_default_tags = [
        'body', 'div','span', 'pre', 'p', 'a', 'ul', 'ol', 'li',
        'form', 'label', 'input', 'select',
        'table', 'thead', 'tbody', 'tfoot', 'tr', 'th','td'
];
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


// object helpers that bind scope to object
hoe.Type = function(constructor){
    return hoe.inherit(hoe.Type, constructor);
};
hoe.Type.prototype = {
    // event system
    on: function(observed, event, callback){
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
    },
    trigger: function(event){
        if (this._hoe_obs && this._hoe_obs[event]){
            var callbacks = this._hoe_obs[event];
            for (var i=0, max=callbacks.length; i<max; i++){
                callbacks[i].fn.apply(callbacks[i].scope,
                                      Array.prototype.slice.call(arguments, 1));
            }
        }
    },

    // functional stuff
    forEach: function(array, fn){
        for(var i = 0, len = array.length; i < len; ++i) {
            fn.call(this, array[i], i, array);
        }
    }
};


// node stuff
if (typeof exports !== 'undefined'){
    exports.hoe = hoe;
}
