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
    const createElmt = (tag, classes = []) => {
        const element = document.createElement(tag);
        for (const c of classes)
            element.classList.add(c);
        return element;
    };
    const generateIconElement = (icon) => {
        return {
            close: getIconCloseElement(),
        }[icon];
    };

    class UIManager {
        constructor() {
            this._services = [];
            this._isConsentReviewed = false;
            // _d: DOM
            // _d.r: root
            // _d.sr: settings root
            // _d.srvr: services root
            this._d = {
                r: createElmt('div'),
                sr: createElmt('div'),
                srvr: createElmt('div'),
            };
            this._initBase();
            this._initEntry();
            this._initSettings();
            this._initServices();
        }
        _initBase() {
            this._d.r = document.createElement('div');
            this._d.r.classList.add('ot-root');
        }
        _initEntry() {
            const elEntryWrapper = createElmt('div', ['ot-entry-wrapper']);
            const elEntry = createElmt('div', ['ot-entry']);
            const elEntryNotice = createElmt('div', ['ot-entry__notice']);
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
            const elEntryBtns = createElmt('div', ['ot-entry__btns']);
            for (const btn of btns) {
                const elEntryBtn = document.createElement('button');
                btn.c.forEach((c) => elEntryBtn.classList.add(c));
                elEntryBtn.innerText = btn.t;
                elEntryBtn.addEventListener('click', btn.h);
                elEntryBtns.append(elEntryBtn);
            }
            elEntry.append(elEntryBtns);
            elEntryWrapper.append(elEntry);
            this._d.r.append(elEntryWrapper);
        }
        _initSettings() {
            this._d.sr.classList.add('ot-settings-overlay');
            const elSettings = createElmt('div', ['ot-settings']);
            // "close" btn
            const elCloseBtn = createElmt('div', ['ot-settings__close']);
            elCloseBtn.addEventListener('click', this._onCloseSettingsClick.bind(this));
            const elClose = generateIconElement('close');
            elClose.classList.add('ot-icn');
            elCloseBtn.append(elClose);
            elSettings.append(elCloseBtn);
            this._d.sr.append(elSettings);
            // content
            let content;
            for (const i in this._d.sr.children)
                if (this._d.sr.children.item(Number(i)).classList.contains('ot-settings'))
                    content = this._d.sr.children.item(Number(i));
            const elHeadline = createElmt('h1');
            elHeadline.innerText = 'Tracking Settings';
            const elNotice = createElmt('p', ['ot-settings__notice']);
            elNotice.innerHTML =
                'Here you can manage tracking/analytics acceptance for each service.<br/> You can also accept or deny tracking for all services at once.';
            const elGActions = createElmt('div', ['ot-settings__main-actions']);
            const btns = [
                {
                    t: 'Deny all',
                    c: ['deny', 'ot-btn', 'ot-error'],
                    h: this._onDenyAllClick.bind(this),
                },
                {
                    t: 'Allow all',
                    c: ['allow', 'ot-btn', 'ot-success'],
                    h: this._onAllowAllClick.bind(this),
                },
            ];
            const elGActionsBtns = createElmt('div', [
                'ot-settings__main-actions__btns',
            ]);
            for (const btn of btns) {
                const elEntryBtn = document.createElement('button');
                btn.c.forEach((c) => elEntryBtn.classList.add(c));
                elEntryBtn.innerText = btn.t;
                elEntryBtn.addEventListener('click', btn.h);
                elGActionsBtns.append(elEntryBtn);
            }
            elGActions.append(elGActionsBtns);
            content.append(elHeadline);
            content.append(elNotice);
            content.append(elGActions);
        }
        _initServices() {
            this._d.srvr.classList.add('ot-settings__services');
        }
        _onOpenSettingsClick() {
            for (const i in this._d.r.children)
                if (!this._d.r.children
                    .item(Number(i))
                    .classList.contains('ot-settings-overlay'))
                    this._d.r.append(this._d.sr);
        }
        _onCloseSettingsClick() {
            for (const i in this._d.r.children)
                if (this._d.r.children
                    .item(Number(i))
                    .classList.contains('ot-settings-overlay'))
                    this._d.sr.remove();
        }
        _onAllowAllClick() {
            console.log('allowed');
        }
        _onDenyAllClick() {
            console.log('denied');
        }
        mount() {
            let settings;
            for (const i in this._d.sr.children)
                if (this._d.sr.children.item(Number(i)).classList.contains('ot-settings'))
                    settings = this._d.sr.children.item(Number(i));
            settings.append(this._d.srvr);
            this._d.r.append(this._d.sr);
            document.body.append(this._d.r);
        }
        setTrackingServices(services) {
            this._services = services;
            for (const service of services) {
                createElmt('div', ['ot-settings__service']);
                console.log(service);
            }
        }
        setConsentReviewed(value) {
            this._isConsentReviewed = value;
        }
    }

    class OwnTrack {
        constructor(config) {
            this._trackingGuard = new TrackingGuard();
            this._uiManager = new UIManager();
            this._services = [];
            for (const service of config.services) {
                this._services.push({
                    name: service.name,
                    srv: this._trackingGuard.wrapService(service),
                });
            }
            this._trackingGuard.save();
            this._uiManager.setTrackingServices(this._services);
            this._uiManager.setConsentReviewed(this._trackingGuard.isReviewed());
            window.addEventListener('DOMContentLoaded', this._onReady.bind(this));
        }
        _onReady() {
            this._uiManager.mount();
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
