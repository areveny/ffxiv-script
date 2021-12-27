import React from 'react';
import Result from '../models/models';
import './linesDisplay.css';

interface LinesDisplayProps {
  lines: Result[];
}

class LinesDisplay extends React.Component<LinesDisplayProps, any> {

  constructor(props: LinesDisplayProps) {
    super(props)
  }

  render() {
    if (!this.props.lines) {
      return (<p>No results found.</p>)
    } else {
      return (
        <div className='display'>
          {this.props.lines.map((result: Result) => {
            const lineId = result.quest_id + '-' + result.text_id
            return (
              <div key={lineId}>
                <span className='speakerName' key={lineId + '-speaker'}>{result.speaker}</span>
                <a className='questName' href={'/quest/' + result.quest_id} key={lineId + '-questName'}>{result.quest_name}</a>
                <br />
                <div className='text' key={lineId + '-container'}>{result.text}</div>
              </div>
            )
          })}
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
    return React.createElement('p', { 'className': 'text-element', 'key': line_name + '-text'}, output)
  }

export default LinesDisplay;