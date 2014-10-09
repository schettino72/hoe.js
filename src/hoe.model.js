/*global hoe */

hoe.Property = function(default_, nullable){
    this.type = null;
    this.default = default_!==undefined ? default_ : null;
    this.nullable = nullable===false ? false : true;
};

hoe.Property.prototype.set = function(val){
    return val;
};

hoe.Property.prototype.to_plain = function(val){
    return val;
};

hoe.Property.prototype.check_type = function(val){
    //undefined is never accepted
    if (val === undefined){
        throw Error('Invalid value type, undefined');
    }
};




hoe.PropertyString = hoe.inherit(hoe.Property, function(){
    hoe.Property.apply(this, arguments);
    this.type = 'string';
});

hoe.PropertyString.prototype.check_type = function(val){
    if (!(typeof val === 'string' || val instanceof String)){
        throw Error('Invalid value type, not a String');
    }
};



hoe.PropertyNumber = hoe.inherit(hoe.Property, function(){
    hoe.Property.apply(this, arguments);
    this.type = 'number';
});

hoe.PropertyNumber.prototype.check_type = function(val){
    if (!(typeof val === 'number' || val instanceof Number)){
        throw Error('Invalid value type, not a Number');
    }
};


hoe.PropertyBoolean = hoe.inherit(hoe.Property, function(){
    hoe.Property.apply(this, arguments);
    this.type = 'boolean';
});

hoe.PropertyBoolean.prototype.check_type = function(val){
    if (!(typeof val === 'boolean' || val instanceof Boolean)){
        throw Error('Invalid value type, not a Boolean');
    }
};



hoe.PropertyDate = hoe.inherit(hoe.Property, function(){
    hoe.Property.apply(this, arguments);
    this.type = 'Date';
});

// we accept a date object or any constructor parameter for a date
hoe.PropertyDate.prototype.set = function(val){
    if (!(val instanceof Date)){
        return new Date(val);
    }
    return val;
};

hoe.PropertyDate.prototype.to_plain = function(val){
    if (val === null){
        return null;
    }
    return val.valueOf();
};

hoe.PropertyDate.prototype.check_type = function(val){
    if (!(val instanceof Date)){
        throw Error('Invalid value type, not a Date');
    }
};




hoe.Model = hoe.Type(function(data){
    this.init_model(data);
});

hoe.Model.prototype.init_model = function(data){
    var desc = this.Properties;
    var consumed = 0; // count number of data items used
    for (var k in desc){
        // set value
        if (k in data){
            this[k] = desc[k].set(data[k]);
            consumed++;
        }
        else {
            this[k] = desc[k].default;
        }

        // validate type value
        if (this[k] === null){
            if (desc[k].nullable===false){
                throw Error('Value can not be null.');
            }
        }
        else {
            // check correct type
            desc[k].check_type(this[k]);
        }
    }

    // check there were no unused values in data
    if (Object.keys(data).length != consumed){
        throw Error('Some data do not belong to model description.');
    }
};

hoe.Model.prototype.as_plain = function(){
    var data = {};
    var desc = this.Properties;
    for (var k in desc){
        data[k] = desc[k].to_plain(this[k]);
    }
    return data;
};
