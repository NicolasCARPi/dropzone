import { Dropzone } from "../../src/dropzone.js";

describe("Amazon S3 Support", function () {
  const getMockFile = (
    type = "text/html",
    filename = "test file name",
    contents = ["file contents"]
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

      cy.intercept({ url: "**/url" }, (req) => {
        req.reply({ statusCode: 200, body: "" });
      }).as("upload");

      dropzone.addFile(getMockFile());
      dropzone.addFile(getMockFile("image/jpeg", "some-file.jpg", [[1, 2, 3]]));

      // Start uploads after intercept is in place
      dropzone.processQueue();

      cy.wait("@upload").then((i1) => {
        seen.push(i1);
      });

      cy.wait("@upload").then((i2) => {
        seen.push(i2);
      });

      cy.then(() => {
        const contentTypes = seen
          .map((i) => {
            const headers = i.request && i.request.headers ? i.request.headers : {};
            // Cypress normalizes header keys to lowercase
            return headers["content-type"] || headers["Content-Type"];
          })
          .filter(Boolean)
          .sort();

        expect(contentTypes).to.deep.equal(
          ["text/html", "image/jpeg"].sort()
        );
      });
    });
  });
});
