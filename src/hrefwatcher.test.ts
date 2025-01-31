import { UrlWatcher } from './hrefwatcher';
import { appHrefQueryString } from './common';

describe('UrlWatcher', () => {
    let urlWatcher: UrlWatcher;
    let onUrlChangeMock: jest.Mock;

    beforeEach(() => {
        // clear window history
        window.history.pushState({}, '', '/');
        onUrlChangeMock = jest.fn();
        urlWatcher = new UrlWatcher(onUrlChangeMock);
    });

    afterEach(() => {
        urlWatcher.dispose();
    });

    describe('extractAppHref', () => {
        it('should extract appHref from query string', () => {
            const appHref = 'http://example.com?query=string#/hash?hash=string';
            window.history.pushState({}, '', `?${appHrefQueryString}=${encodeURIComponent(appHref)}`);
            expect(UrlWatcher.extractAppHref()).toEqual(appHref);
        });

        it('should extract appHref from hash', () => {
            const appHref = 'http://example.com?query=string#/hash?hash=string';
            window.history.pushState({}, '', `#/?${appHrefQueryString}=${encodeURIComponent(appHref)}`);
            expect(UrlWatcher.extractAppHref()).toEqual(appHref);
        });

        it('should return undefined if appHref is not present', () => {
            window.history.pushState({}, '', '/');
            expect(UrlWatcher.extractAppHref()).toBeUndefined();
        });
    });

    describe('setAppHref', () => {
        it('should set appHref in query string', () => {
            const appHref = 'http://example.com?query=string#/hash?hash=string';
            urlWatcher.setAppHref(appHref);
            const url = new URL(window.location.href);
            expect(url.searchParams.get(appHrefQueryString)).toBe(appHref);
        });

        it('should replace appHref in query string', () => {
            const appHref = 'http://example.com?query=string#/hash?hash=string';
            const newAppHref = 'http://example.com?query=string#/hash?hash=string2';
            window.history.pushState({}, '', `?${appHrefQueryString}=${encodeURIComponent(appHref)}`);
            urlWatcher.setAppHref(newAppHref);
            const url = new URL(window.location.href);
            expect(url.searchParams.get(appHrefQueryString)).toBe(newAppHref);
        });

        it('should set appHref in hash', () => {
            const appHref = 'http://example.com?query=string#/hash?hash=string';
            window.history.pushState({}, '', '#/');
            urlWatcher.setAppHref(appHref);
            const url = new URL(window.location.href);
            expect(new URLSearchParams(url.hash.slice(url.hash.indexOf('?'))).get(appHrefQueryString)).toBe(appHref);
        });

        it('should replace appHref in hash', () => {
            const appHref = 'http://example.com?query=string#/hash?hash=string';
            const newAppHref = 'http://example.com?query=string#/hash?hash=string2';
            window.history.pushState({}, '', `#/?${appHrefQueryString}=${encodeURIComponent(appHref)}`);
            urlWatcher.setAppHref(newAppHref);
            const url = new URL(window.location.href);
            expect(new URLSearchParams(url.hash.slice(url.hash.indexOf('?'))).get(appHrefQueryString)).toBe(newAppHref);
        });
    });
});
