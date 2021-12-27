import React from 'react';
import axios from 'axios';
import LinesDisplay from '../../linesDisplay/linesDisplay';
import Result from '../../models/models';
import { serverUrl } from '../../static';
import './display.css';

interface DisplayProps {
  selectedSpeakers: Set<string>;
  matchString: string;
}

interface DisplayState {
  results: Result[];
}

const useCache = false;
const cacheSize = 10;

// https://reactjs.org/blog/2018/06/07/you-probably-dont-need-derived-state.html#what-about-memoization
class Display extends React.Component<DisplayProps, DisplayState> {

  cache: { [key: string]: Result[] } = {}
  cacheEntries = new Array<string>()

  constructor(props: DisplayProps) {
    super(props)
    this.state = { 'results': new Array<Result>() }
  }

  loadCache = (matchString: string, results: Result[]) => {
    this.cache[matchString] = results
    this.cacheEntries.unshift(matchString)
    if (this.cacheEntries.length > cacheSize) {
      var evacuated = this.cacheEntries.pop()
      if (evacuated) {
        delete this.cache[evacuated]
      }
    }
  }

  runQuery = () => {
    axios.post(serverUrl,
      {
        'selectedSpeakers': Array.from(this.props.selectedSpeakers),
        'matchString': this.props.matchString
      },
      { headers: { 'Content-Type': 'application/json' } })
      .then((response) => {
        this.setState({ 'results': response.data })
        this.loadCache(this.props.matchString, response.data)
      })
  }

  componentDidUpdate(prevProps: DisplayProps) {
    if (this.props.selectedSpeakers !== prevProps.selectedSpeakers && this.props.selectedSpeakers.size > 0) { // Different speakers
      this.cache = {}
      this.cacheEntries = []
      this.runQuery()
    } else { // Same speakers
      if (this.props.matchString !== prevProps.matchString) { // New searchString, do update
        if (this.props.matchString in this.cache) { // Check cache
          this.setState({ 'results': this.cache[this.props.matchString] })
        } else {
          this.runQuery()
        }
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