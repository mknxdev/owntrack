(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
    typeof define === 'function' && define.amd ? define(factory) :
    (global = typeof globalThis !== 'undefined' ? globalThis : global || self, global.OwnTrack = factory());
})(this, (function () { 'use strict';

    const checkForValidInit = (config) => {
        try {
            // config
            if (!config)
                throw new Error('OwnTrack: A configuration object is required at first call.');
            // config.services
            if (!config.services || !config.services.length)
                throw new Error('OwnTrack: At least one service is required.');
            // config.services.service
            for (const srv of config.services) {
                if (!srv.name)
                    throw new Error(`OwnTrack: Service: 'name' is required.`);
                if (srv.label && typeof srv.label !== 'string')
                    throw new Error(`OwnTrack: Service: 'label' must be of type string.`);
                if (!srv.trackingScriptUrl)
                    throw new Error(`OwnTrack: Service: 'trackingScriptUrl' is required.`);
                if (typeof srv.trackingScriptUrl !== 'string')
                    throw new Error(`OwnTrack: Service: 'trackingScriptUrl' must be of type string.`);
                if (!srv.handlers)
                    throw new Error(`OwnTrack: Service: 'handlers' is required.`);
                if (typeof srv.handlers !== 'object')
                    throw new Error(`OwnTrack: Service: 'handlers' must be an object.`);
                if (!srv.handlers.init || typeof srv.handlers.init !== 'function')
                    throw new Error(`OwnTrack: Service: 'handlers' must contain an 'init' method.`);
            }
        }
        catch (err) {
            console.error(err.message);
            return false;
        }
        return true;
    };

    const setItem = (name, value) => {
        if (Array.isArray(value) || (typeof value === 'object' && value !== null)) {
            value = JSON.stringify(value);
        }
        localStorage.setItem(name, value);
    };
    const getItem = (name) => {
        const value = localStorage.getItem(name);
        if (!value)
            return null;
        if (['true', 'false'].includes(value))
            return value === 'true';
        if (!isNaN(Number(value)))
            return Number(value);
        try {
            return JSON.parse(value);
        }
        catch (e) {
            /* Nothing to do; continue */
        }
        return String(value);
    };
    const removeItem = (name) => {
        localStorage.removeItem(name);
    };
    var ls = {
        setItem,
        getItem,
        removeItem,
    };

    class ServiceWrapper {
        constructor(name) {
            this.name = name;
        }
    }

    const LS_ITEM_NAME = 'owntrack_uc';
    class TrackingGuard {
        constructor() {
            this._services = [];
            this._consents = [];
            this._consents = ls.getItem(LS_ITEM_NAME) || [];
        }
        _setGuard(handler) {
            return () => {
                handler();
            };
        }
        wrapService({ name, label, trackingScriptUrl, handlers }) {
            // console.log(name, label, trackingScriptUrl, handlers)
            const srv = new ServiceWrapper(name);
            for (const [fnName, fn] of Object.entries(handlers))
                srv[fnName] = this._setGuard(fn);
            this._services.push(srv);
            return srv;
        }
        save() {
            const consents = this._services.map((service) => ({
                srv: service.name,
                v: this._consents.some((c) => c.srv === service.name)
                    ? this._consents.filter((c) => c.srv === service.name)[0].v
                    : false,
                r: this._consents.some((c) => c.srv === service.name)
                    ? this._consents.filter((c) => c.srv === service.name)[0].r
                    : false,
            }));
            ls.setItem(LS_ITEM_NAME, consents);
        }
    }

    class OwnTrack {
        constructor(config) {
            this._trackingGuard = new TrackingGuard();
            this._services = {};
            for (const srv of config.services) {
                this._services[srv.name] = this._trackingGuard.wrapService(srv);
            }
            this._trackingGuard.save();
        }
        service(name) {
            console.log(this._services);
        }
    }

    var index = (config) => {
        if (!window._OT && checkForValidInit(config))
            window._OT = new OwnTrack(config);
        return window._OT;
    };

    return index;

}));
