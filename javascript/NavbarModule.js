/*global gmm */
if (!this.gmm || typeof this.gmm !== 'object') {
    this.gmm = {};
}
(function () {
    'use strict';
    gmm.Viewer.module('NavbarModule', function (Mod, Viewer, Backbone, Marionette, $, _) {

        //==================================
        //initializer called on Viewer.start(options)
        //==================================
        Mod.addInitializer(function (options) {
            Mod.controller = new Controller({
                toolItems: options.toolItems,
                //we pass in the region from the app because it will be
                //converted into a Marionette.Region for us
                region: Viewer.toolsRegion
            });
        });


        //==================================
        //Controller for the NavbarModule
        //==================================
        var Controller = Backbone.Marionette.Controller.extend({
            initialize: function (options) {
                _.bindAll(this);
                this.region = options.region;
                //convert tools array to a collection
                this.collection = new ToolItemCollection(options.toolItems);
                //create the list view and pass in the collection
                this.view = new ToolListView({ collection: this.collection });
                //render it all once, now. Since the items don't change
                //while the app is running, we never need to re-render
                this.region.show(this.view);

                $('#current-item').on('click', function () {
                    Viewer.vent.trigger('Navbar:ToggleMenu');
                    Mod.controller.toggleIcon();                             
                });

                //hook up App events            
                Viewer.vent.on('Navbar:ChangeItemName', function (name) {
                    console.log('NavbarController caught Navbar:ChangeItemName');
                    //change the displayed value in the ui
                    $('#current-item-name').text(name);
                });     
                Viewer.vent.on('Navbar:ToggleIcon', this.toggleIcon,this)   
            },
            toggleIcon:function(){
                $('#menu-widget').toggleClass('rotated');
            }
        });


        //Model
        var ToolItemModel = Backbone.Model.extend({});
        //Collection
        var ToolItemCollection = Backbone.Collection.extend({
            model: ToolItemModel
        });

        var ToolItemView = Backbone.Marionette.ItemView.extend({
            model: ToolItemModel,
            template: '#tool-template',
            tagName: 'li', 
            events: {'click': 'itemClicked'},
            itemClicked: function(){
                console.log('ToolItemClicked: '+ this.model.get('name'));
                Viewer.vent.trigger(this.model.get('eventToRaise'), this);
            
            }      
        });

        var ToolListView = Backbone.Marionette.CollectionView.extend({
          itemView: ToolItemView,
          tagName: 'ul'
        });

    });
})();