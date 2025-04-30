# README #

## What is this repository for? ##

This library enables an application embedded as an iframe in Corvina to retrieve some information such as JWT, organization id, ... and to perform some actions.  
The iframe id must have a prefix "corvina-app-connect-" and the application must be registered in the Corvina platform.

## How to use this library ##

* OPTION 1: Using npm:

    ```shell
    npm install @corvina/corvina-app-connect
    ```

    then in your code:

    ```javascript
    import { CorvinaAppConnect } from '@corvina/corvina-app-connect';
    ```

* OPTION 2: Using script tag:

    ```html
    <script src="https://unpkg.com/@corvina/corvina-app-connect"></script>
    ```

    or using a specific version

    ```html
    <script src="https://unpkg.com/@corvina/corvina-app-connect@0.0.16/dist/index.umd.min.js"></script>
    ```

    then in your code:

    ```javascript
    let { CorvinaHost, CorvinaConnect } = $corvina;
    ```

* OPTION 3: Using script tag of type module

    ```html
    <script type="module">
        import { CorvinaHost, CorvinaConnect } from 'https://unpkg.com/@corvina/corvina-app-connect@0.0.16/dist/index.min.mjs';
    </script>
    ```

Then you can create an instance of CorvinaConnect and use it to retrieve the information you need:

```javascript
let connect = await CorvinaConnect.create({ corvinaHost: "https://app.corvina.io", corvinaHostWindow: window.parent });
let jwt = connect.jwt;
let organizationId = connect.organizationId;

connect.on(CorvinaConnectEventType.ORGANIZATION_ID_CHANGED, (organizationId: string) => {
    console.log(`Organization ID changed to ${organizationId}`)
});

connect.on(CorvinaConnectEventType.JWT_CHANGED, (jwt: string) => {
    console.log(`JWT changed to ${jwt}`)
});
```

You can also trigger a navigation inside Corvina Platform in this way:

```javascript
// navigate to the dashboard, same as clicking on the dashboard button in the Corvina menu
connect.navigateTo(CorvinaPages.DASHBOARD);
// navigate to custom page with parameters
connect.navigateTo("/another-page?param1=value1&param2=value2");
```

## Navigation synchronization ##

The library provides a way to synchronize the navigation between the application and Corvina Platform.

When enabled, the internal location of the application can be exposed as query parameter `appHref` in the iframe URL.

This feature must be explicitly enabled from the application side by calling `enableNavigationSync`.

Once enable, app location is automatically exposed through the `appHref` query parameter, and  the app can listen to the 
`IFRAME_HREF_CHANGED` event to update its location.

```javascript
connect.enableNavigationSync();

connect.on(CorvinaConnectEventType.IFRAME_HREF_CHANGED, ({ href, type }) => {
    iframeWindow.history.pushState({}, '', href);
});
```

## Getting/setting user preferences

Through this library you can access the user preferences stored in Corvina Platform. The preferences are stored in a key/value map, and you can get/set them using the following methods:

```javascript
// get a preference
let preference = await connect.getUserPreference("key");
// set a preference
await connect.setUserPreference("key", "value");
```

These functions are asynchronous and return a promise. By default an error is thrown if the async operation takes more than 10 seconds.

If the key is missing the value returned is `undefined`.

## In-app purchases

Credits are the unit of currency used within the Corvina platform for in-app purchases. Applications can use this library to authorize transactions involving credits. By integrating the provided interface, apps can process payments and manage credit-based transactions, ensuring a seamless user experience for purchasing services or features.

This feature is triggered on demand by calling 
```javascript
connect.promptPreauthorizedTransactionAuthorization(transactions)
```
with _transactions_ defined as `PreauthorizedCreditTransactionInDTO[]`, a list of credit transactions. It prompts a dialog containing details about the total credits and the detail of each transaction, with the possibility to authorize or reject them.

The response by the user is returned as an event, which we must listen to as 
```javascript
connect.off(CorvinaConnectEventType.TRANSACTIONS_AUTHORIZATION_RESPONSE); // turn off any previous handler

connect.on(CorvinaConnectEventType.TRANSACTIONS_AUTHORIZATION_RESPONSE, (response: TransactionsAuthorizationDialogResponse) => {
    // your logic
    // ...
    connect.off(CorvinaConnectEventType.TRANSACTIONS_AUTHORIZATION_RESPONSE); // turn off handler once done
});
```

If the user (pre)authorize the transactions, the response contains `PreauthorizedCreditTransactionOutDTO[]` as payload, otherwise it is null. Response contains also a numerical status (HTTP status code like) and a message describing the event.

```javascript
TransactionsAuthorizationDialogResponse {
    status!: number;
    payload!: PreauthorizedCreditTransactionOutDTO[] | null;
    msg!: TransactionsAuthorizationDialogResponseMessage;
}
```

## How to run the tests ##

* Run `npm run test`
* Open <http://127.0.0.1:8080/commonjs/index.test.html> in your browser

## How to deploy a new version ##

* Update the version in package.json
* Run `npm run build`
* Run `npm publish`
