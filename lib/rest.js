/**
 * <p>
 * To use the HTTP server one must require('rest').
 * </p>
 * <p>
 * The REST interfaces is an extension of the HTTP server in Node. REST provides
 * routing through the path names to a specific function. The user has only to
 * register a function by a particular, optional parameterized, path.
 * <p>
 */

(function() {
	'use strict';

	var http = require('http');
	var pattern = new RegExp(':(\\w*)', 'gi');

	/**
	 * Add a new route to the HTTP server instance.
	 * 
	 * @param server
	 * @param method
	 * @param path
	 * @param callback
	 * @returns
	 */
	function service(server, method, path, callback) {
		var keys = path.match(pattern);
		if (keys) {
			for ( var index = 0; index < keys.length; index++) {
				path = path.replace(keys[index], '(\\w*)');
			}
		}
		server.routes[method]['^' + server.baseurl + path] = callback;
	}

	/**
	 * <p>
	 * Routes the request to the right service
	 * </p>
	 * 
	 * @param req
	 * @param resp
	 * @returns
	 */
	function route(req, resp) {
		var service = this.fallback;
		var params = [ req, resp ];
		var routing = this.routes[req.method];
		if (routing) {
			for ( var route in routing) {
				var match = req.url.match(new RegExp(route));
				if (match && match[0] === req.url) {
					service = routing[route];
					params = params.concat(match.slice(1));
				}
			}
		}
		if (service) {
			try {
				resp.statusCode = 200;
				service.apply(this, params);
			} catch (e) {
				resp.statusCode = 500;
			}
		} else {
			resp.statusCode = 501;
		}
		resp.end();
	}

	/**
	 * <p>
	 * Returns a new web server object.
	 * </p>
	 * <p>
	 * The fallback is a function which is automatically invoked when no route is
	 * applicable to the 'request' event.
	 * </p>
	 */
	http.createRouter = function(baseurl, fallback) {
		var server = http.createServer(route);

		server.routes = {
			'GET' : {},
			'POST' : {},
			'PUT' : {},
			'DELETE' : {}
		};
		server.baseurl = baseurl;
		server.fallback = fallback;

		server.onGet = function(path, callback) {
			service(this, 'GET', path, callback);
		};
		server.onPost = function(path, callback) {
			service(this, 'PIST', path, callback);
		};
		server.onPut = function(path, callback) {
			service(this, 'PUT', path, callback);
		};
		server.onDelete = function(path, callback) {
			service(this, 'DELETE', path, callback);
		};

		return server;
	}

	module.exports = http;
}());
