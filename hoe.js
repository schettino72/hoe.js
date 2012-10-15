function hoe_ele_init($ele, params){
    var param, type;
    for(var i=0, max=params.length; i<max; i++) {
        param = params[i];
        type = jQuery.type(param);
        if(type === "string"){
            $ele.text(param);
        }
        else if(type === "array"){
            for(var j=0, jmax=param.length; i<max; i++) {
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
    return $ele;
}

function define_hoe(){
    var tags = [
        'a', 'body', 'br', 'code', 'div',
        'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
        'input', 'label', 'li', 'ol', 'p', 'pre', 'select', 'span',
        'table', 'tbody', 'td', 'tfoot', 'th', 'thead', 'tr', 'ul'
    ];

    function _create_function(tag){
        return function(){
            return hoe_ele_init($(document.createElement(tag)), arguments);
        }
    }
    var tag;
    for (var i=0, max=tags.length; i<max; i++){
        tag = tags[i];
        window['_' + tag] = _create_function(tag);
    }
}

define_hoe();