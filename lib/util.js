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
 * Convert a JSON Object to an XML Document
 * 
 * @param json
 */
exports.toXML = function(json) {
	var content = '';
	for ( var key in json) {
		var isArray = (typeof json[key] === 'object' && json[key].length);
		var value = isArray ? json[key] : [ json[key] ];
		for ( var i = 0; i < value.length; i++) {
			var isObject = (typeof value[i] === 'object');
			content += '<' + key + '>';
			content += isObject ? exports.toXML(value[i]) : value[i];
			content += '</' + key + '>';
		}
	}
	return content;
};

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
exports.getTilePath = function(z, y, x, ext) {
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
 * Calculate the dimension of the tile matrix at the given level.
 * 
 * @param grid
 * @param level
 * @param bbox
 */
exports.getMatrix = function(grid, level, bbox) {
	var resolution = grid.resolution.values[level];
	var width = grid.size[0] * resolution;
	var height = grid.size[1] * resolution;
	var x0 = Math.floor((bbox[0] - grid.bbox[0]) / width);
	var y0 = Math.floor((bbox[1] - grid.bbox[1]) / height);
	var x1 = Math.ceil((bbox[2] - grid.bbox[0]) / width) - 1;
	var y1 = Math.ceil((bbox[3] - grid.bbox[1]) / height) - 1;
	return [ x0, y0, x1, y1 ];
};

/**
 * Calculate the bounding box of the tile at given level.
 * 
 * @param grid
 * @param z
 * @param y
 * @param x
 */
exports.getTileBounds = function(grid, z, y, x) {
	var resolution = grid.resolution.values[z];
	var width = grid.size[0] * resolution;
	var height = grid.size[1] * resolution;
	var x = grid.bbox[0] + (x * width);
	var y = grid.bbox[1] + (y * height);
	return [ x, y, x + width, y + height ];
};

/**
 * Calculate the bounding box of the tile at given level.
 * 
 * @param bbox
 * @param size
 * @param res
 * @param y
 * @param x
 */
exports.getBoundary = function(bbox, size, res, y, x) {
	var width = size[0] * res;
	var height = size[1] * res;
	var x = bbox[0] + (x * width);
	var y = bbox[1] + (y * height);
	return [ x, y, x + width, y + height ];
};