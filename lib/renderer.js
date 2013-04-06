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
 * Writes an image to the file system
 * 
 * @param filename
 * @param image
 */
renderer.writeImage = function(filename, image) {
	var path = require('path').dirname(filename);
//	console.log(path);
	if (!fs.existsSync(path)) {
		fs.mkdirSync(path, 0777, true);
	}
	fs.writeFileSync(filename, image);
};

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
	 * @param ref
	 * @param bbox
	 * @param size
	 * @param format
	 * @param callback
	 */
	this.render = function(ref, bbox, size, format, callback) {
		var dx = (bbox[2] - bbox[0]) / size[0] * margin[0];
		var dy = (bbox[3] - bbox[1]) / size[1] * margin[1];
		var extent = [ bbox[0] - dx, bbox[1] - dy, bbox[2] + dx, bbox[3] + dy ];
		map.width = size[0] + 2 * margin[0];
		map.height = size[1] + 2 * margin[1];
		map.zoomToBox(extent);
		var img = new mapnik.Image(map.width, map.height);
		map.render(img, function(error, image) {
			var width = image.width() - 2 * margin[0];
			var height = image.height() - 2 * margin[1];
			var view = image.view(margin[0], margin[1], width, height);
			callback(ref, error, view.encodeSync(format));
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
			this.render(filename, bbox, size, format,
					function(name, err, image) {
						renderer.writeImage(name, image);
						if (callback) {
							callback(err, fs.readFileSync(name));
						}
					});
		} else if (callback) { // Fetch image from file system
			callback(null, fs.readFileSync(filename));
		}
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

/**
 * Renders an entire tile sets
 * 
 * @param conf
 */
// process.on('message', function(msg) {
// msg.resp = {
// created : [],
// ignored : [],
// failed : []
// };
// var handler = function(tile, error, image) {
// if (tile && image) { // successful rendering
// msg.resp.created.push(tile);
// renderer.writeImage(tile.file, image);
// } else if (tile) { // rendering failed
// msg.resp.failed.push(tile);
// }
// // Only if reseed=TRUE existing tiles are regenerated
// while ((tile = msg.tiles.pop()) && !msg.reseed
// && fs.existsSync(tile.file)) {
// msg.resp.ignored.push(tile);
// }
// if (tile) {
// var map = new renderer.Map(msg.source, msg.proj, msg.margin);
// map.render(tile, tile.bbox, msg.size, msg.format, handler);
// } else {
// process.send(msg);
// }
// }
// handler();
// });
process.on('message', function(option) {
	var i = 0;
	var z = 0;
	var y = option.tile[0].rows[0];
	var x = option.tile[0].cols[0] - 1;
	var handler = function(tile, error, image) {
		if (tile && image) { // successful rendering
			option.created++;
			renderer.writeImage(tile.file, image);
		} else if (error) {
			option.error++;
		}
		// Only if reseed=TRUE existing tiles are regenerated
		do {
			i = (i + 1) % 128;
			if (++x > option.tile[z].cols[1]) {
				if (++y > option.tile[z].rows[1]) {
					z++;
					if (z < option.tile.length)
						y = option.tile[z].rows[0];
				}
				if (z < option.tile.length)
					x = option.tile[z].cols[0];
			}
			if (z < option.tile.length) {
				tile = {};
				tile.file = require('path').join(
						option.target,
						require('./util').getTilePath(option.from + z, y, x,
								option.format));
				tile.bbox = require('./util').getBoundary(option.bbox,
						option.size, option.tile[z].res, y, x);
			} else {
				tile = null;
			}
			if (tile && !option.reseed && fs.existsSync(tile.file)){
				option.ignored++;
			}
		} while (tile && !option.reseed && fs.existsSync(tile.file));
		if (tile) {
			var map = new renderer.Map(option.source, option.proj,
					option.margin);
			map.render(tile, tile.bbox, option.size, option.format, handler);
		}
		if (!tile || i == 0) {
			process.send(option);
		}
	}
	handler();
});
