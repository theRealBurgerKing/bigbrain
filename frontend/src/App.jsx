import { useState,useEffect } from 'react';
import axios from 'axios';
import {
  BrowserRouter as Router,
} from "react-router-dom";
import Pages from './Pages';

function App() {
  return (
    <Router>
      <Pages/>
    </Router>
  );
}

export default App;