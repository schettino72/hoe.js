hoe.js - javascript for peasants
===================================

about
------

[homepage](https://github.com/schettino72/hoe.js)

`hoe.js` is a javascript tool desgined to easy HTML DOM manipulation,
and working with prototypes.

Goals
-------

* lightweight, use standart javascript + jQuery
* it is designed to complement (and requires) [jQuery](http://jquery.com/)
* code should be easy to read / modify / extend
* see the [zen of python](http://www.python.org/dev/peps/pep-0020/)


introduction
--------------

### creating HTML elements

    hoe.init(); // create function's for popuar tags on global namespace
    var row = tr(td('col1', {'class': "my_class"}),
                 td(a('col2', {name: 'xxx'})) );


This would create:

    <tr>
      <td class="my_class">col1</td>
      <td><a name="xxx">col2</a></td>
    </tr>

`init()` will create functions named according to most used HTML tags.

* function create a tag given by its name
* it returns a jQuery object
* it can take any number of arguments where:
  * plain object are element attributes
  * string is append to the element content
  * DOM element or jQuery object is append to the element content
* init can take 2 arguments
  1. the namespace where the functions will be created (default: window)
  2. list of string with tag names which functions will be created
* you can also use the `hoe()` function where the first argument is a string
  with tag name, other arguments are same as described above

### inherit prototype

    function Base(){
        this.x = 1;
    }
    Base.prototype.three = function(){
        return 3;
    };
    var Sub = hoe.inherit(Base, function(){
        this.x = 2;
    });
    var obj = new Sub();
    obj.three();

`hoe.inherit` is just a shortcut to extend the prototype of a "Type"
into another.

* the first argument is the function constructor to copy the prototype from
* the second argument is optional. If present defines the constructor otherwise
  the constructor from the base type is used


### hoe.Type

`hoe.Type` is an _abstract_ type that provides some convenience methods
that keep the scope to the object when passing methods as callbacks.
It also define an Event system to be used between objects.

You need to `inherit` it to use its methods.

    var MyType = hoe.inherit(hoe.Type, function(){/*...*/});
    var MyType = hoe.Type(function(){/*...*/}); // ... or use this shortcut

#### forEach

    var MyType = hoe.Type(function(){
        this.class = 'hoe';
        this.$ele = div();
    };
    MyType.prototype.foo = function(content){
       this.$ele.append(span({'class': this.class}, content));
    }
    var my = new MyType();
    my.forEach(['ele1', 'ele2'], this.foo);
    my.$ele.html();
    // <div><span class="hoe">ele1</span><span class="hoe">ele2</span></div>


#### on DOM events

`on()` can be used to bind DOM events to object methods

    my.on(my.$ele, 'click', function(){alert(this.class)});
    // is the same as plain jQuery
    my.$ele.bind('click', $.proxy(function(){alert(this.class)}, this));

##### objects can create their own events using `trigger`

    my.trigger('my-custom-event-name', "argument1", {arg: 2});

* first argument is the event name
* other arguments will be passed to any event callback

Other objects can register callbacks to handle events in similar way
it is done for DOM events, but first argument is an object that generates
events instead of a DOM element;

    var my2 = new MyType();
    my2.on(my, 'my-custom-event-name', function(val){
         this.ele.append(val);
    });


license
-----------

[The MIT License](https://github.com/schettino72/hoe.js/blob/master/LICENSE).

