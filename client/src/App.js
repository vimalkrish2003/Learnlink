import React from 'react';
import { BrowserRouter as Router, Route, Switch, Routes } from 'react-router-dom';
import LoginPage from './Components/login';

function App() {
  return (
    <Router>
      <Routes>
      <Route path='/' element={<LoginPage/>}></Route>
        </Routes>
    </Router>
  );
}

export default App;
