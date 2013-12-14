
require.config({
    baseUrl: './lib/',

    paths: {
        'text': 'thirdparty/text/text',
        'hgn': 'thirdparty/hgn',
        'hogan': 'thirdparty/hogan',
        'jath' : 'thirdparty/jath.min',
        'jquery': 'thirdparty/jquery-1.9.1',
        'underscore': 'thirdparty/underscore-1.4.4',
        'backbone': 'thirdparty/backbone-0.9.10',
        'bootstrap': 'thirdparty/bootstrap.min',
        'URIjs': 'thirdparty/URIjs/URI',
        'punycode': 'thirdparty/URIjs/punycode',
        'SecondLevelDomains': 'thirdparty/URIjs/SecondLevelDomains',
        'IPv6': 'thirdparty/URIjs/IPv6',
        'remotestorage' : 'thirdparty/remotestorage',
        'Readium': 'Readium',
        'inflate' : 'thirdparty/inflate',
        'zip' : 'thirdparty/zip',
        'i18n': '../i18n',
        'templates': '../templates',
        'storage/StorageManager' : 'storage/StaticStorageManager'
    },
    hgn : {
        templateExtension : ""
    },
    config : {
        'storage/EpubUnzipper' : {'workerScriptsPath' : '/lib/thirdparty/'},
        'workers/WorkerProxy' : {'workerUrl' : '/scripts/readium-worker.js'}
    },
    shim: {
        zip : {
            exports: 'zip'
        },
        underscore: {
            exports: '_'
        },
        URIjs:{
            exports: 'URI'
        },
        jath : {
            exports: 'Jath'
        },
        backbone: {
            deps: ['underscore', 'jquery'],
            exports: 'Backbone'
        },

        bootstrap: {
            deps: ['jquery'],
            exports: 'bootstrap'
        },

        Readium: {
            deps: ['backbone'],
            exports:'Readium'
        }
    }
});