// based on angularjs.org TODO example

function TodoItem(list, text, done){
    this.list = list; // reference to Todo
    this.text = text; // (str)
    this.done = done; // (bool)

    this.$text = null; // containing the todo text
    this.$input = null; // containing the checkbox

    this.render = function(){
        this.$input = input({type: "checkbox"}).prop('checked', this.done);
        this.$input.click($.proxy(this._set_done, this));
        this.$text = span(this.text);
        this._set_done();
        return [this.$input, this.$text];
    }
    this._set_done = function(event){
        this.done = this.$input.prop('checked');
        this.$text.addClass('done-' + this.done).removeClass('done-' + !this.done);
        this.list.update(!event, this.done);
    }
}

function Todo() {
    this.remaining = 0;
    this.todos = [];

    this.$remaining_title = span();
    this.$todo_list = ul({'class': "unstyled"});

    this.addTodo = function(text, done) {
        var item = new TodoItem(this, text || '', done || false)
        this.todos.push(item);
        item.$ele = li(item.render());
        this.$todo_list.append(item.$ele);
    };

    this.update = function(added, done) {
        if (added)
            this.remaining += done ? 0 : 1;
        else
            this.remaining += done ? -1 : 1;
        this._render_remaining();
    };

    this.archive = function() {
        var oldTodos = this.todos;
        this.todos = [];
        for(var i=0,max=oldTodos.length;i<max;i++){
            if (!oldTodos[i].done)
                this.todos.push(oldTodos[i]);
            else
                oldTodos[i].$ele.remove();
        }
        this._render_remaining();
    };

    this._render_remaining = function(){
        return this.$remaining_title.text(
            this.remaining + ' of ' + this.todos.length + ' remaining');
    };

    this.render = function() {
        var $archive_link = a({href: "#"}, 'archive').click($.proxy(this.archive, this));
        var $todo_input = input({type:"text", size:"30", placeholder:"add new todo here"});
        var $addBtn = input({'class': "btn-primary", type:"submit", value:"add"});
        $addBtn.click($.proxy(function(event){
            this.addTodo($todo_input.val(), false);
            $todo_input.val('');
            event.preventDefault();
        }, this));

        return [this._render_remaining(), ' [', $archive_link, ']',
                this.$todo_list, form($todo_input, $addBtn)];
    }
}
