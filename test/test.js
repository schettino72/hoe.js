"use strict" // ecmascript 5

if (typeof window === 'undefined'){ // running from node
    var assert = require('assert');

    // setup DOM + jQuery
    var jsdom = require("jquery/node_modules/jsdom");
    var window = jsdom.jsdom('<html><body></body></html>').createWindow();
    global.window = window;
    global.document = window.document;
    var $ = global.jQuery = require('jquery').create(window);

    var hoe = require('../hoe.js').hoe;
}
else { // for browser
    var assert = chai.assert;
}


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

