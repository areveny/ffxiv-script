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
  requestBody?: RequestBody;
}

interface RequestBody {
  matchString: string;
  matchSpeaker: string;
  minLevel: number;
  maxLevel: number;
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

function getCacheKey(requestBody: RequestBody): string {
  return [requestBody.matchSpeaker, requestBody.matchString, requestBody.maxLevel, requestBody.minLevel].join("&");
}

function requestBodyMatch(requestBody1: RequestBody | QueryHandlerProps, requestBody2: RequestBody | QueryHandlerProps): boolean {
    return requestBody1.matchSpeaker === requestBody2.matchSpeaker &&
    requestBody1.matchString === requestBody2.matchString &&
    requestBody1.minLevel === requestBody2.minLevel &&
    requestBody1.maxLevel === requestBody2.maxLevel
  }

// https://reactjs.org/blog/2018/06/07/you-probably-dont-need-derived-state.html#what-about-memoization
class QueryHandler extends React.Component<QueryHandlerProps, QueryHandlerState> {

  private cache?: Map<string, Result[]>;

  constructor(props: QueryHandlerProps) {
    super(props);
    this.state = { 'results': new Array<Result>() };
    this.cache = useCache ? new Map<string, Result[]>() : undefined;
  }

  updateCache = (requestBody: RequestBody, results: Result[]): void => {
    if (this.cache === undefined) {
      return;
    }
    this.cache.set(getCacheKey(requestBody), results);
    if (this.cache.size > cacheSize) {
      this.cache.delete(this.cache.keys().next().value);
    }
  }

  updateWithResults = (requestBody: RequestBody, results: Result[]): void => {
    this.setState({ 'results': results, 'requestBody': requestBody });
    if (useCache) {
      this.updateCache(requestBody, results);
    }
  }

  runQuery = (requestBody: RequestBody): void => {
    setTimeout(() => {
      requestBody.matchString === this.props.matchString && axios.post(serverUrl, requestBody,
        { headers: { 'Content-Type': 'application/json' } })
      .then((response) => {
        if (requestBodyMatch(requestBody, this.props)) {
          this.updateWithResults(requestBody, response.data)
        }
      })
    }, 200)
  }

  filterResults = (requestBody: RequestBody): void => {
    let filteredResults: Result[] = this.state.results.filter(result =>
      result.text.indexOf(requestBody.matchString) !== -1 &&
      result.level >= requestBody.minLevel &&
      result.level <= requestBody.maxLevel);
    if (requestBodyMatch(requestBody, this.props)) {
      this.updateWithResults(requestBody, filteredResults)
    }
  }

  componentDidUpdate(prevProps: QueryHandlerProps) {
    if (!requestBodyMatch(this.props, prevProps)) {
      if (this.props.matchString === '' && this.props.matchSpeaker === '') {
        this.setState({ 'results': [] });
        return;
      }
      var matchSpeakerCleaned = cleanSpeakerString(this.props.matchSpeaker)
      if (matchSpeakerCleaned === '' || speakers.includes(matchSpeakerCleaned)) {
        var requestBody: RequestBody = {
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
        if (this.state.results.length > 0 && this.state.requestBody && clientCanFilterResults(this.props, this.state.requestBody)) {
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

export default QueryHandler;