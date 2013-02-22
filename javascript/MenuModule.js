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
                _.bindAll();
                
                console.log('MenuModule:Controller:initialize');
                //convert features array to a collection
                this.collection = new MenuItemCollection(options.menuItems);
                //create the menu list view and pass in the collection
                this.view = new MenuListView({ collection: this.collection });
                //render it all once, now. Since the items don't change
                //while the app is running, we never need to re-render
                //this.view.render();
                options.region.show(this.view);
                

                //hook up App events            
                Viewer.vent.on('Menu:ChangeViewName', function (name) {
                    console.log('MenuController caught Menu:ChangeViewName');
                    //change the displayed value in the ui
                    $('#current-item-name').text(name);
                });

                //The Navbar has the responsibility for everything in the 
                //top navbar - including the click event that causes the menu
                //to appear. The Menu Module just listens for the event
                //and takes action
                Viewer.vent.on('Navbar:ToggleMenu', function () {
                    if ($('#menu-region').is(':visible')) {
                        //hide 
                        Viewer.vent.trigger('Map:ShowControls');
                        $('#menu-region').slideUp();
                    } else {
                        //show                         
                        $('#menu-region').slideDown();
                        Viewer.vent.trigger('Map:HideControls');
                    }                                   
                });
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
                $('#menu-region').slideUp();
            }      
        });

        var MenuListView = Backbone.Marionette.CollectionView.extend({
          itemView: MenuItemView,
          tagName: 'ul'
        });
    });
})();