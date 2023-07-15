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
            if (!Array.isArray(config.services))
                throw new Error(`OwnTrack: 'services' must be an array.`);
            // config.services.service
            if (config.services) {
                for (const srv of config.services) {
                    if (!srv.name)
                        throw new Error(`OwnTrack: Service: 'name' is required.`);
                    if (srv.label && typeof srv.label !== 'string')
                        throw new Error(`OwnTrack: Service: 'label' must be a string.`);
                    if (!srv.trackingScriptUrl)
                        throw new Error(`OwnTrack: Service: 'trackingScriptUrl' is required.`);
                    if (typeof srv.trackingScriptUrl !== 'string')
                        throw new Error(`OwnTrack: Service: 'trackingScriptUrl' must be a string.`);
                    if (!srv.onInit || typeof srv.onInit !== 'function')
                        throw new Error(`OwnTrack: Service: 'onInit' callback is required.`);
                    if (!srv.handlers)
                        throw new Error(`OwnTrack: Service: 'handlers' is required.`);
                    if (typeof srv.handlers !== 'object')
                        throw new Error(`OwnTrack: Service: 'handlers' must be an object.`);
                }
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
        constructor(name, onInit) {
            this._n = name;
            this._onInit = onInit;
        }
        get name() {
            return this._n;
        }
    }

    const LS_ITEM_NAME = 'owntrack_uc';
    class TrackingGuard {
        constructor() {
            this._services = [];
            this._consents = [];
            this._consents = ls.getItem(LS_ITEM_NAME) || [];
        }
        _setFnGuard(handler) {
            return () => {
                return handler();
            };
        }
        wrapService({ name, label, trackingScriptUrl, onInit, handlers, }) {
            // console.log(name, label, trackingScriptUrl, handlers)
            const srv = new ServiceWrapper(name, onInit);
            for (const [fnName, fn] of Object.entries(handlers))
                srv[fnName] = this._setFnGuard(fn);
            this._services.push(srv);
            return srv;
        }
        save() {
            const consents = this._services.map((s) => ({
                srv: s.name,
                v: this._consents.some((c) => c.srv === s.name)
                    ? this._consents.filter((c) => c.srv === s.name)[0].v
                    : false,
                r: this._consents.some((c) => c.srv === s.name)
                    ? this._consents.filter((c) => c.srv === s.name)[0].r
                    : false,
            }));
            this._consents = consents;
            ls.setItem(LS_ITEM_NAME, consents);
        }
        isReviewed() {
            return this._consents.every((consent) => consent.r);
        }
    }

    class UIManager {
        constructor() {
            this._isConsentReviewed = false;
            this._initRoot();
            this._initEntry();
            window.addEventListener('DOMContentLoaded', this._mount.bind(this));
        }
        _initRoot() {
            this._elRoot = document.createElement('div');
            this._elRoot.classList.add('ot-root');
        }
        _initEntry() {
            const elBanner = document.createElement('div');
            elBanner.classList.add('ot-banner');
            const btns = [
                { t: 'Allow', c: 'allow', h: this._onAllowAll },
                { t: 'Deny', c: 'deny', h: this._onDenyAll },
            ];
            for (const btn of btns) {
                const elBtn = document.createElement('button');
                elBtn.classList.add(btn.c);
                elBtn.innerText = btn.t;
                elBtn.addEventListener('click', btn.h);
                elBanner.append(elBtn);
            }
            this._elRoot.append(elBanner);
        }
        _onAllowAll() {
            console.log('allowed');
        }
        _onDenyAll() {
            console.log('denied');
        }
        _mount() {
            document.body.append(this._elRoot);
        }
        setConsentReviewed(value) {
            this._isConsentReviewed = value;
        }
    }

    class OwnTrack {
        constructor(config) {
            this._trackingGuard = new TrackingGuard();
            this._uiManager = new UIManager();
            this._services = {};
            for (const srv of config.services) {
                this._services[srv.name] = this._trackingGuard.wrapService(srv);
            }
            this._trackingGuard.save();
            this._uiManager.setConsentReviewed(this._trackingGuard.isReviewed());
            console.log(this._uiManager);
        }
        service(name) {
            console.log(this);
        }
    }

    var index = (config) => {
        if (!window._OT && checkForValidInit(config))
            window._OT = new OwnTrack(config);
        return window._OT;
    };

    return index;

}));
