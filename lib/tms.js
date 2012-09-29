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
tms = {};

/**
 * Converts a JSON object to XML
 * 
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
 * Calculate the dimension of the tile matrix at the given level.
 * 
 * @param grid
 * @param z
 */
tms.getMatrix = function(grid, z) {
	var resolution = grid.resolution.values[z];
	var width = grid.size[0] * resolution;
	var height = grid.size[1] * resolution;
	var columns = (grid.bbox[2] - grid.bbox[0]) / width;
	var rows = (grid.bbox[3] - grid.bbox[1]) / height;
	return [ Math.ceil(columns), Math.ceil(rows) ];
}

/**
 * Calculate the bounding box of the tile at given level.
 * 
 * @param grid
 * @param z
 * @param y
 * @param x
 */
tms.getTileBounds = function(grid, z, y, x) {
	var resolution = grid.resolution.values[z];
	var width = grid.size[0] * resolution;
	var height = grid.size[1] * resolution;
	var x = grid.bbox[0] + (x * width);
	var y = grid.bbox[1] + (y * height);
	return [ x, y, x + width, y + height ];
}

/**
 * Defines the relative path for the provided cache parameters. The method
 * creates an object with the relative pathname and filename.
 * 
 * @param level -
 *            the caching level
 * @param x -
 *            the horizontal matrix index
 * @param y -
 *            the vertical matrix index
 * @param ext -
 *            the file extension
 */
tms.getTilePath = function(z, y, x, ext) {
	var path_z = '0' + z;
	var path_y = '000000000' + y;
	var path_x = '000000000' + x;

	var filename = path_z.substr(path_z.length - 2);
	filename += '/' + path_x.substr(path_x.length - 9, 3);
	filename += '/' + path_x.substr(path_x.length - 6, 3);
	filename += '/' + path_x.substr(path_x.length - 3);
	filename += '/' + path_y.substr(path_y.length - 9, 3);
	filename += '/' + path_y.substr(path_y.length - 6, 3);
	filename += '/' + path_y.substr(path_y.length - 3) + '.' + ext;
	return filename;
};

/**
 * Get the profile name for the provided grid
 * 
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
 * Handler to provide all available tilemaps
 * 
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
		for ( var i = 0; i < tilemap.grids.length; i++) {
			var gridname = tilemap.grids[i];
			res.write('<TileMap title="' + tilemap.title + '" profile="'
					+ tms.getProfile(conf, gridname) + '" href="'
					+ req.getURL(cache) + '/' + gridname + '" />');
		}
	}
	res.write('</TileMaps>');
	res.end('</TileMapService>');
};

/**
 * Get the definition of a single tile map
 * 
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

	var grid = conf.grids[name] || conf.grids['global-mercator'];
	var size = grid.size;
	res.write('<SRS>' + grid.srs + '</SRS>');
	res.write('<BoundingBox minx="' + grid.bbox[0] + '" miny="' + grid.bbox[1]
			+ '" maxx="' + grid.bbox[2] + '" maxy="' + grid.bbox[3] + '" />');
	res.write('<Origin x="' + grid.bbox[0] + '" y="' + grid.bbox[1] + '" />');

	for ( var i = 0; i < tilemap.format.length; i++) {
		var format = tilemap.format[i];
		res.write('<TileFormat width="' + size[0] + '" height="' + size[1]
				+ '"  mime-type="image/' + format + '" extension="' + format
				+ '" />');
	}

	res.write('<TileSets profile="' + tms.getProfile(conf, gridname) + '">');
	for ( var index = 0; index < grid.resolution.values.length; index++) {
		res.write('<TileSet href="' + req.getURL(index) + '" units-per-pixel="'
				+ grid.resolution.values[index] + '"/>');
	}
	res.write('</TileSets>');

	res.end('</TileMap>');
};

/**
 * Get and/or generate a single tile.
 * 
 * @param conf
 * @param req
 * @param res
 * @param name
 * @param cache
 * @param gridname
 * @param z
 * @param y
 * @param x
 * @param type
 */
tms.getTile = function(conf, req, res, name, cache, gridname, z, y, x, type) {
	var grid = conf.grids[gridname] || conf.grids['global-mercator'];
	var proj = conf.proj[grid.srs];
	var service = conf.services[name];
	var bbox = tms.getTileBounds(grid, z, y, x);
	var file = tms.getTilePath(z, y, x, type);
	var path = require('path').join(conf.cache, name, cache, gridname, file);
	var renderer = new require('./renderer');
	var map = renderer.createMap(service.source, proj, service.margin);
	map.renderFile(bbox, grid.size, type, path, function(err, data) {
		res.setHeader('Content-Type', 'image/' + type);
		res.end(data);
	});
};

exports.id = 'tms';
exports.name = 'TileMapService';
exports.version = '1.0.0';

/**
 * Register the TMS handlers on the resource router
 * 
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
	resource.onGet('/:cache/:grid/:z/:x/:y.:type', function(req, res, name,
			cache, grid, z, x, y, type) {
		tms.getTile(conf, req, res, name, cache, grid, z, y, x, type);
	});
	resource.onGet('/:cache/:grid/:zz/:x0/:x1/:x2/:y0/:y1/:y2.:type', function(
			req, res, name, cache, grid, zz, x0, x1, x2, y0, y1, y2, type) {
		var file = require('path').join(conf.cache, name, cache, grid, zz, x0,
				x1, x2, y0, y1, y2 + '.' + type);
		if (require('fs').existsSync(file)) {
			res.setHeader('Content-Type', 'image/' + type);
			res.end(require('fs').readFileSync(file));
		} else {
			res.statusCode = 404;
			res.end();
		}
	});
};