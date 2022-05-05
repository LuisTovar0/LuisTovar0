import React, {useState} from 'react';
import logo from '../logo.svg';
import './App.css';

export default function App() {
  const [state, setter] = useState({count: 0});

  return (
    <div className="App">
      <img src={logo} className="App-logo" alt="logo"/>
      <p> The site isn't ready, but it's going to be cool </p>
      <button onClick={() => setter({count: state.count + 1})}>
        Click me {state.count} </button>
    </div>
  );
}
