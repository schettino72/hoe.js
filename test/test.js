"use strict" // ecmascript 5

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
    var hoe = require(HOE_PATH).hoe;
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
        test('invalid parameter type (object)', function(){
            function MyType(){};
            var obj = new MyType();
            var fn = function(){return hoe('div', obj);};
            assert.throws(fn, /Invalid object:/);
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
});

