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
                Viewer.vent.on('Map:SetLayerVisibility',this.setLayerVisibility,this);
                Viewer.vent.on('Map:SetBasemap',this.setBaseMap,this);
                Viewer.vent.on('Map:HideControls',this.hideControls,this);
                Viewer.vent.on('Map:ShowControls',this.showControls,this);
                this.initMap(this.config.mapConfig);
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
            	console.dir(data);
            	var pt = new esri.geometry.Point({x: data.x, y: data.y,spatialReference: {wkid:102100 } });
            	if(this.map.getLevel() < 9){
            		this.map.centerAndZoom(pt,9);
		        }else{
		        	this.map.centerAt(pt);
		        }
            	
            },

			setLayerVisibility: function (data) {
                // Set Visibility of image layers too
                //this.preMapDebugging(data, 'Map:SetLayerVisibility');
                var lyr = this.map.getLayer(data.label);
                if (lyr) {
                    lyr.setVisibility(data.visible);
                } else {
                    console.log('Configuration Error: Layer ' + data.label);
                }
                /*_.each(this.config.operationalLayers, function (layer) {
                    if (layer.label == data.label) {
                        layer.visible = data.visible;
                    }
                }, this);*/

            },
            setBaseMap: function (data) {
            	
                _.each(this.config.mapConfig.basemaps, function (layer) {
                    var lyr = this.map.getLayer("basemap_"+layer.label);
                    
                    if (layer.label == data.label) {
                        lyr.setVisibility(true);
                        layer.visible = true;
                    } else {
                        lyr.setVisibility(false);
                        layer.visible = false;
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
                this.initBaseLayers(mapConfig.basemaps);
                this.initOperationalLayers(mapConfig.operationalLayers);
            },

            initBaseLayers: function (basemaps) {
                console.log('Map:Controller:initBaseLayers');
                var me = this;
                for (var i = 0; i < basemaps.length; i++) {
                    var layer = basemaps[i];
                    if (layer.type == 'ArcGISTiledMapServiceLayer') {
                        var lyr = new esri.layers.ArcGISTiledMapServiceLayer(layer.url,
                            {
                                id: 'basemap_' + layer.label,
                                visible: layer.visible
                            });
                      
                        //add to the map                
                        me.map.addLayer(lyr);
                    }
                }

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
            }
        });

        

    });
})();