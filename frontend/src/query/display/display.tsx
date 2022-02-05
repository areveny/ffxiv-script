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

const useCache = true;
const cacheSize = 10;

function cleanSpeakerString(matchSpeaker: string): string {
  if (matchSpeaker === '') {
    return '';
  }
  matchSpeaker = matchSpeaker.replace(/[^\w]/gi, '');
  matchSpeaker = matchSpeaker.charAt(0).toUpperCase() + matchSpeaker.slice(1).toLowerCase();
  if (matchSpeaker.indexOf('Crystalexarch') === 0) {
    return 'Mysteryvoice';
  } else if (matchSpeaker.indexOf('Venat') === 0) {
    return 'Venas';
  }
  return matchSpeaker;
}

function clientCanFilterResults(curProps: DisplayProps, prevProps: DisplayProps): boolean {
  let sameSpeaker = curProps.matchSpeaker === prevProps.matchSpeaker;
  let matchSubstring: boolean = prevProps.matchString.length === curProps.matchString.length - 1 &&
    curProps.matchString.indexOf(prevProps.matchString) !== -1;
  let restrictedLevels: boolean = curProps.minLevel >= prevProps.minLevel && curProps.maxLevel <= prevProps.maxLevel;
  return sameSpeaker && (matchSubstring && restrictedLevels);
}

function getCacheKey(requestBody: DisplayProps): string {
  return [requestBody.matchSpeaker, requestBody.matchString, requestBody.maxLevel, requestBody.minLevel].join("&");
}

// https://reactjs.org/blog/2018/06/07/you-probably-dont-need-derived-state.html#what-about-memoization
class Display extends React.Component<DisplayProps, DisplayState> {

  private cache?: Map<string, Result[]>;

  constructor(props: DisplayProps) {
    super(props);
    this.state = { 'results': new Array<Result>() };
    this.cache = useCache ? new Map<string, Result[]>(): undefined;
  }

  updateCache = (requestBody: DisplayProps, results: Result[]): void => {
    if (this.cache === undefined) {
      return;
    }
    this.cache.set(getCacheKey(requestBody), results);
    if (this.cache.size > cacheSize) {
      this.cache.delete(this.cache.keys().next().value);
    }
  }

  runQuery = (requestBody: DisplayProps): void => {
    axios.post(serverUrl, requestBody,
      { headers: { 'Content-Type': 'application/json' } })
      .then((response) => {
        if (requestBody.minLevel === this.props.minLevel && requestBody.maxLevel === this.props.maxLevel) {
          this.setState({ 'results': response.data });
          if (useCache) {
            this.updateCache(requestBody, response.data);
          }
        }
      })
  }

  filterResults = (requestBody: DisplayProps): void => {
    let filteredResults: Result[] = this.state.results.filter(result =>
      result.text.indexOf(requestBody.matchString) !== -1 &&
      result.level >= requestBody.minLevel &&
      result.level <= requestBody.maxLevel);
    this.setState({ 'results': filteredResults });
    if (useCache) {
      this.updateCache(requestBody, filteredResults);
    }
  }

  componentDidUpdate(prevProps: DisplayProps) {
    let stringChanged: boolean = this.props.matchString !== prevProps.matchString;
    let speakerChanged: boolean = this.props.matchSpeaker !== prevProps.matchSpeaker;
    let minChanged: boolean = this.props.minLevel !== prevProps.minLevel;
    let maxChanged: boolean = this.props.maxLevel !== prevProps.maxLevel;
    if (stringChanged || speakerChanged || minChanged || maxChanged) {
      var matchSpeakerCleaned = cleanSpeakerString(this.props.matchSpeaker)
      if (matchSpeakerCleaned === '' || speakers.includes(matchSpeakerCleaned)) {
        var requestBody = {
          'matchString': this.props.matchString,
          'matchSpeaker': matchSpeakerCleaned,
          'minLevel': this.props.minLevel,
          'maxLevel': this.props.maxLevel
        };

        if (useCache) {
          var cacheKey = getCacheKey(requestBody)
          if (this.cache?.has(cacheKey)) {
            var cachedResult = this.cache.get(cacheKey);
            if (cachedResult !== undefined) {
              this.setState({ 'results': cachedResult });
            }
            return;
          }
        } 
        if (clientCanFilterResults(this.props, prevProps)) {
          this.filterResults(requestBody);
        } else {
          this.runQuery(requestBody);
        }
      }
    }
  }

  render() {
    return (
      <LinesDisplay lines={this.state.results} />
    );
  }
}

export default Display;