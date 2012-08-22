process.on('message', function(q) {
    var url_prova = q.url;
    var urlArray = q.urlA;
    var config = q.config;
    var totale = 0;
 var bbox = url_prova.query.bbox.split('/');
            var zfrom = url_prova.query.from;
            var zto = url_prova.query.to;
            //console.log('bbox is ', bbox);
            for (index in config.services) {
                var service = config.services[index];
                if (urlArray[0] == (service.name_service)) {
                    for (ind in service.tilemaps){
                        var tilemaps = service.tilemaps[ind];
                        if (urlArray[1] == (tilemaps.map)){
                            var l, x ,y;
                            if (zto == null) {zto = zfrom;}
                                
                            
                            for (l = zfrom; l <= zto; l++){
                                var xini = Math.floor((bbox[0] - tilemaps.origin[0])/(tilemaps.TileFormat[0] * tilemaps.tilesets[l]));
                                var yini = Math.floor((bbox[1] - tilemaps.origin[1])/(tilemaps.TileFormat[1] * tilemaps.tilesets[l]));
                                if (bbox.length == 4) {
                                    var xfin = Math.ceil((bbox[2] - tilemaps.origin[0])/(tilemaps.TileFormat[0] * tilemaps.tilesets[l])) -1;
                                    var yfin = Math.ceil((bbox[3] - tilemaps.origin[1])/(tilemaps.TileFormat[1] * tilemaps.tilesets[l])) -1;}
                                else {
                                    var xfin = Math.ceil((tilemaps.boundingbox[2] - tilemaps.origin[0])/(tilemaps.TileFormat[0] * tilemaps.tilesets[l])) -1;
                                    var yfin = Math.ceil((tilemaps.boundingbox[3] - tilemaps.origin[1])/(tilemaps.TileFormat[1] * tilemaps.tilesets[l])) -1;}
                                for (x = xini; x <= xfin; x++){
                                    for (y = yini; y <= yfin; y++){ 
                                          totale++; 
                            var mappe = require('./mappe.js');
                            var newArray = [urlArray[0], urlArray[1], l, x, y];
                            mappe.mappa(config, newArray, function(err, buffer){
                                if (err) {console.log('errore in seeding');}
                                //else {console.log('mappa creata');}
                            });
                            }}}
                        }
                    }
                }
            }
console.log('file da elaborare= '+ totale);
//process.exit();
});