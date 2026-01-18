import { Dropzone } from "../../src/dropzone.js";

describe("Amazon S3 Support", function () {
  const getMockFile = (
    type = "text/html",
    filename = "test file name",
    contents = ["file contents"],
  ) => {
    const file = new File(contents, filename, { type });
    file.status = Dropzone.ADDED;
    file.accepted = true;
    file.upload = { filename };
    return file;
  };

  let dropzone = null;
  let element = null;

  afterEach(function () {
    if (dropzone != null) {
      dropzone.destroy();
      dropzone = null;
    }
    if (element != null) {
      document.body.removeChild(element);
      element = null;
    }
  });

  describe("constructor()", function () {
    it("should throw an exception if binaryBody and uploadMultiple", function () {
      const el = document.createElement("div");
      expect(() => {
        dropzone = new Dropzone(el, {
          url: "/",
          binaryBody: true,
          uploadMultiple: true,
        });
      }).to.throw("You cannot set both: binaryBody and uploadMultiple.");
    });
  });

  describe("upload", function () {
    beforeEach(function () {
      element = Dropzone.createElement("<div></div>");
      document.body.appendChild(element);

      dropzone = new Dropzone(element, {
        url: "url",
        binaryBody: true,
        uploadprogress() {},
      });

      // Ensure test determinism (we will start processing explicitly)
      dropzone.accept = (file, done) => done();
      dropzone.options.autoProcessQueue = false;
    });

    it("should add proper Content-Type", function () {
      const seen = [];

      cy.intercept("**/url", (req) => {
        // Cypress normalizes header keys to lowercase
        seen.push(req.headers["content-type"] || req.headers["Content-Type"]);
        req.reply({ statusCode: 200, body: "" });
      }).as("upload");

      // IMPORTANT: run Dropzone actions only after intercept is registered
      cy.then(() => {
        dropzone.addFile(getMockFile());
        dropzone.addFile(
          getMockFile("image/jpeg", "some-file.jpg", [[1, 2, 3]]),
        );
        dropzone.processQueue();
      });

      // wait for two requests
      cy.wait("@upload");
      cy.wait("@upload");

      // assert after both requests happened
      cy.wrap(seen)
        .should("have.length", 2)
        .then(() => {
          const contentTypes = seen.filter(Boolean).sort();
          expect(contentTypes).to.deep.equal(
            ["image/jpeg", "text/html"].sort(),
          );
        });
    });
  });
});
