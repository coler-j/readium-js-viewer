/*
* ModuleConfig.js: Module that contains configuration options for Readium-js-viewer.
*/

define(['module'], function(module) {

        var config = module.config();
        return {
            'imagePathPrefix': config.imagePathPrefix || "",

            'epubLibraryPath': config.epubLibraryPath || "",

            'canHandleUrl': config.canHandleUrl || false,
            'canHandleDirectory': config.canHandleDirectory || false,


            'epubReadingSystemUrl': config.epubReadingSystemUrl || "/EPUBREADINGSYSTEM.js",

            'workerUrl': config.workerUrl || "/READIUMWORKER.js",

            'annotationCSSUrl': config.annotationCSSUrl || "/ANNOTATIONS.css",
            'mathJaxUrl': config.mathJaxUrl || "/MATHJAX.js",
            'jsLibRoot': config.jsLibRoot || "/ZIPJS/",

            //Fonts is a list of font objects.
            'fonts': config.fonts || [],

            'useSimpleLoader': config.useSimpleLoader || false,
            'featureFlags': config.featureFlags || {'downloads': false, 'annotations': false, 'tts': false},
            'readerPageTitle': config.readerPageTitle || 'Bright Wing Media Booksite',
            'readerHomeTitle': config.readerHomeTitle || 'Home',
            'scrollModeOnMobile': config.scrollModeOnMobile || false,
            'swipeChangesChapter': config.swipeChangesChapter || true,
            'bookmarkSrcUrl': config.bookmarkSrcUrl || '',
            'downloadURL': config.downloadURL || '',
            'csrfToken': config.csrfToken || ""
        };
});
