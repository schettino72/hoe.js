/*jshint globalstrict:true */
/*global hoe */
/*global chai, suite, test*/

"use strict"; // ecmascript 5


var assert = chai.assert;



/*** tests ***/

// TODO extend chai
function html_str($ele){
    return $ele.outerHTML;
}


suite('hoe', function(){
    suite('hoe()', function(){
        test('simple element', function(){
            var $ele = hoe('div');
            assert.equal('<div></div>', html_str($ele));
        });
        test('string content', function(){
            var $ele = hoe('div', null, 'xxx');
            assert.equal('<div>xxx</div>', html_str($ele));
        });
        test('element attributes', function(){
            var $ele = hoe('div', {name: 'xxx'});
            assert.equal('<div name="xxx"></div>', html_str($ele));
        });
        test('many arguments', function(){
            var $ele = hoe('div', {name: 'xxx'}, 'yyy', 'zzz');
            assert.equal('<div name="xxx">yyyzzz</div>', html_str($ele));
        });
        test('dom element', function(){
            var $ele = hoe('div', null, hoe('span'));
            assert.equal('<div><span></span></div>', html_str($ele));
        });
    });

    suite('hoe DOM helpers', function(){
        test('hoe.append(text)', function(){
            var $ele = hoe('div');
            hoe.append($ele, 'xxx');
            assert.equal('<div>xxx</div>', html_str($ele));
        });
        test('hoe.append(node)', function(){
            var $ele = hoe('div');
            hoe.append($ele, hoe('span', null, 'xxx'));
            assert.equal('<div><span>xxx</span></div>', html_str($ele));
        });
        test('hoe.html() replace element content', function(){
            var $ele = hoe('div', null, 'xxx');
            assert.equal('<div>xxx</div>', html_str($ele));
            hoe.html($ele, 'yyy');
            assert.equal('<div>yyy</div>', html_str($ele));
        });

        test('hoe.remove()', function(){
            var $parent = hoe('div', null, 'xxx');
            var $child = hoe('span', null, 'foo');
            $parent.appendChild($child);
            assert.equal('<div>xxx<span>foo</span></div>', html_str($parent));
            assert.isTrue(hoe.remove($child));
            assert.equal('<div>xxx</div>', html_str($parent));
        });

        test('hoe.remove() detached element', function(){
            var $ele = hoe('div', null, 'xxx');
            assert.isFalse(hoe.remove($ele));
        });

        test('hoe.fragment()', function(){
            var $frag = hoe.fragment([hoe('span', null, 'xxx'), 'yyy']);
            var $ele = hoe('div', null, $frag);
            assert.equal('<div><span>xxx</span>yyy</div>', html_str($ele));
        });
    });


    suite('hoe.partial()', function(){
        test('simple element', function(){
            var row  = hoe.partial('div', {'class':'row'}, 'b');
            var $ele = row(null, 'l', 'a');
            assert.equal('<div class="row">bla</div>', html_str($ele));
        });
    });

    suite('hoe.init()', function(){
        test('default create elements on window', function(){
            var window_globals = Object.keys(window);
            assert.isUndefined(window.div);
            hoe.init();
            assert.isDefined(window.div);
            var $ele = window.div(null, 'xxx');
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
            var $ele = my_namespace.span(null, 'xxx');
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
            assert.equal(1, (new Base()).x);
            assert.equal("undefined", typeof obj.x);
            assert.equal(3, obj.three());
            assert.equal(5, Sub.constant_x);
        });
        test('same constructor', function(){
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

    suite('hoe.Type', function(){
        test('scope object', function(){
            var MyStuff = hoe.Type(function(){
                this.x = 5;
            });
            var my = new MyStuff();
            var get_on_scope = my.scope(function() {return this.x;});
            assert.deepEqual(5, get_on_scope());
        });

        test('scope with args', function(){
            var MyStuff = hoe.Type(function(){
                this.x = 5;
            });
            var my = new MyStuff();
            var get_on_scope = my.scope(function(a, b, c) {
                return [this.x, a, b, c];
            });
            assert.deepEqual([5, 'a', 'b', 3], get_on_scope('a', 'b', 3));
        });

        test('DOM event', function(){
            var MyStuff = hoe.Type(function(){
                this.x = 1;
            });
            var $ele = hoe('div', null, "xxx");
            var my = new MyStuff();
            my.listen($ele, 'click', function(){this.x=2;});
            assert.equal(1, my.x);
            $ele.dispatchEvent(new CustomEvent('click'));
            assert.equal(2, my.x);
        });

        test('obj event', function(){
            var Observed = hoe.Type(function(){
                this.do_x = function(){this.fire('done', 5);};
            });
            var Observer = hoe.Type(function(){
                this.x = 1;
                this.ele = new Observed();
                this.react = function(val){this.x=val;};
                this.listen(this.ele, 'done', this.react);
            });
            var obj = new Observer();
            assert.equal(1, obj.x);
            obj.ele.do_x();
            assert.equal(5, obj.x);
        });
    });


    suite('hoe.Type functional', function(){
        test('forArray', function(){
            var MyStuff = hoe.Type(function(){
                this.x = [];
            });
            var my = new MyStuff();
            assert.deepEqual([], my.x);
            my.forArray([1,3,5], function(val){this.x.push(val+1);});
            assert.deepEqual([2,4,6], my.x);
        });
        test('forDict', function(){
            var MyStuff = hoe.Type(function(){
                this.x = {};
            });
            var my = new MyStuff();
            assert.deepEqual({}, my.x);
            my.forDict({1:2, 3:4}, function(val, key){this.x[key]=val+1;});
            assert.deepEqual({1:3, 3:5}, my.x);
        });

        test('mapArray', function(){
            var MyStuff = hoe.Type(function(){
                this.x = 5;
            });
            var my = new MyStuff();
            var got = my.mapArray([1,3,5], function(val){return this.x + val;});
            assert.deepEqual([6,8,10], got);
        });
        test('mapDict', function(){
            var MyStuff = hoe.Type(function(){
                this.x = 5;
            });
            var my = new MyStuff();
            var got = my.mapDict({1:2, 3:4}, function(val, key){
                return parseInt(key, 10) + val + this.x;
            });
            assert.deepEqual([8, 12], got);
        });

    });


    suite('hoe.UI', function(){
        test('return value', function(){
            var MyWidget = hoe.inherit(hoe.UI, function(){});
            MyWidget.prototype._render = function(){
                return hoe('span', null, 'hi');
            };
            var widget = new MyWidget();
            assert.equal('<span>hi</span>', html_str(widget.render()));
        });
        test('remember container', function(){
            var MyWidget = hoe.inherit(hoe.UI, function(){
                this.text = 'hi';
            });
            MyWidget.prototype._render = function(){
                return hoe('span', null, this.text);
            };
            var $container = hoe('div');
            var widget = new MyWidget();
            widget.render($container);
            assert.equal('<div><span>hi</span></div>', html_str($container));

            // re-render without specifying container
            widget.text = 'hello';
            widget.render();
            assert.equal('<div><span>hello</span></div>', html_str($container));

            // container reference
            assert.equal('<div><span>hello</span></div>',
                         html_str(widget.$container));
        });
    });

    suite('hoe.Component', function(){
        test('create', function(){
            var MyComponent = hoe.Component('my-comp', function(){
                hoe.html(this, this.render());
            });
            MyComponent.render = function(){
                return hoe('div', null, 'hi');
            };
            var widget = hoe('my-comp');
            assert.equal('<my-comp><div>hi</div></my-comp>', html_str(widget));
        });

        test('component fire event', function(){
            hoe.Component('my-comp', function(){
                hoe.html(this, 'hello');
            });
            var $widget = hoe('my-comp');
            var result;
            $widget.addEventListener('custom_event', function(event){
                result = "got: " + event.detail;
            });
            $widget.fire('custom_event', '46');
            assert.equal('got: 46', result);
        });

        test('listen event from component', function(){
            hoe.Component('my-comp', function(){
                hoe.html(this, 'hello');
            });
            var $widget = hoe('my-comp');
            var my_obj = new (hoe.Type(function(){}))();
            my_obj.listen($widget, 'custom_event', function(event){
                this.result = "got: " + event.detail;
            });
            $widget.fire('custom_event', '48');
            assert.equal('got: 48', my_obj.result);
        });

        // complete example of a web component that can be created
        // declarative (HTML) or programatically (JS)
        test('init', function(){
            var MyComponent = hoe.Component('my-comp', function(data){
                if (!this.__loaded_html__){
                    this.content = data.content || '';
                    this.num = data.num || '1';
                }
                this.render();
            });
            MyComponent.render = function(){
                hoe.html(this,
                         hoe('span', null, 'XXX ' + this.content +
                             this.num + ' ---'));
            };
            MyComponent.from_html = function(){
                this.num = this.getAttribute('num');
                this.content = this.textContent;
                 // remove parsed content
                hoe.html(this);
            };

            // create component from HTML
            var original_html = '<my-comp num="5">hello from HTML</my-comp>';
            var $from_html = hoe('div');
            $from_html.innerHTML = original_html;
            // the node needs to be cloned because innerHTML
            // returns stale content
            var created = $from_html.cloneNode(true).children[0];
            assert.equal(
                '<my-comp num="5"><span>XXX hello from HTML5 ---' +
                    '</span></my-comp>',
                html_str(created));

            // create component from HTML using hoe
            var $from_hoe = hoe('my-comp', {'num':"4"}, 'hello from HTML');
            assert.equal(
                '<my-comp num="4"><span>XXX hello from HTML4 ---' +
                    '</span></my-comp>',
                html_str($from_hoe));

            // create componet from JS
            var $from_js = MyComponent.New({num:'6', content:'JS'});
            assert.equal(
                '<my-comp><span>XXX JS6 ---</span></my-comp>',
                html_str($from_js));

            // create componet from JS using default values
            var $from_jsd = MyComponent.New({});
            assert.equal(
                '<my-comp><span>XXX 1 ---</span></my-comp>',
                html_str($from_jsd));
        });


    });
});
