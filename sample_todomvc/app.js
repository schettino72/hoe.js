/*global location, localStorage, hoe */
/*global input, label, button, ul, li, div */
/*global h1, section, header, footer, strong, a, span */

// hoe.js Tutorial - TodoMVC
// =============================
//
// In this tutorial we will create a simple TODO application,
// it is based on <http://todomvc.com/>.
// You can take a look at the full
// [specification](https://github.com/addyosmani/todomvc/wiki/App-Specification)
// , but not required.
//
// Before we start you can play with it [here](../sample_todomvc/index.html).
//
// To run locally grab the source files for HTML, CSS and other dependencies
// from the github
// [repo](https://github.com/schettino72/hoe.js/tree/gh-pages/sample_todomvc).
//
var APP; // easy debug

(function( window ) {
    'use strict';
    var ENTER_KEY = 13;

    // ## hoe initialization
    // first call `hoe.init()` to define shorthand functions to
    // create HTML elements in the global namespace like `div()`,
    // `span()`, `a()`...
    hoe.init();

    // ## TodoItem
    // Let's start writing code for a TodoItem,
    // our goal is to write it as a "component".
    //
    // It probably wont be re-used in any other place than
    // a TODO application, anyway this helps us structure the
    // the code in an easy way to understand and modify.
    //
    // ## hoe.Component
    // Creates a [CustomElement](https://github.com/Polymer/CustomElements).
    // A CustomElment can be created in two ways:
    //
    // 1) programatically create by javascript
    // 2) by HTML tags
    //
    // `hoe.Component` takes two parameters, the tag name and an initializer
    // function
    var TodoItem = hoe.Component('todo-item', function (args){
        // ### initializer
        // An item has 3 properties: `id`, `title` and `completed`.
        // The TodoItem is created inheriting from `hoe.Type` so
        // it has some extra features (more on this features later on).
        this.id = args.id;
        this.title = args.title;
        this.completed = args.completed;
        this.render();
    });

    // ## from_html
    // When an custom element is created from HTML, use `from_html()`
    // to extract data from it and return an object that will be passed
    // as argument to the initializer.
    TodoItem.from_html = function(){
        var args = {};
        args.id = this.getAttribute('id');
        args.title = this.textContent;
        args.completed = this.getAttribute('completed') === true;
        // remove title from DOM as actual DOM nodes will be
        // added later
        this.innerHTML = '';
        return args;
    };

    // `hoe.js` approach is that HTML for "widgets" should be created
    // directly by javascript.
    //
    // But shouldn't we separate the presentation from the logic with templates?
    // Well, using templates you would typically need to reference
    // mostly every element by `id` or `class` in order to attach events
    // and modify the element. So how much separation are you really getting
    // from this? Anyway, it is possible to use templates if you wish...
    //
    // Creating HTML from js lets us simplify by keeping all the code
    // in a single location and avoid problems like referencing elements
    // by name that might have changed, have a typo or are simply
    // hard to locate.
    TodoItem.render = function() {
        // * create the _input_ element for the checkbox calling the function
        //   with the tag name
        // * HTML attributes are passed as plain objects
        // * the returned value is a jQuery object
        this.$checkbox = input({ 'class': 'toggle', type: 'checkbox' });
        // set the checkbox according to the instance value using jQuery method.
        this.$checkbox.checked = this.completed;
        // Whenever a TodoItem is marked or unmarked as completed we need
        // to update our object's data, so let's attach an event handler.
        //
        // The standard way to attach callbacks to events is to use the
        // method `listen`. This method is similar with jQuery's `on` and
        // `bind`. The difference is that this method
        // belongs to the TodoItem object and the callback will be automatically
        // executed on the object scope (no need to use `$.proxy`).
        //
        // the arguments are:
        //
        // * the jQuery/DOM element that generates the event
        // * the event name
        // * the callback -> (will be implemented later)
        this.listen( this.$checkbox, 'change', this.toggleCompleted );

        // Create _label_ for checkbox with todo title and attach a
        // method to start editing on double click event.
        //
        // Before we saw how plain objects are used to set HTML
        // attributes for a tag being created. If you pass a _String_
        // it will be append in the content of the element.
        this.$label = label( {}, this.title );
        this.listen( this.$label, 'dblclick', this.startEdit );

        // Create _button_ to remove the TodoItem.
        // When a todo item is deleted it needs to be removed from
        // the TodoApp. Since the TodoItem has no knowlodge of
        // where it is contained it will just tigger/fire an event,
        // so that the container can act uppon it.
        //
        // The fire method's first argument is the name of the event.
        // All other arguments will be passed to the callback attached
        // as event handler, here we just pass a reference to the TodoItem
        // being deleted.
        var $button = button({ 'class': 'destroy' });
        this.listen( $button, 'click', function(){
            this.fire('delete', this);
        } );

        // Here we create the _input_ element to be used when the title
        // of the TodoItem is being edited.
        this.$input = input({ 'class': 'edit', value:this.title });
        this.listen( this.$input, 'blur', this.updateTitle );
        this.listen( this.$input, 'keypress', this.updateTitle );

        // Now we just need to put all the elements together.
        // Note how we combine different arguments, plain object for
        // HTML attributes, DOM elements are appended to the content.
        // You can pass as many arguments as you wish.
        var $view = div( {'class': 'view'},
                         this.$checkbox, this.$label, $button );
        this.appendChild( $view);
        this.appendChild( this.$input );

        // And finally set a class to apply a CSS style.
        this.style.setProperty('display', 'block');
        this.classList.toggle( 'completed', this.completed );
    };

    // ### Event handlers
    // Now we need to create the methods used as event handlers
    // for each operation.
    //
    // `startEdit` will display the input element (done through CSS,
    // so just change the `class` attribute).
    TodoItem.startEdit = function() {
        this.classList.add( 'editing' );
        this.$input.focus();
    };

    // `updateTitle` when finished editing.
    TodoItem.updateTitle = function( e ){
        if ( e.type === 'blur' || e.keyCode === ENTER_KEY ) {
            // update the Object property
            this.title = this.$input.value = this.$input.value.trim();
            // update the UI
            this.$label.textContent = this.title;
            this.classList.remove( 'editing' );
            // notify the container element triggering an event
            if ( !this.title ){
                this.fire( 'delete', this );
            }
            this.fire( 'updated' );
        }
    };

    // `toggleCompleted`, about the same steps.
    // Update the object property, update the UI and trigger an event to
    // notify the container.
    TodoItem.toggleCompleted = function() {
        this.completed = this.$checkbox.checked;
        this.classList.toggle( 'completed' );
        this.fire( 'toggle', this );
    };


    // ## TodoApp
    // The TodoApp will follow the same pattern.
    // The constructor defines the object properties, the initial data
    // is loaded from LocalStorage.
    // The URL hash can be used to set the initial "view filter".
    var TodoApp = hoe.Component('todo-app', function() {
        APP = this;
        // dict of TodoItem by id
        this.todos = {};
        // helper to generate TodoItem id's
        this.next_id = 0;
        // computed values. keep track of number of TodoItem's and completed
        this.num_completed = 0;
        this.num_items = 0;
        // current value of the UI filter
        this.filter = '';
        this.filter_opts = {'': { title: 'All', value: null },
                            'active': { title: 'Active', value: true },
                            'completed': { title: 'Completed', value: false }};

        // Initialization: load data from LocalStorage
        this.load();

        // add elements from HTML
        this.forArray(this.extra, function(todo_item){
            this.addItem(todo_item);
        });

        this.updateCount();
        if (this.num_items){
            this.$footer.style.display = '';
            this.$main.style.display = '';
        }
        // read hash from URL to set initial filter
        this.hashChanged();
    });

    // It is possible to directly modify the object instead of passing
    // arguments to the initializer
    TodoApp.from_html = function(){
        this.extra = [];
        var items = this.getElementsByTagName('todo-item');
        this.forArray(items, function (todo_item){
            this.extra.push(todo_item);
        });
    };

    // ### render
    // create HTMl elements and attach events
    TodoApp.render = function() {
        // the input element where new TodoItem can be added
        this.$input = input({ id: 'new-todo',
                              placeholder: 'What needs to be done?',
                              autofocus: '' });
        this.listen( this.$input, 'keyup', this.createItemCallback );

        // checkbox to toggle all Todo's at once
        this.$toggleAll = input({ id:'toggle-all', type:'checkbox' });
        this.listen( this.$toggleAll, 'change', this.toggleAll );
        var $label = label( { 'for': 'toggle-all' }, 'Mark all as complete' );

        // the container for the TodoItem's HTML
        this.$todoList = ul({ id:'todo-list' });

        // assemble the main section
        this.$main = section( {'id':'main'},  this.$toggleAll,
                              $label, this.$todoList);

        // create the footer
        this.$todoCount = span({ id: 'todo-count' });
        this.$filters = ul( { id: 'filters' } );
        // A separate function was defined to create the HTML
        // for the filters.
        //
        // the `forDict` method from `hoe.Type` will iterate through
        // the items of an array/object and pass them as a parameter
        // to a function. The function will automatically keep the scope
        // in the object.
        this.forDict(this.filter_opts, this.render_filter);
        this.$clear = button({ id: 'clear-completed' });
        this.listen( this.$clear, 'click', this.clearCompleted );
        this.$footer = footer( {'id': 'footer'},
                               this.$todoCount, this.$filters, this.$clear );

        // Put all the parts together.
        //
        // jQuery objects have `hoe()` method that is similar to HTML
        // creation functioins, but use an existing element.
        // Plain objects become HTML attributes, string and other DOM
        // elements are append to the content.
        hoe.html(
            this,
            header( {id:'header'}, h1( null, 'todos' ), this.$input ),
            this.$main, this.$footer
        );
        this.style.display = 'block';

        this.$footer.style.display = 'none';
        this.$main.style.display = 'none';

        // Attach event handler for haschange in the URL
        this.listen(window, 'hashchange', this.hashChanged);

    };

    // `render_filter` create HTML for filter options.
    TodoApp.render_filter = function( data, path ) {
        var $link = a( {href: '#/' + path }, data.title );
        $link.classList.toggle( 'selected', ( this.filter == path) );
        this.listen( $link, 'click', function() {
            this.setFilter(path);
        });
        this.filter_opts[path].$ele = $link;
        this.$filters.appendChild( li( null, $link ) );
    };

    // ### hashChanged
    // Read hash from URL and apply filter
    TodoApp.hashChanged = function() {
        if ( location.hash ) {
            this.setFilter(location.hash.substring(2));
        }
    };

    // ### setFilter
    // Change view to display only todo items that match the filter.
    TodoApp.setFilter = function( path ) {
        // uptate propery
        this.filter = path;
        // update UI
        var $items = this.$filters.getElementsByTagName('a');
        for(var i=0,max=$items.length;i<max;i++){
            $items[i].classList.remove('selected');
        }
        this.filter_opts[path].$ele.classList.add( 'selected' );
        // apply filter to all TodoItem one by one.
        this.forDict( this.todos, this.filterItem );
        // the active filter also needs to be saved in LocalStorage
        this.save();
    };

    // ### createItem
    // Create new TodoItem and add them to the TodoApp.
    // This is used on initialization for items read from LocalStorage
    // and for items added through the UI.
    TodoApp.createItem = function( id, title, completed ) {
        var item = TodoItem.New({id:id, title:title, completed:completed});
        this.addItem(item);
    };

    // ### addItem
    // Adds the TodoItem to the TodoApp and renders it.
    TodoApp.addItem = function( item ) {
        var id = item.id;
        if (id in this.todos) return;
        this.todos[id] = item;
        // Attach event handlers to TodoItem events.
        // The API is the same as used by DOM events,
        // just pass the object as first parameter instead of
        // a DOM element. Than comes the event name (_string_),
        // and the callback.
        this.listen( this.todos[id], 'delete', function(event){
            this.deleteItem(event.detail);
        });
        this.listen( this.todos[id], 'toggle', this.itemToggled );
        this.listen( this.todos[id], 'updated', this.save );
        this.num_items += 1;
        this.num_completed += item.completed ? 1 : 0;
        this.$todoList.appendChild( this.todos[id] );
        this.filterItem( this.todos[id] );
    };


    // ### updateCount
    // Whenever an item is added or edited we need to refresh
    // the footer displaying the summary of items/completed.
    TodoApp.updateCount = function() {
        var left = this.num_items - this.num_completed;
        var left_str = ( left == 1 ) ? ' item left' : ' items left';
        this.$toggleAll.checked = (this.num_completed === this.num_items);
        hoe.html(this.$todoCount,
                 span( null, strong( null, left.toString() ), left_str ) );
        hoe.html( this.$clear,
                  'Clear completed (' + this.num_completed + ')' );
        this.$clear.style.display = (this.num_completed !== 0) ? '' : 'none';
        this.save();
    };

    // ### createItemCallback
    // Called when a new TodoItem is created from the UI
    TodoApp.createItemCallback = function( e ) {
        var title = this.$input.value.trim();
        if ( e.which === ENTER_KEY && title ) {
            var id = this.next_id++;
            this.createItem( id, title, false );
            this.$input.value = '';
            this.$footer.style.display = '';
            this.$main.style.display = '';
            this.updateCount();
        }
    };

    // ### deleteItem
    TodoApp.deleteItem = function( item ) {
        this.num_items -= 1;
        this.num_completed -= item.completed ? 1 : 0;
        if ( this.num_items === 0 ){
            this.$footer.style.display = 'none';
            this.$main.style.display = 'none';
        }
        delete this.todos[item.id];
        hoe.remove(item);
        this.updateCount();
    };

    // ### filterItem
    // Apply filter to a single item setting its visibility.
    TodoApp.filterItem = function ( item ) {
        var display = item.completed != this.filter_opts[this.filter].value;
        item.style.display = display ? '' : 'none';
    };

    // ### itemToggled
    // Event handler for TodoItem. Updates counter and applly filter on item
    TodoApp.itemToggled = function( event ) {
        var item = event.detail;
        this.num_completed += item.completed ? 1 : -1;
        this.filterItem( item );
        this.updateCount();
    };

    // ### toggleAll
    TodoApp.toggleAll = function() {
        var checked = this.$toggleAll.checked;
        this.forDict( this.todos, function( item ){
            if ( item.completed !== checked ){
                item.$checkbox.checked = checked;
                item.toggleCompleted();
            }
        });
    };

    // ### clearCompleted
    // Delete all TodoItem that are completed.
    // Note: items are deleted one by one...
    TodoApp.clearCompleted = function(){
        this.forDict( this.todos, function( item ){
            if ( item.completed ){
                this.deleteItem( item );
            }
        });
    };

    // ### load
    // This app saves the session data using LocaStorage.
    TodoApp.load = function() {
        var store = localStorage.getItem( 'todos-hoejs' );
        if ( store ) {
            // load list of TodoItem, filter, and next_id from LocaStorage
            var data = ( JSON.parse( store ) );
            this.filter = data.filter;
            this.next_id = data.next_id;
            // render the App (initially empty)
            this.render();
            // add the items read from the store
            this.forDict( data.todos, function( value, key ) {
                this.$footer.style.display = '';
                this.$main.style.display = '';
                if (typeof value[1] != 'boolean'){
                    value[1] = false;
                    //throw 'db corrupted!';
                }
                this.createItem( key, value[0], value[1]);
            });
            return;
        }
        this.render();
    };

    // ### save
    // save whole TodoApp on LocalStorage
    TodoApp.save = function() {
        var todos = {};
        this.forDict( this.todos, function( v, k ) {
            todos[k] = [ v.title, v.completed ];
        });
        var data = { next_id: this.next_id, filter: this.filter, todos: todos };
        localStorage.setItem( 'todos-hoejs', JSON.stringify( data ) );
    };

})( window );
