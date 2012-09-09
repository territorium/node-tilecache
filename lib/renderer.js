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
var mapnik = require('mapnik');
var fs = require('./fs.js');

renderer = {};

/**
 * Create a new mapnik map
 * @param source
 * @param proj
 * @param margin
 */
renderer.Map = function(source, proj, margin) {

	var map = new mapnik.Map(256, 256);
	map.loadSync(source);
	map.srs = proj;

	/**
	 * Update the current extent and size of the map
	 * @param bbox
	 * @param size
	 * @param callback
	 */
	this.doRender = function(bbox, size, callback) {
		var dx = (bbox[2] - bbox[0]) / size[0] * margin[0];
		var dy = (bbox[3] - bbox[1]) / size[1] * margin[1];
		map.width = size[0] + 2 * margin[0];
		map.height = size[1] + 2 * margin[1];
		map.zoomToBox([ bbox[0] - dx, bbox[1] - dy, bbox[2] + dx, bbox[3] + dy ]);
		map.render(new mapnik.Image(map.width, map.height), callback);
	};

	/**
	 * Renders asynchrony an image
	 * @param bbox
	 * @param size
	 * @param format
	 * @param callback
	 */
	this.renderAsync = function(bbox, size, format, callback) {
		this.doRender(bbox, size, function(err, image) {
			var width = map.width - 2 * margin[0];
			var height = map.height - 2 * margin[1];
			var view = image.view(margin[0], margin[1], width, height);
			callback(err, view.encodeSync(format));
		});
	};

	this.render = function(path, file, format) {
		var image = new mapnik.Image(map.width, map.height);
		map.render(image, function(err, image) {
			var width = map.width - 2 * margin[0];
			var height = map.height - 2 * margin[1];
			var view = image.view(margin[0], margin[1], width, height);
			var filename = path + '/' + file + '.' + format;
			if (!fs.existsSync(path)) fs.mkdirSync(path, 0777, true);
			fs.writeFile(filename, view.encodeSync(format));
		});
	};

	this.renderAll = function(path, format, width, height, tiles) {
		if (!fs.existsSync(path)) fs.mkdirSync(path, 0777, true);
		var image = new mapnik.Image(map.width, map.height);
		map.render(image, function(error, image) {
			for ( var name in tiles) {
				var tile = tiles[name];
				var view = image.view(tile[0], tile[1], width, height);
				var filename = path + '/' + name + '.' + format;
				fs.writeFile(filename, view.encodeSync(format));
			}
		});
	};
};

/**
 * Create a instance of mapnik based map.
 * @param source
 * @param proj
 * @param margin
 */
exports.createMap = function(source, proj, margin) {
	return new renderer.Map(source, proj, margin);
};