import logo from './logo.svg';
import './App.css';
import { CorvinaConnect, CorvinaHost } from '@corvina/corvina-app-connect/lib/es2015';

(async () => {
  let hostConfiguration = {
    jwt: 'xxx',
    corvinaHost: window.location.origin,
    organizationId: "1",
  };
  
  let host = await CorvinaHost.create(hostConfiguration)
  
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
