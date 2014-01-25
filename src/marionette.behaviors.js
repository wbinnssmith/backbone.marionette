Marionette.Behaviors = (function(Marionette, _){
  function Behaviors(view){
    // lookup view behaviors from behaviors array
    this.behaviors = Behaviors.parseBehaviors(view, view.behaviors);

    var bindUIElements    = view.bindUIElements;
    var unbindUIElements  = view.unbindUIElements;

    var triggerMethod     = view.triggerMethod;
    var undelegateEvents  = view.undelegateEvents;
    var delegateEvents    = view.delegateEvents;

    var _this = this;

    view.behaviorEvents = function() {
      var behaviors = {};

      // mix down all of the behaviors events into
      // a single hash of events
      _.each(_this.behaviors, function(b, i) {
        var behaviorEvents = _.result(b, 'events') || {};
        var _events = {};

        _.each(_.keys(behaviorEvents), function(key) {
          // append white-space at the end of each key
          // to prevent behavior key collisions
          //
          // this is relying on the fact that
          // "click .foo" === "click .foo "
          // from within the backbone event context
          _events[key + (new Array(i+1)).join(" ")] = behaviorEvents[key];
        });

        behaviors = _.extend(behaviors, _events);
      });

      return behaviors;
    };

    view.bindUIElements = function(){
      bindUIElements.apply(view);

      _.each(_this.behaviors, function(b) {
        bindUIElements.call(b);
      });
    };

    view.unbindUIElements = function(){
      unbindUIElements.apply(view);

      _.each(_this.behaviors, function(b) {
        unbindUIElements.apply(b);
      });
    };

    view.triggerMethod = function(){
      var args = arguments;
      // call the views trigger method
      triggerMethod.apply(view, args);

      // loop through each behavior and trigger methods
      _.each(_this.behaviors, function(b){
        // call triggerMethod on each behavior
        // to proxy through any triggerMethod
        triggerMethod.apply(b, args);
      });
    };

    view.delegateEvents = function() {
      delegateEvents.apply(view, arguments);

      _.each(_this.behaviors, function(b){
        Marionette.bindEntityEvents(view, view.model, Marionette.getOption(b, "modelEvents"));
        Marionette.bindEntityEvents(view, view.collection, Marionette.getOption(b, "collectionEvents"));
      });
    };

    view.undelegateEvents = function(){
      undelegateEvents.apply(view, arguments);

      _.each(_this.behaviors, function(b){
        Marionette.unbindEntityEvents(view, view.model, Marionette.getOption(b, "modelEvents"));
        Marionette.unbindEntityEvents(view, view.collection, Marionette.getOption(b, "collectionEvents"));
      });
    };
  }

  // Behavior class level method definitions
  _.extend(Behaviors, {
    // placeholder method to be extended by the user
    // should define the object that stores the behaviors
    // i.e.
    //
    // Marionette.Behaviors.behaviorsLookup: function() {
    //   return App.Behaviors
    // }
    behaviorsLookup: function(){
      throw new Error("You must define where your behaviors are stored. See http://www.marionette.com/using-behaviors");
    },

    parseBehaviors: function(view, behaviors){
      return _.map(behaviors, function(v){
        var key     = _.keys(v)[0];
        var options = _.values(v)[0];
        return new (_.result(Behaviors, "behaviorsLookup")[key])(options, view);
      });
    }
  });

  return Behaviors;

})(Marionette, _);
