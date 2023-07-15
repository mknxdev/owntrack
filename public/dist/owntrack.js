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

    const NS = 'http://www.w3.org/2000/svg';
    const getIconCloseElement = () => {
        const svg = document.createElementNS(NS, 'svg');
        svg.setAttribute('version', '1.1');
        svg.setAttribute('viewBox', '0 0 24 24');
        const l1 = document.createElementNS(NS, 'line');
        l1.setAttribute('x1', '1');
        l1.setAttribute('y1', '23');
        l1.setAttribute('x2', '23');
        l1.setAttribute('y2', '1');
        const l2 = document.createElementNS(NS, 'line');
        l2.setAttribute('x1', '1');
        l2.setAttribute('y1', '1');
        l2.setAttribute('x2', '23');
        l2.setAttribute('y2', '23');
        l1.setAttribute('stroke-width', '3');
        l2.setAttribute('stroke-width', '3');
        l1.setAttribute('stroke', '#000000');
        l2.setAttribute('stroke', '#000000');
        svg.append(l1);
        svg.append(l2);
        return svg;
    };
    const generateIconElement = (icon) => {
        return {
            close: getIconCloseElement(),
        }[icon];
    };

    class UIManager {
        constructor() {
            this._isConsentReviewed = false;
            this._d = {
                root: document.createElement('div'),
                settingsRoot: document.createElement('div'),
            };
            this._initBase();
            this._initEntry();
            this._initSettings();
            window.addEventListener('DOMContentLoaded', this._mount.bind(this));
        }
        _initBase() {
            this._d.root = document.createElement('div');
            this._d.root.classList.add('ot-root');
        }
        _initEntry() {
            const elEntryWrapper = document.createElement('div');
            elEntryWrapper.classList.add('ot-entry-wrapper');
            const elEntry = document.createElement('div');
            elEntry.classList.add('ot-entry');
            const elEntryNotice = document.createElement('div');
            elEntryNotice.classList.add('ot-entry__notice');
            elEntryNotice.innerHTML =
                '<p>This website uses cookies &amp; analytics for tracking and/or advertising purposes. You can choose to accept them or not.</p>';
            elEntry.append(elEntryNotice);
            const btns = [
                {
                    t: 'Settings',
                    c: ['settings', 'ot-btn', 'ot-ghost'],
                    h: this._onOpenSettingsClick.bind(this),
                },
                {
                    t: 'Deny',
                    c: ['deny', 'ot-btn', 'ot-error'],
                    h: this._onDenyAllClick.bind(this),
                },
                {
                    t: 'Allow',
                    c: ['allow', 'ot-btn', 'ot-success'],
                    h: this._onAllowAllClick.bind(this),
                },
            ];
            const elEntryBtns = document.createElement('div');
            elEntryBtns.classList.add('ot-entry__btns');
            for (const btn of btns) {
                const elEntryBtn = document.createElement('button');
                btn.c.forEach((c) => elEntryBtn.classList.add(c));
                elEntryBtn.innerText = btn.t;
                elEntryBtn.addEventListener('click', btn.h);
                elEntryBtns.append(elEntryBtn);
            }
            elEntry.append(elEntryBtns);
            elEntryWrapper.append(elEntry);
            this._d.root.append(elEntryWrapper);
        }
        _initSettings() {
            this._d.settingsRoot.classList.add('ot-settings-overlay');
            const elSettings = document.createElement('div');
            elSettings.classList.add('ot-settings');
            const elCloseBtn = document.createElement('div');
            elCloseBtn.classList.add('ot-settings__close');
            elCloseBtn.addEventListener('click', this._onCloseSettingsClick.bind(this));
            const elClose = generateIconElement('close');
            elClose.classList.add('ot-icn');
            elCloseBtn.append(elClose);
            elSettings.append(elCloseBtn);
            this._d.settingsRoot.append(elSettings);
        }
        _onOpenSettingsClick() {
            for (const i in this._d.root.children)
                if (!this._d.root.children
                    .item(Number(i))
                    .classList.contains('ot-settings-overlay'))
                    this._d.root.append(this._d.settingsRoot);
        }
        _onCloseSettingsClick() {
            for (const i in this._d.root.children)
                if (this._d.root.children
                    .item(Number(i))
                    .classList.contains('ot-settings-overlay'))
                    this._d.settingsRoot.remove();
        }
        _onAllowAllClick() {
            console.log('allowed');
        }
        _onDenyAllClick() {
            console.log('denied');
        }
        _mount() {
            this._d.root.append(this._d.settingsRoot);
            document.body.append(this._d.root);
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
