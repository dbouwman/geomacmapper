/*global gmm */
if (!this.gmm || typeof this.gmm !== 'object') {
    this.gmm = {};
}

(function () {
    'use strict';
    gmm.Viewer.module('FireInfoModule', function (Mod, Viewer, Backbone, Marionette, $, _) {

        //==================================
        //initializer called on Viewer.start(options)
        //==================================
        Mod.addInitializer(function (options) {
            Mod.controller = new Controller({
                region: Viewer.rightRegion
            });
        });
        //==================================
        //Controller for the MenuModule
        //==================================
        var Controller = Backbone.Marionette.Controller.extend({
            initialize: function (options) {
                _.bindAll(this);
                this.region = options.region;
                
                console.log('FireInfoModule:Controller:initialize');
                
                //hook up App events            
                Viewer.vent.on('View:FireInfo', this.showView, this);
            },
            showView:function(data){
                console.log('Showing FireDetailsView...');
                console.dir(data);
                /*this.layout = new YearLayout();
                this.region.show(this.layout);
                this.layout.listRegion.show(new YearListView({collection:this.years}));
                this.region.$el.fadeIn('fast');*/
                
            },
            /*hideView:function(){
                console.log('HistoricFiresModule:hideSearch');
                this.region.$el.fadeOut('fast');
            }*/

        });

        //Model
        var FireInfoModel = Backbone.Model.extend({});
        
        var FireInfoItemView = Backbone.Marionette.ItemView.extend({
            model: FireInfoModel,
            template: '#fire-item-template',
            tagName: 'div',   
        });


    });
})();