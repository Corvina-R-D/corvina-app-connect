import logo from './logo.svg';
import './App.css';
import { CorvinaConnect, CorvinaHost } from '@corvina/corvina-app-connect';

(async () => {
  function mockJwtApp(extra) {
    const iframeUrl = window.location.origin;
    let m = new Map();
    m.set(iframeUrl, {
      jwt: 'xxx' + (extra ?? ''),
      iframeOrigin: iframeUrl,
    });
    return m;
  }
  const hostConfiguration = {
    jwtApp: mockJwtApp(),
    corvinaHost: window.location.origin,
    corvinaDomain: window.location.hostname,
    username: "test",
    organizationId: "1",
    organizationResourceId: "testorg",
    theme: {},
    brandName: "brand"
  };
  // Mock corvina host
  let host = await CorvinaHost.create(hostConfiguration);
  
  let connect = await CorvinaConnect.create({ corvinaHost: hostConfiguration.corvinaHost, corvinaHostWindow: window });
  
  window.host = host;
  window.connect = connect;
})();

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <p>
          Edit <code>src/App.js</code> and save to reload.
        </p>
        <a
          className="App-link"
          href="https://reactjs.org"
          target="_blank"
          rel="noopener noreferrer"
        >
          Learn React
        </a>
      </header>
    </div>
  );
}

export default App;
