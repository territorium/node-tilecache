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

tilecache = {};

/**
 * Parses the configuration and complete the parameters
 * @param file
 */
tilecache.parseConfig = function(file) {
	var conf = require(file);

	var path = require('path');
	var absolutePath = path.dirname(path.resolve(file));

	// Add the Global Geodetic & Mercator grids
	conf.grids['global-geodetic'] = {
		"size" : [ 256, 256 ],
		"srs" : "EPSG:4326",
		"bbox" : [ -180, -90, 180, 90 ]
	};
	conf.grids['global-mercator'] = {
		"size" : [ 256, 256 ],
		"srs" : "EPSG:3857",
		"bbox" : [ -20037508.34, -20037508.34, 20037508.34, 20037508.34 ]
	};

	// Parse the grids
	for ( var name in conf.grids) {
		var grid = conf.grids[name];
		grid.size = grid.size || [ 256, 256 ];
		grid.origin = grid.origin || [ grid.bbox[0], grid.bbox[1] ];
		grid.resolution = grid.resolution || {};
		var res = grid.resolution;
		if (!res.values) {
			res.values = [];
			res.factor = res.factor || 2;
			res.levels = res.levels || 18;
			res.min = res.min || (grid.bbox[2] - grid.bbox[0]) / (2 * grid.size[0]);
			for ( var i = 0; i < res.levels; i++) {
				res.values[i] = res.min / Math.pow(res.factor, i);
			}
		}
	}

	// Parse services
	for ( var name in conf.services) {
		var service = conf.services[name];
		service.source = path.resolve(absolutePath, service.source);
		service.margin = service.margin || [ 0, 0 ];
	}
	return conf;
}

/**
 * Write the service definitions for a single definition
 * @param req
 * @param res
 * @param conf
 * @param name
 */
tilecache.writeService = function(req, res, conf, name) {
	var service = conf.services[name];
	var href = 'http://' + req.headers.host + conf.path + '/' + name;
	for ( var i = 0; i < service.type.length; i++) {
		var type = service.type[i];
		var handler = require('./' + type);
		res.write('<' + handler.name + ' title="' + service.title + '" version="'
				+ handler.version + '" href="' + href + '/' + type + '" />');
	}
};

/**
 * Get all services from the configuration
 * @param req
 * @param res
 * @param name
 */
tilecache.serviceHandler = function(req, res, name) {
	res.statusCode = 200;
	res.setHeader('Content-Type', 'text/xml');
	res.write('<?xml version="1.0" encoding="UTF-8" ?>\n');
	res.write('<Services>');
	if (name) {
		tilecache.writeService(req, res, config, name);
	} else {
		for ( var name in config.services) {
			tilecache.writeService(req, res, config, name);
		}
	}
	res.end('</Services>');
};

/**
 * Register all defined service handler on the router
 * @param conf
 * @param router
 */
tilecache.addHandler = function(conf, router) {
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

var config = tilecache.parseConfig(process.argv[2]);
var resource = require('./resource').createResource(config.path);
resource.onGet('', tilecache.serviceHandler);
resource.onGet('/:name', tilecache.serviceHandler);
tilecache.addHandler(config, resource);

var http = require('http');
http.createServer(resource).listen(8888);
console.log('Server running at', config.port);
