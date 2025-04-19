import {
  BrowserRouter as Router,
} from "react-router-dom";
import Pages from './Pages';

function App() {
  // Define styles as named objects
  const appStyle = {
    height: '98vh',
    width: '100%',
    margin: '0px',
    padding: '0px',
  };

  return (
    <div style={appStyle}>
      <Router>
        <Pages />
      </Router>
    </div>
  );
}

export default App;