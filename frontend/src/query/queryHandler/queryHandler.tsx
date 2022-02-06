import React from 'react';
import axios from 'axios';
import LinesDisplay from '../../linesDisplay/linesDisplay';
import Result from '../../models/models';
import { serverUrl, speakers } from '../../static';
import './queryHandler.css';

interface QueryHandlerProps {
  matchString: string;
  matchSpeaker: string;
  minLevel: number;
  maxLevel: number;
}

interface QueryHandlerState {
  results: Result[];
  limited?: boolean;
}

interface RequestBody {
  matchString: string;
  matchSpeaker: string;
  minLevel: number;
  maxLevel: number;
  limitResults?: boolean;
}

const useCache = true;
const cacheSize = 10;
const LIMITED_RESULT_SIZE = 500;

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

function clientCanFilterResults(curProps: QueryHandlerProps, prevProps: QueryHandlerProps): boolean {
  let sameSpeaker = curProps.matchSpeaker === prevProps.matchSpeaker;
  let matchSubstring: boolean = prevProps.matchString.length <= curProps.matchString.length &&
    curProps.matchString.length >= 2 &&
    curProps.matchString.indexOf(prevProps.matchString) !== -1;
  let restrictedLevels: boolean = curProps.minLevel >= prevProps.minLevel && curProps.maxLevel <= prevProps.maxLevel;
  return sameSpeaker && (matchSubstring && restrictedLevels);
}


function getCacheKey(requestBody: QueryHandlerProps): string {
  return [requestBody.matchSpeaker, requestBody.matchString, requestBody.maxLevel, requestBody.minLevel].join("&");
}

// https://reactjs.org/blog/2018/06/07/you-probably-dont-need-derived-state.html#what-about-memoization
class QueryHandler extends React.Component<QueryHandlerProps, QueryHandlerState> {

  private cache?: Map<string, Result[]>;

  constructor(props: QueryHandlerProps) {
    super(props);
    this.state = { 'results': new Array<Result>() };
    this.cache = useCache ? new Map<string, Result[]>() : undefined;
  }

  updateCache = (requestBody: QueryHandlerProps, results: Result[]): void => {
    if (this.cache === undefined) {
      return;
    }
    this.cache.set(getCacheKey(requestBody), results);
    if (this.cache.size > cacheSize) {
      this.cache.delete(this.cache.keys().next().value);
    }
  }

  runQuery = (requestBody: RequestBody, limitResults?: boolean): void => {
    requestBody.limitResults = limitResults;
    axios.post(serverUrl, requestBody,
      { headers: { 'Content-Type': 'application/json' } })
      .then((response) => {
        if (requestBody.matchString === this.props.matchString &&
          requestBody.minLevel === this.props.minLevel &&
          requestBody.maxLevel === this.props.maxLevel) {
          this.setState({ 'results': response.data, 'limited': limitResults });
          if (limitResults && response.data.length === LIMITED_RESULT_SIZE) {
            setTimeout(() => { requestBody.matchString === this.props.matchString && this.runQuery(requestBody, false) }, 1000);
          } else {
            if (useCache) {
              this.updateCache(requestBody, response.data);
            }
          }
        }
      })
  }

  filterResults = (requestBody: QueryHandlerProps): void => {
    let filteredResults: Result[] = this.state.results.filter(result =>
      result.text.indexOf(requestBody.matchString) !== -1 &&
      result.level >= requestBody.minLevel &&
      result.level <= requestBody.maxLevel);
    if (requestBody.matchString === this.props.matchString &&
      requestBody.minLevel === this.props.minLevel &&
      requestBody.maxLevel === this.props.maxLevel) {
      this.setState({ 'results': filteredResults });
      if (useCache) {
        this.updateCache(requestBody, filteredResults);
      }
    }
  }

  componentDidUpdate(prevProps: QueryHandlerProps) {
    let stringChanged: boolean = this.props.matchString !== prevProps.matchString;
    let speakerChanged: boolean = this.props.matchSpeaker !== prevProps.matchSpeaker;
    let minChanged: boolean = this.props.minLevel !== prevProps.minLevel;
    let maxChanged: boolean = this.props.maxLevel !== prevProps.maxLevel;
    if (stringChanged || speakerChanged || minChanged || maxChanged) {
      console.log(this.cache);
      if (this.props.matchString === '' && this.props.matchSpeaker === '') {
        this.setState({ 'results': [] });
        return;
      }
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
        if (this.state.results.length > 0 && this.state.results.length != LIMITED_RESULT_SIZE && clientCanFilterResults(this.props, prevProps)) {
          this.filterResults(requestBody);
        } else {
          this.runQuery(requestBody, true);
        }
      }
    }
  }

  render() {
    return (
      <LinesDisplay lines={this.state.results} limited={this.state.limited} />
    );
  }
}

export default QueryHandler;