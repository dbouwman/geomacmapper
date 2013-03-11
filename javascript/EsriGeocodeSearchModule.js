/*global gmm */
if (!this.gmm || typeof this.gmm !== 'object') {
    this.gmm = {};
}
//==================================
// EsriGeocodeSearchModule
// This shows the search ui, does the search
// raises an event to Center the map at the
// location OR shows a list with the options
// for disambiguation, which will raise
// the same event if/when clicked
//==================================
(function () {
    'use strict';
    gmm.Viewer.module('EsriGeocodeSearchModule', function (Mod, Viewer, Backbone, Marionette, $, _) {

        //==================================
        //initializer called on Viewer.start(options)
        //==================================
        Mod.addInitializer(function (options) {
            Mod.controller = new Controller({
                region: Viewer.centerRegion
            });
        });

        //==================================
        //Controller for the MenuModule
        //==================================
        var Controller = Backbone.Marionette.Controller.extend({
            initialize: function (options) {
                _.bindAll(this);
                this.region = options.region;
                console.log('EsriGeocodeSearchModule:Controller:initialize');
                //hook up App events            
                Viewer.vent.on('View:Search', this.showSearch, this);
                Viewer.vent.on('View:Search:Close', this.hideSearch, this);
            },
            showSearch:function(){
                console.log('EsriGeocodeSearchModule caught View:Search');
                this.layout = new SearchLayout();
                this.region.show(this.layout);
                this.region.$el.fadeIn('fast');
            },
            hideSearch:function(){
                console.log('EsriGeocodeSearchModule:hideSearch');
                this.region.$el.fadeOut('fast');
            },

            geocodeAddress: function (data) {

                console.log('Geocoder called with ' + data);
                //show spinner

                //although there is a dijit that can do this search
                //it's just a simple ajax call, so we will just use jquery
                var url = 'http://geocode.arcgis.com/arcgis/rest/services/World/GeocodeServer/find';
                this.layout.showSpinner();
                $.ajax(url, {
                    data: {
                        text: data,
                        f: 'json',
                        outSR:102100,
                        maxlocations:6
                    },
                    dataType: 'json',
                    success: this.geocodeResultsHandler ,
                    error: this.geocodeError,
                    complete: this.geocodeComplete
                })
            },
            
            geocodeComplete:function(){
                this.layout.hideSpinner();
            },

            geocodeError:function(jqXHR,status,error){
                //replace this will better logging and
                //an informative message for production code
                console.log('Error running the geocode.');

            },

            geocodeResultsHandler:function(data,status,jqXHR){
                console.log('Got Geocode Results...');
                console.dir(data);
                
                //get the count returned
                var foundCount = data.locations.length;
                if(foundCount === 1){
                    var loc = data.locations[0];
                    //hide the ui and zoom to the location
                    //create a simple point Object
                    var pt = {
                        x:loc.feature.geometry.x,
                        y:loc.feature.geometry.y
                    }
                    Viewer.vent.trigger('Map:CenterAt',pt);
                    this.hideSearch();
                }else{
                    //show the list
                    //convert the locations into a flatter collection of objects
                    var locs = [];
                    _.each(data.locations,function(item){
                        locs.push({
                            name:item.name,
                            x: item.feature.geometry.x,
                            y: item.feature.geometry.y
                        });
                    });
                    //create a collection from these geezers
                    this.locationsCollection = new LocationCollection(locs);
                    //throw them into an collection view
                    var locationListView = new LocationsListView({collection:this.locationsCollection});
                    //show the collection view in the geocode-results-region
                    //if locs is an empty array, the collectionview will show the 
                    this.layout.resultsRegion.show(locationListView);

                }
            }
        });

        //Model
        var LocationModel = Backbone.Model.extend({});
        //Collection
        var LocationCollection = Backbone.Collection.extend({
            model: LocationModel
        });

        var NoItemsView = Backbone.Marionette.ItemView.extend({
          template: "#no-locations-template"
        });

        var LocationItemView = Backbone.Marionette.ItemView.extend({
            model: LocationModel,
            template: '#location-item-template',
            tagName: 'li', 
            events: {'click': 'itemClicked'},
            itemClicked: function(){
                console.log('LocationItemClicked: '+ this.model.get('name'));
                //var options = { label: this.model.get('name')};
                Viewer.vent.trigger('Map:CenterAt', this.model.toJSON());
                Mod.controller.hideSearch();
            }      
        });
        //Use collection views to iterate the collections
        var LocationsListView = Backbone.Marionette.CollectionView.extend({
            itemView: LocationItemView,
            emptyView: NoItemsView,
            tagName: 'ul'
        });


        var SearchLayout = Backbone.Marionette.Layout.extend({
            template: "#search-layout-template",
            //define the regions using selectors for nodes
            //inside the layout's template
            regions: {
                resultsRegion: "#geocode-results-region"
            },
            events: {
                'keypress':'submitOnEnter',
                'click button':'submit',
                'click #search-close':'closeView'
            },
            showSpinner:function(){
                $('#search-icon').addClass('spin');
            },
            hideSpinner:function(){
                $('#search-icon').removeClass('spin');
            },
            closeView:function(){
                //since the close button is IN the this views template
                //the click handler is the view's responsibility
                //However, since it's in a Region, we need to call
                //the hideSearch method on the controller
                Mod.controller.hideSearch();
            },
            
            submitOnEnter:function(e){
                if(e.keyCode == 13){
                    this.submit();
                }
            },
            submit: function(){
                //do the search - since this is an esri specific module
                //we can do it in this module. 

                //events could allow us to not have any direct 
                //binding to the controller but this is tightly coupled
                //anyhow, so there is no benefit
                //Viewer.vent.trigger('View:Search:Close');
                //We can also get to the controller use this
                //and avoids all the eventing
                Mod.controller.geocodeAddress($('#search-textbox').val());
                //change the icon for the search
            }
        });





    });
})();