/*jshint globalstrict:true */
/*global hoe */
/*global chai, suite, test*/

"use strict"; // ecmascript 5


var assert = chai.assert;



/*** tests ***/

suite('hoe.model', function(){
    suite('hoe.model_set', function(){
        var desc = {};
        desc.f1 = new hoe.PropertyString('v1', false);
        desc.f2 = new hoe.PropertyNumber(1, true);
        desc.f3 = new hoe.Property(56, true);

        test('set values', function(){
            var obj = {};
            hoe.model_set(obj, desc, {f1: 'foo', f2: 2});
            assert.deepEqual({f1: 'foo', f2:2, f3:56}, obj);
        });

        test('use default', function(){
            var obj = {};
            hoe.model_set(obj, desc, {f2: 2});
            assert.deepEqual({f1: 'v1', f2:2, f3:56}, obj);
        });

        test('can not pass unrecognized property', function(){
            var obj = {};
            function fn(){
                hoe.model_set(obj, desc, {not_a_field: 10});
            }
            assert.throws(fn, Error, /data do not belong to model description/);
        });

        test('set nullable to null', function(){
            var obj = {};
            hoe.model_set(obj, desc, {f2: null});
            assert.deepEqual({f1: 'v1', f2: null, f3:56}, obj);
        });

        test('set non-nullable to null', function(){
            var obj = {};
            function fn(){
                hoe.model_set(obj, desc, {f1: null});
            }
            assert.throws(fn, Error, /Value can not be null./);
        });

        test('wrong type undefined', function(){
            var obj = {};
            function fn(){
                hoe.model_set(obj, desc, {f3: undefined});
            }
            assert.throws(fn, Error, /Invalid value type, undefined/);
        });


        test('wrong type number', function(){
            var obj = {};
            function fn(){
                hoe.model_set(obj, desc, {f2: '45'});
            }
            assert.throws(fn, Error, /Invalid value type, not a Number/);
        });

        test('wrong type string', function(){
            var obj = {};
            function fn(){
                hoe.model_set(obj, desc, {f1: 47});
            }
            assert.throws(fn, Error, /Invalid value type, not a String/);
        });

    });
});