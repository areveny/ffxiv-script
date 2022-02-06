import React from 'react';
import Result from '../models/models';
import './linesDisplay.css';

const DEFAULT_PAGE_SIZE = 50;

interface LinesDisplayProps {
  lines: Result[];
  limited?: boolean;
  pageSize?: number;
}

interface LinesDisplayState {
  curPage: number;
}

class LinesDisplay extends React.PureComponent<LinesDisplayProps, LinesDisplayState> {

  private pageSize: number;

  constructor(props: LinesDisplayProps) {
    super(props);
    this.state = {"curPage": 1};
    this.pageSize = (props.pageSize ?? DEFAULT_PAGE_SIZE);
  }

  getCollectionInfo = (lineId: String, result: Result) => {
    if (result.quest_id.indexOf('VoiceMan') !== -1) {
      return (
        <span className='full'>{result.level === undefined ? '' : `Cutscene file ${result.quest_id.substring(result.quest_id.length - 1)} from patch `}
          <a className='cutsceneName'
            href={'/cutscene/' + result.quest_id}
            key={lineId + '-questName'}>
            {result.quest_name}
          </a>
        </span>
      );

    } else {
      return (
        <span className='full'>{result.level === undefined ? '' : result.level + ' '}
          <a className='questName'
            href={'/quest/' + result.quest_id}
            key={lineId + '-questName'}>
            {result.quest_name}
          </a>
        </span>
      );
    }
  }

  componentDidUpdate(prevProps: LinesDisplayProps) {
    if (!prevProps.limited && this.props.lines !== prevProps.lines) {
      this.setState({'curPage': 1});
    }
  }

  getPageSelector = () => {
    return (
          <div className='pageSelect'>
            <label>Page: <input className='pageBox' type='number' 
            value={this.state.curPage}
            onChange={this.setPage} 
            min={1} max={Math.ceil(this.props.lines.length / this.pageSize)}/> </label>
          </div>
    )
  }

  setPage = (e: React.FormEvent<HTMLInputElement>) => {
    this.setState({'curPage': parseInt(e.currentTarget.value)});
  }

  render() {
    if (!this.props.lines) {
      return (<p>No results found.</p>);
    } else {
      return (
        <div className='display'>
          {this.pageSize < this.props.lines.length && this.getPageSelector()}
          <div className='lines'>
            {this.props.lines.slice((this.state.curPage - 1) * this.pageSize, this.state.curPage * this.pageSize).map((result: Result) => {
              const lineId: string = result.quest_id + '-' + result.text_id;
              return (
                <div key={lineId + '-container'}>
                  {this.getCollectionInfo(lineId, result)}
                  <div key={lineId}>
                    <span className='speakerName' key={lineId + '-speaker'}>{result.speaker}</span>
                    <br />
                    <div className='text' key={lineId + '-text-container'}>{result.text}</div>
                  </div>
                </div>
              );
            })}
          </div>
          {this.pageSize < this.props.lines.length && this.getPageSelector()}
        </div>
      );
    }
  }
}

function convertFormatting(line: string, line_name: string) {
  var formatStart = line.indexOf('{#DialogueItalicFormat}')
  var output = [];
  var index = 0;
  while (formatStart !== -1) {
    var before = line.substring(0, formatStart)
    var formatCloseStart = line.indexOf('{#PreviousFormat}')
    if (formatCloseStart === -1) {
      output.push(<i key={index}>{line.substring(formatStart + 23)}</i>)
      line = ''
      break
    }
    var formatted = line.substring(formatStart + 23, formatCloseStart)
    output.push(before)
    output.push(<i key={index}>{formatted}</i>)

    index = index + 1
    line = line.substring(formatCloseStart + 17)
    formatStart = line.indexOf('{#DialogueItalicFormat}')
  }
  output.push(line)
  return React.createElement('p', { 'className': 'text-element', 'key': line_name + '-text' }, output)
}

export default LinesDisplay;