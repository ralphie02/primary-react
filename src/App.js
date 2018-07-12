import React, { Component } from 'react';
import logo from './logo.svg';
import './App.css';
import ActionCable from 'actioncable'

const PATH_BASE = 'http://localhost:3000';
const PARAM = 'number[value]=';
const APP_GREETING= 'Welcome to the Prime Number Checker'
const ANSWER = {true: 'Yes!', false: 'No', null: '...checking' }

class App extends Component {
  constructor(props) {
    super(props);

    this.state = {
      list: {},
      searchNumber: '',
      exception: null
    };

    this.onCheckSubmit = this.onCheckSubmit.bind(this);
    this.onSearchChange = this.onSearchChange.bind(this);
    this.createSocket = this.createSocket.bind(this);
  }

  createSocket = () => {
    const cable = ActionCable.createConsumer('ws://localhost:3000/cable');

    cable.subscriptions.create('PrimaryChannel', {
      connected: () => {},
      received: (data) => this.setState((prevState, props) =>
        ({ list: { ...prevState.list, ...data } }))
    });
  }

  onCheckSubmit(event) {
    const { searchNumber } = this.state
    const request_init = { method: 'POST' }
    const request = `${PATH_BASE}/create?${PARAM}${searchNumber}`

    if(searchNumber !== null && searchNumber !== '') {
      fetch(request, request_init)
        .then(response => response.json())
        .then(result => {
          if (result.status === 201){
            this.setState((prevState, props) => ({ list: { ...prevState.list, ...result.body }, exception: null }) )
          } else {
            this.setState((prevState, props) => ({ exception: result.exception }) )
          }
        })
        .catch(e => e)
    }


    event.preventDefault();
  }

  onSearchChange(event) {
    this.setState({ searchNumber: event.target.value })
  }

  componentDidMount () {
    this.createSocket()
  }

  render() {
    const { list, searchNumber, exception } = this.state
    return (
      <div className="App">
        <header className="App-header">
          <img src={logo} className="App-logo" alt="logo" />
          <h2>{APP_GREETING}</h2>
        </header>
        <br/>
        <div>
          <span>{exception !== null ? exception : false}</span>
        </div>
        <div className="App-intro">
          <form onSubmit={this.onCheckSubmit}>
            <input type="number" onChange={this.onSearchChange} value={searchNumber}/>
            <button type="submit">Check</button>
          </form>
        </div>
        <div>
          {
            Object.keys(list).map(key => 
              <div key={key}>
                <span>
                  Is '{key}' a prime number? {ANSWER[list[key]]}
                </span>
              </div>
            )
          }
        </div>
      </div>
    );
  }
}

export default App;
