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

Start the TMS service using typing:
```js
node lib/tilecache.js example/tilecache.json
```
