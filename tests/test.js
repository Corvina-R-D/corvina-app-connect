"use strict";
var _a, _b, _c;
Object.defineProperty(exports, "__esModule", { value: true });
var jsdom_1 = require("jsdom");
var index_1 = require("../index");
var dom = new jsdom_1.JSDOM("<!DOCTYPE html><p>Hello world</p>", {
    url: "https://example.org/",
    referrer: "https://example.com/",
    contentType: "text/html",
    includeNodeLocations: true,
    storageQuota: 10000000
});
console.log((_c = (_b = (_a = dom.window) === null || _a === void 0 ? void 0 : _a.document) === null || _b === void 0 ? void 0 : _b.querySelector("p")) === null || _c === void 0 ? void 0 : _c.textContent); // "Hello world"
dom.window.addEventListener("message", function (m) { return console.log(m.data); });
dom.window.postMessage("test", "*");
// global.window = <any>dom.window;
var host = index_1.CorvinaHost.create({ jwt: "xxxxx", organizationId: "1", corvinaHost: "corvina.io" });
var client = index_1.CorvinaConnect.create("corvina.io");
