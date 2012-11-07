/*global location, localStorage, $, hoe */
/*global input, label, button, ul, li, div, h1, section, header, footer, strong, a, span */

// hoe.js Tutorial - TodoMVC
// =============================
//
// This tutorial we will create a simple TODO application,
// it is based on <http://todomvc.com/>.
// You can take a look at full [specification](https://github.com/addyosmani/todomvc/wiki/App-Specification) - but not required.
//
// Before we start you can play with it [here](../sample_todomvc/index.html).
//
// To run locally grab the source files for HTML, CSS and other dependencies
// from the [github repo](https://github.com/schettino72/hoe.js/tree/gh-pages/sample_todomvc).
//
(function( window ) {
	'use strict';
	var ENTER_KEY = 13;

    // ## hoe initialization
    // first call `hoe.init()` to define shorthand functions to
    // create HTML elements in the global namespace.
	hoe.init();

    // ## TodoItem
    // Let's start writing code for a TodoItem,
    // our goal is to write it as a "component".
    //
    // It probably wont be re-used in any other place than
    // a TODO application, anyway this helps us structure the
    // the code in an easy way to understand and modify.
    //
    // ### constructor
    // An item has 3 properties: `id`, `title` and `completed`.
    // The TodoItem is created inheriting from `hoe.Type` so
    // it has some extra features.
	var TodoItem = hoe.Type( function( id, title, completed ) {
		this.id = id;
		this.title = title;
		this.completed = completed;
	});

    // ### render
    // `hoe.js` approach is that HTML for "widgets" should be created
    // directly by javascript.
    //
    // But shouldnt we separate the presentation from the logic with templates?
    // Well, using templates you would typically need to reference
    // mostly every element by `id` or `class` in other to attach events
    // and modify the element. So how much separation are you really getting
    // from this?
    //
    // Creating HTML from js let us simplify by keeping all the code in a single
    // location and avoid problems like referencing elements by name that might
    // changed, have a typo or are simply hard to locate.
	TodoItem.prototype.render = function() {
        // * create the input element for the checkbox calling the function
        //   with the tag name
        // * HTML attributes are passed as plain objects
        // * the returned value is a jQuery object
		this.$checkbox = input({ 'class': 'toggle', type: 'checkbox' });
        // set the checkbox according to the instance value using jQuery method.
		this.$checkbox.prop('checked', this.completed );
        // Whenever a TodoItem is marked or unmarked as completed we need
        // to update our objects data, so lets attach an event handler.
        //
        // The standard way to attach callbacks to events is to use the
        // method `on`. (This is a `hoe.Type.on` method not the be confused
        // with jQuery `on` method). The difference is that this method
        // belongs to the TodoItem object and callback will be automatically
        // execute on the object scope (no need to use `$.proxy`).
        //
        // the arguments are:
        // * the jQuery/DOM element that generates the event
        // * the event name
        // * the callback -> (will be implemented later)
		this.on( this.$checkbox, 'change', this.toggleCompleted );

        // Create label for checkbox with todo title and attach on
        // double click event
		this.$label = label( this.title );
		this.on( this.$label, 'dblclick', this.startEdit );

        // When a todo item is deleted it needs to be removed from
        // the TodoApp. Since the TodoItem has no knowlodge of
        // where it is contained it will just tigger an event,
        // so that the container can act uppon it.
        //
        // The trigger method's first argument is the name of the event.
        // All other arguments will be passed to the callback attached
        // as event handler
		var $button = button({ 'class': 'destroy' });
		this.on( $button, 'click', function(){ this.trigger('delete', this); } );

        // Here we create the input element to be used when the title
        // of the TodoItem is being edited.
		this.$input = input({ 'class': 'edit', value:this.title });
		this.on( this.$input, 'blur', this.updateTitle );
		this.on( this.$input, 'keypress', this.updateTitle );

        // Now we just need to put all the elements together
		var $view = div( {'class': 'view'}, this.$checkbox, this.$label, $button );
		this.$ele = li( $view, this.$input );

        // And finally set a class to apply a CSS style.
		return this.$ele.toggleClass( 'completed', this.completed );
	};

    // ### Event handlers
    // Now we need to create an event handler for each operation.
    //
    // `startEdit` will display the input element (done through CSS,
    // so just change the `class` attribute).
	TodoItem.prototype.startEdit = function() {
		this.$ele.addClass( 'editing' );
		this.$input.focus();
	};

    // `updateTitle` when finished editing.
	TodoItem.prototype.updateTitle = function( e ){
		if ( e.type === 'blur' || e.keyCode === ENTER_KEY ) {
            // remember to update the Object property
			this.title = $.trim( this.$input.val() );
            // update the UI
			this.$label.text( this.title );
			this.$ele.removeClass( 'editing' );
            // notiy the container element triggering an event
			if ( !this.title ){
				this.trigger( 'delete', this );
			}
			this.trigger( 'updated' );
		}
	};

    // `toggleCompleted`, about the same steps.
    // Update the object property, update the UI trigger event to
    // notify container.
	TodoItem.prototype.toggleCompleted = function() {
		this.completed = this.$checkbox.prop( 'checked' );
		this.$ele.toggleClass( 'completed' );
		this.trigger( 'toggle', this );
	};


    // ## TodoApp
    // The TodoApp will follow the same pattern.
    // The constructor define the object properties, the initial data
    // is loaded from LocalStorage.
    // The URL hash can be used to set the initial "view filter".
	var TodoApp = hoe.Type(function() {
        // dict of TodoItem by id
		this.todos = {};
        // helper to generate TodoItem id's
		this.next_id = 0;
        // computed keep track of number of TodoItem's and completed
		this.num_completed = 0;
		this.num_items = 0;
        // current value of the UI filter
		this.filter = '';
		this.filter_opts = {'': { title: 'All', value: null },
							'active': { title: 'Active', value: true },
							'completed': { title: 'Completed', value: false }};
        // load data from LocalStorage
		this.load();
        // read hash from URL
		this.hashChanged();
	});

    // ### render
    // create HTMl elements and attach events
	TodoApp.prototype.render = function() {
        // the input element where new TodoItem's can be added
		this.$input = input({ id: 'new-todo', placeholder: 'What needs to be done?', autofocus: '' });
		this.on( this.$input, 'keyup', this.addItemCallback );

        // checkbox to toggle all Todo's at once
		this.$toggleAll = input({ id:'toggle-all', type:'checkbox' });
		this.on( this.$toggleAll, 'change', this.toggleAll );
		var $label = label( { 'for': 'toggle-all' }, 'Mark all as complete' );

        // the container for the TodoItem's HTML
		this.$todoList = ul({ id:'todo-list' });

        // assemble the main section
		this.$main = section( this.$toggleAll, $label, this.$todoList);

        // create the footer
		this.$todoCount = span({ id: 'todo-count' });
		this.$filters = ul( { id: 'filters' } );
        // A separate function was defined to create the HTML
        // for the filters.
        //
        // the `forEach` method from `hoe.Type` will iterate through
        // the items of an array/object and pass them as a parameter
        // to a function. The function will automatically keep the scope
        // in the object.
		this.forEach(this.filter_opts, this.render_filter);
		this.$clear = button({ id: 'clear-completed' });
		this.on( this.$clear, 'click', this.clearCompleted );
		this.$footer = footer( this.$todoCount, this.$filters, this.$clear );

        // put all the parts together
		$( '#todoapp' ).hoe( header( {id:'header'}, h1( 'todos' ), this.$input ),
							 this.$main.attr( 'id', 'main' ),
							 this.$footer.attr( 'id', 'footer' ) );

        // Create a group of elements that will be hidden when todo list is empty.
		this.$hide_empty = $( this.$footer ).add( this.$main ).hide();

        // Attach event handler for haschange in the URL
		this.on($(window), 'hashchange', this.hashChanged);
	};

    // `render_filter` create HTML for filter options.
	TodoApp.prototype.render_filter = function( data, path ) {
		var $link = a( {href: '#/' + path }, data.title );
		$link.toggleClass( 'selected', ( this.filter == path) );
		this.on( $link, 'click', function() {
			this.setFilter(path);
		});
		this.filter_opts[path].$ele = $link;
		this.$filters.append( li( $link ) );
	};

    // ### hashChanged
    // Read hash from URL and apply filter
	TodoApp.prototype.hashChanged = function() {
		if ( location.hash ) {
			this.setFilter(location.hash.substring(2));
		}
	};

    // ### setFilter
	TodoApp.prototype.setFilter = function( path ) {
        // uptate propery
		this.filter = path;
        // update UI
		$( 'a', this.$filters ).removeClass( 'selected' );
		this.filter_opts[path].$ele.addClass( 'selected' );
		this.forEach( this.todos, this.filterItem );
        // the active filter is also needs to be save in LocalStorage
		this.save();
	};

    // ### addItem
    // Adds the TodoItem to the TodoApp and render it.
    // This is used on initialization for items read from LocalStorage
    // and for items added through the UI.
    TodoApp.prototype.addItem = function( id, title, completed ) {
        // create a new TodoItem
		this.todos[id] = new TodoItem( id, title, completed );
        // Attach event handlers to TodoItem events.
        // The API is the same as used by DOM events,
        // just pass the object as first parameter instead of
        // a DOM element.
		this.on( this.todos[id], 'delete', this.deleteItem );
		this.on( this.todos[id], 'toggle', this.itemToggled );
		this.on( this.todos[id], 'updated', this.save );
		this.num_items += 1;
		this.num_completed += completed ? 1 : 0;
		this.$todoList.append( this.todos[id].render() );
		this.filterItem( this.todos[id] );
	};


    // ### updateCount
    // Whenever an item is added or edited we need to refresh
    // the footer displaying the summary of items/completed.
	TodoApp.prototype.updateCount = function() {
		var left = this.num_items - this.num_completed;
		var left_str = ( left == 1 ) ? ' item left' : ' items left';
		this.$toggleAll.prop( 'checked', (this.num_completed === this.num_items) );
		this.$todoCount.html( span( strong( left.toString() ), left_str ) );
		this.$clear.text( 'Clear completed (' + this.num_completed + ')' );
		this.$clear.toggle( (this.num_completed !== 0) );
		this.save();
	};

    // ### addItemCallback
    // Called when a new TodoItem is created from the UI
	TodoApp.prototype.addItemCallback = function( e ) {
		var title = $.trim( this.$input.val() );
		if ( e.which === ENTER_KEY && title ) {
			var id = this.next_id++;
			this.addItem( id, title, false );
			this.$input.val( '' );
			this.$hide_empty.show();
			this.updateCount();
		}
	};

    // ### deleteItem
	TodoApp.prototype.deleteItem = function( item ) {
		item.$ele.remove();
		this.num_items -= 1;
		this.num_completed -= item.completed ? 1 : 0;
		if ( this.num_items === 0 ){
			this.$hide_empty.hide();
		}
		delete this.todos[item.id];
		this.updateCount();
	};

    // ### filterItem
    // Apply filter to a single item setting its visibility.
	TodoApp.prototype.filterItem = function ( item ) {
		item.$ele.toggle(( item.completed != this.filter_opts[this.filter].value ));
	};

    // ### itemToggled
    // Event handler for TodoItem. Updates counter and applly filter on item
	TodoApp.prototype.itemToggled = function( item ) {
		this.num_completed += item.completed ? 1 : -1;
		this.filterItem( item );
		this.updateCount();
	};

    // ### toggleAll
	TodoApp.prototype.toggleAll = function() {
		var checked = this.$toggleAll.prop( 'checked' );
		this.forEach( this.todos, function( item ){
			if ( item.completed !== checked ){
				item.$checkbox.prop( 'checked', checked );
				item.toggleCompleted();
			}
		});
	};

    // ### clearCompleted
    // Delete all TodoItem's that are completed.
    // Note: items are deleted one by one...
	TodoApp.prototype.clearCompleted = function(){
		this.forEach( this.todos, function( item ){
			if ( item.completed ){
				this.deleteItem( item );
			}
		});
	};

    // ### load
    // This app saves the session data using LocaStorage.
	TodoApp.prototype.load = function() {
		var store = localStorage.getItem( 'todos-hoejs' );
		if ( store ) {
            // first load TodoItem's and next_id from LocaStorage
			var data = ( JSON.parse( store ) );
			this.filter = data.filter;
			this.next_id = data.next_id;
            // render the App (initially empty)
			this.render();
            // add the items read from the store
			this.forEach( data.todos, function( value, key ) {
				this.$hide_empty.show();
				this.addItem( key, value[0], value[1] );
			});
			this.updateCount();
			return;
		}
		this.render();
	};

    // ### save
    // save whole TodoApp on LocalStorage
	TodoApp.prototype.save = function() {
		var todos = {};
		this.forEach( this.todos, function( v, k ) {
			todos[k] = [ v.title, v.completed ];
		});
		var data = { next_id: this.next_id, filter: this.filter, todos: todos };
		localStorage.setItem( 'todos-hoejs', JSON.stringify( data ) );
	};

    // ## create the application
    // This tipically should be done in a separate file. But just following
    // TodoMVC guidelines...
	new TodoApp();
})( window );
