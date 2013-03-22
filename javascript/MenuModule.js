/*global gmm */
if (!this.gmm || typeof this.gmm !== 'object') {
    this.gmm = {};
}
(function () {
    'use strict';
    gmm.Viewer.module('MenuModule', function (Mod, Viewer, Backbone, Marionette, $, _) {

        //==================================
        //initializer called on Viewer.start(options)
        //==================================
        Mod.addInitializer(function (options) {
            Mod.controller = new Controller({
                menuItems: options.menuItems,
                region: Viewer.menuRegion
            });
        });

        //==================================
        //Controller for the MenuModule
        //==================================
        var Controller = Backbone.Marionette.Controller.extend({
            initialize: function (options) {
                _.bindAll(this);
                this.region = options.region;
                console.log('MenuModule:Controller:initialize');
                //convert features array to a collection
                this.collection = new MenuItemCollection(options.menuItems);
                //render it all once, now. Since the items don't change
                //while the app is running, we never need to re-render
                this.region.show(new MenuListView({ collection: this.collection }));
                
                //Hook up App events            
                //The Navbar has the responsibility for everything in the 
                //top navbar - including the click event that causes the menu
                //to appear. The Menu Module just listens for the event
                //and takes action
                Viewer.vent.on('Navbar:ToggleMenu', this.toggleMenu,this);
            },

            toggleMenu:function(){
                //removed a bunch of direct jQuery dom manipulation
                //and replaced with this.region.$el 
                var itemEl = this.region.$el;
                if(itemEl.is(':visible')){
                    //hide 
                    Viewer.vent.trigger('Map:ShowControls');
                    Viewer.vent.trigger('Navbar:ToggleIcon');
                    itemEl.slideUp();
                }else{
                    //show
                    itemEl.slideDown();
                    Viewer.vent.trigger('Map:HideControls');
                }
            }
        });


        //Model
        var MenuItemModel = Backbone.Model.extend({});
        //Collection
        var MenuItemCollection = Backbone.Collection.extend({
            model: MenuItemModel
        });

        var MenuItemView = Backbone.Marionette.ItemView.extend({
            model: MenuItemModel,
            template: '#menu-list-item-template',
            tagName: 'li', 
            events: {'click': 'itemClicked'},
            itemClicked: function(){
                console.log('ToolItemClicked: '+ this.model.get('name'));
                Viewer.vent.trigger(this.model.get('eventToRaise'), this);
                //hide the menu
                Mod.controller.toggleMenu();
            }      
        });

        var MenuListView = Backbone.Marionette.CollectionView.extend({
          itemView: MenuItemView,
          tagName: 'ul'
        });
    });
})();