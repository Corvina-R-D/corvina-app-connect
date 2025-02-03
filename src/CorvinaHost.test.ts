import { CorvinaConnect, CorvinaConnectEventType } from './CorvinaConnect';
import { CorvinaHost } from './CorvinaHost';
import { IMessage, MessageType } from './common';


describe('CorvinaHost', () => {
    let corvinaHost: CorvinaHost;
    const jwt = 'test-jwt';
    const username = 'test-user';
    const organizationId = 'test-org-id';
    const organizationResourceId = 'test-org-resource-id';
    const corvinaHostUrl = 'http://localhost';
    const corvinaDomain = 'localhost';
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
        const postMessageFromIframeHamdler = {
            get: function (target: any, prop: any, receiver: any) {
                if (prop === 'postMessage') {
                    return (...args: any[]) => {
                        target.dispatchEvent(new MessageEvent(
                            'message', {
                            data: { ...args[0] },
                            source: iframeWindow,
                            origin: corvinaHostUrl
                        }), args[1]);
                    }
                }
                return Reflect.get(target, prop, receiver);
            },
        };
        return {
            mainWindowFromIFrame: new Proxy(mainWindow, postMessageFromIframeHamdler),
            iframeWindow,
        }
    }


    beforeEach(async () => {
        corvinaHost = await CorvinaHost.create({
            jwt,
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

        const responseMessage: IMessage = {
            type: MessageType.CORVINA_CONNECT_INIT_RESPONSE,
            payload: {
                jwt,
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
        iframe.src = 'http://iframe/#/new-path-1'; // Set the iframe src to the desired URL
        iframe.id = 'corvina-app-connect-test';


        document.body.appendChild(iframe);

        const { iframeWindow, mainWindowFromIFrame } = patchWindowObjects({ mainWindow: window, iframeWindow: iframe.contentWindow! });

        const connect = await CorvinaConnect.create({
            corvinaHost: 'https://localhost',
            currentWindow: iframeWindow,
            corvinaHostWindow: mainWindowFromIFrame
        });

        corvinaHost.enableNavigationSync();
        connect.enableNavigationSync();

        connect.on(CorvinaConnectEventType.IFRAME_HREF_CHANGED, ({ href, type }) => {
            iframeWindow.history.pushState({}, '', href);
        });

        iframeWindow.history.pushState({}, '', 'http://iframe/#/new-path-2');
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
        iframeWindow.history.replaceState({}, '', 'http://iframe/#/new-path-4');

        await new Promise(resolve => setTimeout(resolve, 100));
        expect(window.location.href).toContain('new-path-4');
        expect(iframeWindow.history.length).toBe(3);
        expect(window.history.length).toBe(3);


        connect.dispose();
        corvinaHost.dispose();

        document.body.removeChild(iframe);
    }, 30000);
});
