/*jshint globalstrict:true */
/*global hoe */
/*global chai, suite, test*/

"use strict"; // ecmascript 5


var assert = chai.assert;



/*** tests ***/

suite('hoe.app', function(){
    suite('hoe.Route', function(){
        test('Route.match() simple', function(){
            var route = new hoe.Route("/simple");
            assert.deepEqual({}, route.match('/simple'));
            assert.equal(null, route.match('/simple2'));
            assert.equal(null, route.match('/simple/'));
            assert.equal(null, route.match('/simple/123'));
            assert.equal(null, route.match('simple'));
            assert.equal(null, route.match('/abc'));
        });

        test('Route.match() root', function(){
            var route = new hoe.Route("/");
            assert.deepEqual({}, route.match('/'));
        });

        test('Route.match() params', function(){
            var route = new hoe.Route("/with/:p1/and/:p2");
            assert.deepEqual({p1:'abc', p2:'xyz'},
                             route.match('/with/abc/and/xyz'));
            assert.equal(null, route.match('/fooooo/abc/and/xyz'));
            assert.equal(null, route.match('/with/abc/and'));
            assert.equal(null, route.match('/with/abc/and/'));
        });

        test('Route.build()', function(){
            var route = new hoe.Route("/with/:p1/and/:p2");
            assert.equal('/with/abc/and/xyz',
                         route.build({p1:'abc', p2:'xyz'}));

            var fn = function(){route.build({p1:'abc', xxx:'xyz'});};
            assert.throws(fn, /Missing param: p2/);
        });

    });


    suite('hoe.Router', function(){
        test('Router.match()', function(){
            var router = new hoe.Router();
            var route_a = new hoe.Route('/simple', 'simple_name');
            var route_b = new hoe.Route('/xxx/:p1', 'b');
            router.add(route_a);
            router.add(route_b);

            assert.equal(null, router.match('/simple2'));

            var simple = router.match('/simple');
            assert.equal('simple_name', simple.route.name);
            assert.deepEqual({}, simple.params);

            assert.deepEqual({'route': route_b, 'params': {p1:'abc'}},
                             router.match('/xxx/abc'));
         });

        test('Router.build()', function(){
            var router = new hoe.Router();
            var route_a = new hoe.Route('/simple', 'simple_name');
            var route_b = new hoe.Route('/xxx/:p1', 'b');
            router.add(route_a);
            router.add(route_b);

            assert.equal('/xxx/abc', router.build('b', {p1: 'abc'}));
            assert.equal('/simple', router.build('simple_name'));
            var fn = function(){router.build('who');};
            assert.throws(fn, /Route not found: who/);
        });

    });
});