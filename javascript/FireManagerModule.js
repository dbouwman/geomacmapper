/*global gmm */
if (!this.gmm || typeof this.gmm !== 'object') {
    this.gmm = {};
}
//==================================
// FireManagerModule
// This responds to the FireLayer:ConfigChanged
// event, and then harvests in the features
// and creates a collection which is then 
// sent to the map via Map:ShowFires
//==================================
(function () {
    'use strict';
    gmm.Viewer.module('FireManagerModule', function (Mod, Viewer, Backbone, Marionette, $, _) {

        //==================================
        //initializer called on Viewer.start(options)
        //==================================
        Mod.addInitializer(function (options) {
            Mod.controller = new Controller(options);
        });
        //==================================
        //Controller for the Module
        //==================================
        var Controller = Backbone.Marionette.Controller.extend({
            initialize: function (options) {
                console.log('FireManagerModule:Controller:initialize');
                _.bindAll(this);
                this.options = options;
                //hook up App events            
                Viewer.vent.on('FireLayer:ConfigChanged', this.updateFireCollection, this);
            },
            updateFireCollection:function(data){
                console.log('FireLayer:ConfigChanged Caught');
                //raise an event to show the spinner and message area
                Viewer.vent.trigger('Feedback:Show',"loading data...");
                //ensure that our featureSet is empty
                this.featureSet = [];
                //simplest thing would be to just load up the layer as a feature layer
                //and assign a custom renderer, but we are trying to be decoupled here
                //and if we wanted to swap out the map to Leaflet, we'd have a bunch more
                //hoops to jump through. So, we will fetch all the features into an array
                //and throw that to the map and let it sort out how to handle things.
                this.layerUrl = data.url + '/' + data.model.layerId;
                this.getFeatureIds(this.layerUrl);
                

            },

            getFeatureIds: function(url){
                //use jquery to get a list of all the Ids from
                //the service...
                $.ajax(url + '/query', {
                        data: {
                            where: '1=1',
                            returnIdsOnly: true,
                            f: 'json'
                        },
                        dataType: 'jsonp',
                        success: this.parseIds,
                        error: function (jqXHR, status) {
                            console.log('Error loading featureIds...');
                            alert("Error accessing Geomac service " + status);
                        },
                        complete: this.getFeatureIdsComplete
                },this);
            },
            getFeatureIdsComplete: function(jqXHR,status){
                console.log('GetFeautureIds completed with status ' + status);
            },
            parseIds: function(data, status, jqXHR) {
                
                //break the id's into batches of 200, and make iterative requests
                //accumulating the features into an array
                console.log('Status:'+ status);
                var i, j, temparray, chunk = 150;
                this.totalBatches = Math.ceil(data.objectIds.length / chunk);
                console.log('Queried Layer and got ' + data.objectIds.length + ' objectIds ... Will fetch in ' + this.totalBatches + ' batches of ' + chunk);
                for (i = 0, j = data.objectIds.length; i < j; i += chunk) {
                    //console.log(' requesting chunk ' + i);
                    Viewer.vent.trigger('Feedback:UpdateMessage','Requesting data batch '+ (i / chunk) + ' of ' + this.totalBatches);
                    temparray = data.objectIds.slice(i, i + chunk);
                    this.getFeatures(temparray);
                }
            },
            getFeatures: function(objectIdArray){
                //TODO:not sure I like using this.layerUrl here...
                $.ajax(this.layerUrl + '/query',{
                    data:{
                        objectIds:objectIdArray.join(),
                        outFields:'objectid, fire_name,start_date,start_hour,location,inc_type,cause,area_,area_meas',
                        f:'json'
                    },
                    dataType:'jsonp',
                    success: this.parseFeatures,
                    error: function (jqXHR, status) {
                        console.log('Error loading features...');
                        alert("Error accessing Geomac service " + status);
                    }
                },this);
            },
            parseFeatures: function(data,status,jxXHR){
                // console.log('  fetched set of features  ' + data.features.length);
                //union the new features
                this.featureSet = _.union(this.featureSet, data.features);
                this.totalBatches -=1;
                console.log(' Batches left: ' + this.totalBatches);
                if(this.totalBatches === 0){
                    console.log('Done last fetch. Got ' + this.featureSet.length + ' features');
                    Viewer.vent.trigger('Map:ShowFires', this.featureSet);
                    var msg = "loaded " + this.featureSet.length + " fires...";
                    Viewer.vent.trigger('Feedback:UpdateMessage',msg)
                }
            }


        });

        

    });
})();