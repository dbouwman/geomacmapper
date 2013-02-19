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
                menuItems: options.menuItems
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
                this.view.render();

                //hook up App events            
                Viewer.vent.on('Menu:ChangeViewName', function (name) {
                    console.log('MenuController caught Menu:ChangeViewName');
                    //change the displayed value in the ui
                    $('#current-item-name').text(name);
                });

                //hook up events to the Menu controls
                //and simply send events out for other things to react to
                $('#current-item').on('click', function () {
                    if ($('#menu-container').is(':visible')) {
                        //hide 
                        Viewer.vent.trigger('Map:ShowControls');
                        $('#menu-container').slideUp();
                    } else {
                        //show                         
                        $('#menu-container').slideDown();
                        Viewer.vent.trigger('Map:HideControls');
                    }                                   
                });

                //Toolbar Stuff just raise events that 
                //other modules will respond to
                //maybe move this to it's own module
                //that is just concerned with the navbar?
                $('#stats-button').on('click', function () {
                    Viewer.vent.trigger('View:Stats');
                });
                $('#layer-list-button').on('click', function () {
                    Viewer.vent.trigger('View:LayerList');
                });
                $('#search-button').on('click', function () {
                    Viewer.vent.trigger('View:Search');
                });
            }
        });


        //Model
        var MenuItemModel = Backbone.Model.extend({});
        //Collection
        var MenuItemCollection = Backbone.Collection.extend({
            model: MenuItemModel
        });

        //Simple Backbone view here - no need for parent/child views
        //TODO: Change to a Marionette ItemView
        var MenuListView = Backbone.View.extend({
            el: '#menu-item-list-container',            
            initialize: function (options) {
                _.bindAll();
                this.collection = options.collection;
            },

            render: function () {
                //loop over the models in the collection
                console.log('Starting Menu Rendering...');
                _.each(this.collection.models, function (model) {
                    console.log('   rendering...' + model.get('name'));
                    //cook the view                 
                    var vw = new MenuListItemView({ model: model });
                    //if there were a lot of these, it would be much
                    //better to push them into an array THEN
                    //call .append(theArray) all at once
                    this.$el.append(vw.render().el);
                }, this);
                console.log('Done Menu Rendering...');
                return this;
            }

        });

        var MenuListItemView = Backbone.View.extend({
            initialize: function (options) {
                _.bindAll();
                //set the template in initialize so we know the DOM is ready
                this.template = _.template($('#menu-list-item').html());
            },
            events: { 'click': 'itemClicked' },
            render: function () {
                this.$el.append(this.template(this.model.toJSON()));
                return this;
            },
            itemClicked: function () {
                console.log('Menu Item selected ' + this.model.get('name'));
                //update the text in the current-item-name span
                $('#current-item-name').text(this.model.get('name'));
                //raise and event and the related Module will catch it                               
                Viewer.vent.trigger(this.model.get('eventToRaise'), this);
                //re-show the map controls                
                Viewer.vent.trigger('Map:ShowControls');
                //hide the feature list
                $('#menu-container').slideUp();
            }

        });

    });
})();