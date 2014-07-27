/*jshint globalstrict:true */
/*global hoe */
/*global chai, suite, test*/

"use strict"; // ecmascript 5


var assert = chai.assert;



/*** tests ***/

suite('hoe.model', function(){
    suite('hoe.Proerty', function(){
        test('constructor', function(){
            var defaults = new hoe.Property();
            assert.equal(null, defaults.type);
            assert.equal(null, defaults.default);
            assert.equal(true, defaults.nullable);

            var prop = new hoe.Property(25, false);
            assert.equal(25, prop.default);
            assert.equal(false, prop.nullable);
        });

        test('set() just return value wihtout any conversion', function(){
            var prop = new hoe.Property();
            assert.equal(7, prop.set(7));
        });

        test('check_type() fails', function(){
            var prop = new hoe.Property();
            function fn(){
                prop.check_type(undefined);
            }
            assert.throws(fn, Error, /Invalid value type, undefined/);
        });
    });

    suite('hoe.ProertyString', function(){
        test('check_type() fails', function(){
            var prop = new hoe.PropertyString();
            function fn(){
                prop.check_type(34);
            }
            assert.throws(fn, Error, /Invalid value type, not a String/);
        });
    });

    suite('hoe.ProertyNumber', function(){
        test('check_type() fails', function(){
            var prop = new hoe.PropertyNumber();
            function fn(){
                prop.check_type('34');
            }
            assert.throws(fn, Error, /Invalid value type, not a Number/);
        });
    });

    suite('hoe.ProertyDate', function(){
        test('set() can convert int to date', function(){
            var prop = new hoe.PropertyDate();
            var my_date = new Date(7);
            assert.equal(my_date.getTime(), prop.set(my_date).getTime());
            assert.equal(my_date.getTime(), prop.set(7).getTime());
        });

        test('check_type() can not pass unrecognized property', function(){
            var prop = new hoe.PropertyDate();
            function fn(){
                prop.check_type(345);
            }
            assert.throws(fn, Error, /Invalid value type, not a Date/);
        });
    });



    suite('hoe.Model', function(){
        var desc = {};
        desc.f1 = new hoe.PropertyString('v1', false);
        desc.f2 = new hoe.PropertyNumber(1, true);
        desc.f3 = new hoe.Property(56, true);

        var MyModel = hoe.inherit(hoe.Model);
        MyModel.prototype.Properties = desc;

        test('init_model', function(){
            var obj = new MyModel({f1: 'foo', f2: 2});
            assert.deepEqual({f1: 'foo', f2:2, f3:56}, obj.as_plain());
        });


        test('use default', function(){
            var obj = new MyModel({f2: 2});
            assert.deepEqual({f1: 'v1', f2:2, f3:56}, obj.as_plain());
        });

        test('set nullable to null', function(){
            var obj = new MyModel({f2: null});
            assert.deepEqual({f1: 'v1', f2: null, f3:56}, obj.as_plain());
        });

        test('set non-nullable to null', function(){
            function fn(){
                new MyModel({f1: null});
            }
            assert.throws(fn, Error, /Value can not be null./);
        });

        test('can not pass unrecognized property', function(){
            function fn(){
                new MyModel({not_a_field: 10});
            }
            assert.throws(fn, Error, /data do not belong to model description/);
        });

    });
});