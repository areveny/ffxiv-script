import React from 'react';
import axios from 'axios';
import LinesDisplay from '../../linesDisplay/linesDisplay';
import Result from '../../models/models';
import { serverUrl, speakers } from '../../static';
import './display.css';

interface DisplayProps {
  matchString: string;
  matchSpeaker: string;
  minLevel: number;
  maxLevel: number;
}

interface DisplayState {
  results: Result[];
}

const useCache = false;
const cacheSize = 10;

function cleanSpeakerString(matchSpeaker: string) {
  matchSpeaker = matchSpeaker.replace(/[^\w]/gi, '')
  matchSpeaker = matchSpeaker.charAt(0).toUpperCase() + matchSpeaker.slice(1).toLowerCase()
  if (matchSpeaker.indexOf('Crystalexarch') === 0) {
    return 'Mysteryvoice'
  }
  return matchSpeaker
}

// https://reactjs.org/blog/2018/06/07/you-probably-dont-need-derived-state.html#what-about-memoization
class Display extends React.Component<DisplayProps, DisplayState> {

  constructor(props: DisplayProps) {
    super(props)
    this.state = { 'results': new Array<Result>() }
  }

  runQuery = (requestBody: DisplayProps) => {
    axios.post(serverUrl, requestBody,
      { headers: { 'Content-Type': 'application/json' } })
      .then((response) => {
        this.setState({ 'results': response.data })
      })
  }

  componentDidUpdate(prevProps: DisplayProps) {
    var matchSpeakerCleaned = cleanSpeakerString(this.props.matchSpeaker)
    if (this.props.matchString !== prevProps.matchString ||
      this.props.matchSpeaker != prevProps.matchSpeaker ||
      this.props.minLevel != prevProps.minLevel ||
      this.props.maxLevel != prevProps.maxLevel) {
      if (speakers.has(matchSpeakerCleaned)) {
        var requestBody = {
          'matchString': this.props.matchString,
          'matchSpeaker': matchSpeakerCleaned,
          'minLevel': this.props.minLevel,
          'maxLevel': this.props.maxLevel
        }
        this.runQuery(requestBody)
      }
    }
  }

  render() {
    return (
      <LinesDisplay lines={this.state.results} />
    )
  }
}

export default Display;