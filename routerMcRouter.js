(function(window, $, undefined){
	var routerMcRouter = rmr = (function(){
		var routerMcRouter = function(baseUrl){
			var that;
			if(this === window){
				return new routerMcRouter();
			}
			this.baseUrl = baseUrl;
			
			
		}
		routerMcRouter.prototype.routes = {};
		routerMcRouter.prototype.currentState = window.location.pathname;
		routerMcRouter.prototype.register = function(uri, fn){
			if(!uri || !fn){
				throw "Both arguments must be provided"
			}
			if(typeof fn !== "function"){
				throw "second argument must be a function"
			}
			if(typeof uri !== "string"){
				throw "firs argument must be a string"
			}
			this.routes[uri] = fn;
		}
		routerMcRouter.prototype.isRegistered = function(uri){

			if(!uri){
				return;
			}
			var newUri;
			if(this.routes[uri]){
				return true;
			}
			else{
				newUri = uri.slice(0, uri.lastIndexOf("/"));
				newUri = newUri + "/*";
				if(this.routes[newUri]){
					return true;
				}
				else{
					return false;
				}			
			}
		}
		routerMcRouter.prototype.executeUri = function(uri, data){
			if(!uri){
				return;
			}
			if(this.routes[uri]){
				this.routes[uri].call(this , uri, data)
			}
			else{
				newUri = uri.slice(0, uri.lastIndexOf("/"));
				newUri = newUri + "/*";
				if(this.routes[newUri]){
					this.routes[newUri].call(this, uri, data);
				}
				else{
					return false;
				}			
			}
		}
		routerMcRouter.prototype.navigate = function(uri, data){
			var isRegistered;
			if(!uri || typeof uri !== "string"){
				throw "Must provide a uri to navigate to!"
			}
			if(this.isRegistered(uri)){
				window.history.pushState(data, "title", uri);
				this.executeUri(uri, data);
				this.currentState = uri;
			}
		}
		routerMcRouter.prototype.handlePop = function(e){
			var uri = e.currentTarget.location.pathname,
				state = e.state || {};
				state.previousUri = this.currentState;
			if(this.isRegistered(uri)){
				this.executeUri(uri, state);
				this.currentState = uri;
			}
			else if(this.currentState === uri){
				this.executeUri(uri, {});
			}
		}
	
	return routerMcRouter;
	}())
	window.onpopstate = function(e){
		routerMcRouter.prototype.handlePop.call(routerMcRouter.prototype , e);
	}
	window.routerMcRouter = routerMcRouter;
	window.rmr = window.routerMcRouter;
}(window, jQuery));