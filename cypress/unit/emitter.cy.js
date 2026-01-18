import { Dropzone } from "../../src/dropzone.js";

describe("Emitter", function () {
  let emitter = null;

  beforeEach(function () {
    emitter = new Dropzone.prototype.Emitter();
  });

  it(".on() should return the object itself", function () {
    expect(emitter.on("test", function () {})).to.equal(emitter);
  });

  it(".on() should properly register listeners", function () {
    expect(emitter._callbacks === undefined).to.be.true;

    const callback = function () {};
    const callback2 = function () {};

    emitter.on("test", callback);
    emitter.on("test", callback2);
    emitter.on("test2", callback);

    expect(emitter._callbacks.test.length).to.equal(2);
    expect(emitter._callbacks.test[0]).to.equal(callback);
    expect(emitter._callbacks.test[1]).to.equal(callback2);
    expect(emitter._callbacks.test2.length).to.equal(1);
    expect(emitter._callbacks.test2[0]).to.equal(callback);
  });

  it(".emit() should return the object itself", function () {
    expect(emitter.emit("test")).to.equal(emitter);
  });

  it(".emit() should properly invoke all registered callbacks with arguments", function () {
    let callCount1 = 0;
    let callCount12 = 0;
    let callCount2 = 0;

    const callback1 = function (var1, var2) {
      callCount1++;
      expect(var1).to.equal("callback1 var1");
      expect(var2).to.equal("callback1 var2");
    };

    const callback12 = function (var1, var2) {
      callCount12++;
      expect(var1).to.equal("callback1 var1");
      expect(var2).to.equal("callback1 var2");
    };

    const callback2 = function (var1, var2) {
      callCount2++;
      expect(var1).to.equal("callback2 var1");
      expect(var2).to.equal("callback2 var2");
    };

    emitter.on("test1", callback1);
    emitter.on("test1", callback12);
    emitter.on("test2", callback2);

    expect(callCount1).to.equal(0);
    expect(callCount12).to.equal(0);
    expect(callCount2).to.equal(0);

    emitter.emit("test1", "callback1 var1", "callback1 var2");

    expect(callCount1).to.equal(1);
    expect(callCount12).to.equal(1);
    expect(callCount2).to.equal(0);

    emitter.emit("test2", "callback2 var1", "callback2 var2");

    expect(callCount1).to.equal(1);
    expect(callCount12).to.equal(1);
    expect(callCount2).to.equal(1);

    emitter.emit("test1", "callback1 var1", "callback1 var2");

    expect(callCount1).to.equal(2);
    expect(callCount12).to.equal(2);
    expect(callCount2).to.equal(1);
  });

  describe(".off()", function () {
    const callback1 = function () {};
    const callback2 = function () {};
    const callback3 = function () {};
    const callback4 = function () {};

    beforeEach(function () {
      emitter._callbacks = {
        test1: [callback1, callback2],
        test2: [callback3],
        test3: [callback1, callback4],
        test4: [],
      };
    });

    it("should work without any listeners", function () {
      emitter._callbacks = undefined;
      const emt = emitter.off();
      expect(emitter._callbacks).to.deep.equal({});
      expect(emt).to.equal(emitter);
    });

    it("should properly remove all event listeners", function () {
      const emt = emitter.off();
      expect(emitter._callbacks).to.deep.equal({});
      expect(emt).to.equal(emitter);
    });

    it("should properly remove all event listeners for specific event", function () {
      emitter.off("test1");
      expect(emitter._callbacks["test1"] === undefined).to.be.true;
      expect(emitter._callbacks["test2"].length).to.equal(1);
      expect(emitter._callbacks["test3"].length).to.equal(2);

      const emt = emitter.off("test2");
      expect(emitter._callbacks["test2"] === undefined).to.be.true;
      expect(emt).to.equal(emitter);
    });

    it("should properly remove specific event listener", function () {
      emitter.off("test1", callback1);
      expect(emitter._callbacks["test1"].length).to.equal(1);
      expect(emitter._callbacks["test1"][0]).to.equal(callback2);

      expect(emitter._callbacks["test3"].length).to.equal(2);

      const emt = emitter.off("test3", callback4);
      expect(emitter._callbacks["test3"].length).to.equal(1);
      expect(emitter._callbacks["test3"][0]).to.equal(callback1);
      expect(emt).to.equal(emitter);
    });
  });
});
