import React from 'react';
import axios from 'axios';
import LinesDisplay from '../../linesDisplay/linesDisplay';
import Result from '../../models/models';
import { serverUrl } from '../../static';
import './display.css';

interface DisplayProps {
  matchString: string;
  matchSpeaker: string;
}

interface DisplayState {
  results: Result[];
}

const useCache = false;
const cacheSize = 10;

// https://reactjs.org/blog/2018/06/07/you-probably-dont-need-derived-state.html#what-about-memoization
class Display extends React.Component<DisplayProps, DisplayState> {

  constructor(props: DisplayProps) {
    super(props)
    this.state = { 'results': new Array<Result>() }
  }

  runQuery = () => {
    axios.post(serverUrl,
      {
        'matchString': this.props.matchString,
        'matchSpeaker': this.props.matchSpeaker,
      },
      { headers: { 'Content-Type': 'application/json' } })
      .then((response) => {
        this.setState({ 'results': response.data })
      })
  }

  componentDidUpdate(prevProps: DisplayProps) {
    if (this.props.matchString !== prevProps.matchString || this.props.matchSpeaker != prevProps.matchSpeaker) {
      this.runQuery()
    }
  }

  render() {
    return (
      <LinesDisplay lines={this.state.results} />
    )
  }
}

export default Display;