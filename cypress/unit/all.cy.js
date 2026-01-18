import { Dropzone } from "../../src/dropzone.js";

describe("Dropzone", function () {
  let getMockFile = (
    type = "text/html",
    filename = "test file name",
    contents = ["file contents"],
  ) => {
    let file = new File(contents, filename, { type: type });
    file.status = Dropzone.ADDED;
    file.accepted = true;
    file.upload = {
      filename: filename,
    };
    return file;
  };

  describe("constructor()", function () {
    let dropzone = null;

    afterEach(function () {
      if (dropzone != null) {
        return dropzone.destroy();
      }
    });

    it("should throw an exception if the element is invalid", () =>
      expect(() => (dropzone = new Dropzone("#invalid-element"))).to.throw(
        "Invalid dropzone element: not an instance of HTMLElement.",
      ));

    it("should throw an exception if assigned twice to the same element", function () {
      let element = document.createElement("div");
      dropzone = new Dropzone(element, { url: "url" });
      return expect(() => new Dropzone(element, { url: "url" })).to.throw(
        "Dropzone already attached.",
      );
    });

    it("should set itself as element.dropzone", function () {
      let element = document.createElement("div");
      dropzone = new Dropzone(element, { url: "url" });
      return expect(element.dropzone).to.equal(dropzone);
    });

    it("should add itself to Dropzone.instances", function () {
      let element = document.createElement("div");
      dropzone = new Dropzone(element, { url: "url" });
      return expect(Dropzone.instances[Dropzone.instances.length - 1]).to.equal(
        dropzone,
      );
    });

    it("should use the action attribute not the element with the name action", function () {
      let element = Dropzone.createElement(
        '<form action="real-action"><input type="hidden" name="action" value="wrong-action" /></form>',
      );
      dropzone = new Dropzone(element);
      return expect(dropzone.options.url).to.equal("real-action");
    });

    return describe("options", function () {
      let element = null;
      let element2 = null;
      beforeEach(function () {
        element = document.createElement("div");
        element.id = "test-element";
        element2 = document.createElement("div");
        element2.id = "test-element2";
        return (Dropzone.options.testElement = {
          url: "/some/url",
          parallelUploads: 10,
        });
      });
      afterEach(() => delete Dropzone.options.testElement);

      it("should take the options set in Dropzone.options", function () {
        dropzone = new Dropzone(element);
        expect(dropzone.options.url).to.equal("/some/url");
        return expect(dropzone.options.parallelUploads).to.equal(10);
      });

      it("should prefer passed options over Dropzone.options", function () {
        dropzone = new Dropzone(element, { url: "/some/other/url" });
        return expect(dropzone.options.url).to.equal("/some/other/url");
      });

      it("should take the default options if nothing set in Dropzone.options", function () {
        dropzone = new Dropzone(element2, { url: "/some/url" });
        return expect(dropzone.options.parallelUploads).to.equal(2);
      });

      it("should call the fallback function if forceFallback == true", () => {
        const fallback = Cypress.sinon.spy();

        dropzone = new Dropzone(element, {
          url: "/some/other/url",
          forceFallback: true,
          fallback,
        });

        expect(fallback).to.have.been.calledOnce;
      });

      return describe("options.clickable", function () {
        let clickableElement = null;
        dropzone = null;
        beforeEach(function () {
          clickableElement = document.createElement("div");
          clickableElement.className = "some-clickable";
          return document.body.appendChild(clickableElement);
        });
        afterEach(function () {
          document.body.removeChild(clickableElement);
          if (dropzone != null) {
            return dropzone.destroy;
          }
        });

        it("should use the default element if clickable == true", function () {
          dropzone = new Dropzone(element, { clickable: true });
          expect(dropzone.clickableElements).to.deep.equal([dropzone.element]);
        });
        it("should lookup the element if clickable is a CSS selector", function () {
          dropzone = new Dropzone(element, { clickable: ".some-clickable" });
          expect(dropzone.clickableElements).to.deep.equal([clickableElement]);
        });
        it("should simply use the provided element", function () {
          dropzone = new Dropzone(element, { clickable: clickableElement });
          expect(dropzone.clickableElements).to.deep.equal([clickableElement]);
        });
        it("should accept multiple clickable elements", function () {
          dropzone = new Dropzone(element, {
            clickable: [document.body, ".some-clickable"],
          });
          expect(dropzone.clickableElements).to.deep.equal([
            document.body,
            clickableElement,
          ]);
        });
        it("should throw an exception if the element is invalid", () =>
          expect(
            () =>
              (dropzone = new Dropzone(element, {
                clickable: ".some-invalid-clickable",
              })),
          ).to.throw(
            "Invalid `clickable` option provided. Please provide a CSS selector, a plain HTML element or a list of those.",
          ));
      });
    });
  });

  describe("init()", function () {
    describe("clickable", function () {
      let dropzones = {
        "using acceptedFiles": new Dropzone(
          Dropzone.createElement('<form action="/"></form>'),
          { clickable: true, acceptedFiles: "audio/*,video/*" },
        ),
      };

      it("should not add an accept attribute if no acceptParameter", function () {
        let dropzone = new Dropzone(
          Dropzone.createElement('<form action="/"></form>'),
          { clickable: true, acceptParameter: null, acceptedFiles: null },
        );
        return expect(dropzone.hiddenFileInput.hasAttribute("accept")).to.be
          .false;
      });

      return (() => {
        let result = [];
        for (let name in dropzones) {
          var dropzone = dropzones[name];
          result.push(
            describe(name, () =>
              (function (dropzone) {
                it("should create a hidden file input if clickable", function () {
                  expect(dropzone.hiddenFileInput).to.be.ok;
                  expect(dropzone.hiddenFileInput.tagName).to.equal("INPUT");
                });

                it("should have a tabindex of -1", function () {
                  expect(dropzone.hiddenFileInput.tabIndex).to.equal(-1);
                });

                it("should use the acceptParameter", () =>
                  expect(
                    dropzone.hiddenFileInput.getAttribute("accept"),
                  ).to.equal("audio/*,video/*"));

                it("should create a new input element when something is selected to reset the input field", () =>
                  (() => {
                    let result1 = [];
                    for (let i = 0; i <= 3; i++) {
                      let { hiddenFileInput } = dropzone;
                      let event = document.createEvent("HTMLEvents");
                      event.initEvent("change", true, true);
                      hiddenFileInput.dispatchEvent(event);
                      expect(dropzone.hiddenFileInput).to.not.equal(
                        hiddenFileInput,
                      );
                      result1.push(
                        expect(
                          Dropzone.elementInside(hiddenFileInput, document),
                        ).to.not.be.ok,
                      );
                    }
                    return result1;
                  })());
              })(dropzone),
            ),
          );
        }
        return result;
      })();
    });

    it("should create a .dz-message element", function () {
      let element = Dropzone.createElement(
        '<form class="dropzone" action="/"></form>',
      );
      let dropzone = new Dropzone(element, {
        clickable: true,
        acceptParameter: null,
      });
      return expect(element.querySelector(".dz-message")).to.be.instanceof(
        Element,
      );
    });

    it("should not create a .dz-message element if there already is one", function () {
      let element = Dropzone.createElement(
        '<form class="dropzone" action="/"></form>',
      );
      let msg = Dropzone.createElement('<div class="dz-message">TEST</div>');
      element.appendChild(msg);

      let dropzone = new Dropzone(element, {
        clickable: true,
        acceptParameter: null,
      });
      expect(element.querySelector(".dz-message")).to.equal(msg);

      return expect(element.querySelectorAll(".dz-message").length).to.equal(1);
    });
  });

  describe("options", function () {
    let element = null;
    let dropzone = null;

    beforeEach(function () {
      element = Dropzone.createElement("<div></div>");
      return (dropzone = new Dropzone(element, {
        maxFilesize: 4,
        url: "url",
        acceptedFiles: "audio/*,image/png",
        maxFiles: 3,
      }));
    });

    return describe("file specific", function () {
      let file = null;
      beforeEach(function () {
        file = {
          name: "test name",
          size: 2 * 1024 * 1024,
          width: 200,
          height: 100,
          upload: {
            filename: "test name",
          },
        };
        return dropzone.options.addedfile.call(dropzone, file);
      });

      describe(".addedFile()", () =>
        it("should properly create the previewElement", function () {
          expect(file.previewElement).to.be.instanceof(Element);

          expect(
            file.previewElement.querySelector("[data-dz-name]").innerHTML,
          ).to.equal("test name");
          expect(
            file.previewElement.querySelector("[data-dz-size]").innerHTML,
          ).to.equal("<strong>2.1</strong> MB");
        }));

      describe(".error()", function () {
        it("should properly insert the error", function () {
          dropzone.options.error.call(dropzone, file, "test message");

          return expect(
            file.previewElement.querySelector("[data-dz-errormessage]")
              .innerHTML,
          ).to.equal("test message");
        });

        it("should properly insert the error when provided with an object containing the error", function () {
          dropzone.options.error.call(dropzone, file, {
            error: "test message",
          });

          return expect(
            file.previewElement.querySelector("[data-dz-errormessage]")
              .innerHTML,
          ).to.equal("test message");
        });
      });

      describe(".thumbnail()", () =>
        it("should properly insert the error", function () {
          let transparentGif =
            "data:image/gif;base64,R0lGODlhAQABAIAAAP///wAAACH5BAEAAAAALAAAAAABAAEAAAICRAEAOw==";
          dropzone.options.thumbnail.call(dropzone, file, transparentGif);
          let thumbnail = file.previewElement.querySelector(
            "[data-dz-thumbnail]",
          );
          expect(thumbnail.src).to.deep.equal(transparentGif);
          return expect(thumbnail.alt).to.equal("test name");
        }));

      describe(".uploadprogress()", () =>
        it("should properly set the width", function () {
          dropzone.options.uploadprogress.call(dropzone, file, 0);
          expect(
            file.previewElement.querySelector("[data-dz-uploadprogress]").style
              .width,
          ).to.equal("0%");
          dropzone.options.uploadprogress.call(dropzone, file, 80);
          expect(
            file.previewElement.querySelector("[data-dz-uploadprogress]").style
              .width,
          ).to.equal("80%");
          dropzone.options.uploadprogress.call(dropzone, file, 90);
          expect(
            file.previewElement.querySelector("[data-dz-uploadprogress]").style
              .width,
          ).to.equal("90%");
          dropzone.options.uploadprogress.call(dropzone, file, 100);
          return expect(
            file.previewElement.querySelector("[data-dz-uploadprogress]").style
              .width,
          ).to.equal("100%");
        }));

      return describe(".resize()", function () {
        describe("with default thumbnail settings", function () {
          it("should properly return target dimensions for 'contain'", function () {
            let info = dropzone.options.resize.call(
              dropzone,
              file,
              120,
              120,
              "crop",
            );
            expect(info.trgWidth).to.equal(120);
            expect(info.trgHeight).to.equal(100);
            info = dropzone.options.resize.call(
              dropzone,
              file,
              100,
              100,
              "crop",
            );
            expect(info.trgWidth).to.equal(100);
            return expect(info.trgHeight).to.equal(100);
          });

          it("should properly return target dimensions for 'contain'", function () {
            let info = dropzone.options.resize.call(
              dropzone,
              file,
              120,
              120,
              "contain",
            );
            expect(info.trgWidth).to.equal(120);
            expect(info.trgHeight).to.equal(60);
            info = dropzone.options.resize.call(
              dropzone,
              file,
              100,
              100,
              "contain",
            );
            expect(info.trgWidth).to.equal(100);
            return expect(info.trgHeight).to.equal(50);
          });
        });

        return describe("with null thumbnail settings", function () {
          it("should properly return target dimensions for crop", function () {
            let testSettings = [
              [null, null],
              [null, 80],
              [150, null],
            ];

            for (let i = 0; i < testSettings.length; i++) {
              let setting = testSettings[i];
              let info = dropzone.options.resize.call(
                dropzone,
                file,
                setting[0],
                setting[1],
                "crop",
              );

              if (i === 0) {
                expect(info.trgWidth).to.equal(200);
                expect(info.trgHeight).to.equal(100);
              }

              if (i === 1) {
                expect(info.trgWidth).to.equal(160);
                expect(info.trgHeight).to.equal(80);
              }

              if (i === 2) {
                expect(info.trgWidth).to.equal(150);
                expect(info.trgHeight).to.equal(75);
              }
            }
          });

          it("should properly return target dimensions for contain", function () {
            let testSettings = [
              [null, 80],
              [150, null],
            ];

            for (let i = 0; i < testSettings.length; i++) {
              let setting = testSettings[i];
              let info = dropzone.options.resize.call(
                dropzone,
                file,
                setting[0],
                setting[1],
                "contain",
              );

              if (i === 0) {
                expect(info.trgWidth).to.equal(160);
                expect(info.trgHeight).to.equal(80);
              }

              if (i === 1) {
                expect(info.trgWidth).to.equal(150);
                expect(info.trgHeight).to.equal(75);
              }
            }
          });
        });
      });
    });
  });

  describe("instance", function () {
    let element = null;
    let dropzone = null;
    beforeEach(function () {
      element = Dropzone.createElement("<div></div>");
      document.body.appendChild(element);
      return (dropzone = new Dropzone(element, {
        maxFilesize: 4,
        maxFiles: 100,
        url: "url",
        acceptedFiles: "audio/*,image/png",
        uploadprogress() {},
      }));
    });
    afterEach(function () {
      document.body.removeChild(element);
      dropzone.destroy();
    });

    describe(".accept()", function () {
      it("should pass if the filesize is OK", () =>
        dropzone.accept(
          { size: 2 * 1024 * 1024, type: "audio/mp3" },
          (err) => expect(err).to.be.undefined,
        ));

      it("shouldn't pass if the filesize is too big", () =>
        dropzone.accept({ size: 10 * 1024 * 1024, type: "audio/mp3" }, (err) =>
          expect(err).to.equal("File is too big (10MiB). Max filesize: 4MiB."),
        ));

      it("should properly accept files which mime types are listed in acceptedFiles", function () {
        dropzone.accept(
          { type: "audio/mp3" },
          (err) => expect(err).to.be.undefined,
        );
        dropzone.accept(
          { type: "image/png" },
          (err) => expect(err).to.be.undefined,
        );
        return dropzone.accept(
          { type: "audio/wav" },
          (err) => expect(err).to.be.undefined,
        );
      });

      it("should properly reject files when the mime type isn't listed in acceptedFiles", () =>
        dropzone.accept({ type: "image/jpeg" }, (err) =>
          expect(err).to.equal("You can't upload files of this type."),
        ));

      it("should fail if maxFiles has been exceeded and call the event maxfilesexceeded", function () {
        Cypress.sinon.stub(dropzone, "getAcceptedFiles");
        let file = { type: "audio/mp3" };

        dropzone.getAcceptedFiles.returns({ length: 99 });

        dropzone.options.dictMaxFilesExceeded =
          "You can only upload {{maxFiles}} files.";

        let called = false;
        dropzone.on("maxfilesexceeded", function (lfile) {
          expect(lfile).to.equal(file);
          return (called = true);
        });

        dropzone.accept(file, (err) => expect(err).to.be.undefined);
        expect(called).to.not.be.ok;

        dropzone.getAcceptedFiles.returns({ length: 100 });
        dropzone.accept(file, (err) =>
          expect(err).to.equal("You can only upload 100 files."),
        );
        expect(called).to.be.ok;

        return dropzone.getAcceptedFiles.restore();
      });

      it("should properly handle if maxFiles is 0", function () {
        let file = { type: "audio/mp3" };

        dropzone.options.maxFiles = 0;

        let called = false;
        dropzone.on("maxfilesexceeded", function (lfile) {
          expect(lfile).to.equal(file);
          return (called = true);
        });

        dropzone.accept(file, (err) =>
          expect(err).to.equal("You cannot upload any more files."),
        );
        return expect(called).to.be.ok;
      });
    });

    describe(".removeFile()", () =>
      it("should abort uploading if file is currently being uploaded", function () {
        cy.clock();

        const mockFile = getMockFile();

        // Important: Dropzone uses uploadFiles(), not uploadFile()
        Cypress.sinon.stub(dropzone, "uploadFiles").callsFake(() => {
          // do nothing: keep it "uploading" forever
        });

        dropzone.accept = (file, done) => done();

        Cypress.sinon.stub(dropzone, "cancelUpload");

        dropzone.addFile(mockFile);

        // Force processing so status becomes UPLOADING
        dropzone.processFile(mockFile);

        cy.tick(0).then(() => {
          expect(mockFile.status).to.equal(Dropzone.UPLOADING);
          expect(dropzone.getUploadingFiles()[0]).to.equal(mockFile);

          expect(dropzone.cancelUpload.callCount).to.equal(0);
          dropzone.removeFile(mockFile);
          expect(dropzone.cancelUpload.callCount).to.equal(1);
        });
      }));

    describe(".cancelUpload()", () => {
      it("should properly cancel upload if file currently uploading", function () {
        const mockFile = getMockFile();

        dropzone.accept = (file, done) => done();

        // Keep the upload from completing so status stays UPLOADING
        Cypress.sinon.stub(dropzone, "uploadFiles").callsFake(() => {});

        dropzone.addFile(mockFile);

        // Force it into UPLOADING deterministically
        dropzone.processFile(mockFile);

        expect(mockFile.status).to.equal(Dropzone.UPLOADING);
        expect(dropzone.getUploadingFiles()[0]).to.equal(mockFile);

        dropzone.cancelUpload(mockFile);

        expect(mockFile.status).to.equal(Dropzone.CANCELED);
        expect(dropzone.getUploadingFiles().length).to.equal(0);
        expect(dropzone.getQueuedFiles().length).to.equal(0);
      });

      it("should properly cancel the upload if file is not yet uploading", function () {
        let mockFile = getMockFile();

        dropzone.accept = (file, done) => done();

        // Making sure the file stays in the queue.
        dropzone.options.parallelUploads = 0;

        dropzone.addFile(mockFile);
        expect(mockFile.status).to.equal(Dropzone.QUEUED);
        expect(dropzone.getQueuedFiles()[0]).to.equal(mockFile);

        dropzone.cancelUpload(mockFile);
        expect(mockFile.status).to.equal(Dropzone.CANCELED);
        expect(dropzone.getQueuedFiles().length).to.equal(0);
        return expect(dropzone.getUploadingFiles().length).to.equal(0);
      });

      it("should call processQueue()", function (done) {
        let mockFile = getMockFile();

        dropzone.accept = (file, done) => done();

        // Making sure the file stays in the queue.
        dropzone.options.parallelUploads = 0;

        Cypress.sinon.spy(dropzone, "processQueue");

        dropzone.addFile(mockFile);
        return setTimeout(function () {
          expect(dropzone.processQueue.callCount).to.equal(1);

          dropzone.cancelUpload(mockFile);

          expect(dropzone.processQueue.callCount).to.equal(2);
          return done();
        }, 10);
      });

      it("should properly cancel all files with the same XHR if uploadMultiple is true", function () {
        const mock1 = getMockFile();
        const mock2 = getMockFile();
        const mock3 = getMockFile();

        dropzone.accept = (file, done) => done();

        dropzone.options.uploadMultiple = true;
        dropzone.options.parallelUploads = 3;

        // Keep the shared XHR from completing (prevents SUCCESS race)
        const sendStub = Cypress.sinon
          .stub(window.XMLHttpRequest.prototype, "send")
          .callsFake(() => {});

        // Observe that processing happened once
        Cypress.sinon.spy(dropzone, "processFiles");

        try {
          dropzone.addFile(mock1);
          dropzone.addFile(mock2);
          dropzone.addFile(mock3);

          // Start the batch upload deterministically
          dropzone.processQueue();

          expect(dropzone.processFiles.callCount).to.equal(1);

          // All files should share the same XHR in uploadMultiple mode
          expect(mock1.xhr).to.exist;
          expect(mock1.xhr === mock2.xhr && mock2.xhr === mock3.xhr).to.be.ok;

          Cypress.sinon.spy(mock1.xhr, "abort");

          dropzone.cancelUpload(mock1);

          expect(mock1.status).to.equal(Dropzone.CANCELED);
          expect(mock2.status).to.equal(Dropzone.CANCELED);
          expect(mock3.status).to.equal(Dropzone.CANCELED);

          // The shared XHR should only be aborted once
          expect(mock1.xhr.abort.callCount).to.equal(1);
        } finally {
          sendStub.restore();
        }
      });
    });

    describe(".disable()", () =>
      it("should properly cancel all pending uploads", function () {
        dropzone.accept = (file, done) => done();
        dropzone.options.parallelUploads = 1;

        Cypress.sinon.spy(dropzone, "cancelUpload");

        dropzone.addFile(getMockFile());
        dropzone.addFile(getMockFile());

        return setTimeout(function () {
          expect(dropzone.getUploadingFiles().length).to.equal(1);
          expect(dropzone.getQueuedFiles().length).to.equal(1);
          expect(dropzone.files.length).to.equal(2);

          expect(dropzone.cancelUpload.callCount).to.equal(0);

          dropzone.disable();

          // should cancel at least the uploading file (and may cancel queued too depending on impl)
          expect(dropzone.cancelUpload.callCount).to.be.greaterThan(0);

          expect(dropzone.getUploadingFiles().length).to.equal(0);
          expect(dropzone.getQueuedFiles().length).to.equal(0);
          expect(dropzone.files.length).to.equal(2);

          expect(dropzone.files[0].status).to.equal(Dropzone.CANCELED);
          expect(dropzone.files[1].status).to.equal(Dropzone.CANCELED);
        }, 10);
      }));

    describe(".destroy()", function () {
      it("should properly cancel all pending uploads and remove all file references", function () {
        dropzone.accept = (file, done) => done();
        dropzone.options.parallelUploads = 1;

        dropzone.addFile(getMockFile());
        dropzone.addFile(getMockFile());

        // Force queue processing so states are set before assertions
        dropzone.processQueue();

        expect(dropzone.getUploadingFiles().length).to.equal(1);
        expect(dropzone.getQueuedFiles().length).to.equal(1);
        expect(dropzone.files.length).to.equal(2);

        Cypress.sinon.spy(dropzone, "disable");

        dropzone.destroy();

        expect(dropzone.disable.callCount).to.equal(1);
        expect(element).to.not.have.property("dropzone");
      });
      /*
      it("should properly cancel all pending uploads and remove all file references", function (done) {
        dropzone.accept = (file, done) => done();

        dropzone.options.parallelUploads = 1;

        dropzone.addFile(getMockFile());
        dropzone.addFile(getMockFile());

        return setTimeout(function () {
          expect(dropzone.getUploadingFiles().length).to.equal(1);
          expect(dropzone.getQueuedFiles().length).to.equal(1);
          expect(dropzone.files.length).to.equal(2);

          Cypress.sinon.spy(dropzone, "disable");

          dropzone.destroy();

          expect(dropzone.disable.callCount).to.equal(1);
          expect(element).to.not.have.property("dropzone");
          return done();
        }, 10);
      });
      */

      it("should be able to create instance of dropzone on the same element after destroy", function () {
        dropzone.destroy();
        return expect(
          () =>
            new Dropzone(element, {
              maxFilesize: 4,
              url: "url",
              acceptedFiles: "audio/*,image/png",
              uploadprogress() {},
            }),
        ).to.not.throw(Error);
      });

      it("should remove itself from Dropzone.instances", function () {
        expect(Dropzone.instances.indexOf(dropzone) !== -1).to.be.ok;
        dropzone.destroy();
        return expect(Dropzone.instances.indexOf(dropzone) === -1).to.be.ok;
      });
    });

    describe(".filesize()", function () {
      it("should handle files with 0 size properly", () =>
        expect(dropzone.filesize(0)).to.equal("<strong>0</strong> b"));

      it("should convert to KiloBytes, etc..", function () {
        expect(dropzone.options.filesizeBase).to.equal(1000); // Just making sure the default config is correct

        expect(dropzone.filesize(2 * 1000 * 1000)).to.equal(
          "<strong>2</strong> MB",
        );
        expect(dropzone.filesize(2 * 1024 * 1024)).to.equal(
          "<strong>2.1</strong> MB",
        );

        expect(dropzone.filesize(2 * 1000 * 1000 * 1000)).to.equal(
          "<strong>2</strong> GB",
        );
        expect(dropzone.filesize(2 * 1024 * 1024 * 1024)).to.equal(
          "<strong>2.1</strong> GB",
        );

        expect(dropzone.filesize(2.5111 * 1000 * 1000 * 1000)).to.equal(
          "<strong>2.5</strong> GB",
        );
        expect(dropzone.filesize(1.1 * 1000)).to.equal(
          "<strong>1.1</strong> KB",
        );
        return expect(dropzone.filesize(999 * 1000)).to.equal(
          "<strong>1</strong> MB",
        );
      });

      it("should convert to KibiBytes, etc.. when the filesizeBase is changed to 1024", function () {
        dropzone.options.filesizeBase = 1024;

        expect(dropzone.filesize(2 * 1024 * 1024)).to.equal(
          "<strong>2</strong> MB",
        );
        return expect(dropzone.filesize(2 * 1000 * 1000)).to.equal(
          "<strong>1.9</strong> MB",
        );
      });
    });

    describe("._updateMaxFilesReachedClass()", function () {
      it("should properly add the dz-max-files-reached class", function () {
        dropzone.getAcceptedFiles = () => ({ length: 10 });
        dropzone.options.maxFiles = 10;
        expect(dropzone.element.classList.contains("dz-max-files-reached")).to
          .not.be.ok;
        dropzone._updateMaxFilesReachedClass();
        return expect(
          dropzone.element.classList.contains("dz-max-files-reached"),
        ).to.be.ok;
      });
      it("should fire the 'maxfilesreached' event when appropriate", function () {
        let spy = Cypress.sinon.spy();
        dropzone.on("maxfilesreached", () => spy());
        dropzone.getAcceptedFiles = () => ({ length: 9 });
        dropzone.options.maxFiles = 10;
        dropzone._updateMaxFilesReachedClass();
        expect(spy.notCalled).to.be.true;
        dropzone.getAcceptedFiles = () => ({ length: 10 });
        dropzone._updateMaxFilesReachedClass();
        expect(spy.called).to.be.true;
        dropzone.getAcceptedFiles = () => ({ length: 11 });
        dropzone._updateMaxFilesReachedClass();
        expect(spy.calledOnce).to.be.true;
      }); //ie, it has not been called again

      it("should properly remove the dz-max-files-reached class", function () {
        dropzone.getAcceptedFiles = () => ({ length: 10 });
        dropzone.options.maxFiles = 10;
        expect(dropzone.element.classList.contains("dz-max-files-reached")).to
          .not.be.ok;
        dropzone._updateMaxFilesReachedClass();
        expect(dropzone.element.classList.contains("dz-max-files-reached")).to
          .be.ok;
        dropzone.getAcceptedFiles = () => ({ length: 9 });
        dropzone._updateMaxFilesReachedClass();
        return expect(
          dropzone.element.classList.contains("dz-max-files-reached"),
        ).to.not.be.ok;
      });
    });

    return describe("events", () => {
      describe("progress updates", () =>
        it("should properly emit a totaluploadprogress event", function (done) {
          dropzone.files = [
            {
              size: 1990,
              accepted: true,
              status: Dropzone.UPLOADING,
              upload: {
                progress: 20,
                total: 2000, // The bytes to upload are higher than the file size
                bytesSent: 400,
              },
            },
            {
              size: 1990,
              accepted: true,
              status: Dropzone.UPLOADING,
              upload: {
                progress: 10,
                total: 2000, // The bytes to upload are higher than the file size
                bytesSent: 200,
              },
            },
          ];

          let _called = 0;

          dropzone.on("totaluploadprogress", function (progress) {
            expect(progress).to.equal(totalProgressExpectation);
            if (++_called === 3) {
              return done();
            }
          });

          var totalProgressExpectation = 15;
          dropzone.emit("uploadprogress", {});

          totalProgressExpectation = 97.5;
          dropzone.files[0].upload.bytesSent = 2000;
          dropzone.files[1].upload.bytesSent = 1900;
          // It shouldn't matter that progress is not properly updated since the total size
          // should be calculated from the bytes
          dropzone.emit("uploadprogress", {});

          totalProgressExpectation = 100;
          dropzone.files[0].upload.bytesSent = 2000;
          dropzone.files[1].upload.bytesSent = 2000;
          // It shouldn't matter that progress is not properly updated since the total size
          // should be calculated from the bytes
          dropzone.emit("uploadprogress", {});

          // Just so the afterEach hook doesn't try to cancel them.
          dropzone.files[0].status = Dropzone.CANCELED;
          return (dropzone.files[1].status = Dropzone.CANCELED);
        }));

      it("should emit DOM events", function (done) {
        let element = Dropzone.createElement(`<form action="/the/url">
  <input type="hidden" name="test" value="hidden" />
  <input type="checkbox" name="unchecked" value="1" />
  <input type="checkbox" name="checked" value="value1" checked="checked" />
  <input type="radio" value="radiovalue1" name="radio1" />
  <input type="radio" value="radiovalue2" name="radio1" checked="checked" />
  <select name="select"><option value="1">1</option><option value="2" selected>2</option></select>
</form>`);
        dropzone = new Dropzone(element, { url: "/the/url" });

        var domEventTriggered = false;
        element.addEventListener("dropzone:sending", function (evt) {
          domEventTriggered = true;
        });

        let mock1 = getMockFile();

        dropzone.addFile(mock1);

        return setTimeout(function () {
          expect(domEventTriggered).to.equal(true);
          done();
        }, 10);
      });
    });
  });

  describe("helper function", function () {
    let element = null;
    let dropzone = null;
    beforeEach(function () {
      element = Dropzone.createElement("<div></div>");
      return (dropzone = new Dropzone(element, { url: "url" }));
    });

    describe("getExistingFallback()", function () {
      it("should return undefined if no fallback", () =>
        expect(dropzone.getExistingFallback()).to.equal(undefined));

      it("should only return the fallback element if it contains exactly fallback", function () {
        element.appendChild(
          Dropzone.createElement('<form class="fallbacks"></form>'),
        );
        element.appendChild(
          Dropzone.createElement('<form class="sfallback"></form>'),
        );
        return expect(dropzone.getExistingFallback()).to.equal(undefined);
      });

      it("should return divs as fallback", function () {
        let fallback = Dropzone.createElement(
          '<form class=" abc fallback test "></form>',
        );
        element.appendChild(fallback);
        return expect(fallback).to.equal(dropzone.getExistingFallback());
      });
      it("should return forms as fallback", function () {
        let fallback = Dropzone.createElement(
          '<div class=" abc fallback test "></div>',
        );
        element.appendChild(fallback);
        return expect(fallback).to.equal(dropzone.getExistingFallback());
      });
    });

    describe("getFallbackForm()", function () {
      it("should use the paramName without [0] if uploadMultiple is false", function () {
        dropzone.options.uploadMultiple = false;
        dropzone.options.paramName = "myFile";
        let fallback = dropzone.getFallbackForm();
        let fileInput = fallback.querySelector("input[type=file]");
        return expect(fileInput.name).to.equal("myFile");
      });
      it("should properly add [0] to the file name if uploadMultiple is true", function () {
        dropzone.options.uploadMultiple = true;
        dropzone.options.paramName = "myFile";
        let fallback = dropzone.getFallbackForm();
        let fileInput = fallback.querySelector("input[type=file]");
        return expect(fileInput.name).to.equal("myFile[0]");
      });
    });

    describe("getAcceptedFiles() / getRejectedFiles()", function () {
      let mock2, mock3, mock4;
      let mock1 = (mock2 = mock3 = mock4 = null);
      beforeEach(function () {
        mock1 = getMockFile();
        mock2 = getMockFile();
        mock3 = getMockFile();
        mock4 = getMockFile();
        dropzone.options.accept = function (file, done) {
          if (file === mock1 || file === mock3) {
            return done();
          } else {
            return done("error");
          }
        };
        dropzone.addFile(mock1);
        dropzone.addFile(mock2);
        dropzone.addFile(mock3);
        return dropzone.addFile(mock4);
      });

      it("getAcceptedFiles() should only return accepted files", () =>
        expect(dropzone.getAcceptedFiles()).to.deep.equal([mock1, mock3]));
      it("getRejectedFiles() should only return rejected files", () =>
        expect(dropzone.getRejectedFiles()).to.deep.equal([mock2, mock4]));
    });

    describe("getQueuedFiles()", () =>
      it("should return all files with the status Dropzone.QUEUED", function () {
        let mock1 = getMockFile();
        let mock2 = getMockFile();
        let mock3 = getMockFile();
        let mock4 = getMockFile();

        dropzone.options.accept = (file, done) => (file.done = done);

        dropzone.addFile(mock1);
        dropzone.addFile(mock2);
        dropzone.addFile(mock3);
        dropzone.addFile(mock4);

        expect(dropzone.getQueuedFiles()).to.deep.equal([]);

        mock1.done();
        mock3.done();

        expect(dropzone.getQueuedFiles()).to.deep.equal([mock1, mock3]);
        expect(mock1.status).to.equal(Dropzone.QUEUED);
        expect(mock3.status).to.equal(Dropzone.QUEUED);
        expect(mock2.status).to.equal(Dropzone.ADDED);
        return expect(mock4.status).to.equal(Dropzone.ADDED);
      }));

    describe("getUploadingFiles()", () =>
      it("should return all files with the status Dropzone.UPLOADING", function () {
        const mock1 = getMockFile();
        const mock2 = getMockFile();
        const mock3 = getMockFile();
        const mock4 = getMockFile();

        dropzone.options.accept = (file, _done) => (file.done = _done);

        // Important: Dropzone uses uploadFiles(), keep uploads from completing
        Cypress.sinon.stub(dropzone, "uploadFiles").callsFake(() => {});

        dropzone.addFile(mock1);
        dropzone.addFile(mock2);
        dropzone.addFile(mock3);
        dropzone.addFile(mock4);

        expect(dropzone.getUploadingFiles()).to.deep.equal([]);

        // Accept two files
        mock1.done();
        mock3.done();

        // Force processing now that files are accepted
        dropzone.processQueue();

        expect(dropzone.getUploadingFiles()).to.deep.equal([mock1, mock3]);
        expect(mock1.status).to.equal(Dropzone.UPLOADING);
        expect(mock3.status).to.equal(Dropzone.UPLOADING);
        expect(mock2.status).to.equal(Dropzone.ADDED);
        expect(mock4.status).to.equal(Dropzone.ADDED);
      }));

    describe("getActiveFiles()", () =>
      it("should return all files with the status Dropzone.UPLOADING or Dropzone.QUEUED", function () {
        const mock1 = getMockFile();
        const mock2 = getMockFile();
        const mock3 = getMockFile();
        const mock4 = getMockFile();

        dropzone.options.accept = (file, _done) => (file.done = _done);

        // IMPORTANT: stub the method Dropzone actually uses
        Cypress.sinon.stub(dropzone, "uploadFiles").callsFake(() => {});

        dropzone.options.parallelUploads = 2;

        dropzone.addFile(mock1);
        dropzone.addFile(mock2);
        dropzone.addFile(mock3);
        dropzone.addFile(mock4);

        expect(dropzone.getActiveFiles()).to.deep.equal([]);

        // Accept 1,3,4 (leave 2 unaccepted)
        mock1.done();
        mock3.done();
        mock4.done();

        // Force queue processing now that files are accepted
        dropzone.processQueue();

        expect(dropzone.getActiveFiles()).to.deep.equal([mock1, mock3, mock4]);

        expect(mock1.status).to.equal(Dropzone.UPLOADING);
        expect(mock3.status).to.equal(Dropzone.UPLOADING);
        expect(mock2.status).to.equal(Dropzone.ADDED);
        expect(mock4.status).to.equal(Dropzone.QUEUED);
      }));

    return describe("getFilesWithStatus()", () =>
      it("should return all files with provided status", function () {
        let mock1 = getMockFile();
        let mock2 = getMockFile();
        let mock3 = getMockFile();
        let mock4 = getMockFile();

        dropzone.options.accept = (file, _done) => (file.done = _done);
        dropzone.uploadFile = function () {};

        dropzone.addFile(mock1);
        dropzone.addFile(mock2);
        dropzone.addFile(mock3);
        dropzone.addFile(mock4);

        expect(dropzone.getFilesWithStatus(Dropzone.ADDED)).to.deep.equal([
          mock1,
          mock2,
          mock3,
          mock4,
        ]);

        mock1.status = Dropzone.UPLOADING;
        mock3.status = Dropzone.QUEUED;
        mock4.status = Dropzone.QUEUED;

        expect(dropzone.getFilesWithStatus(Dropzone.ADDED)).to.deep.equal([
          mock2,
        ]);
        expect(dropzone.getFilesWithStatus(Dropzone.UPLOADING)).to.deep.equal([
          mock1,
        ]);
        return expect(
          dropzone.getFilesWithStatus(Dropzone.QUEUED),
        ).to.deep.equal([mock3, mock4]);
      }));
  });

  describe("file handling", function () {
    let mockFile = null;
    let dropzone = null;

    beforeEach(function () {
      mockFile = getMockFile();

      let element = Dropzone.createElement("<div></div>");
      dropzone = new Dropzone(element, { url: "/the/url" });
    });

    afterEach(() => dropzone.destroy());

    describe("addFile()", function () {
      it("should properly set the status of the file", function () {
        let doneFunction = null;

        dropzone.accept = (file, done) => (doneFunction = done);
        dropzone.processFile = function () {};
        dropzone.uploadFile = function () {};

        dropzone.addFile(mockFile);

        expect(mockFile.status).to.equal(Dropzone.ADDED);
        doneFunction();
        expect(mockFile.status).to.equal(Dropzone.QUEUED);

        mockFile = getMockFile();
        dropzone.addFile(mockFile);

        expect(mockFile.status).to.equal(Dropzone.ADDED);
        doneFunction("error");
        return expect(mockFile.status).to.equal(Dropzone.ERROR);
      });

      it("should properly set the status of the file if autoProcessQueue is false and not call processQueue", function (done) {
        let doneFunction = null;
        dropzone.options.autoProcessQueue = false;
        dropzone.accept = (file, done) => (doneFunction = done);
        dropzone.processFile = function () {};
        dropzone.uploadFile = function () {};

        dropzone.addFile(mockFile);
        Cypress.sinon.stub(dropzone, "processQueue");

        expect(mockFile.status).to.equal(Dropzone.ADDED);
        doneFunction();
        expect(mockFile.status).to.equal(Dropzone.QUEUED);
        expect(dropzone.processQueue.callCount).to.equal(0);
        return setTimeout(function () {
          expect(dropzone.processQueue.callCount).to.equal(0);
          return done();
        }, 10);
      });

      it("should not add the file to the queue if autoQueue is false", function () {
        let doneFunction = null;
        dropzone.options.autoQueue = false;
        dropzone.accept = (file, done) => (doneFunction = done);
        dropzone.processFile = function () {};
        dropzone.uploadFile = function () {};

        dropzone.addFile(mockFile);

        expect(mockFile.status).to.equal(Dropzone.ADDED);
        doneFunction();
        return expect(mockFile.status).to.equal(Dropzone.ADDED);
      });

      it("should create a remove link if configured to do so", function () {
        dropzone.options.addRemoveLinks = true;
        dropzone.processFile = function () {};
        dropzone.uploadFile = function () {};

        Cypress.sinon.stub(dropzone, "processQueue");
        dropzone.addFile(mockFile);

        return expect(
          dropzone.files[0].previewElement.querySelector(
            "a[data-dz-remove].dz-remove",
          ),
        ).to.be.ok;
      });

      it("should create a remove link with HTML if configured to do so", function () {
        dropzone.options.addRemoveLinks = true;
        dropzone.options.dictRemoveFile =
          '<i class="icon icon-class"></i> Remove';
        dropzone.processFile = function () {};
        dropzone.uploadFile = function () {};

        Cypress.sinon.stub(dropzone, "processQueue");
        dropzone.addFile(mockFile);

        return (
          expect(
            dropzone.files[0].previewElement.querySelector(
              "a[data-dz-remove].dz-remove",
            ),
          ).to.be.ok &&
          expect(
            dropzone.files[0].previewElement.querySelector(
              "a[data-dz-remove].dz-remove",
            ).innerHTML,
          ).to.equal('<i class="icon icon-class"></i> Remove')
        );
      });

      it("should attach an event handler to data-dz-remove links", function () {
        dropzone.options.previewTemplate = `\
<div class="dz-preview dz-file-preview">
  <div class="dz-details">
    <div class="dz-filename"><span data-dz-name></span></div>
    <div class="dz-size" data-dz-size></div>
    <img data-dz-thumbnail />
  </div>
  <div class="dz-progress"><span class="dz-upload" data-dz-uploadprogress></span></div>
  <div class="dz-success-mark"><span>✔</span></div>
  <div class="dz-error-mark"><span>✘</span></div>
  <div class="dz-error-message"><span data-dz-errormessage></span></div>
  <a class="link1" data-dz-remove></a>
  <a class="link2" data-dz-remove></a>
</div>\
`;

        Cypress.sinon.stub(dropzone, "processQueue");

        dropzone.addFile(mockFile);

        let file = dropzone.files[0];
        let removeLink1 = file.previewElement.querySelector(
          "a[data-dz-remove].link1",
        );
        let removeLink2 = file.previewElement.querySelector(
          "a[data-dz-remove].link2",
        );

        Cypress.sinon.stub(dropzone, "removeFile");

        let event = document.createEvent("HTMLEvents");
        event.initEvent("click", true, true);
        removeLink1.dispatchEvent(event);

        expect(dropzone.removeFile.callCount).to.equal(1);

        event = document.createEvent("HTMLEvents");
        event.initEvent("click", true, true);
        removeLink2.dispatchEvent(event);

        return expect(dropzone.removeFile.callCount).to.equal(2);
      });

      return describe("thumbnails", function () {
        it("should properly queue the thumbnail creation", function (done) {
          let ct_callback;
          let doneFunction;

          dropzone.accept = (file, done) => (doneFunction = done);
          dropzone.processFile = function () {};
          dropzone.uploadFile = function () {};

          let mock1 = getMockFile("image/jpg");
          let mock2 = getMockFile("image/jpg");
          let mock3 = getMockFile("image/jpg");

          let ct_file;
          dropzone.createThumbnail = function (
            file,
            thumbnailWidth,
            thumbnailHeight,
            resizeMethod,
            fixOrientation,
            callback,
          ) {
            ct_file = file;
            ct_callback = callback;
          };

          Cypress.sinon.spy(dropzone, "createThumbnail");

          dropzone.addFile(mock1);
          dropzone.addFile(mock2);
          dropzone.addFile(mock3);

          expect(dropzone.files.length).to.equal(3);
          return setTimeout(function () {
            expect(dropzone.createThumbnail.callCount).to.equal(1);
            expect(mock1).to.equal(ct_file);
            ct_callback();
            expect(dropzone.createThumbnail.callCount).to.equal(2);
            expect(mock2).to.equal(ct_file);
            ct_callback();
            expect(dropzone.createThumbnail.callCount).to.equal(3);
            expect(mock3).to.equal(ct_file);

            return done();
          }, 10);
        });

        return describe("when file is SVG", () =>
          it("should use the SVG image itself", function (done) {
            let createBlob = function (data, type) {
              try {
                return new Blob([data], { type });
              } catch (e) {
                let BlobBuilder =
                  window.BlobBuilder ||
                  window.WebKitBlobBuilder ||
                  window.MozBlobBuilder ||
                  window.MSBlobBuilder;
                let builder = new BlobBuilder();
                builder.append(data.buffer || data);
                return builder.getBlob(type);
              }
            };

            let blob = createBlob("foo", "image/svg+xml");

            return dropzone.createThumbnail(
              blob,
              dropzone.options.thumbnailWidth,
              dropzone.options.thumbnailHeight,
              "crop",
              false,
              function (dataURI, canvas) {
                let fileReader = new FileReader();
                fileReader.onload = function () {
                  expect(fileReader.result).to.equal(dataURI);
                  return done();
                };
                return fileReader.readAsDataURL(blob);
              },
            );
          }));
      });
    });

    describe("enqueueFile()", function () {
      it("should be wrapped by enqueueFiles()", function () {
        Cypress.sinon.stub(dropzone, "enqueueFile");

        let mock1 = getMockFile();
        let mock2 = getMockFile();
        let mock3 = getMockFile();

        dropzone.enqueueFiles([mock1, mock2, mock3]);

        expect(dropzone.enqueueFile.callCount).to.equal(3);
        expect(dropzone.enqueueFile.args[0][0]).to.equal(mock1);
        expect(dropzone.enqueueFile.args[1][0]).to.equal(mock2);
        return expect(dropzone.enqueueFile.args[2][0]).to.equal(mock3);
      });

      it("should fail if the file has already been processed", function () {
        mockFile.status = Dropzone.ERROR;
        expect(() => dropzone.enqueueFile(mockFile)).to.throw(
          "This file can't be queued because it has already been processed or was rejected.",
        );
        mockFile.status = Dropzone.COMPLETE;
        expect(() => dropzone.enqueueFile(mockFile)).to.throw(
          "This file can't be queued because it has already been processed or was rejected.",
        );
        mockFile.status = Dropzone.UPLOADING;
        return expect(() => dropzone.enqueueFile(mockFile)).to.throw(
          "This file can't be queued because it has already been processed or was rejected.",
        );
      });

      it("should set the status to QUEUED and call processQueue asynchronously if everything's ok", function (done) {
        mockFile.status = Dropzone.ADDED;
        Cypress.sinon.stub(dropzone, "processQueue");
        expect(dropzone.processQueue.callCount).to.equal(0);
        dropzone.enqueueFile(mockFile);
        expect(mockFile.status).to.equal(Dropzone.QUEUED);
        expect(dropzone.processQueue.callCount).to.equal(0);
        return setTimeout(function () {
          expect(dropzone.processQueue.callCount).to.equal(1);
          return done();
        }, 10);
      });
    });

    describe("uploadFiles()", function () {
      let xhr;
      let requests;
      beforeEach(function () {
        requests = [];
        xhr = Cypress.sinon.useFakeXMLHttpRequest();

        return (xhr.onCreate = (xhr) => requests.push(xhr));
      });

      afterEach(() => {
        if (xhr && typeof xhr.restore === "function") xhr.restore();
      });

      // Removed this test because multiple filenames can be transmitted now
      // it "should properly urlencode the filename for the headers"

      it("should be wrapped by uploadFile()", function () {
        Cypress.sinon.stub(dropzone, "uploadFiles");

        dropzone.uploadFile(mockFile);

        expect(dropzone.uploadFiles.callCount).to.equal(1);
        expect(dropzone.uploadFiles.calledWith([mockFile])).to.be.ok;
      });
      describe("with real XHR (cy.intercept)", function () {
        beforeEach(function () {
          // turn fake XHR off so Cypress can observe real requests
          xhr.restore();
        });
        it("should use url options if strings", function () {
          dropzone.accept = (file, done) => done();
          dropzone.options.autoProcessQueue = false;

          const method = String(
            dropzone.options.method || "post",
          ).toUpperCase();
          const urlPath = String(dropzone.options.url);

          const OriginalXHR = window.XMLHttpRequest;

          const openSpy = Cypress.sinon.spy(OriginalXHR.prototype, "open");
          const sendStub = Cypress.sinon
            .stub(OriginalXHR.prototype, "send")
            .callsFake(() => {});

          try {
            dropzone.addFile(mockFile);
            dropzone.processQueue();

            expect(openSpy.callCount).to.be.greaterThan(0);

            // XHR.open(method, url, ...)
            const [calledMethod, calledUrl] = openSpy.args[0];

            expect(String(calledMethod).toUpperCase()).to.equal(method);
            expect(String(calledUrl)).to.match(
              new RegExp(`${urlPath.replace(/^\/+/, "")}$`),
            );
          } finally {
            sendStub.restore();
            openSpy.restore();
          }
        });
        it("should call url options if functions", function () {
          const method = "PUT";
          const url = "/custom/upload/url";

          dropzone.accept = (file, done) => done();

          dropzone.options.method = Cypress.sinon.stub().callsFake((files) => {
            // Dropzone passes an array of files here in this codebase
            expect(files).to.deep.equal([mockFile]);
            return method;
          });

          dropzone.options.url = Cypress.sinon.stub().callsFake((files) => {
            expect(files).to.deep.equal([mockFile]);
            return url;
          });

          cy.intercept({ method, url: `**${url}` }, (req) => {
            req.reply({ statusCode: 200, body: "" });
          }).as("upload");

          dropzone.addFile(mockFile);
          dropzone.processFile(mockFile);

          cy.wait("@upload").then(() => {
            expect(dropzone.options.method.callCount).to.equal(1);
            expect(dropzone.options.url.callCount).to.equal(1);

            // If you prefer explicit Sinon asserts, these are fine too:
            Cypress.sinon.assert.calledWith(dropzone.options.method, [
              mockFile,
            ]);
            Cypress.sinon.assert.calledWith(dropzone.options.url, [mockFile]);
          });
        });

        it("should use the timeout option", function () {
          dropzone.accept = (file, done) => done();
          dropzone.options.timeout = 10000;

          const OriginalXHR = window.XMLHttpRequest;
          const openSpy = Cypress.sinon.spy(OriginalXHR.prototype, "open");

          const xhrInstances = [];
          function WrappedXHR() {
            const xhr = new OriginalXHR();
            xhrInstances.push(xhr);
            return xhr;
          }
          WrappedXHR.prototype = OriginalXHR.prototype;

          window.XMLHttpRequest = WrappedXHR;

          try {
            dropzone.addFile(mockFile);
            dropzone.processFile(mockFile);

            expect(openSpy.callCount).to.be.greaterThan(0);
            expect(xhrInstances.length).to.be.greaterThan(0);
            expect(xhrInstances[0].timeout).to.equal(10000);
          } finally {
            window.XMLHttpRequest = OriginalXHR;
            openSpy.restore();
          }
        });

        it("should properly handle if timeout is null", function () {
          dropzone.accept = (file, done) => done();
          dropzone.options.timeout = null;

          // Prevent racing ahead before we start the upload
          dropzone.options.autoProcessQueue = false;

          const OriginalXHR = window.XMLHttpRequest;
          const openSpy = Cypress.sinon.spy(OriginalXHR.prototype, "open");

          try {
            dropzone.addFile(mockFile);
            dropzone.processQueue();

            expect(openSpy.callCount).to.be.greaterThan(0);

            const xhr0 = openSpy.thisValues[0];
            expect(xhr0).to.exist;
            expect(xhr0.timeout).to.equal(0);
          } finally {
            openSpy.restore();
          }
        });

        it("should ignore the onreadystate callback if readyState != 4", function () {
          dropzone.accept = (file, done) => done();
          dropzone.options.autoProcessQueue = false;

          const OriginalXHR = window.XMLHttpRequest;

          let xhr;
          function WrappedXHR() {
            xhr = new OriginalXHR();
            return xhr;
          }
          WrappedXHR.prototype = OriginalXHR.prototype;

          window.XMLHttpRequest = WrappedXHR;

          try {
            dropzone.addFile(mockFile);
            dropzone.processQueue();

            expect(mockFile.status).to.equal(Dropzone.UPLOADING);

            // Prepare response-ish fields Dropzone might read
            xhr.status = 200;
            xhr.getResponseHeader = () => "text/plain";
            xhr.responseText = "ok";

            const trigger = () => {
              if (typeof xhr.onreadystatechange === "function")
                xhr.onreadystatechange();
              else if (typeof xhr.onload === "function") xhr.onload();
            };

            // Force readyState = 3 (non-final) and trigger callback
            Object.defineProperty(xhr, "readyState", {
              value: 3,
              configurable: true,
            });
            trigger();

            expect(mockFile.status).to.equal(Dropzone.UPLOADING);

            // Force readyState = 4 (final) and trigger callback
            Object.defineProperty(xhr, "readyState", {
              value: 4,
              configurable: true,
            });
            trigger();

            expect(mockFile.status).to.equal(Dropzone.SUCCESS);
          } finally {
            window.XMLHttpRequest = OriginalXHR;
          }
        });

        it("should emit error and errormultiple when response was not OK", function () {
          dropzone.options.uploadMultiple = true;

          // Make sure the file is accepted and upload doesn't start before intercept is set
          dropzone.accept = (file, done) => done();
          dropzone.options.autoProcessQueue = false;

          let error = false;
          let errormultiple = false;
          let complete = false;
          let completemultiple = false;

          dropzone.on("error", () => (error = true));
          dropzone.on("errormultiple", () => (errormultiple = true));
          dropzone.on("complete", () => (complete = true));
          dropzone.on("completemultiple", () => (completemultiple = true));

          // Force the upload request to fail
          const method = String(
            dropzone.options.method || "post",
          ).toUpperCase();
          const urlPath = String(dropzone.options.url);
          const urlGlob = urlPath.includes("://")
            ? urlPath
            : `**/${urlPath.replace(/^\/+/, "")}`;

          cy.intercept({ method, url: urlGlob }, (req) => {
            req.reply({
              statusCode: 400,
              headers: { "content-type": "text/plain" },
              body: "nope",
            });
          }).as("upload");

          dropzone.addFile(mockFile);
          dropzone.processQueue();

          cy.wait("@upload").then(() => {
            expect(mockFile.status).to.equal(Dropzone.ERROR);

            expect(
              true === error &&
                error === errormultiple &&
                errormultiple === complete &&
                complete === completemultiple,
            ).to.be.ok;
          });
        });
      });

      it("should include hidden files in the form and unchecked checkboxes and radiobuttons should be excluded", function (done) {
        let element = Dropzone.createElement(`<form action="/the/url">
  <input type="hidden" name="test" value="hidden" />
  <input type="checkbox" name="unchecked" value="1" />
  <input type="checkbox" name="checked" value="value1" checked="checked" />
  <input type="radio" value="radiovalue1" name="radio1" />
  <input type="radio" value="radiovalue2" name="radio1" checked="checked" />
  <select name="select"><option value="1">1</option><option value="2" selected>2</option></select>
</form>`);
        dropzone = new Dropzone(element, { url: "/the/url" });

        let formData = null;
        dropzone.on("sending", function (file, xhr, tformData) {
          formData = tformData;
          return Cypress.sinon.spy(tformData, "append");
        });

        let mock1 = getMockFile();

        dropzone.addFile(mock1);

        return setTimeout(function () {
          expect(formData.append.callCount).to.equal(5);

          expect(formData.append.args[0][0]).to.equal("test");
          expect(formData.append.args[0][1]).to.equal("hidden");

          expect(formData.append.args[1][0]).to.equal("checked");
          expect(formData.append.args[1][1]).to.equal("value1");

          expect(formData.append.args[2][0]).to.equal("radio1");
          expect(formData.append.args[2][1]).to.equal("radiovalue2");

          expect(formData.append.args[3][0]).to.equal("select");
          expect(formData.append.args[3][1]).to.equal("2");

          expect(formData.append.args[4][0]).to.equal("file");
          expect(formData.append.args[4][1]).to.equal(mock1);

          // formData.append.args[1][0]).to.eql "myName[]"
          return done();
        }, 10);
      });

      it("should all values of a select that has the multiple attribute", function (done) {
        let element = Dropzone.createElement(`<form action="/the/url">
  <select name="select" multiple>
    <option value="value1">1</option>
    <option value="value2" selected>2</option>
    <option value="value3">3</option>
    <option value="value4" selected>4</option>
  </select>
</form>`);
        dropzone = new Dropzone(element, { url: "/the/url" });

        let formData = null;
        dropzone.on("sending", function (file, xhr, tformData) {
          formData = tformData;
          return Cypress.sinon.spy(tformData, "append");
        });

        let mock1 = getMockFile();

        dropzone.addFile(mock1);

        return setTimeout(function () {
          expect(formData.append.callCount).to.equal(3);

          expect(formData.append.args[0][0]).to.equal("select");
          expect(formData.append.args[0][1]).to.equal("value2");

          expect(formData.append.args[1][0]).to.equal("select");
          expect(formData.append.args[1][1]).to.equal("value4");

          expect(formData.append.args[2][0]).to.equal("file");
          expect(formData.append.args[2][1]).to.equal(mock1);

          // formData.append.args[1][0]).to.eql "myName[]"
          return done();
        }, 10);
      });

      describe("settings()", function () {
        it("should correctly set `withCredentials` on the xhr object", function () {
          const OriginalXHR = window.XMLHttpRequest;

          const openSpy = Cypress.sinon.spy(OriginalXHR.prototype, "open");
          const sendStub = Cypress.sinon
            .stub(OriginalXHR.prototype, "send")
            .callsFake(() => {});

          try {
            // first upload: default is false
            dropzone.options.withCredentials = false;
            dropzone.uploadFile(mockFile);

            expect(openSpy.callCount).to.be.greaterThan(0);
            const xhr1 = openSpy.thisValues[0];
            expect(xhr1).to.exist;
            expect(xhr1.withCredentials).to.equal(false);

            // second upload: set true
            dropzone.options.withCredentials = true;
            dropzone.uploadFile(mockFile);

            expect(openSpy.callCount).to.be.greaterThan(1);
            const xhr2 = openSpy.thisValues[1];
            expect(xhr2).to.exist;
            expect(xhr2.withCredentials).to.equal(true);
          } finally {
            sendStub.restore();
            openSpy.restore();
          }
        });

        it("should correctly override headers on the xhr object", function () {
          dropzone.options.headers = { "Foo-Header": "foobar" };
          dropzone.uploadFile(mockFile);
          return expect(requests[0].requestHeaders["Foo-Header"]).to.equal(
            "foobar",
          );
        });

        it("should not set headers on the xhr object that are empty", function () {
          dropzone.options.headers = { "X-Requested-With": null };
          dropzone.uploadFile(mockFile);
          return expect(Object.keys(requests[0].requestHeaders)).to.not.contain(
            "X-Requested-With",
          );
        });

        it("should properly use the paramName without [n] as file upload if uploadMultiple is false", function (done) {
          dropzone.options.uploadMultiple = false;
          dropzone.options.paramName = "myName";

          let formData = [];
          let sendingCount = 0;
          dropzone.on("sending", function (files, xhr, tformData) {
            sendingCount++;

            formData.push(tformData);
            return Cypress.sinon.spy(tformData, "append");
          });

          let mock1 = getMockFile();
          let mock2 = getMockFile();

          dropzone.addFile(mock1);
          dropzone.addFile(mock2);

          return setTimeout(function () {
            expect(sendingCount).to.equal(2);

            expect(formData.length).to.equal(2);
            expect(formData[0].append.callCount).to.equal(1);
            expect(formData[1].append.callCount).to.equal(1);
            expect(formData[0].append.args[0][0]).to.equal("myName");
            expect(formData[0].append.args[0][0]).to.equal("myName");

            return done();
          }, 10);
        });

        it("should properly use the paramName with [n] as file upload if uploadMultiple is true", function () {
          dropzone.options.uploadMultiple = true;
          dropzone.options.paramName = "myName";

          // Ensure the sending events actually fire
          dropzone.accept = (file, done) => done();

          let formData = null;
          let sendingMultipleCount = 0;
          let sendingCount = 0;

          dropzone.on("sending", () => {
            sendingCount++;
          });

          dropzone.on("sendingmultiple", function (files, xhr, tformData) {
            sendingMultipleCount++;
            formData = tformData;
            Cypress.sinon.spy(tformData, "append");
          });

          const mock1 = getMockFile();
          const mock2 = getMockFile();

          // Add files so Dropzone knows about them (and will emit per-file events)
          dropzone.addFile(mock1);
          dropzone.addFile(mock2);

          // Trigger the multi-upload directly (no timers)
          dropzone.uploadFiles([mock1, mock2]);

          expect(sendingCount).to.equal(2);
          expect(sendingMultipleCount).to.equal(1);

          expect(formData).to.exist;
          expect(formData.append.callCount).to.equal(2);
          expect(formData.append.args[0][0]).to.equal("myName[0]");
          expect(formData.append.args[1][0]).to.equal("myName[1]");
        });
        it("should use resizeImage if dimensions are provided", function (done) {
          Cypress.sinon.stub(dropzone, "resizeImage");
          Cypress.sinon.stub(dropzone, "createThumbnail");

          dropzone.options.resizeWidth = 400;

          let mock1 = getMockFile("image/jpeg");

          dropzone.addFile(mock1);

          return setTimeout(function () {
            expect(dropzone.resizeImage.callCount).to.equal(1);
            return done();
          }, 10);
        });

        it("should not use resizeImage for SVG if dimensions are provided", function (done) {
          Cypress.sinon.stub(dropzone, "uploadFiles");

          dropzone.createThumbnail = function (
            file,
            width,
            height,
            resizeMethod,
            fixOrientation,
            callback,
          ) {
            callback(null, null);
          };

          dropzone.options.resizeWidth = 400;

          let mock1 = getMockFile("image/svg+xml");

          dropzone.addFile(mock1);

          setTimeout(function () {
            expect(dropzone.uploadFiles.callCount).to.equal(1);
            let uploadedFiles = dropzone.uploadFiles.getCall(0).args[0];
            expect(uploadedFiles).to.deep.equal([mock1]);
            done();
          }, 10);
        });

        it("should not use resizeImage if dimensions are not provided", function (done) {
          Cypress.sinon.stub(dropzone, "resizeImage");
          Cypress.sinon.stub(dropzone, "createThumbnail");

          let mock1 = getMockFile("image/jpeg");

          dropzone.addFile(mock1);

          return setTimeout(function () {
            expect(dropzone.resizeImage.callCount).to.equal(0);
            return done();
          }, 10);
        });

        it("should not use resizeImage if file is not an image", function (done) {
          Cypress.sinon.stub(dropzone, "resizeImage");
          Cypress.sinon.stub(dropzone, "createThumbnail");

          dropzone.options.resizeWidth = 400;

          let mock1 = getMockFile("text/plain");

          dropzone.addFile(mock1);

          return setTimeout(function () {
            expect(dropzone.resizeImage.callCount).to.equal(0);
            return done();
          }, 10);
        });
      });

      it("should not change the file name if the options.renameFile is not set", function (done) {
        let mockFilename = "T3sT ;:_-.,!¨@&%&";
        mockFile = getMockFile("text/html", mockFilename);

        let renamedFilename = dropzone._renameFile(mockFile);

        expect(renamedFilename).to.equal(mockFilename);
        return done();
      });

      it("should rename the file name if options.renamedFilename is set", function (done) {
        dropzone.options.renameFile = (file) =>
          file.name.toLowerCase().replace(/[^\w]/gi, "");

        mockFile = getMockFile("text/html", "T3sT ;:_-.,!¨@&%&");

        let renamedFilename = dropzone._renameFile(mockFile);

        expect(renamedFilename).to.equal("t3st_");
        return done();
      });

      describe("should properly set status of file", function () {
        let xhr;
        let requests;

        beforeEach(function () {
          requests = [];
          xhr = Cypress.sinon.useFakeXMLHttpRequest();

          return (xhr.onCreate = (xhr) => requests.push(xhr));
        });

        afterEach(() => {
          if (xhr && typeof xhr.restore === "function") xhr.restore();
        });
        it("should correctly set `withCredentials` on the xhr object", function () {
          dropzone.accept = (file, done) => done();
          dropzone.options.autoProcessQueue = false;

          const OriginalXHR = window.XMLHttpRequest;

          const sendStub = Cypress.sinon
            .stub(OriginalXHR.prototype, "send")
            .callsFake(function () {
              // 1st send => 400, 2nd send => 200
              const statusCode = sendStub.callCount === 1 ? 400 : 200;

              // status is read-only on real XHR: define a getter instead
              Object.defineProperty(this, "status", {
                configurable: true,
                get() {
                  return statusCode;
                },
              });

              Object.defineProperty(this, "readyState", {
                configurable: true,
                get() {
                  return 4;
                },
              });

              // responseText can be read-only too
              Object.defineProperty(this, "responseText", {
                configurable: true,
                get() {
                  return "";
                },
              });

              this.getResponseHeader = () => "text/plain";

              if (typeof this.onreadystatechange === "function")
                this.onreadystatechange();
              if (typeof this.onload === "function") this.onload();
              if (typeof this.onloadend === "function") this.onloadend();
            });

          try {
            // first file => ERROR
            dropzone.addFile(mockFile);
            dropzone.processQueue();
            expect(mockFile.status).to.equal(Dropzone.ERROR);

            // second file => SUCCESS
            mockFile = getMockFile();
            dropzone.addFile(mockFile);
            dropzone.processQueue();
            expect(mockFile.status).to.equal(Dropzone.SUCCESS);
          } finally {
            sendStub.restore();
          }
        });
      });
    });
    /*
        it("should correctly set `withCredentials` on the xhr object", function () {
          dropzone.accept = (file, done) => done();
          dropzone.options.autoProcessQueue = false;

          const OriginalXHR = window.XMLHttpRequest;

          const sendStub = Cypress.sinon
            .stub(OriginalXHR.prototype, "send")
            .callsFake(function () {
              // 1st send => 400, 2nd send => 200
              const statusCode = sendStub.callCount === 1 ? 400 : 200;

              this.status = statusCode;

              // Some implementations have read-only readyState, but this works in most cases
              try {
                Object.defineProperty(this, "readyState", {
                  value: 4,
                  configurable: true,
                });
              } catch (e) {
                // ignore
              }

              this.getResponseHeader = () => "text/plain";
              this.responseText = "";

              if (typeof this.onreadystatechange === "function")
                this.onreadystatechange();
              if (typeof this.onload === "function") this.onload();
            });

          try {
            // first file => ERROR
            dropzone.addFile(mockFile);
            dropzone.processQueue();
            expect(mockFile.status).to.equal(Dropzone.ERROR);

            // second file => SUCCESS
            mockFile = getMockFile();
            dropzone.addFile(mockFile);
            dropzone.processQueue();
            expect(mockFile.status).to.equal(Dropzone.SUCCESS);
          } finally {
            sendStub.restore();
          }
        });
      });
    });
    */

    describe("transformFile()", function () {
      it("should be invoked and the result should be uploaded if configured", (done) => {
        Cypress.sinon.stub(dropzone, "_uploadData");

        let mock1 = getMockFile("text/html", "original-file");
        let mock2 = getMockFile("text/html", "transformed-file");

        dropzone.options.transformFile = (file, done) => {
          expect(file).to.equal(mock1);
          done(mock2);
        };

        dropzone.addFile(mock1);

        setTimeout(function () {
          expect(dropzone._uploadData.callCount).to.equal(1);
          let uploadedFiles = dropzone._uploadData.args[0][0];
          let uploadedDataBlocks = dropzone._uploadData.args[0][1];
          expect(uploadedFiles[0]).to.equal(mock1);
          expect(uploadedDataBlocks[0].data).to.equal(mock2);
          done();
        }, 10);
      });
      it("should be used as a basis for chunked uploads", (done) => {
        Cypress.sinon.stub(dropzone, "_uploadData");

        dropzone.options.chunking = true;
        dropzone.options.chunkSize = 1;
        dropzone.options.parallelChunkUploads = true;

        let mock1 = getMockFile("text/html", "original-file", [
          "Veeeeery long file",
        ]); // 18 bytes
        let mock2 = getMockFile("text/html", "transformed-file", ["2b"]); // only 2 bytes

        dropzone.options.transformFile = (file, done) => {
          expect(file).to.equal(mock1);
          done(mock2);
        };

        dropzone.addFile(mock1);

        setTimeout(async function () {
          expect(dropzone._uploadData.callCount).to.equal(2);

          // the same file should be passed on each call.
          expect(dropzone._uploadData.args[0][0][0]).to.equal(mock1);
          expect(dropzone._uploadData.args[1][0][0]).to.equal(mock1);

          // Since we only allow chunks of 1 byte, there should be 2 chunks,
          // because the transformed file only has 2 bytes.
          // If this would equal to 18 bytes, then the wrong file would have
          // been chunked.
          expect(mock1.upload.totalChunkCount).to.equal(2);

          let uploadedDataBlocks1 = dropzone._uploadData.args[0][1][0];
          let uploadedDataBlocks2 = dropzone._uploadData.args[1][1][0];

          let block1Text = await uploadedDataBlocks1.data.text();
          let block2Text = await uploadedDataBlocks2.data.text();
          expect(block1Text).to.equal("2");
          expect(block2Text).to.equal("b");
          done();
        }, 10);
      });
    });

    return describe("complete file", () =>
      it("should properly emit the queuecomplete event when the complete queue is finished", function (done) {
        let mock1 = getMockFile("text/html", "mock1");
        let mock2 = getMockFile("text/html", "mock2");
        let mock3 = getMockFile("text/html", "mock3");
        mock1.status = Dropzone.ADDED;
        mock2.status = Dropzone.ADDED;
        mock3.status = Dropzone.ADDED;

        dropzone.uploadFiles = function (files) {
          return setTimeout(() => {
            return this._finished(files, null, null);
          }, 1);
        };

        let completedFiles = 0;
        dropzone.on("complete", (file) => completedFiles++);

        dropzone.on("queuecomplete", function () {
          expect(completedFiles).to.equal(3);
          return done();
        });

        dropzone.addFile(mock1);
        dropzone.addFile(mock2);
        return dropzone.addFile(mock3);
      }));
  });
});
