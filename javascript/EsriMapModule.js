//FeatureLayer constructor example
//http://help.arcgis.com/en/webapi/javascript/arcgis/jsapi/#FeatureLayer/FeatureLayerConst2

/*global gmm */
if (!this.gmm || typeof this.gmm !== 'object') {
    this.gmm = {};
}
//==================================
// CurrentFiresModule
// This responds to the View:CurrentFires
// event, and raises another event to 
// send the correct config over to the map
// to display the current fires
//==================================
(function () {
    'use strict';
    gmm.Viewer.module('EsriMapModule', function (Mod, Viewer, Backbone, Marionette, $, _) {

        //==================================
        //initializer called on Viewer.start(options)
        //==================================
        Mod.addInitializer(function (options) {
            Mod.controller = new Controller({
            		config:options,
            		region: Viewer.mapRegion
            	});
        });
        //==================================
        //Controller for the Module
        //==================================
        var Controller = Backbone.Marionette.Controller.extend({
            initialize: function (options) {
                _.bindAll(this);
                this.config = options.config;
                this.region = options.region;
                //setup the map here...

                //hook up App events            
                Viewer.vent.on('Map:FireLayer:DataChanged', this.updateFireLayer, this);
                Viewer.vent.on('Map:CenterAt', this.centerAt, this);
                Viewer.vent.on('Map:CenterAtAndZoom', this.centerAtAndZoom, this);
                Viewer.vent.on('Map:CenterAtLatLongAndZoom', this.centerAtLatLongAndZoom, this);
                Viewer.vent.on('Map:SetLayerVisibility',this.setLayerVisibility,this);
                Viewer.vent.on('Map:SetBasemap',this.setBaseMap,this);
                Viewer.vent.on('Map:HideControls',this.hideControls,this);
                Viewer.vent.on('Map:ShowControls',this.showControls,this);
                Viewer.vent.on('Map:ShowFires',this.showFires,this);
                this.initMap(this.config.mapConfig);
            },
            showFires:function(featureArray){
                
                //remove the firelayer if it's in the map
                var lyr = this.map.getLayer("fireLayer");
                if(lyr){
                    this.map.removeLayer(lyr);
                }
                //setup the definition for the layer
                //this includes the renderer
                var layerDefinition = this.getFireLayerDefinition();
                var featureCollection = {
                  layerDefinition: layerDefinition,
                  featureSet: {
                    "geometryType": "esriGeometryPoint",
                    "features":featureArray
                    }
                };
                //create the feature layer...
                var fireLayer = new esri.layers.FeatureLayer(featureCollection, {
                  mode: esri.layers.FeatureLayer.MODE_SNAPSHOT,
                  id: "fireLayer",
                  visible:true
                });
                //hover handler
                dojo.connect(fireLayer, "onMouseOver",function(evt){
                    //raise an event with the attributes so another view can
                    //handle displaying the details
                    console.log('Hovering on ' + evt.graphic.attributes['fire_name']);
                });
                this.map.addLayer(fireLayer);
                console.log("Added fireLayer to the map with "+ featureArray.length + " features");
                Viewer.vent.trigger("Feedback:Hide");


            },
            hideControls:function(){
            	$('#map_zoom_slider').fadeOut('fast');
            },
            showControls:function(){
				$('#map_zoom_slider').fadeIn('fast');
            },
            updateFireLayer:function(data){
                console.log('Map:FireLayer:DataChanged Caught');
                //do the work!
                
            },
            centerAt:function(data){
            	console.log('Map:CenterAt Caught');
                var lvl = this.map.getLevel();
            	if(lvl < 9){
            		data.l = 9;
		        }else{
                    data.l = lvl;
                }
                this.centerAtAndZoom(data);
            	
            },
            centerAtAndZoom:function(data){ // assume webmercator
                console.log('Map:CenterAtAndZoom Caught');
                console.dir(data);
                var pt = new esri.geometry.Point({x: data.x, y: data.y,spatialReference: {wkid:102100 } });
                this.map.centerAndZoom(pt,data.l);
            },

            centerAtLatLongAndZoom:function(data){ //assume geographic
                //we could pass along the SR, or a wkid, but that seems like "leakage" to me...
                console.log('Map:centerAtLatLongAndZoom Caught');
                console.dir(data);
                var pt = new esri.geometry.Point({x: data.x, y: data.y,spatialReference: {wkid:4326 } });
                this.map.centerAndZoom(pt,data.l);
            },


			setLayerVisibility: function (data) {
                var lyr = this.map.getLayer(data.label);
                if (lyr) {
                    lyr.setVisibility(data.visible);
                } else {
                    console.log('Configuration Error: Layer ' + data.label);
                }

            },
            setBaseMap: function (data) {
                _.each(this.config.mapConfig.basemaps, function (layer) {
                    var lyr = this.map.getLayer("basemap_"+layer.label);
                    
                    if (layer.label == data.label) {
                        lyr.setVisibility(true);
                        
                    } else {
                        lyr.setVisibility(false);
                        
                    }
                }, this);
            },

            initMap: function (mapConfig) {
                console.log('Map:Controller:initMap');

                var initialExtent = new esri.geometry.Extent(mapConfig.initialExtent);
               
                this.map = new esri.Map("map", {
                    extent: initialExtent,
                    maxZoom: 15
                 });

                dojo.connect(this.map, 'onLoad', this.onMapLoad);
                dojo.connect(this.map, 'onZoomEnd', this.updateUrl);
                dojo.connect(this.map, 'onPanEnd', this.updateUrl);
                this.initBaseLayers(mapConfig.basemaps);
                this.initOperationalLayers(mapConfig.operationalLayers);
            },
            updateUrl: function(){
                //fires when the extent is updated
                var center = this.map.geographicExtent.getCenter();
                var level = this.map.getLevel();
                var data = {x:center.x, y:center.y, l: level};
                console.log('EsriMapModule: Extent updated - calling Router:SetUrl with ' + data.x + ' ' +data.y);
                //raise an event which keeps the map decoupled from the router
                Viewer.vent.trigger('Router:SetUrl',data);
            },
            initBaseLayers: function (basemaps) {
                console.log('Map:Controller:initBaseLayers');
                _.each(basemaps, function(layer){
                    switch(layer.type){
                        case 'ArcGISTiledMapServiceLayer':
                            var lyr = new esri.layers.ArcGISTiledMapServiceLayer(layer.url,
                                {
                                    id: 'basemap_' + layer.label,
                                    visible: layer.visible
                                });
                            
                            this.map.addLayer(lyr);
                            break;
                        default: 
                            alert(layer.type + ' layers not currently supported for basemaps');
                            break;
                    }
                },this);
            },

            initOperationalLayers: function (operationalLayers) {
                console.log('MapModule:Controller:initOperationalLayers');
                _.each(operationalLayers, function (layer) {
                    switch (layer.type) {
                        case 'ArcGISDynamicMapServiceLayer':
                            var lyr = new esri.layers.ArcGISDynamicMapServiceLayer(layer.url,
                            {
                                id: layer.name,
                                visible: layer.visible,
                                opacity: layer.opacity
                            });
                            lyr.setVisibleLayers(layer.visibleLayers);
                            console.log(' Added ' + layer.name + ' to the map...');
                            this.map.addLayer(lyr);
                            break;
                        case 'FeatureLayer':
                            alert('Feature Layers not currently supported');
                            break;
                        case 'ArcGISImageServiceLayer':
                            alert('ArcGISImageServiceLayers not currently supported');
                            break;
                        default:
                            alert(layer.type + ' layers not currently supported.');
                            break;
                    }
                }, this);
                console.log('Done adding operational layers to the map');
            }, 

            onMapLoad: function (map) {
                $(window).resize(this.resizeMap);
            },
            resizeMap: function () {
                //resize the map when the browser resizes
                if (this.map) {
                    this.map.resize(true);
                    this.map.reposition();
                } else {
                    console.error('MapModule:Controller:resizeMap map is undefined');
                }
            },

            getFireLayerDefinition: function(){
                var defn = {
                  "geometryType": "esriGeometryPoint",
                  "objectIdField": "objectid",
                  "spatialReference":{"wkid":102100},
                  "drawingInfo": {
                    "renderer": {
                      "type": "simple",
                      "symbol": {
                        "type": "esriPMS",
                        "url": "images/icon28-active.png",
                        "contentType": "image/png",
                        "width": 15,
                        "height": 15
                      }
                    }
                  },
                  "fields":[
                      {
                         "name":"objectid",
                         "type":"esriFieldTypeOID",
                         "alias":"objectid"
                      },
                      {
                         "name":"fire_name",
                         "type":"esriFieldTypeString",
                         "alias":"fire_name",
                         "length":30
                      },
                      {
                         "name":"start_date",
                         "type":"esriFieldTypeString",
                         "alias":"start_date",
                         "length":18
                      },
                      {
                         "name":"start_hour",
                         "type":"esriFieldTypeString",
                         "alias":"start_hour",
                         "length":4
                      },
                      {
                         "name":"location",
                         "type":"esriFieldTypeString",
                         "alias":"location",
                         "length":80
                      },
                      {
                         "name":"inc_type",
                         "type":"esriFieldTypeString",
                         "alias":"inc_type",
                         "length":3
                      },
                      {
                         "name":"cause",
                         "type":"esriFieldTypeString",
                         "alias":"cause",
                         "length":1
                      },
                      {
                         "name":"area_",
                         "type":"esriFieldTypeDouble",
                         "alias":"area_"
                      },
                      {
                         "name":"area_meas",
                         "type":"esriFieldTypeString",
                         "alias":"area_meas",
                         "length":10
                      }]
                }; 
                return defn;

            }
        });

        

    });
})();