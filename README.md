_Note: Please don't use the zip download feature on this repo as this repo uses submodules and this is not supported at present by github and will result in an incomplete copy of the repo._

# readium-js-viewer

**EPUB reader written in HTML, CSS and Javascript.**

This Readium software component implements the "cloud reader" for online e-books.

Please see https://github.com/readium/readium-shared-js for more information about the underlying rendering engine.


## License

**BSD-3-Clause** ( http://opensource.org/licenses/BSD-3-Clause )

See [license.txt](./license.txt).


## Prerequisites

* A decent terminal. On Windows, GitBash works great ( https://msysgit.github.io or https://git-for-windows.github.io or https://git-scm.com/download/win ), and optionally Cygwin adds useful commands ( https://www.cygwin.com ).
* NodeJS ( https://nodejs.org ) **v4+** (Note that NodeJS v6+ and NPM v3+ are now supported, including NodeJS v7+ and NPM v4+)
 * Optionally: Yarn ( https://yarnpkg.com ) **v0.23+**


## Development

### Git initialisation

* `git clone --recursive -b BRANCH_NAME https://github.com/readium/readium-js-viewer.git readium-js-viewer` (replace "BRANCH_NAME" with e.g. "develop")
* `cd readium-js-viewer`
* `git submodule update --init --recursive` to ensure that the readium-js-viewer chain of dependencies is initialised (readium-js, readium-shared-js)
* `git checkout BRANCH_NAME && git submodule foreach --recursive "git checkout BRANCH_NAME"` (or simply `cd` inside each repository / submodule, and manually enter the desired branch name: `git checkout BRANCH_NAME`) Git should automatically track the corresponding branch in the 'origin' remote.



### Source tree preparation

* `npm run prepare:all` (to perform required preliminary tasks, like patching code before building)
 * OR: `yarn run prepare:yarn:all` (to use Yarn instead of NPM for node_module management)

Note that in some cases, administrator rights may be needed in order to install dependencies, because of NPM-related file access permissions (the console log would clearly show the error). Should this be the case, running `sudo npm run prepare:all` usually solves this.

Note that the above command executes the following:

* `npm install` (to download dependencies defined in `package.json` ... note that the `--production` option can be used to avoid downloading development dependencies, for example when testing only the pre-built `build-output` folder contents)
* `npm update` (to make sure that the dependency tree is up to date)
* + some additional HTTP requests to the GitHub API in order to check for upstream library updates (wherever Readium uses a forked codebase)


### Typical workflow

No RequireJS optimization:

* `npm run http` (to launch an http server. This automatically opens a web browser instance to the HTML files in the `dev` folder, choose `index_RequireJS_no-optimize.html`, or the `*LITE.html` variant which do include only the reader view, not the ebook library view)
* Hack away! (e.g. source code in the `src/js` folder)
* Press F5 (refresh / reload) in the web browser

Or to use optimized Javascript bundles (single or multiple):

* `npm run build` (to update the RequireJS bundles in the build output folder)
* `npm run http:watch` (to launch an http server. This automatically opens a web browser instance to the HTML files in the `dev` folder, choose `index_RequireJS_single-bundle.html` or `index_RequireJS_multiple-bundles.html`, or the `*LITE.html` variants which do include only the reader view, not the ebook library view)
* `npm run http` (same as above, but without watching for file changes (no automatic rebuild))

And finally to update the distribution packages (automatically calls the `build` task above, so `npm run build` is redundant):

* `npm run dist` (Chrome extension and cloud reader, including the lite / no-library variant)

The above task takes a lot of time (as it builds distributable packages for *all* ReadiumJS flavours), and is in fact not strictly necessary to test the cloud reader (see `npm run http` above, using the "no optimise" RequireJS option). Thankfully, the packaged code for the Chrome App / Extension can be quickly generated using this build command instead:


Also note that the built-in local HTTP server functionality (`npm run http`) is primarily designed to serve the Readium application at development time in its "exploded" form (`dev`, `src`, `node_modules`, etc. folders). It is also possible to use any arbitrary HTTP server as long as the root folder is `readium-js-viewer` (so that the application assets ; CSS, images, fonts ; can be loaded relative to this base URL). Example with the built-in NodeJS server: `node node_modules/http-server/bin/http-server -a 127.0.0.1 -p 8080 -c-1 .`. Also note that the `127.0.0.1` IP address which is used by default when invoking the `npm run http` command can be set to `0.0.0.0` in order to automatically bind the HTTP server to the local LAN IP, making it possible to open the Readium app in a web browser from another machine on the network. Simply set the `RJS_HTTP_IP` environment variable to `0.0.0.0` (e.g. using `export RJS_HTTP_IP="0.0.0.0"` from the command line), or for a less permanent setting: `RJS_HTTP_IP="0.0.0.0" npm run http` (the environment variable only "lasts" for the lifespan of the NPM command).

Remark: a log of HTTP requests is preserved in `http_app-ebooks.log`. This file contains ANSI color escape codes, so although it can be read using a regular text editor, it can be rendered in its original format using the shell command: `cat http_app.log` (on OSX / Linux), or `sed "s,x,x,g" http_app-ebooks.log` (on Windows).


### HTTP CORS (separate domains / origins, app vs. ebooks)

By default, a single HTTP server is launched when using the `npm run http` task, or its "watch" and "nowatch" variants (usage described in the above "Typical workflow" section).
To launch separate local HTTP servers on two different domains (in order to test HTTP CORS cross-origin app vs. ebooks deployment architecture), simply invoke the equivalent tasks named with `http2` instead of `http`. For example: `npm run http2`. More information about real-world HTTP CORS is given in the "Cloud reader deployment" section below.

Remark: logs of HTTP requests are preserved in two separate files `http_app.log` and `http_ebooks.log`. They contains ANSI color escape codes, so although they can be read using a regular text editor, they can be rendered in their original format using the shell command: `cat http_app.log` (on OSX / Linux), or `sed "s,x,x,g" http_app.log` (on Windows).



### Plugins integration

When invoking the `npm run build` command, the generated `build-output` folder contains RequireJS module bundles that include the default plugins specified in `readium-js/readium-js-shared/plugins/plugins.cson` (see the plugins documentation https://github.com/readium/readium-shared-js/blob/develop/PLUGINS.md ). Developers can override the default plugins configuration by using an additional file called `plugins-override.cson`. This file is git-ignored (not persistent in the Git repository), which means that Readium's default plugins configuration is never at risk of being mistakenly overridden by developers, whilst giving developers the possibility of creating custom builds on their local machines.

For example, the `annotations` plugin can be activated by adding it to the `include` section in `readium-js/readium-js-shared/plugins/plugins-override.cson`.
Then, in order to create / remove highlighted selections, simply comment `display:none` for `.icon-annotations` in the `src/css/viewer.css` file (this will enable an additional toolbar button).


## RequireJS bundle optimisation

Note that by default, compiled RequireJS bundles are minified / mangled / uglify-ed. You can force the build process to generate non-compressed Javascript bundles by setting the `RJS_UGLY` environment variable to "no" or "false" (any other value means "yes" / "true").

This may come-in handy when testing / debugging the Chrome Extension (Packaged App) in "developer mode" directly from the `dist` folder (i.e. without the sourcemaps manually copied into the script folder).


## Distribution

See the `dist` folder contents (generated by `npm run dist`):

* `cloud-reader-lite`

The source maps are generated separately, so they are effectively an opt-in feature (simply copy/paste them next to their original Javascript file counterparts, e.g. in the `scripts` folder). The command `npm run dist+sourcemap` can be used to ensure that sourcemap files are copied across into their respective dist folders (note that this command invokes `npm run dist`).


The `cloud-reader-lite` distribution does not feature an ebook library, so EPUBs must be specified via the URL parameter (HTTP GET), for example:
`http://domain.com/index.html?epub=http://otherdomain.com/ebook.epub` (assuming both HTTP servers are suitably configured with CORS),
or for example `http://domain.com/index.html?epub=EPUBs/ebook.epub` (assuming a folder named `EPUBs/` exists as a sibling of `index.html`,
and this folder contains the `ebook.epub` file
(note that the folder name is arbitrary, and it may in fact follow the default naming convention: `epub_content/`)).



## How to use (RequireJS bundles / AMD modules)

### Single bundle

The `_single-bundle` folder contains `readium-js-viewer_all.js` (and its associated source-map file, as well as a RequireJS bundle index file (which isn't actually needed at runtime, so here just as a reference)),
which aggregates all the required code (external library dependencies included, such as Underscore, jQuery, etc.),
as well as the "Almond" lightweight AMD loader ( https://github.com/jrburke/almond ).

This means that the full RequireJS library ( http://requirejs.org ) is not actually needed to bootstrap the AMD modules at runtime,
as demonstrated by the HTML file in the `dev` folder (trimmed for brevity):

```html
<html>
<head>

<!-- main code bundle, which includes its own Almond AMD loader (no need for the full RequireJS library) -->
<script type="text/javascript" src="../build-output/_single-bundle/readium-js-viewer_all.js"> </script>

<!-- index.js calls into the above library -->
<script type="text/javascript" src="./index.js"> </script>

</head>
<body>
<div id="viewport"> </div>
</body>
</html>
```


## CSON vs. JSON (package.json)

CSON = CoffeeScript-Object-Notation ( https://github.com/bevry/cson )

Running the command `npm run cson2json` will re-generate the `package.json` JSON file.
For more information, see comments in the master `./package/package_base.cson` CSON file.

Why CSON? Because it is a lot more readable than JSON, and therefore easier to maintain.
The syntax is not only less verbose (separators, etc.), more importantly it allows *comments* and *line breaking*!

Although these benefits are not so critical for basic "package" definitions,
here `package.cson/json` declares relatively intricate `script` tasks that are used in the development workflow.
`npm run SCRIPT_NAME` offers a lightweight technique to handle most build tasks,
as NPM CLI utilities are available to perform cross-platform operations (agnostic to the actual command line interface / shell).
For more complex build processes, Grunt / Gulp can be used, but these build systems do not necessarily offer the most readable / maintainable options.

Downside: DO NOT invoke `npm init` or `npm install --save` `--save-dev` `--save-optional`,
as this would overwrite / update the JSON, not the master CSON!
