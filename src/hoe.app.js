/*global hoe */

// This code is unstable/incomple - not released yet


//////////////////////////////////////////////////////////////////////
// Route, Router, App are helpers to create single page apps

// XXX
hoe.Route = hoe.Type(function(template, name, endpoint){
    this.template = template;
    this.name = name;
    this.endpoint = endpoint;

    // convert template into list of parts that can have a 'param' or 'fixed'
    this._parts = this.mapArray(template.substr(1).split('/'), function(part){
        return part[0] === ':' ? {'param': part.substr(1)} : {'fixed': part};
    });
});


// check if a path matches this route
// return an object with param values if matched or null if not matched
hoe.Route.prototype.match = function(path){
    var path_parts = path.substr(1).split('/');
    if (path_parts.length != this._parts.length){
        return null;
    }

    var params = {};
    for(var i=0, max=path_parts.length; i<max; i++){
        if ('fixed' in this._parts[i]){
            if (this._parts[i].fixed != path_parts[i]){
                return null;
            }
        }
        else {
            if (!path_parts[i]){
                return null; // dont accept empty param values
            }
            params[this._parts[i].param] = path_parts[i];
        }
    }
    return params;
};

// create path using given params
hoe.Route.prototype.build = function(params){
    var path = "";
    this._parts.forEach(function(part){
        if (part.fixed){
            path += '/' + part.fixed;
        }
        else {
            var part_value = params[part.param];
            if (!part_value){
                throw Error('Missing param: ' + part.param);
            }
            path += '/' + part_value;
        }
    });
    return path;
};


// XXX
hoe.Router = hoe.Type(function(){
    this.routes = {};
});

hoe.Router.prototype.add = function(route){
    this.routes[route.name] = route;
};

// return object with 'router' and 'params'
hoe.Router.prototype.match = function(path){
    var result = null;
    hoe.Type.prototype.forDict(this.routes, function(route){
        var match = route.match(path);
        if (match !== null){
            result = {'route': route, 'params': match};
            return;
        }
    });
    return result;
};

hoe.Router.prototype.build = function(name, params){
    var route = this.routes[name];
    if (!route){
        throw Error('Route not found: ' + name);
    }
    return route.build(params);
};


// single page application - help setting the URL
hoe.App = hoe.Type(function(){
    this.router = new hoe.Router();

    // bind events
    $('body').on('click', 'a', this.scope(this._handle_click));
    $(window).bind('popstate', this.scope(this._popstate));

    // avoid chrome bug
    // https://code.google.com/p/chromium/issues/detail?id=63040
    this._loaded = false;
});


// based on jquery.pjax.js:handleClick
// https://github.com/defunkt/jquery-pjax/blob/master/jquery.pjax.js
hoe.App.prototype._handle_click = function(event) {
    var link = event.currentTarget;

    // Middle click, cmd click, and ctrl click should open
    // links in a new tab as normal.
    if ( event.which > 1 || event.metaKey || event.ctrlKey ||
         event.shiftKey || event.altKey )
        return;

    // Ignore cross origin links
    if ( location.protocol !== link.protocol || location.host !== link.host )
        return;

    // Ignore anchors on the same page
    if (link.hash && link.href.replace(link.hash, '') ===
        location.href.replace(location.hash, ''))
        return;

    // Ignore empty anchor "foo.html#"
    if (link.href === location.href + '#')
        return;

    this.load(link.pathname, true);
    event.preventDefault();
};


hoe.App.prototype._popstate = function() {
    if (this._loaded){ // ignore initial event on chrome (bug)
        this.load(document.location.pathname, false);
    }
};


// find path in router and loads endpoint
hoe.App.prototype.load = function(path, push_state){
    this._loaded = true;
    var match = this.router.match(path);
    if (match){
        match.route.endpoint(match.params);
    }
    else {
        window.alert('404: ' + path);
    }

    if (push_state){
        window.history.pushState({}, null, path);
    }
};
