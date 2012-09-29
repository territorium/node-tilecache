# Node.js - TileCache

Implementation of the [TMS](http://wiki.osgeo.org/wiki/Tile_Map_Service_Specification) specification using the [Mapnik](http://mapnik.org/) rendering API.

## Dependencies

- [Mapnik](http://mapnik.org/)
- [Node-Mapnik](https://github.com/mapnik/node-mapnik)
- [forever](https://github.com/nodejitsu/forever)

## Example

Download the data from the [Natural Earth Data site](http://www.naturalearthdata.com/http//www.naturalearthdata.com/download/110m/cultural/110m-admin-0-countries.zip) and create a [style definition](https://github.com/mapnik/mapnik/wiki/GettingStartedInXML)

```js
<Map background-color="steelblue" srs="+proj=longlat +ellps=WGS84 +datum=WGS84 +no_defs">

  <Style name="countries">
    <Rule>
      <PolygonSymbolizer fill="#f2eff9" />
      <LineSymbolizer stroke="rgb(50%,50%,50%)" stroke-width="0.1" />
    </Rule>
  </Style>

  <Layer name="world" srs="+proj=longlat +ellps=WGS84 +datum=WGS84 +no_defs">
    <StyleName>countries</StyleName>
    <Datasource>
      <Parameter name="type">shape</Parameter>
      <Parameter name="file">ne_110m_admin_0_countries.shp</Parameter>
    </Datasource>
  </Layer>

</Map>
```

Start the TMS & seeding service typing:
```js
node lib/tilecache.js example/tilecache.json
```

The implementation provides different RESTful webservices:
```js
GET     http://[HOST]/services                  List the available TMS services
GET     http://[HOST]/services/seed/        	List of all cache definitions
GET     http://[HOST]/services/seed/task/       List of current seeding tasks
POST    http://[HOST]/services/seed/task/       Add a new seeding task
DELETE  http://[HOST]/services/seed/task/[ID]   Remove a seeding task by id
```

You can add a new seeding task using the curl and providing a JSON request; The parameters service, cache & global are mandatory. Optional parameters are format, from, to  & bbox:
```js
curl -i -X POST http://localhost:8888/services/seed/task/ --data '{"service":"countries", "cache" : "default", "grid": "global"}'
```