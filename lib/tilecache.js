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
if (process.argv.length < 3) {
	console.error('Usage: node tilecache.js [config]');
	process.exit(1);
}

var config = require(process.argv[2]);

service = {};

/**
 * Write the service definitions for a single definition
 * @param req
 * @param res
 * @param conf
 * @param name
 */
service.writeService = function(req, res, conf, name) {
	var service = conf.services[name];
	var url = 'http://' + req.headers.host + conf.path + '/' + name;
	for ( var i = 0; i < service.type.length; i++) {
		var type = service.type[i];
		var handler = require('./' + type);
		res.write('<' + handler.name + ' title="' + service.title + '" version="'
				+ handler.version + '" href="' + href + '/' + name + '" />');
	}
};

/**
 * Get all services from the configuration
 * @param req
 * @param res
 * @param name
 */
service.serviceHandler = function(req, res, name) {
	res.statusCode = 200;
	res.setHeader('Content-Type', 'text/xml');
	res.write('<?xml version="1.0" encoding="UTF-8" ?>\n');
	res.write('<Services>');
	if (name) {
		service.writeService(req, res, config, name);
	} else {
		for ( var name in config.services) {
			service.writeService(req, res, config, name);
		}
	}
	res.end('</Services>');
};
/**
 * Register all defined service handler on the router
 * @param conf
 * @param router
 */
service.addHandler = function(conf, router) {
	var handles = {};
	for ( var name in conf.services) {
		var service = conf.services[name];
		for ( var i = 0; i < service.type.length; i++) {
			var type = service.type[i];
			if (!handles[type]) {
				handles[type] = require('./' + type);
				handles[type].bind(router.resource('/:name/' + type), conf);
			}
		}
	}
};

var resource = require('./resource').createResource(config.path);
resource.onGet('', service.serviceHandler);
resource.onGet('/:name', service.serviceHandler);
service.addHandler(config, resource);

var http = require('http');
http.createServer(resource).listen(8888);
console.log('Server running at http://127.0.0.1:8888' + config.path);
