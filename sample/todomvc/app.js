/*global location, localStorage, $, hoe */
/*global input, label, button, ul, li, div, h1, section, header, footer, strong, a, span */
(function( window ) {
	'use strict';
	hoe.init();
	var ENTER_KEY = 13;

	var TodoItem = hoe.Type( function( id, title, completed ) {
		this.id = id;
		this.title = title;
		this.completed = completed;
	});
	TodoItem.prototype.render = function() {
		this.$checkbox = input({ 'class': 'toggle', type: 'checkbox' });
		this.$checkbox.prop('checked', this.completed );
		this.on( this.$checkbox, 'change', this.toggleCompleted );
		this.$label = label( this.title );
		this.on( this.$label, 'dblclick', this.startEdit );
		var $button = button({ 'class': 'destroy' });
		this.on( $button, 'click', function(){ this.trigger('delete', this); } );
		this.$input = input({ 'class': 'edit', value:this.title });
		this.on( this.$input, 'blur', this.updateTitle );
		this.on( this.$input, 'keypress', this.updateTitle );
		var $view = div( {'class': 'view'}, this.$checkbox, this.$label, $button );
		this.$ele = li( $view, this.$input );
		return this.$ele.toggleClass( 'completed', this.completed );
	};
	TodoItem.prototype.startEdit = function() {
		this.$ele.addClass( 'editing' );
		this.$input.focus();
	};
	TodoItem.prototype.updateTitle = function( e ){
		if ( e.type === 'blur' || e.keyCode === ENTER_KEY ) {
			this.title = $.trim( this.$input.val() );
			this.$label.text( this.title );
			this.$ele.removeClass( 'editing' );
			if ( !this.title ){
				this.trigger( 'delete', this );
			}
			this.trigger( 'updated' );
		}
	};
	TodoItem.prototype.toggleCompleted = function() {
		this.completed = this.$checkbox.prop( 'checked' );
		this.$ele.toggleClass( 'completed' );
		this.trigger( 'toggle', this );
	};

	var TodoApp = hoe.Type(function() {
		this.todos = {};
		this.next_id = 0;
		this.filter = '';
		this.num_completed = 0;
		this.num_items = 0;
		this.filter_opts = {'': { title: 'All', value: null },
							'active': { title: 'Active', value: true },
							'completed': { title: 'Completed', value: false }};
		this.load();
		this.hashChanged();
	});
	TodoApp.prototype.load = function() {
		var store = localStorage.getItem( 'todos-hoejs' );
		if ( store ) {
			var data = ( JSON.parse( store ) );
			this.filter = data.filter;
			this.next_id = data.next_id;
			this.render();
			this.forEach( data.todos, function( value, key ) {
				this.$hide_empty.show();
				this.addItem( key, value[0], value[1] );
			});
			this.updateCount();
			return;
		}
		this.render();
	};
	TodoApp.prototype.save = function() {
		var todos = {};
		this.forEach( this.todos, function( v, k ) {
			todos[k] = [ v.title, v.completed ];
		});
		var data = { next_id: this.next_id, filter: this.filter, todos: todos };
		localStorage.setItem( 'todos-hoejs', JSON.stringify( data ) );
	};
	TodoApp.prototype.render = function() {
		this.$input = input({ id: 'new-todo', placeholder: 'What needs to be done?', autofocus: '' });
		this.on( this.$input, 'keyup', this.addItemCallback );
		this.$toggleAll = input({ id:'toggle-all', type:'checkbox' });
		this.on( this.$toggleAll, 'change', this.toggleAll );
		var $label = label( { 'for': 'toggle-all' }, 'Mark all as complete' );
		this.$todoList = ul({ id:'todo-list' });
		this.$todoCount = span({ id: 'todo-count' });
		this.$main = section( this.$toggleAll, $label, this.$todoList);
		this.$filters = ul( { id: 'filters' } );
		this.forEach(this.filter_opts, this.render_filter);
		this.$clear = button({ id: 'clear-completed' });
		this.on( this.$clear, 'click', this.clearCompleted );
		this.$footer = footer( this.$todoCount, this.$filters, this.$clear );
		$( '#todoapp' ).hoe( header( {id:'header'}, h1( 'todos' ), this.$input ),
							 this.$main.attr( 'id', 'main' ),
							 this.$footer.attr( 'id', 'footer' ) );
		this.$hide_empty = $( this.$toggleAll, this.$footer, this.$main ).hide();
		this.on($(window), 'hashchange', this.hashChanged);
	};
	TodoApp.prototype.render_filter = function( data, path ) {
		var $link = a( {href: '#/' + path }, data.title );
		$link.toggleClass( 'selected', ( this.filter == path) );
		this.on( $link, 'click', function() {
			this.setFilter(path);
		});
		this.filter_opts[path].$ele = $link;
		this.$filters.append( li( $link ) );
	};
	TodoApp.prototype.hashChanged = function() {
		if ( location.hash ) {
			this.setFilter(location.hash.substring(2));
		}
	};
	TodoApp.prototype.setFilter = function( path ) {
		$( 'a', this.$filters ).removeClass( 'selected' );
		this.filter = path;
		this.filter_opts[path].$ele.addClass( 'selected' );
		this.forEach( this.todos, this.filterItem );
		this.save();
	};
	TodoApp.prototype.updateCount = function() {
		var left = this.num_items - this.num_completed;
		var left_str = ( left == 1 ) ? ' item left' : ' items left';
		this.$toggleAll.prop( 'checked', (this.num_completed === this.num_items) );
		this.$todoCount.html( span( strong( left.toString() ), left_str ) );
		this.$clear.text( 'Clear completed (' + this.num_completed + ')' );
		this.$clear.toggle( (this.num_completed !== 0) );
		this.save();
	};
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
	TodoApp.prototype.addItem = function( id, title, completed ) {
		this.todos[id] = new TodoItem( id, title, completed );
		this.on( this.todos[id], 'delete', this.deleteItem );
		this.on( this.todos[id], 'toggle', this.itemToggled );
		this.on( this.todos[id], 'updated', this.save );
		this.num_items += 1;
		this.num_completed += completed ? 1 : 0;
		this.$todoList.append( this.todos[id].render() );
		this.filterItem( this.todos[id] );
	};
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
	TodoApp.prototype.filterItem = function ( item ) {
		item.$ele.toggle(( item.completed != this.filter_opts[this.filter].value ));
	};
	TodoApp.prototype.itemToggled = function( item ) {
		this.num_completed += item.completed ? 1 : -1;
		this.filterItem( item );
		this.updateCount();
	};
	TodoApp.prototype.toggleAll = function() {
		var checked = this.$toggleAll.prop( 'checked' );
		this.forEach( this.todos, function( item ){
			if ( item.completed !== checked ){
				item.$checkbox.prop( 'checked', checked );
				item.toggleCompleted();
			}
		});
	};
	TodoApp.prototype.clearCompleted = function(){
		this.forEach( this.todos, function( item ){
			if ( item.completed ){
				this.deleteItem( item );
			}
		});
	};
	new TodoApp();
})( window );
