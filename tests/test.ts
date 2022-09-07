import {JSDOM} from "jsdom";

const dom = new JSDOM(
    `<!DOCTYPE html><p>Hello world</p>`,
    {
        url: "http://app.corvina.io",
        contentType: "text/html",
        includeNodeLocations: true,
        storageQuota: 10000000
    }
);
console.log(dom.window?.document?.querySelector("p")?.textContent); // "Hello world"

dom.window.addEventListener("message", m => console.log(m.data) );
dom.window.postMessage("test", "*");

global.window = <any>dom.window;
import { CorvinaConnect, CorvinaHost } from "../index";
const host = CorvinaHost.create({ jwt: "xxxxx", organizationId: "1", corvinaHost: "http://app.corvina.io" })
const client = CorvinaConnect.create({ corvinaHost: "http://app.corvina.io", corvinaHostWindow: global.window });
