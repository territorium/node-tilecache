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
sedd = {};


/**
 * List all available caches and grids
 * 
 * @param conf
 * @param req
 * @param res
 */
sedd.list = function(conf, req, res){
	var services = conf.services;
	var data = '<html xmlns="http://www.w3.org/1999/xhtml">'
	data += '<head><meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />'
	data += '<title>Seeding list</title></head><body><h1>CREATE A NEW TASK</h1>'
	data += '<table border=1><tr><td>SERVICE</td><td>CACHE</td><td>GRID</td><td>FORMAT</td></tr>'
	for (var sName in services){
		service = services[sName];
		for (var cName in service.caches){
			cache = service.caches[cName];
			for (var gName in cache.grids){
				data += '<tr><td>' + sName + ':' + service.title + '<br><a href=create/' + sName +'/'+ cName + '/' + cache.grids[gName] + '/>Seed this layer</a></td>'
				data += '<td>' + cName + '</td><td>' +cache.grids[gName] + '</td><td>'
				for (i=0; i < cache.format.length; i++){		
					data += (i==0) ? cache.format[i] : ', ' + cache.format[i];
				}
				data += '</td></tr>'
			}
		}
	}
	data += '</table>';
	data += '<br><br><a href="/services/sedd/task">view the seeding tasks</a>';
	data += '</body></html>'
res.end(data);
}

/**
 * List all optional parameters
 * 
 * @param conf
 * @param req
 * @param res
 * @param service
 * @param cache
 * @param grid
 */
sedd.options = function (conf, req, res, service, cache, grid){
	var data = '<html xmlns="http://www.w3.org/1999/xhtml">'
	data += '<head><meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />'
	data += '<title>Create task</title></head><body>'
	data += '<h1>ADD A NEW TASK</h1>'
	data += 'Service: ' + service;
	data += '<br>Cache: ' + cache;
	data += '<br>Grid: ' + grid;
	data += '<form action="" method="POST" enctype="application/json" name="seeding" target="_self">'  
	data += '<label for="format">Format</label><select name="format" id="format">'
	data += '<option value=""></option>';
	var format = conf.services[service].caches[cache].format;
	for (i = 0; i< format.length; i++){
		data += '<option value="'+format[i]+'">'+format[i]+'</option>'
	}
	data += '</select><br><label for="from">Level from</label><select name="from" id="from">'
	data += '<option value=""></option>';
	for (i = 0; i< conf.grids[grid].resolution.levels; i++){
		data += '<option value="' + i + '">' + i + '</option>'
	}
	data += '</select><br /><label for="to">Level to</label><select name="to" id="to">'
	data += '<option value=""></option>';
	for (i = 0; i< conf.grids[grid].resolution.levels; i++){
		data += '<option value="' + i + '">' + i + '</option>'
	}
	data += '</select><br /><label for="bbox">Bounding box</label>'
	data += '<input name="minx" type="number" value="" size="12" maxlength="12" />'
	data += '<input name="miny" type="text" value="" size="12" maxlength="12" />'
	data += '<input name="maxx" type="text" value="" size="12" maxlength="12" />'
	data += '<input name="maxy" type="text" value="" size="12" maxlength="12" />'
	data += '<br /><label for="reseed">Reseed</label><input name="reseed" type="checkbox" value="true" /><br />'
	data += '<input name="Submit" type="submit" value="Submit" /><br />'
	data +='</form>'
	data += '</table></body></html>'
res.end(data);
}

/**
 * Create a new task
 * 
 * @param conf
 * @param req
 * @param res
 * @param service
 * @param cache
 * @param grid
 * @param content
 */
sedd.createTask = function(conf, req, res, service, cache, grid, content){
	param = content.split('&');
	option = {};
	json = '{"service" : "' + service + '", "cache" : "' + cache +'", "grid" : "' + grid + '", ';
	for (i=0; i< param.length; i++){
		if(param[i].charAt(param[i].length -1) != '='){
			opt = param[i].split('=');
			json += '"'+opt[0]+'" : ' + '"'+ opt[1] +'"';
			if (i < param.length -1){
				json += ',';
			}
		}
	}
	json += '}';
	option = JSON.parse(json);
	if (option.minx && option.miny && option.maxx && option.maxy){
		option.bbox = [];
		option.bbox[0] = option.minx;
		option.bbox[1] = option.miny;
		option.bbox[2] = option.maxx;
		option.bbox[3] = option.maxy;
	}
	var host = {
		port : 8888,
		path : '/services/seed/task/',
		method : 'POST',
		headers : {"Content-Type" : 'application/json',
			accept : 'application/json'}
	};
	var data = '';
	var newReq = require('http').request(host, function(newRes){
		newRes.on('data', function(chunk){
			data += chunk;
		});
		newRes.on('end', function(){
			body = JSON.parse(data);
			res.setHeader('Content-Type', 'text/html');
			res.write('Created task with ID ' + body.id + '<br>');
			res.write('<a href="/services/sedd/task">view the seeding tasks</a><br>');
			res.end('<a href="/services/sedd/">create a new seeding task</a>');
		});
	});
	newReq.write(JSON.stringify(option));
newReq.end();
}

/**
 * list all seeding tasks
 * 
 * @param config
 * @param req
 * @param res
 */
sedd.getTasks = function(conf, req, res){
	var host = {
		port : 8888,
		path : '/services/seed/task/',
		method : 'GET',
		headers : {"Content-Type" : 'application/json',
			accept : 'application/json'}
	};
	var data = '';
	var body = '<table border="1"><tr><td>ID</td><td>SERVICE</td><td>CACHE</td><td>GRID</td><td>SIZE</td>';
	body += '<td>MARGIN</td><td>BBOX</td><td>FORMAT</td><td>FROM LEVEL</td><td>TO LEVEL</td><td>RESEED</td><td>TOTAL TILES</td><td>CREATED TILES</td></tr>';
	var json = {};
	var newReq = require('http').request(host, function(newRes){
		newRes.on('data', function(chunk){
			data += chunk;
		});
		newRes.on('end', function(){
			json = JSON.parse(data);
			for (i=0; i< json.task.length; i++){
				task = json.task[i];
				body += '<tr><td>' + task.id + '<br><a href="delete/' + task.id +'">Delete</a></td><td>' + task.service + '</td><td>' + task.cache + '</td><td>' + task.grid + '</td><td>';
				body += task.size + '</td><td>' + task.margin + '</td><td>' + task.bbox + '</td><td>' + task.format + '</td><td>' + task.from + '</td><td>' + task.to + '</td>';
				body += '<td>' + task.reseed + '</td><td>' + task.total + '</td><td>' + task.created + '</td></tr>';
			}
			body += '</table>';
			body += '<br><br><a href="/services/sedd/">create a new seeding task</a>';
			res.end(body);
		});
	});
	newReq.end();
}

/**
 * remove a task
 * 
 * @param config
 * @param req
 * @param res
 * @param id
 */
sedd.removeTask = function(conf, req, res, id){
	var host = {
		port : 8888,
		path : '/services/seed/task/' + id,
		method : 'DELETE',
		headers : {"Content-Type" : 'application/json',
			accept : 'application/json'}
	};
	var body = '';
	var newReq = require('http').request(host, function(newRes){
		newRes.on('end', function(){
			res.setHeader('Content-Type', 'text/html');
			res.write('task ' + id + ' removed<br>');
			res.write('<a href="/services/sedd/task">view the seeding tasks</a><br>');
			res.end('<a href="/services/sedd/">create a new seeding task</a>');
		});
	});
	newReq.end();
}

exports.id = 'sedd';
exports.name = 'SeedingList';
exports.version = '1.0.0';

/**
 * Register the Seeding handlers on the resource router
 * 
 * @param resource
 * @param config
 */
exports.bind = function(resource, conf) {
	resource.onGet('/', function(req, res) {
		sedd.list(conf, req, res);
	});
	resource.onGet('/task', function(req, res) {
		sedd.getTasks(conf, req, res);
	});

	resource.onGet('/create/:service/:cache/:grid', function(req, res, service, cache, grid) {
		sedd.options(conf, req, res, service, cache, grid);
	});

	resource.onPost('/create/:service/:cache/:grid/', function(req, res, service, cache, grid, content) {
		sedd.createTask(conf, req, res, service, cache, grid, content);
	});

	resource.onGet('/delete/:id', function(req, res, id) {
		sedd.removeTask(conf, req, res, id);
	});
};
