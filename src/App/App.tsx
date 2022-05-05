import React, {Component} from 'react';
import logo from '../logo.svg';
import './App.css';

interface AppProps {
}

interface AppState {
  count: number;
}

export default class App extends Component<AppProps, AppState> {
  constructor(props: AppProps | Readonly<AppProps>) {
    super(props);
    this.state = {
      count: 0
    };
  }

  render() {
    return (
      <div className="App">
        <img src={logo} className="App-logo" alt="logo"/>
        <p> The site isn't ready, but it's going to be cool </p>
        <button onClick={() => this.setState({count: this.state.count + 1})}>
          Click me {this.state.count} </button>
      </div>
    );
  }
}

