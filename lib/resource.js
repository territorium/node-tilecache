/**
 * Node TileCache implements a node.js based implementation of TMS
 * 
 * Copyright (C) 2012 Territorium Online
 * 
 * This program is free software: you can redistribute it and/or modify it under
 * the terms of the GNU Affero General Public License as published by the Free
 * Software Foundation, either version 3 of the License, or (at your option) any
 * later version.
 * 
 * This program is distributed in the hope that it will be useful, but WITHOUT
 * ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS
 * FOR A PARTICULAR PURPOSE. See the GNU Affero General Public License for more
 * details.
 * 
 * You should have received a copy of the GNU Affero General Public License
 * along with this program. If not, see <http://www.gnu.org/licenses/>.
 */

/**
 * Add a resource for the provided HTTP method.
 * @param context
 * @param method
 * @param path
 * @param callback
 */
function addHandler(context, method, path, callback) {
	var resource = context.path + path;
	var route = {
		"path" : resource,
		"params" : normalize(resource.match(/:(\w*)/gi)),
		"callback" : callback
	};
	var regexp = '^' + resource.replace(/:(\w*)/gi, '(\\w+)') + '/?$';
	if (!context.routes[method]) {
		context.routes[method] = {};
	}
	context.routes[method][regexp] = route;
};

/**
 * Normalize the parameter names
 * @param params
 * @returns
 */
function normalize(params) {
	if (params) {
		for ( var i = 0; i < params.length; i++) {
			params[i] = params[i].substr(1);
		}
		return params;
	}
	return [];
};

/**
 * 
 * @param caller
 * @param context
 * @param request
 * @param response
 */
function onRequest(caller, context, request, response) {
	var resource = context.fallback;
	var routes = context.routes[request.method];
	request.params = {};
	if (routes) {
		for ( var regexp in routes) {
			var route = routes[regexp];
			var match = request.url.match(new RegExp(regexp));
			if (match && match[0] == request.url) {
				resource = route.callback;
				var params = match.slice(1);
				for ( var i = 0; i < params.length; i++) {
					var key = route.params[i];
					request.params[key] = params[i];
				}
			}
		}
	}
	if (resource) {
		try {
			response.statusCode = 200;
			resource.apply(caller, [ request, response ]);
		} catch (e) {
			response.statusCode = 500;
		}
	} else {
		response.statusCode = 501;
	}
	response.end();
};

/**
 * Defines a resource with an absolute HTTP path
 * @param context
 * @returns {Function}
 */
function resource(context) {
	var handler = function(request, response) {
		onRequest(this, context, request, response);
	}
	/**
	 * Register a GET resource for the relative path.
	 * @param path
	 * @param callback
	 */
	handler.onGet = function(path, callback) {
		addHandler(context, 'GET', path, callback);
	};
	/**
	 * Register a POST resource for the relative path.
	 * @param path
	 * @param callback
	 */
	handler.onPost = function(path, callback) {
		addHandler(context, 'POST', path, callback);
	};
	/**
	 * Register a PUT resource for the relative path.
	 * @param path
	 * @param callback
	 */
	handler.onPut = function(path, callback) {
		addHandler(context, 'PUT', path, callback);
	};
	/**
	 * Register a DELETE resource for the relative path.
	 * @param path
	 * @param callback
	 */
	handler.onDelete = function(path, callback) {
		addHandler(context, 'DELETE', path, callback);
	};
	/**
	 * Creates a sub resource.
	 * @param path
	 */
	handler.resource = function(path) {
		return resource({
			"path" : context.path + path,
			"fallback" : context.fallback,
			"routes" : context.routes
		});
	};
	return handler;
};

/**
 * Provides a simple RESTful request listener. The listener implements a path
 * based router.
 * 
 * @param path
 * @param fallback
 */
exports.createResource = function(path, fallback) {
	return resource({
		"path" : path,
		"fallback" : fallback,
		"routes" : {}
	});
};