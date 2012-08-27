    var EventEmitter = require('events').EventEmitter;
    var ee = new EventEmitter();
    var mappe = require('./mappe.js');
    var config;
    var coda =[];
    var count = 0;
    var totale = 0;
    var incoda = 0;
    var service;
    var tilemaps;
    var boundingbox;
    var from;
    var to;

process.on('message', function(q) {
    
    var op = q.url.query.op;
    if (op == 'seed')
    {
    var url_prova = q.url;
    var urlArray = q.urlA;
    config = q.config;
    var bbox = url_prova.query.bbox.split('/');
    from = url_prova.query.from;
    to = url_prova.query.to;
    service = config.services[urlArray[0]];
    if (typeof(service) !== 'undefined'){
        tilemaps = config.services[urlArray[0]].tilemaps[urlArray[1]];
    if (typeof(tilemaps) !== 'undefined') {            

            var l, x ,y;
            if (to == null) {to = from;}
                
            
            for (l = from; l <= to; l++){
                if (bbox.length == 4) {
                    var xini = Math.floor((bbox[0] - tilemaps.origin[0])/(tilemaps.TileFormat[0] * tilemaps.tilesets[l]));
                    var yini = Math.floor((bbox[1] - tilemaps.origin[1])/(tilemaps.TileFormat[1] * tilemaps.tilesets[l]));
                    var xfin = Math.ceil((bbox[2] - tilemaps.origin[0])/(tilemaps.TileFormat[0] * tilemaps.tilesets[l])) -1;
                    var yfin = Math.ceil((bbox[3] - tilemaps.origin[1])/(tilemaps.TileFormat[1] * tilemaps.tilesets[l])) -1;}
                else {
                    var xini = Math.floor((tilemaps.boundingbox[0] - tilemaps.origin[0])/(tilemaps.TileFormat[0] * tilemaps.tilesets[l]));
                    var yini = Math.floor((tilemaps.boundingbox[1] - tilemaps.origin[1])/(tilemaps.TileFormat[1] * tilemaps.tilesets[l]));
                    var xfin = Math.ceil((tilemaps.boundingbox[2] - tilemaps.origin[0])/(tilemaps.TileFormat[0] * tilemaps.tilesets[l])) -1;
                    var yfin = Math.ceil((tilemaps.boundingbox[3] - tilemaps.origin[1])/(tilemaps.TileFormat[1] * tilemaps.tilesets[l])) -1;}
                boundingbox = [xini, yini, xfin, yfin];
                for (x = xini; x <= xfin; x++){
                    for (y = yini; y <= yfin; y++){ 
                          totale++; 
            //console.log(y);
            var newArray = [urlArray[0], urlArray[1], l, x, y];
            ee.emit('event', newArray, config);
            }}
        }
        }
        console.log('file da elaborare= '+ totale);
        }
}
else if (op == 'int'){
    process.send({service : service, tilemaps : tilemaps, boundingbox : boundingbox, from : from, tu : to, tot : totale, incorso : count, incoda : incoda});
        }

});

    ee.on('event', function (urlA){
            if (count<200) {
            count++;
            ee.emit('go', urlA);
            } else {
            ee.emit('wait', urlA);
            }
        });
    
    ee.on('done', function(){
        count--;
        if (coda.length > 0){
            incoda--;
            ee.emit('event', coda.shift());
            //console.log(coda);
            }
        else if (coda.length == 0 && count == 0){
            console.log('exit seeding');
            process.exit();
          }
        });
        
    ee.on('wait', function(urlA){
        incoda++;
        coda.push(urlA);
        });
        
    ee.on('go', function (urlA){
        mappe.mappa(config, urlA, function(err, buffer){
                if (err) { console.log('erorre seeding');}
                else {
                ee.emit('done');
                }

            });
        });