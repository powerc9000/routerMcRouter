(function(window){
  "use strict";
  var routerMcRouter;
  function isFunction(fn){
    if(typeof fn !== "function"){
      return false;
    }else{
      return true;
    }
  }
  routerMcRouter = (function(){
    function routerMcRouter(baseUrl){
      if(!this){
        return new routerMcRouter();
      }
      this.baseUrl = baseUrl || "";
      this.routes = [];
      this.navigationListeners = [];
      this._defaultRoute = false;
      this.routeMatched = false;
      window.onpopstate = handlePop.bind(this);
    }
    //routerMcRouter.prototype.routes = [];

    routerMcRouter.prototype.onNavigate = function(callback){
      this.navigationListeners.push(callback);
    }
    routerMcRouter.prototype.currentState = window.location.pathname + window.location.search + window.location.hash;
    routerMcRouter.prototype.register = function(uri, fn){
      var keys =[], reg;
      if(!uri || !fn){
        throw "Both arguments must be provided";
      }
      if(!isFunction(fn)){
        throw "second argument must be a function";
      }
      if(typeof uri !== "string"){
        throw "first argument must be a string";
      }
      reg = routeToRegexp(uri, keys);

      this.routes.push({regExp:reg, fn:fn, keys:keys});
      if(reg.exec(window.location.pathname+window.location.hash)){
        this.executeUri(window.location.pathname);
      }
    };
    routerMcRouter.prototype.defaultRoute = function(callback){
      if(!isFunction(callback)){
        throw "Argument must be a function";
      }
      this._defaultRoute = callback;
      if(!this.routeMatched){
        this._defaultRoute.call(this);  
      }
    };
    // routerMcRouter.prototype.isRegistered = function(uri){
    //   var match, i, len = this.routes.length;
    //   var URINoQueryString =  uri.substring(0, uri.indexOf("?"));
    //   if(!URINoQueryString){
    //     URINoQueryString = uri;
    //   }
    //   for(i=0; i<len; i++){
    //     match = this.routes[i].regExp.exec(URINoQueryString);
    //     if(match){
    //       return true;
    //     }
    //   }
    // };
    routerMcRouter.prototype.redirect = function(uri, data){
      if(!uri || typeof uri !== "string"){
        throw "Must provide a uri to navigate to!";
      }
      if(this.executeUri(uri, data)){
        window.history.replaceState(data, "title", uri);
      }
    };
    routerMcRouter.prototype.executeUri = function(uri, data){
      var that = this;
      var DidNavigate = false;
      var len = this.routes.length,
        i, j , match, route,
        ky = {};
      var URINoQueryString =  uri.substring(0, uri.indexOf("?"));
      this.routeMatched = false;
      if(!URINoQueryString){
        URINoQueryString = uri;
      }
      for(i=0; i<len; i++){
        match = this.routes[i].regExp.exec(URINoQueryString);
        if(match){
          route = this.routes[i];
          break;
        }
      }
      if(route){
        for(i = 0, j = 1; i<route.keys.length; i++, j++){
          ky[route.keys[i].name] = match[j];
        }
        route.fn.call(that, data, ky);
        DidNavigate = true;
        this.routeMatched = true;
      }else{
        if(this._defaultRoute){

          this._defaultRoute.call(this, uri, data);
        }
      }
      this.navigationListeners.forEach(function(l){
        l.call(that, uri);
      });
      return DidNavigate;
    };
    routerMcRouter.prototype.navigate = function(uri, data){
      if(!uri || typeof uri !== "string"){
        throw "Must provide a uri to navigate to!";
      }
      if(this.executeUri(uri, data)){
        window.history.pushState(data, "title", uri);
      }
    };
    function handlePop(e){
      var that = this;
      var uri = e.currentTarget.location.pathname + e.currentTarget.location.search + e.currentTarget.location.hash,
        state = e.state || {};
        console.log(uri);
        state.previousUri = this.currentState;
        e.preventDefault();
      if(this.executeUri(uri, state)){
        this.currentState = uri;
      }
      else if(this.currentState === uri){
        this.executeUri(uri, {});
      }
      console.log(uri);
      this.navigationListeners.forEach(function(l){
        l.call(that, uri);
      });
    };

    function routeToRegexp(path, keys, sensitive, strict) {
      if (path instanceof RegExp) return path;
      if (Array.isArray(path)) path = '(' + path.join('|') + ')';
      path = path
        .concat(strict ? '' : '/?')
        .replace(/\/\(/g, '(?:/')
        .replace(/(\/)?(\.)?:(\w+)(?:(\(.*?\)))?(\?)?(\*)?/g, function(_, slash, format, key, capture, optional, star){
          keys.push({ name: key, optional: !! optional });
          slash = slash || '';
          return ''
            + (optional ? '' : slash)
            + '(?:'
            + (optional ? slash : '')
            + (format || '') + (capture || (format && '([^/.]+?)' || '([^/]+?)')) + ')'
            + (optional || '')
            + (star ? '(/*)?' : '');
        })
        .replace(/([\/.])/g, '\\$1')
        .replace(/\*/g, '(.*)');
      return new RegExp('^' + path + '$', sensitive ? '' : 'i');
    }
    
  
  return routerMcRouter;
  }());
  
 
  if(module && module.exports){
    module.exports = routerMcRouter;
  }else{
    window.routerMcRouter = routerMcRouter;
    window.rmr = window.routerMcRouter;
  }
}(window));