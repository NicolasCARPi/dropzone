# Changelog for dropzone

## 7.4.2

* dev: move all tests to Cypress, remove many devDependencies (#48)
* bump: force install of brace-expansion 2.0.2

## 7.4.1

* ci: fix publish workflow

## 7.4.0

* bug/minor: gif: prevent gifs from being truncated to first frame (#46) fix #39
* ci: try trusted publishing with OIDC (see https://github.blog/changelog/2025-07-31-npm-trusted-publishing-with-oidc-is-generally-available/)
* chore: update dependencies (#45)

## 7.3.1

* bug/minor: ux: avoid displaying empty confirm on cancel action (by spatarel in #42)
* doc: readme: fix broken link by AalbatrossGuy in #41

## 7.3.0

* Emit emptyfolder event when receiving an empty folder by @CyBot in #35
* Fix for Issue #36 by @alloylab in #37

## 7.2.1

* bug/minor: add null check to prevent uncaught type error on parent node (#34 by Christina Toegl)
  This fix prevents uncaught type errors thrown if hiddenFileInput has no parentNode.

## 7.2.0

* feat: uuid: add fallback uuid generator for insecure contexts (PR #24 fix #22 by Dieter Oberkofler)
* dev: minor: improve fallback uuid-generator (PR #27 by Erik Axel Nielsen)
* dev: chore: bump yarnpkg from 4.2.2 to 4.5.3

## 7.1.6

* Add support for MacOS 14+ filenames (PR #21 by @brentmartinmiller, fix #20)
* Add custom type definition (PR #19 by @doberkofler, fix #7)
* Readme improvements (PR #15 by @jules-w2)
* Use setAttributes() for setting the aria-label

## 7.1.5

* Fix SASS deprecation warnings with version 1.77.7 (PR #14 by Jules)
* Fix import statements in README.md (fix #16)
* Mention the need for secure context in README (fix #13)
* Upgrade `@swc/helpers` from 0.5.11 to 0.5.12

## 7.1.4

Fix bug where using an ID for selecting the dropzone element would make the lib crash. fix #12

## 7.1.3

A very small patch release with a fix regarding the `form` attribute of the hidden `input` field. See dropzone/dropzone#2300. PR #11 by @bancer.

## 7.1.2

A small patch release with an important bugfix that was asked by the community for a long time:

* fix: parallelChunkUploads should respect parallelUploads. fix dropzone/dropzone#2030 (based on PR dropzone/dropzone#2249 by @labor4)

## 7.1.1

A small patch release with an important bugfix that was asked by the community for a long time:

* Fix issue with exif resizing of thumbnail that messed up the files. fix dropzone/dropzone#1967
  PR dropzone/dropzone#2001 by @kaymes

## 7.1.0

With this release, we drop deprecated and old things, and bring back the test suite.

### Breaking change

If you have `acceptedMimeTypes` in your options, replace it with `acceptedFiles`. This option was deprecated 3 years ago, and has now be completely removed.

### Changes

* All tests now run: a previous change made it run only one single test! (by using `describe.only()` instead of `describe()`)
* The test suite now runs on each commit in a GH Action
* Remove a dependency on `just-extend`: use `Object.assign()` instead
* Simplify greatly the browser detection and remove blockedBrowser code that only targeted opera 12 from 12 years ago
* Removed some IE related code and simplified some code paths as we now expect a decent enough browser
* Some code cleanup: remove unused variables
* Use crypto.randomUUID instead of a custom function
* Run CodeQL only in src/
* Update cypress config

## 7.0.4

* Upgrade dependencies
* Add SECURITY.md file (and enable security settings on repository)

## 7.0.3

* Add more files to .npmignore: no need to distribute parcel-cache or documentation files
* Remove composer.json

## 7.0.2

* Try and fix the publish on npm action (it worked).

## 7.0.1

* Upgrade publish action version. Try and fix the publish on npm action.

## 7.0.0

* No issues were reported with alpha versions, so this is the (maintained) stable version now. There are no changes from alpha2.

## 7.0.0-alpha2

* README changes

## 7.0.0-alpha

This is the first release of this fork. Mainly to test if publish action runs fine.

* upgrade some dependencies
* add github actions
* fix improper grammer PR dropzone/dropzone#2211 by @Offlein
* Send at least one chunk if filesize is 0. Fix for dropzone/dropzone#1982. PR dropzone/dropzone#2153 by @Forceu
* fix typos. fix dropzone/dropzone#2140
* add arialabel to hidden input

## 6.0.0-beta.2

- Add `binaryBody` support (thanks to @patrickbussmann and @meg1502).
  - This adds full support for AWS S3 Multipart Upload.
  - There is an example setup for this now in `test/test-sites/2-integrations`.

## 6.0.0-beta.1

### Breaking

- Dropzone is dropping IE support! If you still need to support IE, please use
  `5.9.3`. You can download it here:
  https://github.com/dropzone/dropzone/releases/download/v5.9.3/dist.zip
- `Dropzone.autoDiscover` has been removed! If you want to auto discover your
  elements, invoke `Dropzone.discover()` after your HTML has loaded and it will
  do the same.
- The `dropzone-amd-module` files have been removed. There is now a
  `dropzone.js` and a `dropzone.mjs` in the dist folder.
- The `min/` folder has been removed. `dropzone.min.js` is now the only
  file that is minimized.
- Remove `Dropzone.extend` and replace by the `just-extend` package.
- There is no more `Dropzone.version`.

## 5.9.3

- Fix incorrect resize method used for creating thumbnails of existing files
  (thanks to @gplwhite)

## 5.9.2

- Handle `xhr.readyState` in the `submitRequest` function and don't attempt to
  send if it's not `1` (OPENED). (thanks to @bobbysmith007)

## 5.9.1

- Fix the way upload progress is calculated when using chunked uploads. (thanks
  to @ckovey)

## 5.9.0

- Properly handle when timeout is null or 0
- Make the default of timeout null

## 5.8.1

- Fix custom event polyfill for IE11
- Fix build to use ES5 instead of ES6, which was broken due to webpack upgrade.
  (thanks to @fukayatsu)

## 5.8.0

- Dropzone now also triggers custom events on the DOM element. The custom events
  are the same as the events you can listen on with Dropzone but start with
  `dropzone:`. (thanks to @1cg)
- Moved the `./src/options.js` previewTemplate in its own
  `preview-template.html` file.
- Switched to yarn as the primary package manager (shouldn't affect anybody that
  is not working Dropzone itself).

## 5.7.6

- Revert `dist/min/*.css` files to be named `dist/min/*.min.css`.
- Setup bower releases.

## 5.7.5

- Rename `blacklistedBrowsers` to `blockedBrowsers` (but still accept
  `blacklistedBrowsers` for legacy).
- Add automatic trigger for packagist deployment.
- Fix links in `package.json`.

## 5.7.4

- Prevent hidden input field from getting focus (thanks to @sinedied)
- Fix documentation of `maxFilesize` (thanks to @alxndr-w)
- Fix build issues so the UMD module can be imported properly

## 5.7.3 (retracted)

- Add `disablePreviews` option.
- Fix IE problems with Symbols.
- **WARNING**: This release had issues because the .js files couldn't be
  imported as AMD/CommonJS packages properly. The standalone version worked fine
  though. I have retracted this version from npm but have left the release on
  GitHub.

## 5.7.2

- Base the calculation of the chunks to send on the transformed files
- Properly display seconds (instead of ms) in error message when timeout is
  reached
- Properly handle it when `options.method` is a function (there was a bug, which
  always assumed that it was a String) (thanks to @almdac)
- Fix orientation on devices that already handle it properly (thanks to @nosegrind)
- Handle additionalParams when they are an Array the way it's expected (thanks to @wiz78)
- Check for `string` in error message type instead of `String` (thanks to @RuQuentin)

## 5.7.1

- Fix issue with IE (thanks to @Bjego)

## 5.7.0

- Cleanup the SVGs used to remove IDs and sketch attributes
  Since SVGs are duplicated this resulted in duplicate IDs being used.
- Add a dedicated `displayExistingFile` method to make it easier to display
  server files.
- Fix an error where chunked uploads don't work as expected when transforming
  files before uploading.
- Make the default text a button so it's discoverable by keyboard.

## 5.6.1

- Re-released due to missing javascript files
- Removes `npm` dependency that got added by mistake

## 5.6.0

- Timeout now generates an error (thanks to @mmollick)
- Fix duplicate iteration of error processing (#159 thanks @darkland)
- Fixed bootstrap example (@thanks to @polosatus)
- The `addedfiles` event now triggers _after_ each individual `addedfile` event
  when dragging files into the dropzone, which is the same behavior as when
  clicking it.

## 5.5.0

- Correct photo orientation before uploading (if enabled) (thanks to @nosegrind)
- Remove a potential memory leak in some browsers by keeping a reference to `xhr` inside the individual
  chunk objects (thanks to @clayton2)
- Allow HTML in the remove links (thanks to @christianklemp)
- `hiddenInputContainer` can now be an `HtmlElement` in addition to a selector String (thanks to @WAmeling)
- Fix default values on website (since the last deployment, the default values all stated `null`)

## 5.4.0

- Fix IE11 issue when dropping files

## 5.3.1

- Fix broken npm release of 5.3.0

## 5.3.0

- Add `dictUploadCanceled` option (thanks to @Fohlen)
- Fix issue with drag'n'drop on Safari and IE10 (thanks to @taylorryan)
- Fix issues with resizing if SVG files are dropped (thanks to @saschagros)

## 5.2.0

- **Migrated from coffeescript to ES6!**
- **Added chunked file uploading!** The highly requested chunked uploads are now available. Checkout the
  `chunking` option documentation for more information.
- Fixed a faulty `console.warning` (should be `console.warn`)
- If an input field doesn't have a name, don't include it when sending the form (thanks to @remyj38)
- Opera on Windows Phone is now also blacklisted (thanks to @dracos1)
- If a custom preview element is used, it is now properly handled when it doesn't have a parent (thanks to @uNmAnNeR)

## 5.1.1

- Fix issue where showing files already on the server fails, due to the missing `file.upload.filename`
- Fix issue where `file.upload.filename` gets removed after the file uploaded completed
- Properly handle `arraybuffer` and `blob` responses

## 5.1.0

- Add possibility to translate file sizes. (#16 thanks to @lerarybak for that)
- Fix duplicate filenames in multiple file uploads (#15)
- The `renameFilename` option has been **deprecated**. Use `renameFile` instead
  (which also has a slightly different function signature)
- The `renameFile` option now stores the new name in `file.upload.filename` (#1)

## 5.0.1

- Add missing dist/ folder to npm.

## 5.0.0

- **Add support for browser image resizing!** Yes, really. The new options are: `resizeWidth`, `resizeHeight`, `resizeMimeType` and `resizeQuality`.
  Thanks a lot to [MD Systems](https://www.md-systems.ch/) for donating the money to make this a reality.
- Fix IE11 issue with `options.timeout`
- Resolve an issue that occurs in the iOS squashed image fix, where some transparent PNGs are stretched inaccurately

## 4.4.0

- Add `options.timeout`

## 4.3.0

Added Changelog. Sorry that this didn't happen sooner.
