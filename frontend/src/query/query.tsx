import { State } from 'history';
import React from 'react';
import Display from './display/display';
import './query.css';

interface QueryState {
  matchString: string;
  matchSpeaker: string;
}

class Query extends React.Component<any, QueryState> {

  selectedSpeakers = new Set()

  constructor(props: any) {
    super(props)
    this.state = {
      'matchSpeaker': '',
      'matchString': ''
    }
  }

  handleChange = (e: React.FormEvent) => {
    var element = (e.currentTarget as HTMLInputElement)
    const {className, value} = (e.currentTarget as HTMLInputElement)
    this.setState({[className]: value } as Pick<State, keyof State>)
  }

  render() {
    return (
      <div className="query">
        <div className="matchInput">
          <label> Speaker: <input className='matchSpeaker' type='text' value={this.state.matchSpeaker} onChange={this.handleChange} /> </label>
        </div>
        <div className="matchInput">
          <label> Match text: <input className='matchString' type='text' value={this.state.matchString} onChange={this.handleChange} /> </label>
        </div>
        <Display matchString={this.state.matchString} matchSpeaker={this.state.matchSpeaker}/>
      </div>
    );
  }
}

export default Query;