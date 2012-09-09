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
tms = {
	globals : {
		"global-geodetic" : {
			"size" : [ 256, 256 ],
			"srs" : "EPSG:4326",
			"bbox" : [ -180, -90, 180, 90 ]
		},
		"global-mercator" : {
			"size" : [ 256, 256 ],
			"srs" : "EPSG:3857",
			"bbox" : [ -20037508.34, -20037508.34, 20037508.34, 20037508.34 ]
		}
	}
};

/**
 * Converts a JSON object to XML
 * @param json
 */
tms.toXML = function(json) {
	var content = '';
	for ( var key in json) {
		var isObject = ((typeof json[key]) === 'object');
		content += '<' + key + '>';
		content += isObject ? tms.toXML(json[key]) : json[key];
		content += '</' + key + '>';
	}
	return content;
};

/**
 * Get the profile name for the provided grid
 * @param conf
 * @param name
 */
tms.getProfile = function(conf, name) {
	var grid = conf.grids[name];
	if (name == 'global-geodetic' || name == 'global-mercator') {
		return name;
	} else if (grid && grid.resolution && grid.resolution.factor == 2) {
		return 'local';
	}
	return 'none';
};

/**
 * Get the grid by name and derive the grid definition
 * @param conf
 * @param name
 */
tms.getGrid = function(conf, name) {
	var grid = tms.globals[name] || conf.grids[name];
	if (!grid) {
		grid = tms.globals['global-mercator'];
	}
	grid.size = grid.size || [ 256, 256 ];
	grid.origin = grid.origin || [ grid.bbox[0], grid.bbox[1] ];
	grid.resolution = grid.resolution || {};
	if (!grid.resolution.values) {
		var factor = grid.resolution.factor || 2;
		var levels = grid.resolution.levels || 18;
		var width = grid.bbox[2] - grid.bbox[0];
		var min = grid.resolution.min || width / (2 * grid.size[0]);
		grid.resolution.values = [];
		for ( var i = 0; i < levels; i++) {
			grid.resolution.values[i] = min / Math.pow(factor, i);
		}
	}
	return grid;
}

/**
 * Handler to provide all available tilemaps
 * @param conf
 * @param ref
 * @param req
 * @param name
 */
tms.getTileMaps = function(conf, req, res, name) {
	var service = conf.services[name];
	res.setHeader('Content-Type', 'text/xml');
	res.write('<?xml version="1.0" encoding="UTF-8" ?>\n');
	res.write('<TileMapService version="' + exports.version + '">');
	res.write('<Title>' + service.title + '</Title>');
	res.write('<Abstract>' + service.abstract + '</Abstract>');
	res.write('<KeywordList>' + service.keywords.join(' ') + '</KeywordList>');
	res.write('<ContactInformation>');
	res.write(tms.toXML(service.contact));
	res.write('</ContactInformation>');
	res.write('<TileMaps>');
	for ( var cache in service.caches) {
		var tilemap = service.caches[cache];
		var url = 'http://' + req.headers.host + req.url + '/' + cache;
		for ( var i = 0; i < tilemap.grids.length; i++) {
			var gridname = tilemap.grids[i];
			res.write('<TileMap title="' + tilemap.title + '" profile="'
					+ tms.getProfile(conf, gridname) + '" href="' + url + '/' + gridname
					+ '" />');
		}
	}
	res.write('</TileMaps>');
	res.end('</TileMapService>');
};

/**
 * Get the definition of a single tile map
 * @param conf
 * @param req
 * @param res
 * @param name
 * @param cache
 * @param grid
 */
tms.getTileMap = function(conf, req, res, name, cache, gridname) {
	var service = conf.services[name];
	var tilemap = service.caches[cache];
	res.setHeader('Content-Type', 'text/xml');
	res.write('<?xml version="1.0" encoding="UTF-8" ?>\n');
	res.write('<TileMap version="' + exports.version + '">');
	res.write('<Title>' + tilemap.title + '</Title>');
	res.write('<Abstract>' + tilemap.abstract + '</Abstract>');

	var grid = tms.getGrid(conf, gridname);
	var size = grid.size;
	res.write('<SRS>' + grid.srs + '</SRS>');
	res.write('<BoundingBox minx="' + grid.bbox[0] + '" miny="' + grid.bbox[1]
			+ '" maxx="' + grid.bbox[2] + '" maxy="' + grid.bbox[3] + '" />');
	res.write('<Origin x="' + grid.origin[0] + '" y="' + grid.origin[1] + '" />');

	for ( var i = 0; i < tilemap.format.length; i++) {
		var format = tilemap.format[i];
		res.write('<TileFormat width="' + size[0] + '" height="' + size[1]
				+ '"  mime-type="image/' + format + '" extension="' + format + '" />');
	}

	res.write('<TileSets profile="' + tms.getProfile(conf, gridname) + '">');
	for ( var index = 0; index < grid.resolution.values.length; index++) {
		var href = 'http://' + req.headers.host + req.url + '/' + index;
		res.write('<TileSet href="' + href + '" order="' + index
				+ '" units-per-pixel="' + grid.resolution.values[index] + '"/>');
	}
	res.write('</TileSets>');

	res.end('</TileMap>');
};

exports.id = 'tms';
exports.name = 'TileMapService';
exports.version = '1.0.0';

/**
 * Register the TMS handlers on the resource router
 * @param resource
 * @param config
 */
exports.bind = function(resource, conf) {
	resource.onGet('', function(req, res, name) {
		tms.getTileMaps(conf, req, res, name);
	});
	resource.onGet('/:cache/:grid', function(req, res, name, cache, grid) {
		tms.getTileMap(conf, req, res, name, cache, grid);
	});
	resource.onGet('/:cache/:grid/:z/:y/:x.:type', function(req, res, name,
			cache, grid, z, y, x, type) {
		console.log(name, cache, grid, z, y, x, type);
	});
};