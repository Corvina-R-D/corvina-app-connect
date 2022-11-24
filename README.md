# README #

## What is this repository for? ##

This library enables an application embedded as an iframe in Corvina to retrieve some information such as JWT, organization id, ...
The iframe id must have a prefix "corvina-app-connect-" and the application must be registered in the Corvina platform.

## How to use this library? ##

* Using npm:

```shell
npm install @corvina/corvina-app-connect
```

then in your code:

```javascript
 import { CorvinaAppConnect } from '@corvina/corvina-app-connect';
```

* Using script tag:

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

* Using script tag of type module

```html
<script type="module">
    import { CorvinaHost, CorvinaConnect } from 'https://unpkg.com/@corvina/corvina-app-connect@0.0.16/dist/index.min.mjs';
</script>
```

Then you can create an instance of CorvinaConnect and use it to retrieve the information you need:

```javascript
let connect = await CorvinaConnect.create({ corvinaHost: "https://corvina.io", corvinaHostWindow: window.parent });
let jwt = connect.jwt;
let organizationId = connect.organizationId;

connect.on(CorvinaConnectEventType.ORGANIZATION_ID_CHANGED, (organizationId: string) => {
    console.log(`Organization ID changed to ${organizationId}`)
});

connect.on(CorvinaConnectEventType.JWT_CHANGED, (jwt: string) => {
    console.log(`JWT changed to ${jwt}`)
});
```
