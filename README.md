node-tilecache
==============

TMS implementation based on node.js 

Version 0.1


https://github.com/mapnik/mapnik/wiki/GettingStartedInXML

Download the data from  the [Natural Earth Data site](http://www.naturalearthdata.com/http//www.naturalearthdata.com/download/110m/cultural/110m-admin-0-countries.zip).


To download and unzip on the command line with the do:

    wget https://github.com/mapnik/mapnik/wiki/data/110m-admin-0-countries.zip
    unzip 110m-admin-0-countries.zip # creates ne_110m_admin_0_countries.shp

Create the `world_style.xml`:
<Map background-color="steelblue" srs="+proj=longlat +ellps=WGS84 +datum=WGS84 +no_defs">

  <Style name="My Style">
    <Rule>
      <PolygonSymbolizer fill="#f2eff9" />
      <LineSymbolizer stroke="rgb(50%,50%,50%)" stroke-width="0.1" />
    </Rule>
  </Style>

  <Layer name="world" srs="+proj=longlat +ellps=WGS84 +datum=WGS84 +no_defs">
    <StyleName>My Style</StyleName>
    <Datasource>
      <Parameter name="type">shape</Parameter>
      <Parameter name="file">ne_110m_admin_0_countries.shp</Parameter>
    </Datasource>
  </Layer>

</Map>
