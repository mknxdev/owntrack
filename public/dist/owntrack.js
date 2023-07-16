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

    class TrackingServiceWrapper {
        constructor(name, label, onInit) {
            this.name = name;
            this._l = label;
            this._onInit = onInit;
        }
        get label() {
            return this._l || this.name;
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
            const srv = new TrackingServiceWrapper(name, label, onInit);
            for (const [fnName, fn] of Object.entries(handlers))
                srv[fnName] = this._setFnGuard(fn);
            this._services.push(srv);
            return srv;
        }
        store() {
            const consents = this._services.map((srv) => ({
                srv: srv.name,
                v: this._consents.some((c) => c.srv === srv.name)
                    ? this._consents.filter((c) => c.srv === srv.name)[0].v
                    : false,
                r: this._consents.some((c) => c.srv === srv.name)
                    ? this._consents.filter((c) => c.srv === srv.name)[0].r
                    : false,
            }));
            this._consents = consents;
            ls.setItem(LS_ITEM_NAME, consents);
        }
        updateConsent(value, service = '') {
            if (!service)
                for (const consent of this._consents) {
                    consent.v = value;
                    consent.r = true;
                }
            else
                this._consents = this._consents.map((consent) => {
                    if (consent.srv === service) {
                        consent.v = value;
                        consent.r = true;
                    }
                    return consent;
                });
            this.store();
        }
        getTrackingServices() {
            return this._services.map((srv) => ({
                name: srv.name,
                consent: {
                    value: this._consents.some((c) => c.srv === srv.name)
                        ? this._consents.filter((c) => c.srv === srv.name)[0].v
                        : false,
                    reviewed: this._consents.some((c) => c.srv === srv.name)
                        ? this._consents.filter((c) => c.srv === srv.name)[0].r
                        : false,
                },
                sw: srv,
            }));
        }
        isReviewed(service = '') {
            if (!service)
                return this._consents.every((consent) => consent.r);
            return !!this._consents.filter((consent) => consent.srv === service && consent.r).length;
        }
        hasConsent(service = '') {
            if (!service)
                return this._consents.every((consent) => consent.v);
            return !!this._consents.filter((consent) => consent.srv === service && consent.v).length;
        }
        hasGlobalConsent(value) {
            return this._consents.every((c) => c.v === value);
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
        svg.classList.add('ot-icn');
        return svg;
    };
    const createElmt = (tag, classes = [], attrs = {}) => {
        const element = document.createElement(tag);
        for (const c of classes)
            element.classList.add(c);
        for (const [attr, val] of Object.entries(attrs))
            element.setAttribute(attr, val);
        return element;
    };
    const generateIconElement = (icon) => {
        return {
            close: getIconCloseElement(),
        }[icon];
    };

    const findElementChildByAttr = (el, attr, attrVal = '') => {
        let found = null;
        for (let i = 0; i < el.children.length; i++) {
            const child = el.children[i];
            const hasAttr = child.hasAttribute(attr);
            const childAttrVal = child.getAttribute(attr);
            if (hasAttr && (!attrVal || (attrVal && childAttrVal === attrVal)))
                found = child;
            else if (!found)
                found = findElementChildByAttr(child, attr, attrVal);
        }
        return found;
    };

    class UIManager {
        constructor(trackingGuard) {
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
            this._trackingGuard = trackingGuard;
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
                    c: ['otua-settings', 'ot-btn', 'ot-ghost'],
                    a: { 'data-ot-entry-ua': 'settings' },
                    h: this._onSettingsOpenClick.bind(this),
                },
                {
                    t: 'Deny',
                    c: ['otua-deny', 'ot-btn'],
                    a: { 'data-ot-entry-ua': 'deny' },
                    h: this._onDenyAllClick.bind(this),
                },
                {
                    t: 'Allow',
                    c: ['otua-allow', 'ot-btn'],
                    a: { 'data-ot-entry-ua': 'allow' },
                    h: this._onAllowAllClick.bind(this),
                },
                {
                    i: 'close',
                    c: ['otua-close', 'ot-btn', 'ot-btn-icn', 'ot-ghost', 'ot-rounded'],
                    a: { 'data-ot-entry-ua': 'close' },
                    h: this._onMainCloseClick.bind(this),
                },
            ];
            const elEntryBtns = createElmt('div', ['ot-entry__btns']);
            for (const btn of btns) {
                let elEntryBtn;
                if (btn.t) {
                    elEntryBtn = createElmt('button', btn.c, btn.a);
                    elEntryBtn.innerHTML = btn.t;
                }
                else if (btn.i) {
                    elEntryBtn = createElmt('div', btn.c, btn.a);
                    elEntryBtn.append(generateIconElement('close'));
                }
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
            const elCloseBtn = createElmt('div', [
                'ot-settings__close',
                'ot-btn',
                'ot-btn-icn',
                'ot-ghost',
                'ot-rounded',
            ]);
            elCloseBtn.addEventListener('click', this._onSettingsCloseClick.bind(this));
            const elClose = generateIconElement('close');
            elCloseBtn.append(elClose);
            elSettings.append(elCloseBtn);
            this._d.sr.append(elSettings);
            // content
            let content;
            for (let i = 0; i < this._d.sr.children.length; i++)
                if (this._d.sr.children.item(Number(i)).classList.contains('ot-settings'))
                    content = this._d.sr.children.item(Number(i));
            const elHeadline = createElmt('h1');
            elHeadline.innerHTML = 'Tracking Settings';
            const elNotice = createElmt('p', ['ot-settings__notice']);
            elNotice.innerHTML =
                'Here you can manage tracking/analytics acceptance for each service.<br/> You can also accept or deny tracking for all services at once.';
            const elGActions = createElmt('div', ['ot-settings__main-actions']);
            const btns = [
                {
                    t: 'Deny all',
                    c: ['otua-deny', 'ot-btn', 'otua-deny'],
                    a: { 'data-ot-settings-ua': 'deny' },
                    h: this._onDenyAllClick.bind(this),
                },
                {
                    t: 'Allow all',
                    c: ['otua-allow', 'ot-btn', 'otua-allow'],
                    a: { 'data-ot-settings-ua': 'allow' },
                    h: this._onAllowAllClick.bind(this),
                },
            ];
            const elGActionsBtns = createElmt('div', [
                'ot-settings__main-actions__btns',
            ]);
            for (const btn of btns) {
                const elEntryBtn = createElmt('button', btn.c, btn.a);
                elEntryBtn.innerHTML = btn.t;
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
        _render() {
            // entry + settings
            const elBtnEntryDenyAll = findElementChildByAttr(this._d.r, 'data-ot-entry-ua', 'deny');
            const elBtnEntryAllowAll = findElementChildByAttr(this._d.r, 'data-ot-entry-ua', 'allow');
            const elBtnSettingsDenyAll = findElementChildByAttr(this._d.sr, 'data-ot-settings-ua', 'deny');
            const elBtnSettingsAllowAll = findElementChildByAttr(this._d.sr, 'data-ot-settings-ua', 'allow');
            elBtnEntryDenyAll.classList.remove('ot-active');
            elBtnEntryAllowAll.classList.remove('ot-active');
            elBtnSettingsDenyAll.classList.remove('ot-active');
            elBtnSettingsAllowAll.classList.remove('ot-active');
            if (this._trackingGuard.isReviewed()) {
                if (this._trackingGuard.hasGlobalConsent(false)) {
                    elBtnEntryDenyAll.classList.add('ot-active');
                    elBtnSettingsDenyAll.classList.add('ot-active');
                }
                else if (this._trackingGuard.hasGlobalConsent(true)) {
                    elBtnEntryAllowAll.classList.add('ot-active');
                    elBtnSettingsAllowAll.classList.add('ot-active');
                }
            }
            // settings:services
            for (const srv of this._services) {
                const elSrv = findElementChildByAttr(this._d.srvr, 'data-ot-srv', srv.name);
                if (elSrv) {
                    const elState = findElementChildByAttr(elSrv, 'data-ot-srv-state');
                    elState.innerHTML = this._getServiceStateLabel(srv);
                    const elBtnDeny = findElementChildByAttr(elSrv, 'data-ot-settings-srv-ua', 'deny');
                    const elBtnAllow = findElementChildByAttr(elSrv, 'data-ot-settings-srv-ua', 'allow');
                    elBtnDeny.classList.remove('ot-active');
                    elBtnAllow.classList.remove('ot-active');
                    if (srv.consent.reviewed) {
                        if (!srv.consent.value)
                            elBtnDeny.classList.add('ot-active');
                        else
                            elBtnAllow.classList.add('ot-active');
                    }
                }
            }
        }
        _onMainCloseClick() { }
        _onSettingsOpenClick() {
            for (let i = 0; i < this._d.r.children.length; i++)
                if (!this._d.r.children
                    .item(Number(i))
                    .classList.contains('ot-settings-overlay'))
                    this._d.r.append(this._d.sr);
        }
        _onSettingsCloseClick() {
            for (let i = 0; i < this._d.r.children.length; i++)
                if (this._d.r.children
                    .item(Number(i))
                    .classList.contains('ot-settings-overlay'))
                    this._d.sr.remove();
        }
        _onAllowAllClick() {
            this._trackingGuard.updateConsent(true);
            this._services = this._trackingGuard.getTrackingServices();
            this._render();
        }
        _onDenyAllClick() {
            this._trackingGuard.updateConsent(false);
            this._services = this._trackingGuard.getTrackingServices();
            this._render();
        }
        _onAllowServiceClick(service) {
            this._trackingGuard.updateConsent(true, service);
            this._services = this._trackingGuard.getTrackingServices();
            this._render();
        }
        _onDenyServicelClick(service) {
            this._trackingGuard.updateConsent(false, service);
            this._services = this._trackingGuard.getTrackingServices();
            this._render();
        }
        mount() {
            this._render();
            let settings;
            for (let i = 0; i < this._d.sr.children.length; i++)
                if (this._d.sr.children.item(Number(i)).classList.contains('ot-settings'))
                    settings = this._d.sr.children.item(Number(i));
            settings.append(this._d.srvr);
            this._d.r.append(this._d.sr);
            document.body.append(this._d.r);
        }
        _getServiceStateLabel(srv) {
            console.log(srv);
            if (!srv.consent.reviewed)
                return 'Pending';
            if (srv.consent.value)
                return 'Allowed';
            return 'Denied';
        }
        initSettingsService(services) {
            this._services = services;
            for (const service of services) {
                const elSrv = createElmt('div', ['ot-settings__service'], {
                    'data-ot-srv': service.name,
                });
                const elSrvHeader = createElmt('div', ['ot-settings__service-header']);
                const elSrvName = createElmt('p', ['ot-settings__service-name']);
                const elSrvType = createElmt('p', ['ot-settings__service-type']);
                elSrvName.innerHTML = service.sw.label;
                elSrvType.innerHTML = 'Tracking Measurement';
                elSrvHeader.append(elSrvName);
                elSrvHeader.append(elSrvType);
                const elSrvContent = createElmt('div', ['ot-settings__service-content']);
                const elSrvInfo = createElmt('div', ['ot-settings__service-info']);
                const elSrvState = createElmt('div', ['ot-settings__service-state'], {
                    'data-ot-srv-state': '',
                });
                elSrvInfo.append(elSrvState);
                const elSrvBtns = createElmt('div', ['ot-settings__service-btns']);
                const btns = [
                    {
                        t: 'Deny',
                        c: ['otua-deny', 'ot-btn', 'ot-btn-sm'],
                        a: { 'data-ot-settings-srv-ua': 'deny' },
                        h: this._onDenyServicelClick.bind(this),
                    },
                    {
                        t: 'Allow',
                        c: ['otua-allow', 'ot-btn', 'ot-btn-sm'],
                        a: { 'data-ot-settings-srv-ua': 'allow' },
                        h: this._onAllowServiceClick.bind(this),
                    },
                ];
                for (const btn of btns) {
                    const elServiceBtn = createElmt('button', btn.c, btn.a);
                    elServiceBtn.innerHTML = btn.t;
                    elServiceBtn.addEventListener('click', (e) => btn.h(service.name, e));
                    elSrvBtns.append(elServiceBtn);
                }
                elSrvContent.append(elSrvInfo);
                elSrvContent.append(elSrvBtns);
                elSrv.append(elSrvHeader);
                elSrv.append(elSrvContent);
                this._d.srvr.append(elSrv);
            }
        }
        setConsentReviewed(value) {
            this._isConsentReviewed = value;
        }
    }

    class OwnTrack {
        constructor(config) {
            this._trackingGuard = new TrackingGuard();
            this._uiManager = new UIManager(this._trackingGuard);
            const serviceWrappers = [];
            for (const service of config.services)
                serviceWrappers.push(this._trackingGuard.wrapService(service));
            this._trackingGuard.store();
            const services = serviceWrappers.map((sw) => ({
                name: sw.name,
                consent: {
                    value: this._trackingGuard.hasConsent(sw.name),
                    reviewed: this._trackingGuard.isReviewed(sw.name),
                },
                sw,
            }));
            this._uiManager.initSettingsService(services);
            this._uiManager.setConsentReviewed(this._trackingGuard.isReviewed());
            window.addEventListener('DOMContentLoaded', this._onReady.bind(this));
        }
        _onReady() {
            this._uiManager.mount();
            console.log(this);
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
