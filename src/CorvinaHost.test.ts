import { CorvinaConnect, CorvinaConnectEventType } from './CorvinaConnect';
import { CorvinaHost } from './CorvinaHost';
import { IJwtAppMap, IMessage, MessageType } from './common';


describe('CorvinaHost', () => {
    let corvinaHost: CorvinaHost;
    
    const iframeUrl = 'http://iframe';
    const jwtApp = new Map() as IJwtAppMap;
    jwtApp.set(iframeUrl, {
        jwt: 'test-jwt',
        iframeOrigin: iframeUrl,
    });
    const username = 'test-user';
    const organizationId = 'test-org-id';
    const organizationResourceId = 'test-org-resource-id';
    const corvinaDomain = 'localhost';
    const corvinaHostUrl = "http://" + corvinaDomain;
    const defaultStandardTime = new Date();
    const brandName = 'TestBrand';

    const patchWindowObjects = ({ mainWindow, iframeWindow }: { mainWindow: Window, iframeWindow: Window }): { mainWindowFromIFrame: Window, iframeWindow: Window } => {
        const jsdomPostMessage: any = iframeWindow.postMessage;
        (iframeWindow as any).postMessage = (message: any, options?: WindowPostMessageOptions) => {
            if (options && options.targetOrigin) {
                // ensure to use only the suppported signature, and remove any restriction on the source
                jsdomPostMessage.call(iframeWindow, { ...message }, '*');
            } else {
                jsdomPostMessage.call(iframeWindow, message);
            }
        }

        // ensure the main window, when posting 
        const postMessageFromIframeHandler = {
            get: function (target: any, prop: any, receiver: any) {
                if (prop === 'postMessage') {
                    return (...args: any[]) => {
                        target.dispatchEvent(new MessageEvent(
                            'message', {
                            data: { ...args[0] },
                            source: iframeWindow,
                            origin: iframeUrl,
                        }), args[1]);
                    }
                }
                return Reflect.get(target, prop, receiver);
            },
        };
        return {
            mainWindowFromIFrame: new Proxy(mainWindow, postMessageFromIframeHandler),
            iframeWindow,
        }
    }


    beforeEach(async () => {
        corvinaHost = await CorvinaHost.create({
            jwtApp,
            username,
            organizationId,
            organizationResourceId,
            corvinaHost: corvinaHostUrl,
            corvinaDomain,
            defaultStandardTime,
            brandName,
        });
    });

    afterEach(() => {
        corvinaHost.dispose();
    });

    it('should initialize CorvinaHost and handle CORVINA_CONNECT_INIT message', () => {
        const iframe = document.createElement('iframe');
        iframe.id = 'corvina-app-connect-test';
        document.body.appendChild(iframe);

        const message: IMessage = {
            type: MessageType.CORVINA_CONNECT_INIT,
            payload: {},
        };

        const event = new MessageEvent('message', {
            data: message,
            origin: corvinaHostUrl,
            source: iframe.contentWindow,
        });

        patchWindowObjects({ mainWindow: window, iframeWindow: iframe.contentWindow! });
        const postMessageMocked = jest.spyOn(iframe.contentWindow!, 'postMessage');

        window.dispatchEvent(event);

        /*
        const responseMessage: IMessage = {
            type: MessageType.CORVINA_CONNECT_INIT_RESPONSE,
            payload: {
                jwt: jwtApp.get(iframeUrl)!.jwt,
                username,
                organizationId,
                organizationResourceId,
                corvinaHost: corvinaHostUrl,
                corvinaDomain,
                theme: undefined,
                defaultStandardTime,
                brandName,
            },
        };
        */

        expect(postMessageMocked).toHaveBeenCalledTimes(1);

        document.body.removeChild(iframe);
    });

    it('should handle IFRAME_HREF_CHANGED message', () => {
        const iframe = document.createElement('iframe');
        iframe.id = 'corvina-app-connect-test';
        document.body.appendChild(iframe);

        const newHref = 'http://localhost/new-path';
        const message: IMessage = {
            type: MessageType.IFRAME_HREF_CHANGED,
            payload: {
                href: newHref,
            },
        };

        const event = new MessageEvent('message', {
            data: message,
            origin: corvinaHostUrl,
            source: iframe.contentWindow,
        });

        window.dispatchEvent(event);

        expect(corvinaHost['_appHref']).toBe(newHref);

        document.body.removeChild(iframe);
    });

    it('host synchronization', async () => {
        const iframe = document.createElement('iframe');
        iframe.src = iframeUrl + '/#/new-path-1'; // Set the iframe src to the desired URL
        iframe.id = 'corvina-app-connect-test';

        document.body.appendChild(iframe);

        const { iframeWindow, mainWindowFromIFrame } = patchWindowObjects({ mainWindow: window, iframeWindow: iframe.contentWindow! });

        const connect = await CorvinaConnect.create({
            corvinaHost: 'http://localhost',
            currentWindow: iframeWindow,
            corvinaHostWindow: mainWindowFromIFrame
        });

        corvinaHost.enableNavigationSync();
        connect.enableNavigationSync();

        connect.on(CorvinaConnectEventType.IFRAME_HREF_CHANGED, ({ href, type }) => {
            iframeWindow.history.pushState({}, '', href);
        });

        iframeWindow.history.pushState({}, '', iframeUrl + '/#/new-path-2');
        // sleep 100ms
        await new Promise(resolve => setTimeout(resolve, 100));

        console.log('window location: ', window.location.href);

        expect(window.location.href).toContain('appHref');
        expect(window.location.href).toContain('new-path-2');

        // the other way around
        window.history.pushState({}, '', 'http://localhost/?appHref=http%3A%2F%2Fiframe%2F%23%2Fnew-path-3');

        await new Promise(resolve => setTimeout(resolve, 100));
        console.log('iframe location: ', iframeWindow.location.href);

        expect(iframeWindow.location.href).toContain('new-path-3');
        expect(iframeWindow.history.length).toBe(3);
        expect(window.history.length).toBe(3);

        // host synchronization without history tracking (using replaceState)
        iframeWindow.history.replaceState({}, '', iframeUrl + '/#/new-path-4');

        await new Promise(resolve => setTimeout(resolve, 100));
        expect(window.location.href).toContain('new-path-4');
        expect(iframeWindow.history.length).toBe(3);
        expect(window.history.length).toBe(3);


        connect.dispose();
        corvinaHost.dispose();

        document.body.removeChild(iframe);
    }, 30000);

    it('send JWT_CHANGED message to target iframes only', async () => {
        // two iframes for different apps on a page
        const iframe1 = document.createElement('iframe');
        const url1 = 'http://iframe1';
        iframe1.src = url1;
        iframe1.id = 'corvina-app-connect-test-1';
        document.body.appendChild(iframe1);

        const iframe2 = document.createElement('iframe');
        const url2 = 'http://iframe2';
        iframe2.src = url2;
        iframe2.id = 'corvina-app-connect-test-2';
        document.body.appendChild(iframe2);

        const { iframeWindow: iframeWindow1, mainWindowFromIFrame: mainWindowFromIFrame1 } = patchWindowObjects({ mainWindow: window, iframeWindow: iframe1.contentWindow! });
        const { iframeWindow: iframeWindow2, mainWindowFromIFrame: mainWindowFromIFrame2 } = patchWindowObjects({ mainWindow: window, iframeWindow: iframe2.contentWindow! });

        const connect1 = await CorvinaConnect.create({
            corvinaHost: 'http://localhost',
            currentWindow: iframeWindow1,
            corvinaHostWindow: mainWindowFromIFrame1
        });

        const connect2 = await CorvinaConnect.create({
            corvinaHost: 'http://localhost',
            currentWindow: iframeWindow2,
            corvinaHostWindow: mainWindowFromIFrame2
        });

        const postMessageMocked1 = jest.spyOn(iframe1.contentWindow!, 'postMessage');
        const postMessageMocked2 = jest.spyOn(iframe2.contentWindow!, 'postMessage');
        
        corvinaHost.setJwtApp({
            jwt: 'jwt1',
            iframeOrigin: url1,
        })

        corvinaHost.setJwtApp({
            jwt: 'jwt2',
            iframeOrigin: url2,
        })

        expect(postMessageMocked1).toHaveBeenCalledTimes(1);
        expect(postMessageMocked1).toHaveBeenCalledWith(
            {payload: {jwt: "jwt1"}, type: "JWT_CHANGED"}, {targetOrigin: "http://iframe1/"}
        );
        expect(postMessageMocked2).toHaveBeenCalledTimes(1);
        expect(postMessageMocked2).toHaveBeenCalledWith(
            {payload: {jwt: "jwt2"}, type: "JWT_CHANGED"}, {targetOrigin: "http://iframe2/"}
        );

        // add a second iframe on the page for app1
        const iframe3 = document.createElement('iframe');
        iframe3.src = url1;
        iframe3.id = 'corvina-app-connect-test-3';
        document.body.appendChild(iframe3);

        const { iframeWindow: iframeWindow3, mainWindowFromIFrame: mainWindowFromIFrame3 } = patchWindowObjects({ mainWindow: window, iframeWindow: iframe3.contentWindow! });

        const connect3 = await CorvinaConnect.create({
            corvinaHost: 'http://localhost',
            currentWindow: iframeWindow3,
            corvinaHostWindow: mainWindowFromIFrame3
        });
        const postMessageMocked3 = jest.spyOn(iframe3.contentWindow!, 'postMessage');
        corvinaHost.setJwtApp({
            jwt: 'jwt1',
            iframeOrigin: url1,
        })

        // the jwt should be sent both to iframe1 and iframe3...
        expect(postMessageMocked3).toHaveBeenCalledTimes(1);
        expect(postMessageMocked3).toHaveBeenCalledWith(
            {payload: {jwt: "jwt1"}, type: "JWT_CHANGED"}, {targetOrigin: "http://iframe1/"}
        );
        expect(postMessageMocked1).toHaveBeenCalledTimes(2);
        expect(postMessageMocked1).toHaveBeenCalledWith(
            {payload: {jwt: "jwt1"}, type: "JWT_CHANGED"}, {targetOrigin: "http://iframe1/"}
        );
        // .. but not to iframe2
        expect(postMessageMocked2).toHaveBeenCalledTimes(1);

        document.body.removeChild(iframe1);
        document.body.removeChild(iframe2);
    });

});
