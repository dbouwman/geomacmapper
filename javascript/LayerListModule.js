/*global gmm */
if (!this.gmm || typeof this.gmm !== 'object') {
    this.gmm = {};
}
(function () {
    'use strict';
    gmm.Viewer.module('LayerListModule', function (Mod, Viewer, Backbone, Marionette, $, _) {

        //==================================
        //initializer called on Viewer.start(options)
        //==================================
        Mod.addInitializer(function (options) {
            Mod.controller = new Controller({
                mapConfig: options.mapConfig,
                region: Viewer.layerListRegion
            });
        });



        //==================================
        //Controller for the LayerList Module
        //==================================
        var Controller = Backbone.Marionette.Controller.extend({
            initialize: function (options) {
                _.bindAll();
                
                console.log('LayerListMobule:Controller:initialize');
                this.region = options.region;
                
                //The layer list has two collections
                // 1) the list of basemaps
                // 2) list of operational layers
                this.basemapCollection = new LayerCollection(options.mapConfig.basemaps);
                this.layerCollection = new LayerCollection(options.mapConfig.operationalLayers);
                
                //create the views
                this.basemapView = new BasemapListView({collection:this.basemapCollection});
                this.layersView = new LayerListView({collection:this.layerCollection});
                //create our layout that will hold the child views
                this.layout = new LayerListLayoutView();

                // pre-render this all
                // the collections don't change
                // at runtime, so we can do it when it loads
                this.region.show(this.layout);
                this.layout.layerListRegion.show(this.layersView);
                this.layout.basemapRegion.show(this.basemapView);

                //hook up App events to show/hide the panel          
                Viewer.vent.on('View:LayerList', function (name) {
                    console.log('LayerListController caught View:LayerList');
                    if( $('#layer-list-region').is(':visible') ){
                        $('#layer-list-region').hide();
                    }else{
                        $('#layer-list-region').show();
                    }   
                });
                Viewer.vent.on('View:LayerList:Hide',function(){
                    $('#layer-list-region').hide();
                });
            }
        });


        //Model
        var LayerModel = Backbone.Model.extend({});
        //Collection
        var LayerCollection = Backbone.Collection.extend({
            model: LayerModel
        });
        //------ BASE MAPS
        var BasemapItemView = Backbone.Marionette.ItemView.extend({
            model: LayerModel,
            template: '#basemap-item-template',
            tagName: 'li', 
            events: {'click': 'itemClicked'},
            itemClicked: function(){
                console.log('BaseMapItemClicked: '+ this.model.get('name'));
                var options = { label: this.model.get('name')};
                Viewer.vent.trigger('Map:SetBasemap', options);
            }      
        });
        //Use collection views to iterate the collections
        var BasemapListView = Backbone.Marionette.CollectionView.extend({
            itemView: BasemapItemView,
            tagName: 'ul'
        });
        

        //------- OPERATIONAL LAYERS
        var LayerItemView = Backbone.Marionette.ItemView.extend({
            model: LayerModel,
            template: '#layer-item-template',
            tagName: 'li', 
            events: {'click': 'itemClicked'},
            itemClicked: function(evt){
                console.log('LayerItemClicked: '+ this.model.get('name'));
                var options = { label: this.model.get('name'), visible: evt.target.checked };
                Viewer.vent.trigger('Map:SetLayerVisibility', options); 
            }      
        });

        var LayerListView = Backbone.Marionette.CollectionView.extend({
            itemView: LayerItemView,
            tagName: 'ul'
        });


        //------- LAYOUT - Parent View
        var LayerListLayoutView = Backbone.Marionette.Layout.extend({
          template: "#layer-list-template",
          //define the regions using selectors for nodes
          //inside the layout's template
          regions: {
            layerListRegion: "#layer-list",
            basemapRegion: "#basemap-list"
          },
          events:{'click #layer-list-close':'closeView'},
          closeView:function(){
            Viewer.vent.trigger('View:LayerList:Hide');       
          }
        });
    });
})();