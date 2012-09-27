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
 * 
 * @param source
 * @param proj
 * @param margin
 */
renderer.Map = function(source, proj, margin) {

	var map = new mapnik.Map(256, 256);
	map.loadSync(source);
	map.srs = proj;

	/**
	 * Update the current extent and size of the map and render the image for
	 * the requested format
	 * 
	 * @param bbox
	 * @param size
	 * @param format
	 * @param callback
	 */
	this.render = function(bbox, size, format, callback) {
		var dx = (bbox[2] - bbox[0]) / size[0] * margin[0];
		var dy = (bbox[3] - bbox[1]) / size[1] * margin[1];
		map.width = size[0] + 2 * margin[0];
		map.height = size[1] + 2 * margin[1];
		map
				.zoomToBox([ bbox[0] - dx, bbox[1] - dy, bbox[2] + dx,
						bbox[3] + dy ]);
		map.render(new mapnik.Image(map.width, map.height), function(error,
				image) {
			var width = image.width() - 2 * margin[0];
			var height = image.height() - 2 * margin[1];
			var view = image.view(margin[0], margin[1], width, height);
			callback(error, view.encodeSync(format));
		});
	};

	/**
	 * Renders an image and store it on file system and/or return the data to
	 * the callback
	 * 
	 * @param bbox
	 * @param size
	 * @param format
	 * @param filename
	 * @param callback
	 */
	this.renderFile = function(bbox, size, format, filename, callback) {
		if (!fs.existsSync(filename)) { // Render image
			this.render(bbox, size, format, function(error, image) {
				var path = require('path').dirname(filename);
				if (!fs.existsSync(path))
					fs.mkdirSync(path, 0777, true);
				fs.writeFileSync(filename, image);
				if (callback)
					callback(error, fs.readFileSync(filename));
			});
		} else if (callback) { // Fetch image from file system
			callback(null, fs.readFileSync(filename));
		}
	};

	this.renderTiles = function(tiles, size, format, force, callback) {
		var index = 0;
		var self = this;
		var handler = function(error, image) {
			index++;
			if (index < tiles.length) {
				self.render(tiles[index].bbox, size, format, handler);
			} else {
				callback();
			}
		}
		this.render(tiles[index].bbox, size, format, handler);
	};

	this.renderAll = function(path, format, width, height, tiles) {
		if (!fs.existsSync(path))
			fs.mkdirSync(path, 0777, true);
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
 * 
 * @param source
 * @param proj
 * @param margin
 */
exports.createMap = function(source, proj, margin) {
	return new renderer.Map(source, proj, margin);
};