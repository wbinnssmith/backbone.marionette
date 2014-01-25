describe("Behaviors", function(){
  describe("behavior lookup", function() {
    it("should throw if behavior lookup is not defined", function() {
      expect(Marionette.Behaviors.behaviorsLookup).toThrow();
    });
  });

  describe("behavior parsing", function() {
    var V, Obj;

    beforeEach(function() {
      Obj = {
        ToolTip: sinon.spy()
      };

      V = Marionette.ItemView.extend({
        behaviors: [
          {
            ToolTip: {
              position: "top"
            }

          }
        ]
      });

      Marionette.Behaviors.behaviorsLookup = Obj;
    });

    it("should instantiate the tooltip behavior", function() {
      new V;
      expect(Obj.ToolTip).toHaveBeenCalled();
    });
  });

  describe("behavior initialize", function() {
    var Behavior = Marionette.Behavior.extend({
      initialize: sinon.spy()
    });

    it("should call initialize when a behavior is created", function() {
      var b = new Behavior;

      expect(b.initialize).toHaveBeenCalled();
    });
  });

  describe("behavior events", function() {
    var V, Obj, spy, spy2;

    beforeEach(function() {
      spy = sinon.spy();
      spy2 = sinon.spy();

      Obj = {
        ToolTip: Marionette.Behavior.extend({
          events: {
            "click": spy
          }
        }),
        DropDown: Marionette.Behavior.extend({
          events: {
            "click": spy2
          }
        })
      };

      V = Marionette.ItemView.extend({
        template: _.template(""),
        behaviors: [
          {
            ToolTip: {}
          },
          {
            DropDown: {}
          }
        ]
      });

      Marionette.Behaviors.behaviorsLookup = Obj;
    });

    it("should call the behaviors event", function() {
      v = new V();
      v.render();
      v.delegateEvents();
      v.$el.click();

      expect(spy).toHaveBeenCalled();
      expect(spy2).toHaveBeenCalled();
    });
  });

  describe("behavior UI", function() {
    var V, hold, spy;

    beforeEach(function() {
      hold = {};
      spy = new sinon.spy();
      hold.test = Marionette.Behavior.extend({
        ui: {
          'doge': '.doge'
        },
        onRender: function() {
          spy(this.ui.doge.length);
        }
      });

      Marionette.Behaviors.behaviorsLookup = hold;

      V = Marionette.ItemView.extend({
        template: _.template('<div class="doge"></div>'),
        behaviors: [
          {
            test: {}
          }
        ]
      });
    });

    it("should set the behavior UI element", function() {
      v = new V;
      v.render();
      expect(spy).toHaveBeenCalled(1);
    });
  });

  describe("behavior model events", function() {
    var spy, V, hold, m;
    beforeEach(function() {
      spy = sinon.spy();
      hold = {}
      hold.test = Marionette.Behavior.extend({
        modelEvents: {
          change: spy
        },
        collectionEvents: {
          reset: spy
        }
      });

      CV = Marionette.CollectionView.extend({
        behaviors: [
          {
            test: {}
          }
        ]
      });

      V = Marionette.ItemView.extend({
        behaviors: [
          {
            test: {}
          }
        ]
      });

      m = new Backbone.Model({
        name: "tom"
      });

      c = new Backbone.Collection([])

      Marionette.Behaviors.behaviorsLookup = hold;
    });

    it ("should proxy model events", function() {
      v = new V({
        model: m
      });

      v.delegateEvents();

      m.set("name", "doge");

      expect(spy).toHaveBeenCalled();
    });

    it ("should proxy collection events", function() {
      v = new CV({
        collection: c
      });

      v.delegateEvents();

      c.reset();

      expect(spy).toHaveBeenCalled();
    });

  });

  describe("behavior trigger calls", function() {
    var spy, V, hold;
    beforeEach(function() {
      spy = sinon.spy();
      hold = {}
      hold.testB = Marionette.Behavior.extend({
        onRender: function(){
          spy();
        }
      });

      V = Marionette.View.extend({
        behaviors: [
          {
            testB: {}
          }
        ]
      });

      Marionette.Behaviors.behaviorsLookup = hold;
    })

    it ("should call onRender when a view is rendered", function() {
      var v = new V;
      v.triggerMethod("render");
      expect(spy).toHaveBeenCalled();
    });
  });
});
