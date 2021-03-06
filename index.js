var map = require('map-stream');
var rext = require('replace-ext');
var gutil = require('gulp-util');

const PLUGIN_NAME = 'gulp-twig';

module.exports = function (options) {
    'use strict';
    if (!options) {
        options = {};
    }

    function modifyContents(file, cb) {
        if (file.isNull()) {
            return cb(null, file);
        }

        if (file.isStream()) {
            return cb(new gutil.PluginError(PLUGIN_NAME, "Streaming not supported!"));
        }

        var Twig = require('twig'),
            twig = Twig.twig,
            twigOpts = {
                path: file.path,
                async: false
            },
            template;

        if (options.debug !== undefined) {
            twigOpts.debug = options.debug;
        }
        if (options.trace !== undefined) {
            twigOpts.trace = options.trace;
        }
        if (options.base !== undefined) {
            twigOpts.base = options.base;
        }
        if (options.cache !== true) {
            Twig.cache(false);
        }

        template = twig(twigOpts);

        try {
            file.contents = new Buffer(template.render(options.data));
        }catch(e){
            if (options.errorLogToConsole) {
                gutil.log(PLUGIN_NAME + ' ' + e);
                return cb();
            }

            if (typeof options.onError === 'function') {
                options.onError(e);
                return cb();
            }
            return cb(new gutil.PluginError(PLUGIN_NAME, e));
        }

        file.path = rext(file.path, '.html');
        cb(null, file);
    }

    return map(modifyContents);
};
