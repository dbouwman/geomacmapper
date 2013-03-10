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
    gmm.Viewer.module('CurrentFiresModule', function (Mod, Viewer, Backbone, Marionette, $, _) {

        //==================================
        //initializer called on Viewer.start(options)
        //==================================
        Mod.addInitializer(function (options) {
            Mod.controller = new Controller(options.currentFiresConfig);
        });
        //==================================
        //Controller for the Module
        //==================================
        var Controller = Backbone.Marionette.Controller.extend({
            initialize: function (options) {
                _.bindAll(this);
                this.options = options;
                //hook up App events            
                Viewer.vent.on('View:CurrentFires', this.setCurrentFires, this);
            },
            setCurrentFires:function(){
                Viewer.vent.trigger('Map:FireLayer:ConfigChanged', this.options.settings);
                Viewer.vent.trigger('Menu:ChangeViewName',this.options.settings.name);
                
            }   
        });
    });
})();