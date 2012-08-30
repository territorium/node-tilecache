var mapnik = require('mapnik');
var map = new mapnik.Map(256, 256);
map.loadSync('world_style.xml');
map.zoomAll();
map.renderFileSync('map.png');
