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
var basepath = require('path').dirname(process.mainModule.filename);
var renderer = require('path').join(basepath, 'renderer.js');

seed = {};
seed.task = {};

/**
 * List all available caches and grids
 * 
 * @param conf
 * @param req
 * @param res
 */
seed.list = function(conf, req, res) {
	var data = {};
	data.grids = {};
	data.caches = {};
	for ( var name in conf.grids) {
		var grid = conf.grids[name];
		data.grids[name] = {
			srs : grid.srs,
			size : grid.size,
			bbox : grid.bbox,
			levels : grid.resolution.levels,
		};
	}
	for ( var name in conf.services) {
		data.caches[name] = conf.services[name].caches;
	}
	req.marshall(res, data);
};

/**
 * Create the task definitions
 * 
 * @param conf
 * @param json
 */
seed.createOptions = function(conf, json) {
	var service = conf.services[json.service];
	var cache = service.caches[json.cache];
	var grid = conf.grids[json.grid];
	var option = {
		"id" : new Date().getTime().toString(16),
		"service" : json.service,
		"source" : service.source,
		"target" : require('path').join(conf.cache, json.service, json.cache,
				json.grid),
		"cache" : json.cache,
		"grid" : json.grid,
		"proj" : conf.proj[grid.srs],
		"size" : grid.size,
		"margin" : service.margin,
		"bbox" : (json.bbox) ? [ Math.max(json.bbox[0], grid.bbox[0]),
				Math.max(json.bbox[1], grid.bbox[1]),
				Math.min(json.bbox[2], grid.bbox[2]),
				Math.min(json.bbox[3], grid.bbox[3]) ] : grid.bbox,
		"format" : json.format || cache.format[0],
		"from" : json.from || 0,
		"to" : json.to || grid.resolution.levels,
		"reseed" : json.reseed,
		"total" : 0,
		"created" : 0,
		"tile" : []
	};
	for ( var i = option.from; i <= option.to; i++) {
		var matrix = require('./util').getMatrix(grid, i, option.bbox);
		option.total += ((matrix[2] - matrix[0] + 1) * (matrix[3] - matrix[1] + 1));
		option.tile.push({
			"cols" : [ matrix[0], matrix[2] ],
			"rows" : [ matrix[1], matrix[3] ],
			"res" : grid.resolution.values[i]
		});
	}
	return option;
};

/**
 * List all active seeding tasks
 * 
 * @param conf
 * @param req
 * @param res
 */
seed.getTasks = function(conf, req, res) {
	var tasks = [];
	for ( var id in seed.task) {
		tasks.push(seed.task[id].options);
	}
	req.marshall(res, {
		task : tasks
	});
};

/**
 * Add a new seeding tasks
 * 
 * @param conf
 * @param req
 * @param res
 * @param content
 */
seed.addTask = function(conf, req, res, content) {
	var json = JSON.parse(content);
	if (json.service && json.cache && json.grid) {
		var task = seed.createOptions(conf, json);
		var child = require('child_process').fork(renderer);
		child.on('message', function(m) {
			// var total = m.resp.created.length + m.resp.ignored.length
			// + m.resp.failed.length;
			// res.setHeader('Content-Type', 'application/xml');
			// res.end('<seeding><tiles>' + m.resp.created.length
			// + '</tiles><ignored>' + m.resp.ignored.length
			// + '</ignored><total>' + total + '</total></seeding>');
			console.log('>>>', m);
		});
		child.options = task;
		seed.task[task.id] = child;
		child.send(task);
		req.marshall(res, task);
	} else {
		res.statusCode = 404;
		res.end();
	}
};

/**
 * Remove a seeding tasks by id
 * 
 * @param conf
 * @param req
 * @param res
 * @param id
 */
seed.removeTask = function(conf, req, res, id) {
	if (seed.task[id]) {
		var task = seed.task[id];
		delete seed.task[id];
		task.kill('SIGHUP')
	} else {
		res.statusCode = 404;
	}
	res.end();
};

seed.test = function(conf, req, res, name, cache, gridname) {
	var grid = conf.grids[gridname] || conf.grids['global-mercator'];
	var proj = conf.proj[grid.srs];
	var service = conf.services[name];

	var ts = new Date().getTime();
	console.log(ts.toString(16));

	console.log('seeding cache', cache, grid, 'on', name);

	var child = require('child_process').fork(renderer);
	child.on('message', function(m) {
		var total = m.resp.created.length + m.resp.ignored.length
				+ m.resp.failed.length;
		res.setHeader('Content-Type', 'application/xml');
		res.end('<seeding><tiles>' + m.resp.created.length
				+ '</tiles><ignored>' + m.resp.ignored.length
				+ '</ignored><total>' + total + '</total></seeding>');
	});

	var option = {
		source : service.source,
		proj : proj,
		size : grid.size,
		margin : service.margin,
		reseed : false,
		format : 'png',
		tiles : [],
	}

	var path = '/tmp/cache/countries/default/global-geodetic/01/000/000/000/000/000';
	for ( var i = 0; i < 20; i++) {
		var id = '00' + i;
		option.tiles.push({
			file : path + '/' + id.substr(id.length - 3, 3) + '.png',
			bbox : [ -180, -90, 0, 90 ]
		});
	}
	child.send(option);
};

exports.id = 'seed';
exports.name = 'SeedingService';
exports.version = '1.0.0';

/**
 * Register the Seeding handlers on the resource router
 * 
 * @param resource
 * @param config
 */
exports.bind = function(resource, conf) {
	resource.onGet('/', function(req, res) {
		seed.list(conf, req, res);
	});
	resource.onGet('/task', function(req, res) {
		seed.getTasks(conf, req, res);
	});
	resource.onPost('/task', function(req, res, content) {
		seed.addTask(conf, req, res, content);
	});
	resource.onDelete('/task/:id', function(req, res, id) {
		seed.removeTask(conf, req, res, id);
	});
};