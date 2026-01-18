/// <reference types="cypress" />

describe("Dropzone with zero configuration", () => {
  beforeEach(() => {
    cy.visit("/1-basic/zero_configuration.html");

    // Patch the already auto-created Dropzone instance
    cy.window().then((win) => {
      const dz = win.Dropzone?.instances?.[0];
      expect(dz, "Dropzone instance").to.exist;

      if (typeof dz.options.previewTemplate === "string") {
        dz.options.previewTemplate = dz.options.previewTemplate.trim();
      }
    });
  });

  it("uploads single file", () => {
    cy.intercept("POST", "/").as("upload");

    cy.get(".dropzone").selectFile("cypress/fixtures/image.jpg", {
      action: "drag-drop",
    });

    cy.wait("@upload").then((interception) => {
      expect(interception.response.statusCode).to.eq(200);
      expect(interception.response.body).to.deep.eq({ success: true });
    });
  });

  it("uploads two files", () => {
    cy.intercept("POST", "/").as("upload");

    cy.get(".dropzone")
      .selectFile("cypress/fixtures/image.jpg", { action: "drag-drop" })
      .selectFile("cypress/fixtures/image.tiff", { action: "drag-drop" });

    // wait for BOTH uploads
    cy.wait("@upload").then((interception) => {
      expect(interception.response.statusCode).to.eq(200);
      expect(interception.response.body).to.deep.eq({ success: true });
    });

    cy.wait("@upload").then((interception) => {
      expect(interception.response.statusCode).to.eq(200);
      expect(interception.response.body).to.deep.eq({ success: true });
    });
  });
});
