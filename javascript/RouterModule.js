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
            Mod.router = new Router();
            //TODO: Set this up via the configuration
            Backbone.history.start({pushState: false, root:options.appRoot});
        });
        

        var Router = Backbone.Marionette.AppRouter.extend({
            initialize: function(options){
                console.log('Router initialize called');
                 //Allow other parts of the app to update the url by raising an event
                Viewer.vent.on('Router:Navigate', this.setUrl);
            },

            setUrl: function(data){
                
                console.log('RouterModule caught Router.Navigate: data: ' + data.x + ' '+ data.y + ' ' + data.l);
                //round to two decimals
                data.x = Math.round(data.x * 100)/100;
                data.y = Math.round(data.y * 100)/100;
                var urlFragment = 'map/'+data.x+'/'+data.y+'/'+data.l;
                console.log(urlFragment);
                Mod.router.navigate(urlFragment, {trigger:false});
               
            },

            routes : {
                "map/:x/:y/:l" : "centerAndZoom"
            },
            centerAndZoom : function(x,y,l){
                Viewer.vent.trigger('Map:CenterAtLatLongAndZoom', {x:x, y:y, l:l});
            }
        });       
    });
})();