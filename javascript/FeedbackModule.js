/*global gmm */
if (!this.gmm || typeof this.gmm !== 'object') {
    this.gmm = {};
}
(function () {
    'use strict';
    gmm.Viewer.module('FeedbackModule', function (Mod, Viewer, Backbone, Marionette, $, _) {

        //==================================
        //initializer called on Viewer.start(options)
        //==================================
        Mod.addInitializer(function (options) {
            Mod.controller = new Controller();
        });
        //==================================
        //Controller for the Module
        //==================================
        var Controller = Backbone.Marionette.Controller.extend({
            initialize: function (options) {
                _.bindAll(this);
                console.log('FeedbackModule:Controller:initialize');
                //listen to events
                Viewer.vent.on('Feedback:Show',this.show,this);
                Viewer.vent.on('Feedback:UpdateMessage',this.updateMessage,this);
                Viewer.vent.on('Feedback:Hide',this.hide,this);
                   
            },
            show:function(message){
                $('#actions').html(message);
                $('#feedback').show();
            },
            updateMessage:function(message){
                $('#actions').html(message);
            },
            hide:function(){
                $('#feedback').hide();
            }
        });
    });
})();
