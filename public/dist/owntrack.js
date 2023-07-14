(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
    typeof define === 'function' && define.amd ? define(factory) :
    (global = typeof globalThis !== 'undefined' ? globalThis : global || self, global.OwnTrack = factory());
})(this, (function () { 'use strict';

    const checkForValidInit = (config) => {
        try {
            if (!config)
                throw new Error('OwnTrack: A configuration object is required at first call.');
        }
        catch (err) {
            console.error(err.message);
            return false;
        }
        try {
            if (!config.services || !config.services.length)
                throw new Error('OwnTrack: At least one service is required.');
        }
        catch (err) {
            console.error(err.message);
            return false;
        }
        return true;
    };

    class OwnTrack {
        constructor(config) { }
    }

    var index = (config) => {
        if (!window._OT && checkForValidInit(config))
            window._OT = new OwnTrack(config);
        return window._OT;
    };

    return index;

}));
