var fs = require('fs'), path = require('path');
exports.coordConvert = function(cachedir, dir, leveldir, xdir, ydir, levely,
		ext) {
	if (leveldir <= 9) {
		leveldir = '0' + leveldir;
	}
	xdir = xdir.toString();
	ydir = ((levely - ydir) - 1).toString();
	var i = 0, j = 0;
	var l = xdir.length, m = ydir.length;
	while (i < 9 - l) {
		xdir = '0' + xdir;
		i++;
	}
	while (j < 9 - m) {
		ydir = '0' + ydir;
		j++;
	}
	var x1, x2, x3, y1, y2, y3;
	x1 = xdir.substring(0, 3);
	x2 = xdir.substring(3, 6);
	x3 = xdir.substring(6, 9);
	y1 = ydir.substring(0, 3);
	y2 = ydir.substring(3, 6);
	y3 = ydir.substring(6, 9) + '.' + ext;
	var dirArray = [ cachedir, dir, leveldir, x1, x2, x3, y1, y2, y3 ];
	return dirArray;
	// esiste (dirArray, '');
}

// number of levels available for the x coord
exports.xlevels = function(tilemap, level) {
	var xdim = tilemap.TileFormat[0];
	var res = tilemap.tilesets[level];
	return (Math.ceil((tilemap.boundingbox[2] - tilemap.boundingbox[0])
			/ (xdim * res)));
}

// number of levels available for the y coord
exports.ylevels = function(tilemap, level) {
	var ydim = tilemap.TileFormat[1];
	var res = tilemap.tilesets[level];
	return (Math.ceil((tilemap.boundingbox[3] - tilemap.boundingbox[1])
			/ (ydim * res)));
}

// convert the y coord for the grid
exports.yinvert = function(y, level) {
	return ((level - y) - 1);
}

// return an array with the directory structure for the cache
exports.dirStruct = function(leveldir, xdir, ydir) {
	if (leveldir <= 9) {
		leveldir = '0' + leveldir;
	}
	xdir = xdir.toString();
	ydir = ydir.toString();
	var i = 0, j = 0;
	var l = xdir.length, m = ydir.length;
	while (i < 9 - l) {
		xdir = '0' + xdir;
		i++;
	}
	while (j < 9 - m) {
		ydir = '0' + ydir;
		j++;
	}
	var x1, x2, x3, y1, y2, y3;
	x1 = xdir.substring(0, 3);
	x2 = xdir.substring(3, 6);
	x3 = xdir.substring(6, 9);
	y1 = ydir.substring(0, 3);
	y2 = ydir.substring(3, 6);
	y3 = ydir.substring(6, 9);
	return [ leveldir, x1, x2, x3, y1, y2, y3 ];
}
