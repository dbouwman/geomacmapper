/*global gmm */
if (!this.gmm || typeof this.gmm !== 'object') {
    this.gmm = {};
}
//==================================
// HistoricFiresModule
// This shows the UI with the list of years
// then raises a Map:FireLayer:ConfigurationChanged event
// and the Map module handles things from there
//==================================
(function () {
    'use strict';
    gmm.Viewer.module('HistoricFiresModule', function (Mod, Viewer, Backbone, Marionette, $, _) {

        //==================================
        //initializer called on Viewer.start(options)
        //==================================
        Mod.addInitializer(function (options) {
            Mod.controller = new Controller({
                config:options.historicFiresConfig,
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
                this.options = options;
                console.log('HistoricFiresModule:Controller:initialize');
                this.years = new YearCollection(options.config.years);
                this.url = options.config.url;

                //hook up App events            
                Viewer.vent.on('View:HistoricFires', this.showView, this);
                Viewer.vent.on('View:HistoricFires:Close', this.hideView, this);
            },
            showView:function(){
                console.log('Showing HistoricFiresView...');
                this.layout = new YearLayout();
                this.region.show(this.layout);
                this.layout.listRegion.show(new YearListView({collection:this.years}));
                this.region.$el.fadeIn('fast');
                
            },
            hideView:function(){
                console.log('HistoricFiresModule:hideSearch');
                this.region.$el.fadeOut('fast');
            }

        });

        //Model
        var YearModel = Backbone.Model.extend({});
        //Collection
        var YearCollection = Backbone.Collection.extend({
            model: YearModel
        });

        var YearItemView = Backbone.Marionette.ItemView.extend({
            model: YearModel,
            template: '#year-item-template',
            tagName: 'li', 
            events: {'click': 'itemClicked'},
            itemClicked: function(){
                console.log('YearItemClicked: '+ this.model.get('name'));
                var data ={
                    model:this.model.toJSON(),
                    url:Mod.controller.url};
                Viewer.vent.trigger('FireLayer:ConfigChanged', data);
                Viewer.vent.trigger('Navbar:ChangeItemName',this.model.get('name'));
                //hide the view
                Mod.controller.hideView();
            }      
        });

        var YearListView = Backbone.Marionette.CollectionView.extend({
          itemView: YearItemView,
          tagName: 'ul'
        });

        var YearLayout = Backbone.Marionette.Layout.extend({
            template: "#year-layout-template",
            regions: {
                listRegion: "#year-list-region"
            },
            events: {'click #years-close':'closeView'},
            closeView: function(){
                Mod.controller.hideView();
            }
        });


    });
})();