"use strict" // ecmascript 5

/*** setup test runner ***/
if (typeof window === 'undefined'){ // running on node
    var assert = require('assert');

    // setup DOM + jQuery
    var jsdom = require("jquery/node_modules/jsdom");
    var window = jsdom.jsdom('<html><body></body></html>').createWindow();
    global.window = window;
    global.document = window.document;
    var $ = global.jQuery = require('jquery').create(window);

    if (!global.HOE_PATH){
        global.HOE_PATH = '../lib/hoe.js';
    }
    var hoe = require(HOE_PATH).hoe;
}
else { // running on browser
    var assert = chai.assert;
}


/*** tests ***/

// TODO extend chai
function html_str($ele){
    return $('<div>').html($ele).html();
}


suite('hoe', function(){
    suite('hoe()', function(){
        test('simple element', function(){
            assert.equal("<div></div>", html_str(hoe('div')));
        });
    });
});

