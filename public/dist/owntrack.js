(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
    typeof define === 'function' && define.amd ? define(factory) :
    (global = typeof globalThis !== 'undefined' ? globalThis : global || self, global.OwnTrack = factory());
})(this, (function () { 'use strict';

    const checkForValidConfig = (config) => {
        try {
            // config
            if (!config)
                throw new Error('OwnTrack: A configuration object is required at first call.');
            // config.services
            if (!config.services)
                throw new Error(`OwnTrack: 'services' is required.`);
            if (!Array.isArray(config.services))
                throw new Error(`OwnTrack: 'services' must be an array.`);
            // config.services.service
            if (config.services) {
                for (const srv of config.services) {
                    // config.services.service.name
                    if (!srv.name)
                        throw new Error(`OwnTrack: Service [${srv.name}]: 'name' is required.`);
                    if (config.services.filter((s) => s.name === srv.name).length > 1)
                        throw new Error(`OwnTrack: Service names must be unique.`);
                    // config.services.service[scriptUrl | onInit | handlers]
                    if (!srv.scriptUrl && !srv.onInit && !srv.handlers)
                        throw new Error(`OwnTrack: Service [${srv.name}]' must contain at least one of the following properties: scriptUrl, onInit, handlers.`);
                    // config.services.service.label
                    if (srv.label && typeof srv.label !== 'string')
                        throw new Error(`OwnTrack: Service [${srv.name}]: 'label' must be a string.`);
                    // config.services.service.type
                    if (srv.type && typeof srv.type !== 'string')
                        throw new Error(`OwnTrack: Service [${srv.name}]: 'type' must be a string.`);
                    // config.services.service.description
                    if (srv.description && typeof srv.description !== 'string')
                        throw new Error(`OwnTrack: Service [${srv.name}]: 'description' must be a string.`);
                    // config.services.service.scriptUrl
                    if (srv.scriptUrl && typeof srv.scriptUrl !== 'string')
                        throw new Error(`OwnTrack: Service [${srv.name}]: 'scriptUrl' must be a string.`);
                    // config.services.service.onInit
                    if (srv.onInit && typeof srv.onInit !== 'function')
                        throw new Error(`OwnTrack: Service [${srv.name}]: 'onInit' must be a function.`);
                    // config.services.service.handlers
                    if (srv.handlers && typeof srv.handlers !== 'object')
                        throw new Error(`OwnTrack: Service [${srv.name}]: 'handlers' must be an object.`);
                    if (srv.handlers &&
                        Object.entries(srv.handlers).some((h) => typeof h[1] !== 'function'))
                        throw new Error(`OwnTrack: Service [${srv.name}]: 'handlers' properties must be function declarations.`);
                }
            }
        }
        catch (err) {
            console.error(err.message);
            return false;
        }
        return true;
    };
    const checkForValidServiceName = (name, services) => {
        try {
            if (!services.includes(name))
                throw new Error(`OwnTrack: '${name}' service is not registered.`);
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
    const getLogoElement = () => {
        const svg = document.createElementNS(NS, 'svg');
        svg.setAttribute('version', '1.1');
        svg.setAttribute('viewBox', '0 0 1282.93 709.16');
        const p1 = document.createElementNS(NS, 'polygon');
        const p2 = document.createElementNS(NS, 'polygon');
        p1.setAttribute('points', '501.45 0 207.71 0 0 207.71 0 501.45 207.71 709.16 501.45 709.16 709.16 501.45 709.16 207.71 501.45 0');
        p1.setAttribute('fill', '#88181a');
        p2.setAttribute('points', '1282.93 131.04 1150.56 0 646.02 0 778.38 131.04 915.5 131.04 915.5 709.16 1046.54 576.8 1046.54 131.04 1282.93 131.04');
        p2.setAttribute('fill', '#6e6e6e');
        svg.append(p1);
        svg.append(p2);
        svg.classList.add('ot-logo');
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
    const createScriptElmt = (url) => {
        const element = document.createElement('script');
        element.setAttribute('type', 'text/javascript');
        element.setAttribute('src', url);
        return element;
    };
    const generateIconElement = (icon) => {
        return {
            close: getIconCloseElement(),
        }[icon];
    };

    class TrackingService {
        constructor(name, label) {
            this.name = name;
            this._l = label;
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
            this._scriptQueue = [];
            this._initTaskQueue = [];
            this._tasksQueue = [];
            // rc: required cookies
            this._rcService = {
                isEditable: false,
                name: '_rc',
                description: 'This website uses some cookies needed for it to work. They cannot be disabled.',
                consent: { value: true, reviewed: true },
                ts: new TrackingService('_rc', 'Required cookies'),
            };
            this._consents = ls.getItem(LS_ITEM_NAME) || [];
        }
        wrapService({ name, label, type, description, scriptUrl, onInit, handlers, }) {
            if (scriptUrl)
                this._scriptQueue.push({
                    srv: name,
                    url: scriptUrl,
                    processed: false,
                    attachedHandler: false,
                });
            if (onInit)
                this._initTaskQueue.push({ srv: name, handler: onInit, processed: false });
            const srv = new TrackingService(name, label);
            if (handlers)
                for (const [fnName, fn] of Object.entries(handlers)) {
                    srv[fnName] = this._getWrappedTrackingFn(name, fn);
                }
            this._services.push(srv);
            return {
                isEditable: true,
                name,
                type,
                description,
                consent: {
                    value: this.hasConsent(name),
                    reviewed: this.isReviewed(name),
                },
                ts: srv,
            };
        }
        _getWrappedTrackingFn(srv, handler) {
            return (...args) => {
                this._tasksQueue.push({
                    srv,
                    handler,
                    args,
                    processed: false,
                });
                this._execTaskQueue();
            };
        }
        _execScriptTaskQueue() {
            this._scriptQueue = this._scriptQueue
                .map((task) => {
                if (!task.processed &&
                    !task.attachedHandler &&
                    this.isReviewed(task.srv) &&
                    this.hasConsent(task.srv)) {
                    const elScript = createScriptElmt(task.url);
                    elScript.addEventListener('load', () => {
                        task.processed = true;
                        console.log(`[${task.srv}] script task done`);
                        this._execScriptTaskQueue();
                        this._execInitTaskQueue();
                        this._execTaskQueue();
                    });
                    document.head.append(elScript);
                    task.attachedHandler = true;
                }
                return task;
            })
                .filter((task) => !task.processed);
        }
        _execInitTaskQueue() {
            this._initTaskQueue = this._initTaskQueue
                .map((task) => {
                const hasScriptDep = this._scriptQueue.filter((s) => s.srv === task.srv);
                const isScriptLoaded = hasScriptDep.length ? hasScriptDep[0].processed : true;
                if (isScriptLoaded &&
                    this.isReviewed(task.srv) &&
                    this.hasConsent(task.srv)) {
                    task.handler();
                    task.processed = true;
                    console.log(`[${task.srv}] init task done`);
                    this._execTaskQueue();
                }
                return task;
            })
                .filter((task) => !task.processed);
        }
        _execTaskQueue() {
            this._tasksQueue = this._tasksQueue
                .map((task) => {
                const hasScriptDep = this._scriptQueue.filter((s) => s.srv === task.srv);
                const isScriptLoaded = hasScriptDep.length ? hasScriptDep[0].processed : true;
                const hasInitDep = this._initTaskQueue.filter((s) => s.srv === task.srv);
                const isInitDone = hasInitDep.length ? hasInitDep[0].processed : true;
                if (isScriptLoaded &&
                    isInitDone &&
                    this.isReviewed(task.srv) &&
                    this.hasConsent(task.srv)) {
                    task.handler(...task.args);
                    task.processed = true;
                    console.log(`[${task.srv}] task done`);
                }
                return task;
            })
                .filter((task) => !task.processed);
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
        init() {
            this._execScriptTaskQueue();
            this._execInitTaskQueue();
            this._execTaskQueue();
        }
        setConsent(value, service = '') {
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
            this._execScriptTaskQueue();
            this._execInitTaskQueue();
            this._execTaskQueue();
        }
        setUnreviewedConsents(value) {
            this._consents = this._consents.map((consent) => {
                if (!consent.r)
                    consent.v = value;
                consent.r = true;
                return consent;
            });
            this.store();
            this._execScriptTaskQueue();
            this._execInitTaskQueue();
            this._execTaskQueue();
        }
        getRCService() {
            return this._rcService;
        }
        getTrackingServices() {
            return this._services.map((srv) => ({
                isEditable: true,
                name: srv.name,
                consent: {
                    value: this._consents.some((c) => c.srv === srv.name)
                        ? this._consents.filter((c) => c.srv === srv.name)[0].v
                        : false,
                    reviewed: this._consents.some((c) => c.srv === srv.name)
                        ? this._consents.filter((c) => c.srv === srv.name)[0].r
                        : false,
                },
                ts: srv,
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

    class DOMProxy {
        constructor(trackingGuard) {
            this._services = [];
            this._triggerDisplayed = false;
            this._manualOpen = false;
            this._entryDisplayed = false;
            this._settingsDisplayed = false;
            this._d = {
                r: createElmt('div'),
                tr: createElmt('div'),
                er: createElmt('div'),
                sr: createElmt('div'),
                sc: createElmt('div'),
                srvr: createElmt('div'), // services root
            };
            this._trackingGuard = trackingGuard;
        }
        _initBase() {
            this._d.r = document.createElement('div');
            this._d.r.classList.add('ot-root');
        }
        _initTrigger() {
            const elTriggerContainer = createElmt('div', ['ot-trigger']);
            const elTriggerInfo = createElmt('p', ['ot-trigger__info']);
            elTriggerInfo.innerHTML = 'Tracking<br />Protection';
            elTriggerContainer.append(getLogoElement());
            elTriggerContainer.append(elTriggerInfo);
            this._d.tr.classList.add('ot-trigger-container');
            this._d.tr.append(elTriggerContainer);
            this._d.tr.addEventListener('click', this._onMainTriggerClick.bind(this));
        }
        _initEntry() {
            this._d.er = createElmt('div', ['ot-entry-wrapper']);
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
                    h: this._onEDenyAllServicesClick.bind(this),
                },
                {
                    t: 'Allow',
                    c: ['otua-allow', 'ot-btn'],
                    a: { 'data-ot-entry-ua': 'allow' },
                    h: this._onEAllowAllServicesClick.bind(this),
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
            this._d.er.append(elEntry);
        }
        _initSettingsBase() {
            this._d.sr.classList.add('ot-settings-overlay');
            this._d.sc.classList.add('ot-settings');
        }
        _initSettingsHeader() {
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
                    h: this._onSDenyAllServicesClick.bind(this),
                },
                {
                    t: 'Allow all',
                    c: ['otua-allow', 'ot-btn', 'otua-allow'],
                    a: { 'data-ot-settings-ua': 'allow' },
                    h: this._onSAllowAllServicesClick.bind(this),
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
            this._d.sc.append(elCloseBtn);
            this._d.sc.append(elHeadline);
            this._d.sc.append(elNotice);
            this._d.sc.append(elGActions);
        }
        _initSettingsServices() {
            this._d.srvr.classList.add('ot-settings__services');
            for (const service of this._services) {
                const elSrv = createElmt('div', ['ot-settings__service'], {
                    'data-ot-srv': service.name,
                });
                const elSrvHeader = createElmt('div', ['ot-settings__service-header']);
                const elSrvName = createElmt('p', ['ot-settings__service-name']);
                const elSrvContent = createElmt('div', ['ot-settings__service-content']);
                const elSrvInfo = createElmt('div', ['ot-settings__service-info']);
                let elSrvType;
                if (service.type) {
                    elSrvType = createElmt('p', ['ot-settings__service-type']);
                    elSrvType.innerHTML = service.type;
                }
                elSrvName.innerHTML = service.ts.label;
                elSrvHeader.append(elSrvName);
                if (elSrvType)
                    elSrvHeader.append(elSrvType);
                let elSrvDesc;
                if (service.description) {
                    elSrvDesc = createElmt('div', ['ot-settings__service-desc']);
                    elSrvDesc.innerHTML = service.description;
                }
                let elSrvState;
                if (service.isEditable)
                    elSrvState = createElmt('div', ['ot-settings__service-state'], {
                        'data-ot-srv-state': '',
                    });
                if (elSrvDesc)
                    elSrvInfo.append(elSrvDesc);
                if (elSrvState)
                    elSrvInfo.append(elSrvState);
                let elSrvBtns;
                if (service.isEditable) {
                    elSrvBtns = createElmt('div', ['ot-settings__service-btns']);
                    const btns = [
                        {
                            t: 'Deny',
                            c: ['otua-deny', 'ot-btn', 'ot-btn-sm'],
                            a: { 'data-ot-settings-srv-ua': 'deny' },
                            h: this._onDenyServiceClick.bind(this),
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
                }
                elSrvContent.append(elSrvInfo);
                if (elSrvBtns)
                    elSrvContent.append(elSrvBtns);
                elSrv.append(elSrvHeader);
                elSrv.append(elSrvContent);
                this._d.srvr.append(elSrv);
            }
            this._d.sc.append(this._d.srvr);
        }
        _initSettingsFooter() {
            const elEntryCP = createElmt('div', ['ot-settings__cp']);
            const elEntryCPInfo = createElmt('div', ['ot-settings__cp-info']);
            elEntryCPInfo.innerHTML = 'Powered by OwnTrack';
            const elEntryCPLogo = createElmt('div', ['ot-settings__cp-logo']);
            elEntryCPLogo.append(getLogoElement());
            elEntryCP.append(elEntryCPInfo);
            elEntryCP.append(elEntryCPLogo);
            this._d.sc.append(elEntryCP);
        }
        _render() {
            // base
            if (this._triggerDisplayed) {
                this._d.r.append(this._d.tr);
            }
            else {
                this._d.tr.remove();
            }
            if (this._entryDisplayed) {
                this._d.r.append(this._d.er);
            }
            else {
                this._d.er.remove();
            }
            if (this._settingsDisplayed) {
                this._d.sr.append(this._d.sc);
                this._d.r.append(this._d.sr);
            }
            else {
                this._d.sr.remove();
            }
            // entry + settings
            const elBtnESettings = findElementChildByAttr(this._d.r, 'data-ot-entry-ua', 'settings');
            if (elBtnESettings) {
                if (this._settingsDisplayed)
                    elBtnESettings.classList.add('ot-active');
                else
                    elBtnESettings.classList.remove('ot-active');
            }
            const elBtnEDenyAll = findElementChildByAttr(this._d.r, 'data-ot-entry-ua', 'deny');
            const elBtnEAllowAll = findElementChildByAttr(this._d.r, 'data-ot-entry-ua', 'allow');
            const elBtnSDenyAll = findElementChildByAttr(this._d.sr, 'data-ot-settings-ua', 'deny');
            const elBtnSAllowAll = findElementChildByAttr(this._d.sr, 'data-ot-settings-ua', 'allow');
            elBtnEDenyAll === null || elBtnEDenyAll === void 0 ? void 0 : elBtnEDenyAll.classList.remove('ot-active');
            elBtnEAllowAll === null || elBtnEAllowAll === void 0 ? void 0 : elBtnEAllowAll.classList.remove('ot-active');
            elBtnSDenyAll === null || elBtnSDenyAll === void 0 ? void 0 : elBtnSDenyAll.classList.remove('ot-active');
            elBtnSAllowAll === null || elBtnSAllowAll === void 0 ? void 0 : elBtnSAllowAll.classList.remove('ot-active');
            if (this._trackingGuard.isReviewed()) {
                if (this._trackingGuard.hasGlobalConsent(false)) {
                    elBtnEDenyAll === null || elBtnEDenyAll === void 0 ? void 0 : elBtnEDenyAll.classList.add('ot-active');
                    elBtnSDenyAll === null || elBtnSDenyAll === void 0 ? void 0 : elBtnSDenyAll.classList.add('ot-active');
                }
                else if (this._trackingGuard.hasGlobalConsent(true)) {
                    elBtnEAllowAll === null || elBtnEAllowAll === void 0 ? void 0 : elBtnEAllowAll.classList.add('ot-active');
                    elBtnSAllowAll === null || elBtnSAllowAll === void 0 ? void 0 : elBtnSAllowAll.classList.add('ot-active');
                }
            }
            // settings:services
            for (const srv of this._services) {
                const elSrv = findElementChildByAttr(this._d.srvr, 'data-ot-srv', srv.name);
                if (elSrv) {
                    const elState = findElementChildByAttr(elSrv, 'data-ot-srv-state');
                    if (elState)
                        elState.innerHTML = this._getServiceStateLabel(srv);
                    const elBtnDeny = findElementChildByAttr(elSrv, 'data-ot-settings-srv-ua', 'deny');
                    const elBtnAllow = findElementChildByAttr(elSrv, 'data-ot-settings-srv-ua', 'allow');
                    elBtnDeny === null || elBtnDeny === void 0 ? void 0 : elBtnDeny.classList.remove('ot-active');
                    if (srv.consent.reviewed && !srv.consent.value)
                        elBtnDeny === null || elBtnDeny === void 0 ? void 0 : elBtnDeny.classList.add('ot-active');
                    elBtnAllow === null || elBtnAllow === void 0 ? void 0 : elBtnAllow.classList.remove('ot-active');
                    if (srv.consent.reviewed && srv.consent.value)
                        elBtnAllow === null || elBtnAllow === void 0 ? void 0 : elBtnAllow.classList.add('ot-active');
                }
            }
        }
        _onMainTriggerClick() {
            this._triggerDisplayed = false;
            this._entryDisplayed = true;
            this._manualOpen = true;
            this._render();
        }
        _onMainCloseClick() {
            this._trackingGuard.setUnreviewedConsents(false);
            this._services = this._trackingGuard.getTrackingServices();
            this._triggerDisplayed = true;
            this._entryDisplayed = false;
            this._settingsDisplayed = false;
            this._manualOpen = false;
            this._render();
        }
        _onSettingsOpenClick() {
            this._settingsDisplayed = true;
            this._render();
        }
        _onSettingsCloseClick() {
            this._settingsDisplayed = false;
            if (!this._manualOpen) {
                this._triggerDisplayed = this._trackingGuard.isReviewed();
                this._entryDisplayed = !this._trackingGuard.isReviewed();
            }
            this._render();
        }
        _onEAllowAllServicesClick() {
            this._trackingGuard.setConsent(true);
            this._triggerDisplayed = true;
            this._entryDisplayed = false;
            this._services = this._trackingGuard.getTrackingServices();
            this._render();
        }
        _onEDenyAllServicesClick() {
            this._trackingGuard.setConsent(false);
            this._triggerDisplayed = true;
            this._entryDisplayed = false;
            this._services = this._trackingGuard.getTrackingServices();
            this._render();
        }
        _onSAllowAllServicesClick() {
            this._trackingGuard.setConsent(true);
            this._services = this._trackingGuard.getTrackingServices();
            this._render();
        }
        _onSDenyAllServicesClick() {
            this._trackingGuard.setConsent(false);
            this._services = this._trackingGuard.getTrackingServices();
            this._render();
        }
        _onAllowServiceClick(service) {
            this._trackingGuard.setConsent(true, service);
            this._services = this._trackingGuard.getTrackingServices();
            this._render();
        }
        _onDenyServiceClick(service) {
            this._trackingGuard.setConsent(false, service);
            this._services = this._trackingGuard.getTrackingServices();
            this._render();
        }
        _getServiceStateLabel(srv) {
            if (!srv.consent.reviewed)
                return 'Pending';
            if (srv.consent.value)
                return 'Allowed';
            return 'Denied';
        }
        mount() {
            this._render();
            document.body.append(this._d.r);
        }
        setServices(services) {
            this._services = services;
        }
        init() {
            this._triggerDisplayed = this._trackingGuard.isReviewed();
            this._entryDisplayed = !this._trackingGuard.isReviewed();
            this._initBase();
            this._initTrigger();
            this._initEntry();
            this._initSettingsBase();
            this._initSettingsHeader();
            this._initSettingsServices();
            this._initSettingsFooter();
        }
    }

    class OwnTrack {
        constructor(config) {
            this._trackingGuard = new TrackingGuard();
            this._services = [];
            this._dp = new DOMProxy(this._trackingGuard);
            for (const service of config.services)
                this._services.push(this._trackingGuard.wrapService(service));
            this._trackingGuard.store();
            this._trackingGuard.init();
            this._dp.setServices([
                this._trackingGuard.getRCService(),
                ...this._services,
            ]);
            this._dp.init();
            window.addEventListener('DOMContentLoaded', () => {
                this._dp.mount();
            });
        }
        service(name) {
            if (checkForValidServiceName(name, this._services.map((s) => s.name)))
                return this._services.filter((s) => s.name === name)[0].ts;
        }
    }

    var index = (config) => {
        if (!window.__owntrack && checkForValidConfig(config))
            window.__owntrack = new OwnTrack(config);
        return window.__owntrack;
    };

    return index;

}));
