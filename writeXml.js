var body = '';
var er = true;
exports.servizi = function (config){
    var callback = arguments[arguments.length - 1];
    //if (typeof(callback) !== 'function') callback = function(){};
    body = "<?xml version=\"1.0\" encoding=\"UTF-8\" ?><Services>"
    for (index in config.services) {
        var service = config.services[index];
        body += "<TileMapService title=\"" + service.title;
        body += "\" href=\"http://"+ config.host +":" + config.port + "/" + index + "\"";
        body +="/>";
    }
    body += " </Services>";
    er = false;
return callback(er, body);
}
            
exports.risorse =  function (config, urlArray){
    var callback = arguments[arguments.length - 1];
    //if (typeof(callback) !== 'function') callback = function(){};
    var service = config.services[urlArray[0]];
    if (typeof(service) !== 'undefined') {
        er = false;
        body = "<?xml version=\"1.0\" encoding=\"UTF-8\" ?><TileMapService version=\"1.0.0\" services=\"http://" + config.host +":" + config.port + "\">";
        body += "<Title>" + service.title +"</Title>";
        body += "<Abstract>" + service.abs + "</Abstract><TileMaps>";
        for (index in service.tilemaps){
        var tilemaps = service.tilemaps[index];
        body += "<TileMap title=\"" + tilemaps.title + "\" srs=\"" + tilemaps.SRS + "\" profile=\"" + tilemaps.profile;
        body +="\" href=\"http://" + config.host + ":" + config.port + "/" + urlArray[0] + "/" + index +"\" />"
        }
        body += "</TileMaps></TileMapService>";
    } else {
        er = true;
        body = '<?xml version="1.0" ?>\n<TileMapServerError>\n<Message>The requested Service does not exist.</Message>\n</TileMapServerError>';
    }
return callback(er, body);
}

exports.tilemap = function (config, urlArray){
    var callback = arguments[arguments.length - 1];
    //if (typeof(callback) !== 'function') callback = function(){};
    var er = true;
    body = 'Service non found';
    var service = config.services[urlArray[0]];
    if (typeof(service) !== 'undefined'){
        var tilemaps = config.services[urlArray[0]].tilemaps[urlArray[1]];
        if (typeof(tilemaps) !== 'undefined') {
            er = false;
            var body = "<?xml version=\"1.0\" encoding=\"UTF-8\" ?>";  
            body += "<TileMap version=\"1.0.0\" tilemapservice=\"http://" + config.host +":" + config.port + "/" + urlArray[0]+"\">";
            body += "<Title>"+tilemaps.title+"</Title>";
            body += "<Abstract>"+service.abs+"</Abstract>";
            body += "<SRS>"+tilemaps.SRS+"</SRS>";
            body += "<BoundingBox minx=\""+tilemaps.boundingbox[0]+"\" miny=\""+tilemaps.boundingbox[1];
            body += "\" maxx=\""+tilemaps.boundingbox[2]+"\" maxy=\""+tilemaps.boundingbox[3]+"\" />";
            body += "<Origin x=\""+tilemaps.origin[0]+"\" y=\""+tilemaps.origin[1]+"\" />";
            body += "<TileFormat width=\""+tilemaps.TileFormat[0]+"\" height=\""+tilemaps.TileFormat[1];
            body += "\" mime-type=\""+tilemaps.TileFormat[2]+"\" extension=\""+tilemaps.TileFormat[3]+"\" />";
            body += "<TileSets profile=\""+tilemaps.profile+"\">";
            for (upp in tilemaps.tilesets){
                body += "<TileSet href=\"http://" + config.host + ":" + config.port + "/" + urlArray[0] + "/" + urlArray[1] + "/" + upp
                body += "\" units-per-pixel=\""+tilemaps.tilesets[upp]+"\" order=\""+upp+"\" />"
            }
            body += "</TileSets></TileMap>";        
        } else {
            er = true;
            body = '<?xml version="1.0" ?>\n<TileMapServerError>\n<Message>The requested Tilemap does not exist.</Message>\n</TileMapServerError>';
        }
    }         
return callback(er, body);
}

//The client requests a nonexistent resource URL. Return HTTP error code 404 (Not Found)
//The server fails in processing a response for a valid resource URL. Return HTTP error code 500 (Internal Server Error)