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
 * 
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
		grid.resolution = grid.resolution || {};
		var res = grid.resolution;
		if (!res.values) {
			res.values = [];
			res.factor = res.factor || 2;
			res.levels = res.levels || 18;
			res.min = res.min || (grid.bbox[2] - grid.bbox[0]) / grid.size[0];
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
 * 
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
		res.write('<' + handler.name + ' title="' + service.title
				+ '" version="' + handler.version + '" href="' + href + '/'
				+ type + '" />');
	}
};

/**
 * Get all services from the configuration
 * 
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
 * 
 * @param conf
 * @param router
 */
tilecache.addHandler = function(conf, router) {
	var handles = {};
	handles['seed'] = require('./seed');
	handles['seed'].bind(router.resource('/seed'), conf);
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

var conf_file = require('path').join(process.cwd(), process.argv[2]);
var config = tilecache.parseConfig(conf_file);
var resource = require('./resource').createResource(config.path);
resource.onGet('', tilecache.serviceHandler);
resource.onGet('/:name', tilecache.serviceHandler);
resource
		.onGet(
				'/:name/view',
				function(req, res) {
					var content = '<!DOCTYPE html>';
					content = '<html>\n';
					content = '   <head>\n';
					content += '    <link rel="stylesheet" href="http://cdn.leafletjs.com/leaflet-0.4/leaflet.css" />\n';
					content += '    <!--[if lte IE 8]>\n';
					content += '      <link rel="stylesheet" href="http://cdn.leafletjs.com/leaflet-0.4/leaflet.ie.css" />\n';
					content += '    <![endif]-->\n';
					content += '    <script src="http://cdn.leafletjs.com/leaflet-0.4/leaflet.js"></script>\n';
					content += '  </head>\n';
					content += '  <body style="margin: 0; padding: 0;">\n';
					content += '    <div id="map" style="position: absolute; top: 0; left: 0; right: 0; bottom: 0;"></div>\n';
					content += '    <script>\n';
					content += '      var baseurl = "http://localhost:8888/services/countries/tms/default/global-mercator/{z}/{x}/{y}.png";\n';
					content += '      var map = L.map("map").setView([46.498019, 11.354316],3);\n';
					content += '      L.tileLayer(baseurl,{"tms":true}).addTo(map);\n';
					content += '    </script>\n';
					content += '  </body>\n';
					content += '</html>';

					res.statusCode = 200;
					res.setHeader('Content-Type', 'text/html');
					res.end(content);

				});
tilecache.addHandler(config, resource);

var http = require('http');
http.createServer(resource).listen(8888);
console.log('Server running at', config.port);
