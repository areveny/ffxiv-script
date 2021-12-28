import { State } from 'history';
import React from 'react';
import Display from './display/display';
import { speakers } from '../static'
import './query.css';

interface QueryState {
  matchString: string;
  matchSpeaker: string;
  minLevel: number;
  maxLevel: number;
}

class Query extends React.Component<any, QueryState> {

  selectedSpeakers = new Set()

  constructor(props: any) {
    super(props)
    this.state = {
      'matchSpeaker': '',
      'matchString': '',
      'minLevel': 1,
      'maxLevel': 90
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
          <label> Speaker: 
            <datalist id='speakers'>
              {
                speakers.map((speaker: string) => {
                  return (
                  <option>{speaker}</option>
                  )
                })
              }

            </datalist> 
            <input className='matchSpeaker' autoComplete='on' list='speakers' value={this.state.matchSpeaker} onChange={this.handleChange}/>
            </label>
        </div>
        <div className="matchInput">
          <label> Match text: <input className='matchString' type='text' value={this.state.matchString} onChange={this.handleChange} /> </label>
        </div>
        <div className="levelRange">
          <label> Min level: <input className='minLevel' type='number' value={this.state.minLevel} onChange={this.handleChange} /> </label>
          <label> Max level: <input className='maxLevel' type='number' value={this.state.maxLevel} onChange={this.handleChange} /> </label>
        </div>
        <Display matchString={this.state.matchString} matchSpeaker={this.state.matchSpeaker} minLevel={this.state.minLevel} maxLevel={this.state.maxLevel}/>
      </div>
    );
  }
}

export default Query;