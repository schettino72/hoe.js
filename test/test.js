/*jshint globalstrict:true */
/*global global, require */
/*global suite, test*/

"use strict"; // ecmascript 5


var IS_NODE = typeof window === 'undefined';

/*** setup test runner ***/
function fake_dom(){
    var jsdom = require("jquery/node_modules/jsdom");
    var window = jsdom.jsdom('<html><body></body></html>').createWindow();
    global.window = window;
    global.document = window.document;
    global.Element = window.Element;
    global.$ = global.jQuery = require('jquery').create(window);
}

if (IS_NODE){ // running on node
    var chai = require('chai');

    // setup DOM + jQuery
    fake_dom();

    if (!global.HOE_PATH){
        global.HOE_PATH = '../src/hoe.js';
    }
    var hoe = require(global.HOE_PATH).hoe;
}

var assert = chai.assert;



/*** tests ***/

// TODO extend chai
function html_str($ele){
    return $('<div>').html($ele).html();
}


suite('hoe', function(){
    suite('hoe()', function(){
        test('simple element', function(){
            var $ele = hoe('div');
            assert.equal('<div></div>', html_str($ele));
        });
        test('element attributes', function(){
            var $ele = hoe('div', {name: 'xxx'});
            assert.equal('<div name="xxx"></div>', html_str($ele));
        });
        test('string content', function(){
            var $ele = hoe('div', 'xxx');
            assert.equal('<div>xxx</div>', html_str($ele));
        });
        test('many arguments', function(){
            var $ele = hoe('div', {name: 'xxx'}, 'yyy', 'zzz');
            assert.equal('<div name="xxx">yyyzzz</div>', html_str($ele));
        });
        test('jquery element', function(){
            var $ele = hoe('div', $('<span>'));
            assert.equal('<div><span></span></div>', html_str($ele));
        });
        test('dom element', function(){
            var $ele = hoe('div', $('<span>').get(0));
            assert.equal('<div><span></span></div>', html_str($ele));
        });
        test('array element', function(){
            var $ele = hoe('div', [
                'hi',
                $('<span>hoe</span>'),
                'hu'
            ]);
            assert.equal('<div>hi<span>hoe</span>hu</div>', html_str($ele));
        });
        test('modify existing jQuery element', function(){
            var $ele = $('<div>');
            $ele.hoe('xxx');
            assert.equal('<div>xxx</div>', html_str($ele));
        });
        test('invalid parameter type (bool)', function(){
            var fn = function(){return hoe('div', true);};
            assert.throws(fn, /Invalid type: boolean/);
        });
    });


    suite('hoe.partial()', function(){
        test('simple element', function(){
            var row  = hoe.partial('div', {'class':'row'});
            var $ele = row('bla');
            assert.equal('<div class="row">bla</div>', html_str($ele));
        });
    });

    suite('hoe.init()', function(){
        test('default create elements on window', function(){
            var window_globals = Object.keys(window);
            assert.isUndefined(window.div);
            hoe.init();
            assert.isDefined(window.div);
            var $ele = window.div('xxx');
            assert.equal('<div>xxx</div>', html_str($ele));

            // delete stuff added to window
            hoe.init_default_tags.forEach(function(tag){
                delete window[tag];
            });
            assert.deepEqual(window_globals, Object.keys(window));
        });
        test('set namespace and tags to be created', function(){
            assert.isUndefined(window.span);
            var my_namespace = {};
            hoe.init(my_namespace, ['span']);
            assert.isUndefined(window.span);
            assert.isUndefined(my_namespace.div);
            var $ele = my_namespace.span('xxx');
            assert.equal('<span>xxx</span>', html_str($ele));
        });
    });


    suite('hoe.inherit', function(){
        test('new constructor', function(){
            function Base(){
                this.x = 1;
            }
            Base.prototype.three = function(){return 3;};
            Base.constant_x = 5;
            var Sub = hoe.inherit(Base, function(){
                this.y = 2;
            });
            var obj = new Sub();
            assert.equal(2, obj.y);
            assert.equal("undefined", typeof obj.x);
            assert.equal(3, obj.three());
            assert.equal(5, Sub.constant_x);
        });
        test('new constructor', function(){
            function Base(){
                this.x = 1;
            }
            Base.prototype.three = function(){return 3;};
            Base.constant_x = 5;
            var Sub = hoe.inherit(Base);
            var obj = new Sub();
            assert.equal(1, obj.x);
            assert.equal(3, obj.three());
            assert.equal(5, Sub.constant_x);
        });
    });

    suite('hoe.Type event system', function(){
        test('DOM event', function(){
            var MyStuff = hoe.Type(function(){
                this.x = 1;
            });
            var $ele = hoe('div', "xxx");
            var my = new MyStuff();
            my.on($ele, 'click', function(){this.x=2;});
            assert.equal(1, my.x);
            $ele.trigger('click');
            assert.equal(2, my.x);
        });
        test('obj event', function(){
            var Observed = hoe.Type(function(){
                this.do_x = function(){this.trigger('done', 5);};
            });
            var Observer = hoe.Type(function(){
                this.x = 1;
                this.ele = new Observed();
                this.react = function(val){this.x=val;};
                this.on(this.ele, 'done', this.react);
            });
            var obj = new Observer();
            assert.equal(1, obj.x);
            obj.ele.do_x();
            assert.equal(5, obj.x);
        });
    });


    suite('hoe.Type functional', function(){
        test('forEach array', function(){
            function MyStuff(){
                this.x = [];
            }
            $.extend(MyStuff.prototype, hoe.Type.prototype);
            var my = new MyStuff();
            assert.deepEqual([], my.x);
            my.forEach([1,3,5], function(val){this.x.push(val+1);});
            assert.deepEqual([2,4,6], my.x);
        });
        test('forEach object', function(){
            function MyStuff(){
                this.x = {};
            }
            $.extend(MyStuff.prototype, hoe.Type.prototype);
            var my = new MyStuff();
            assert.deepEqual({}, my.x);
            my.forEach({1:2, 3:4}, function(val, key){this.x[key]=val+1;});
            assert.deepEqual({1:3, 3:5}, my.x);
        });

        test('map array', function(){
            function MyStuff(){
                this.x = 5;
            }
            $.extend(MyStuff.prototype, hoe.Type.prototype);
            var my = new MyStuff();
            var got = my.map([1,3,5], function(val){return this.x + val;});
            assert.deepEqual([6,8,10], got);
        });
        test('map object', function(){
            function MyStuff(){
                this.x = 5;
            }
            $.extend(MyStuff.prototype, hoe.Type.prototype);
            var my = new MyStuff();
            var got = my.map({1:2, 3:4}, function(val, key){
                return parseInt(key, 10) + val + this.x;
            });
            assert.deepEqual([8, 12], got);
        });
    });
});
