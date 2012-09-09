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

var rs = {};
/**
 * Register a resource handler for the defined HTTP method. Each handler expects
 * at least 2 arguments (request, response). For each path parameter an
 * additional argument is used.
 * @param context
 * @param method
 * @param path
 * @param handler
 */
rs.addHandler = function(context, method, path, handler) {
	var resource = context.path + path;
	var route = {
		"path" : resource,
		"params" : resource.match(/:([\w][\w-]*)/gi),
		"handler" : handler
	};
	var regexp = '^' + resource.replace(/:([\w][\w-]*)/gi, '([\\w][\\w-]*)')
			+ '/?$';
	if (!context.routes[method]) {
		context.routes[method] = {};
	}
	context.routes[method][regexp] = route;
};

/**
 * The onRequest is responsible to route the request to the right handler.
 * @param caller
 * @param context
 * @param request
 * @param response
 */
rs.onRequest = function(caller, context, request, response) {
	var params = [ request, response ];
	var handler = context.fallback;
	var routes = context.routes[request.method];
	if (routes) {
		for ( var regexp in routes) {
			var route = routes[regexp];
			var match = request.url.match(new RegExp(regexp));
			if (match && match[0] == request.url) {
				params = params.concat(match.slice(1));
				handler = route.handler;
			}
		}
	}
	request.getURL = function(path) {
		var url = 'http://' + request.headers.host + request.url;
		url += (url.charAt(url.length - 1) == '/') ? '' : '/';
		url += (path.length > 0 && path.charAt(0) == '/') ? path.substr(1) : path;
		return url;
	};
	if (handler) {
		try {
			response.statusCode = 200;
			handler.apply(caller, params);
		} catch (e) {
			response.statusCode = 500;
			response.setHeader('Content-Type', 'text/xml');
			response.write('<?xml version="1.0" encoding="UTF-8" ?>\n');
			response.end('<ServerError>' + e + '</ServerError>');
		}
	} else {
		response.statusCode = 501;
		response.end();
	}
};

/**
 * Defines a resource with an absolute HTTP path
 * @param context
 * @returns {Function}
 */
rs.resource = function(context) {
	var handler = function(request, response) {
		rs.onRequest(this, context, request, response);
	}
	/**
	 * Register a GET resource for the relative path.
	 * @param path
	 * @param handler
	 */
	handler.onGet = function(path, handler) {
		rs.addHandler(context, 'GET', path, handler);
	};
	/**
	 * Register a POST resource for the relative path.
	 * @param path
	 * @param handler
	 */
	handler.onPost = function(path, handler) {
		rs.addHandler(context, 'POST', path, handler);
	};
	/**
	 * Register a PUT resource for the relative path.
	 * @param path
	 * @param handler
	 */
	handler.onPut = function(path, handler) {
		rs.addHandler(context, 'PUT', path, handler);
	};
	/**
	 * Register a DELETE resource for the relative path.
	 * @param path
	 * @param handler
	 */
	handler.onDelete = function(path, handler) {
		rs.addHandler(context, 'DELETE', path, handler);
	};
	/**
	 * Creates a sub resource.
	 * @param path
	 */
	handler.resource = function(path) {
		return rs.resource({
			"path" : context.path + path,
			"handler" : context.handler,
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
 * @param handler
 */
exports.createResource = function(path, handler) {
	return rs.resource({
		"path" : path,
		"handler" : handler,
		"routes" : {}
	});
};