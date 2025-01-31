import { appHrefQueryString } from "./common";

export class UrlWatcher {
    private readonly _onUrlChange: ( {type}: {type: string} ) => void;
    private readonly _originalPushState: typeof history.pushState;
    private readonly _originalReplaceState: typeof history.replaceState;
    private readonly _window: Window = window;

    constructor(onUrlChange: ( {type} : {type: string} ) => void, currentWindow?: Window) {
        this._window = currentWindow || window;
        this._onUrlChange = onUrlChange;

        // Override history.pushState and history.replaceState
        this._originalPushState = this._window.history.pushState;
        this._originalReplaceState = this._window.history.replaceState;

        this._window.history.pushState = (...args) => {
            this._originalPushState.apply(this._window.history, args);
            this._onUrlChange({ type: 'pushState' });
        };

        this._window.history.replaceState = (...args) => {
            this._originalReplaceState.apply(this._window.history, args);
            this._onUrlChange({ type: 'replaceState' });
        };

        // Listen for popstate (back/forward buttons)
        this._window.addEventListener("popstate", this._onUrlChange);
    }

    dispose() {
        this._window.history.pushState = this._originalPushState;
        this._window.history.replaceState = this._originalReplaceState;
        this._window.removeEventListener("popstate", this._onUrlChange);
    }


    public static extractAppHref(): string | undefined {
        try {
            const url = new URL(window.location.href);
            let appHref = url.searchParams.get(appHrefQueryString);
            if (!appHref) {
                // parse appHref from the hash
                appHref = (new URLSearchParams(url.hash.slice(url.hash.indexOf('?')))).get(appHrefQueryString);
            }
            if (appHref) {
                return decodeURIComponent(appHref);
            }
        } catch (error) {
            console.warn("CorvinaHost: Error extracting appHref from ", window.location.href);
        }
        return undefined;
    }

    public setAppHref(appHref: string, type?: string) {
        const applyPath = (path: string) => {
            if (type === 'replaceState') {
                this._originalReplaceState.call(this._window.history, null, "", path);
            } else {
                this._originalPushState.call(this._window.history, null, "", path);
            } 
        }
        // if using hash mode
        if (this._window.location.hash) {
            // look for the query string in the hash
            let queryParamsPos = this._window.location.hash.indexOf("?");
            if (queryParamsPos < 0) {
               applyPath(this._window.location.hash + "?" + appHrefQueryString + "=" + encodeURIComponent(appHref));
            } else {
                // try to get the query string from the hash
                const params = new URLSearchParams(this._window.location.hash.slice(queryParamsPos));
                params.set(appHrefQueryString, appHref);
                const newHash = this._window.location.hash.slice(0, queryParamsPos+1) + params;
                applyPath(newHash);
            }
        } else {
            // the url contains the query string appHrefQueryString?
            const url = new URL(this._window.location.href)
            url.searchParams.set(appHrefQueryString, appHref);
            applyPath(url.toString());
        }
    }
}
