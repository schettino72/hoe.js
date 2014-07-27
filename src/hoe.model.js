/*global hoe */

hoe.Property = function(default_, nullable){
    this.type = null;
    this.default = default_!==undefined ? default_ : null;
    this.nullable = nullable===false ? false : true;
};

hoe.Property.prototype.check_type = function(val){
    //undefined is never accepted
    if (val === undefined){
        throw Error('Invalid value type, undefined');
    }
};



hoe.PropertyString = function(){
    hoe.Property.apply(this, arguments);
    this.type = 'string';
};
hoe.PropertyString.prototype = Object.create(hoe.Property.prototype);
hoe.PropertyString.prototype.constructor = hoe.PropertyString;

hoe.PropertyString.prototype.check_type = function(val){
    if (!(typeof val === 'string' || val instanceof String)){
        throw Error('Invalid value type, not a String');
    }
};



hoe.PropertyNumber = function(){
    hoe.Property.apply(this, arguments);
    this.type = 'number';
};
hoe.PropertyNumber.prototype = Object.create(hoe.Property.prototype);
hoe.PropertyNumber.prototype.constructor = hoe.PropertyNumber;

hoe.PropertyNumber.prototype.check_type = function(val){
    if (!(typeof val === 'number' || val instanceof Number)){
        throw Error('Invalid value type, not a Number');
    }
};









hoe.model_set = function (obj, desc, data){
    var consumed = 0; // count number of data items used
    for (var k in desc){
        // set value
        if (k in data){
            obj[k] = data[k];
            consumed++;
        }
        else {
            obj[k] = desc[k].default;
        }

        // validate type value
        if (data[k] === null){
            if (desc[k].nullable===false){
                throw Error('Value can not be null.');
            }
        }
        else {
            // check correct type
            desc[k].check_type(obj[k]);
        }
    }

    // check there were no unused values in data
    if (Object.keys(data).length != consumed){
        throw Error('Some data do not belong to model description.');
    }
};
