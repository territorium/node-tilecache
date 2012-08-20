exports.servizi = function (config){
    var callback = arguments[arguments.length - 1];
    //if (typeof(callback) !== 'function') callback = function(){};
    //response.setHeader("Content-Type", "text/xml");
    var body = "<?xml version=\"1.0\" encoding=\"UTF-8\" ?><Services>"
    for (index in config.services) {
        var service = config.services[index];
        body += "<TileMapService title=\"" + service.title;
        body += "\" href=\"http://"+ config.host +":" + config.port + "/" + service.name_service + "\"";
        body +="/>";
        }
    body += " </Services>";
    er = false;
    return callback(er, body);
    //response.writeHead(200, {
        //'Content-Length': body.length});
   // response.end(body);
}
            
exports.risorse =  function (config, urlArray){
    var callback = arguments[arguments.length - 1];
    //if (typeof(callback) !== 'function') callback = function(){};
    var er = true;
    for (index in config.services) {
        var service = config.services[index];
        if (urlArray[0] == (service.name_service)) {
        er = false;
    //response.setHeader("Content-Type", "text/xml");
    var body = "<?xml version=\"1.0\" encoding=\"UTF-8\" ?><TileMapService version=\"1.0.0\" services=\"http://" + config.host +":" + config.port + "\">";
    //var servizio = config.services[index];
    body += "<Title>" + service.title +"</Title>";
    body += "<Abstract>" + service.abs + "</Abstract><TileMaps>";
    for (ind in service.tilemaps){
        var tilemaps = service.tilemaps[ind];
        body += "<TileMap title=\"" + tilemaps.title + "\" srs=\"" + tilemaps.SRS + "\" profile=\"" + tilemaps.profile;
        body +="\" href=\"http://" + config.host + ":" + config.port + "/" + service.name_service + "/" + tilemaps.map+"\" />"
    }
    body += "</TileMaps></TileMapService>";
    
    //response.writeHead(200, {
      //  'Content-Length': body.length});
    //response.end(body);
    }}
return callback(er, body);
}

exports.tilemap = function (config, urlArray){
    var callback = arguments[arguments.length - 1];
    //if (typeof(callback) !== 'function') callback = function(){};
    var er = true;
    for (index in config.services) {
        var service = config.services[index];
        if (urlArray[0] == (service.name_service)) {
            for (ind in service.tilemaps){
                var tilemaps = service.tilemaps[ind];
                if (urlArray[1] == (tilemaps.map)){
                er = false;
    //response.setHeader("Content-Type", "text/xml");
    var body = "<?xml version=\"1.0\" encoding=\"UTF-8\" ?>";  
    body += "<TileMap version=\"1.0.0\" tilemapservice=\"http://" + config.host +":" + config.port + "/" + service.name_service+"\">";
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
    body += "<TileSet href=\"http://" + config.host + ":" + config.port + "/" + service.name_service + "/" + tilemaps.map + "/" + upp
    body += "\" units-per-pixel=\""+tilemaps.tilesets[upp]+"\" order=\""+upp+"\" />"
    }
    body += "</TileSets></TileMap>";
    //response.writeHead(200, {
   // 'Content-Length': body.length});
  //  response.end(body);        
    }
                 
            }
            }}
return callback(er, body);
}