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
                this.options = options.config;
                this.region = options.region;
                //setup the map here...

                //hook up App events            
                Viewer.vent.on('Map:FireLayer:ConfigChanged', this.setFireLayerConfig, this);
                Viewer.vent.on('Map:CenterAt', this.centerAt, this);
            },
            setFireLayerConfig:function(data){
                console.log('Map:FireLayer:ConfigChanged Caught');
                //do the work!
                
            },
            centerAt:function(data){
            	console.log('Map:CenterAt Caught');
            	
            }  
        });
    });
})();