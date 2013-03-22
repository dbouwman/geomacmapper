/*global gmm */
if (!this.gmm || typeof this.gmm !== 'object') {
    this.gmm = {};
}
(function () {
    'use strict';
    gmm.Viewer.module('RouterModule', function (Mod, Viewer, Backbone, Marionette, $, _) {

        //==================================
        //initializer called on Viewer.start(options)
        //==================================
        Mod.addInitializer(function (options) {
            console.log('RouterModule starting up...')
            //Create a new Router
            Mod.router = new Router({
                active: options.currentFiresConfig,
                historic:options.historicFiresConfig
                });
            //start history
            Backbone.history.start({pushState: false, root:options.appRoot});
        });

        var Router = Backbone.Marionette.AppRouter.extend({
            initialize: function(options){
                _.bindAll(this);
                this.active = options.active;
                this.historic = options.historic;
                 //Allow other parts of the app to update the url by raising an event
                Viewer.vent.on('Router:SetUrl', this.setUrl);
                Viewer.vent.on('Map:Loaded',this.onMapLoaded);
                //Viewer.vent.on('FireLayer:ConfigChanged', this.setYear);
                
            },

            onMapLoaded:function(){
                //ok, now that we have a map we can link up some events
                Viewer.vent.on('FireLayer:ConfigChanged',this.setYear);
                //and if we have values passed in on the url, raise events
                if(this.urlValues){
                    Viewer.vent.trigger('FireLayer:ConfigChanged', this.urlValues.yearData);
                    Viewer.vent.trigger('Map:ShowPerimeters',this.urlValues.yearData);
                    Viewer.vent.trigger('Navbar:ChangeItemName',this.urlValues.yearData.model.name);
                    Viewer.vent.trigger('Map:CenterAtLatLongAndZoom', {
                        x:this.urlValues.x, 
                        y:this.urlValues.y, 
                        l:this.urlValues.l
                    });
                }else{
                    //do the defaults - this is essentially what starts the app
                    //with the active fires
                    Viewer.vent.trigger('FireLayer:ConfigChanged', this.active);
                    Viewer.vent.trigger('Map:ShowPerimeters',this.active);
                    Viewer.vent.trigger('Navbar:ChangeItemName',this.active.model.name);
                }
            },

            setYear: function(data){
                if(this.data){
                    var urlFragment = 'map/'+this.data.x+'/'+this.data.y+'/'+this.data.l
                    if(data.model.year){
                        this.year = data.model.year;
                        urlFragment += '/' + this.year;  
                    }else{
                        this.year = null;
                    }
                    Mod.router.navigate(urlFragment, {trigger:false});
                }
                if(data.model.year){
                    this.year = data.model.year;
                }
            },

            setUrl: function(data){
                //round to two decimals
                data.x = Math.round(data.x * 100)/100;
                data.y = Math.round(data.y * 100)/100;
                this.data = data;
                var urlFragment = 'map/'+this.data.x+'/'+this.data.y+'/'+this.data.l
                if(this.year){
                    urlFragment += '/' + this.year; 
                }
                //var urlFragment = 'map/'+data.x+'/'+data.y+'/'+data.l +'/' + this.year; 
                
               
                Mod.router.navigate(urlFragment, {trigger:false});
               
            },

            routes : {
                "map/:x/:y/:l/(:year)" : "routeActions"
            },

            routeActions : function(x,y,l, year){
                if(year){
                    //having a year passed in means we are 
                    //looking at historic data 
                    this.year = year;
                    console.log('Got the year passed in...' + year);
                    //find the historic entry with year = year
                    var data = {};
                    data.url = this.historic.url;
                    _.each(this.historic.years, function(item){
                        if(item.year == year){
                            data.model = item;
                        }
                    });
                    //
                }else{
                    //no year means "Active" which is pre-set in the config
                    var data =  this.active;
                }
                //we can't raise the events here because the map is likely not
                //ready yet. So we just hold onto the urlValues and raise them
                //when we are notified that the map is ready
                this.urlValues = {
                    x: x,
                    y: y,
                    l: l,
                    yearData: data
                };

            }
        });       
    });
})();