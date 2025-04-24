import { BrowserRouter as Router } from "react-router-dom";
import styled from 'styled-components';
import Pages from './Pages';

const AppContainer = styled.div(() => ({
  minHeight: '100%',
  width: '100%',
  margin: '0px',
  padding: '0px',
}));

function App() {
  return (
    <AppContainer>
      <Router>
        <Pages />
      </Router>
    </AppContainer>
  );
}

export default App;