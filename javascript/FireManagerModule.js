/*global gmm */
if (!this.gmm || typeof this.gmm !== 'object') {
    this.gmm = {};
}
//==================================
// FireManagerModule
// This responds to the FireLayer:ConfigChanged
// event, and then harvests in the features
// and creates a collection which is then 
// sent to the map via Map:FireCollection:Changed
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
                _.bindAll(this);
                this.options = options;
                //hook up App events            
                Viewer.vent.on('FireLayer:ConfigChanged', this.updateFireCollection, this);
            },
            updateFireCollection:function(data){
                console.log('FireLayer:ConfigChanged Caught');
                console.dir(data);

                
            }
        });

        

    });
})();