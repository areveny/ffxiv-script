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
            return (
              <div key={result.line_name}>
                <span className='speakerName' key={result.line_name + '-' + result.speaker}>{result.speaker}</span>
                <a className='conversationName' href={'/conversation/' + result.conversation_name} key={result.line_name + '-' + result.conversation_name}>{result.conversation_name}</a>
                <br />
                <div className='text' key={result.line_name + '-container'}>{convertFormatting(result.text, result.line_name)}</div>
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