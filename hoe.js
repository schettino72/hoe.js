
jQuery.fn.hoe = function() {
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
                $ele.append(param);
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


/* hoe namespace */
// create new object and apply arguments
// hoe(tag [, param ...]
var hoe = function(tag){
    var $ele = jQuery(document.createElement(tag));
    return $ele.hoe.apply($ele, Array.prototype.slice.call(arguments, 1));
};

// build functions to create hoe objcts on namespace
hoe.init = function(namespace, tags){
    // by default add most common tags to window object
    var default_tags = [
        'body', 'div','span', 'pre', 'p', 'a', 'ul', 'ol', 'li',
        'form', 'label', 'input', 'select',
        'table', 'thead', 'tbody', 'tfoot', 'tr', 'th','td'
    ];
    namespace = namespace || window;
    tags = tags || default_tags;

    function _create_function(tag){
        return function(){
            var $ele = jQuery(document.createElement(tag));
            return $ele.hoe.apply($ele, arguments);
        }
    }
    for (var i=0, max=tags.length; i<max; i++){
        namespace[tags[i]] = _create_function(tags[i]);
    }
};

// node stuff
if (typeof exports !== 'undefined')
    exports.hoe = hoe;
