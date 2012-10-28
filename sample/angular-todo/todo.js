// based on angularjs.org TODO example

function TodoItem(text, done){
    this.text = text; // (str)
    this.done = done; // (bool)

    this.$text = null; // containing the todo text
    this.$input = null; // containing the checkbox

    this.render = function(){
        this.$input = input({type: "checkbox"}).prop('checked', this.done);
        this.on(this.$input, 'click', function(){
            this._set_done();
            this.trigger('changed', this.done);
        });
        this.$text = span(this.text);
        this._set_done();
        return [this.$input, this.$text];
    };
    this._set_done = function(){
        this.done = this.$input.prop('checked');
        this.$text.addClass('done-' + this.done).removeClass('done-' + !this.done);
    };
}
$.extend(TodoItem.prototype, hoe.obj_proto);


function Todo() {
    this.remaining = 0;
    this.todos = [];

    this.$remaining_title = span();
    this.$todo_list = ul({'class': "unstyled"});

    this.addTodo = function(text, done) {
        var item = new TodoItem(text || '', done || false);
        this.on(item, 'changed', this.update);
        this.remaining += item.done ? 0 : 1;
        this.todos.push(item);
        item.$ele = li(item.render());
        this.$todo_list.append(item.$ele);
    };

    this.update = function(done) {
        this.remaining += done ? -1 : 1;
        this._render_remaining();
    };

    this.archive = function() {
        var oldTodos = this.todos;
        this.todos = [];
        this.forEach(oldTodos, function(todo){
            if (!todo.done)
                this.todos.push(todo);
            else
                todo.$ele.remove();
        });
        this._render_remaining();
    };

    this._render_remaining = function(){
        return this.$remaining_title.text(
            this.remaining + ' of ' + this.todos.length + ' remaining');
    };

    this.render = function() {
        var $archive_link = a({href: "#"}, 'archive');
        this.on($archive_link, 'click', this.archive);
        var $todo_input = input({type:"text", size:"30", placeholder:"add new todo here"});
        var $addBtn = input({'class': "btn-primary", type:"submit", value:"add"});
        this.on($addBtn, 'click', function(event){
            this.addTodo($todo_input.val(), false);
            this._render_remaining();
            $todo_input.val('');
            event.preventDefault();
        });

        return [this._render_remaining(), ' [', $archive_link, ']',
                this.$todo_list, form($todo_input, $addBtn)];
    };
}
$.extend(Todo.prototype, hoe.obj_proto);