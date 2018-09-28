
var path = require('path');

var path_readiumJSViewer = process.cwd();
var path_readiumJS = path.join(path_readiumJSViewer, '/readium-js');
var path_readiumSharedJS = path.join(path_readiumJS, '/readium-shared-js');

var repoNamePaths = {
    "readiumJsViewer": path_readiumJSViewer,
    "readiumJs": path_readiumJS,
    "readiumSharedJs": path_readiumSharedJS
};

var filePath = path.join(process.cwd(), 'readium-js', 'readium-shared-js', 'readium-build-tools', 'versionsMaker.js')

var fs = require("fs");
fs.readFile(
    filePath,
    {encoding: 'utf-8'},
    function(err, fileContents) {
        if (!err) {
            var func = eval("("+fileContents+")");
            return func();
        } else {
            console.debug(err);
        }
    }
);
