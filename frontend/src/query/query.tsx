import React from 'react';
import Display from './display/display';
import './query.css';

const houseSpeakers = ['Achilles', 'Charon', 'Dusa', 'Eurydice', 'Hades', 'Hypnos', 'Megaera', 'Nyx', 'Orpheus', 'Patroclus', 'Persephone', 'Sisyphus', 'Storyteller', 'Thanatos', 'Zagreus']
const godSpeakers = ['Aphrodite', 'Ares', 'Artemis', 'Athena', 'Chaos', 'Demeter', 'Dionysus', 'Hermes', 'Poseidon', 'Zeus']

const colors: { [key: string]: string } = {
  'Aphrodite': 'pink',
  'Ares': 'red',
  'Artemis': 'green',
  'Athena': 'yellow',
  'Chaos': 'purple',
  'Demeter': 'lightblue',
  'Dionysus': 'purple',
  'Hermes': 'orange',
  'Poseidon': 'seagreen',
  'Zeus': 'yellow',
  'Hades': 'red',
  'Zagreus': 'red',
  'Thanatos': 'gray',
  'Nyx': 'purple'
}

interface QueryState {
  selectedSpeakers: Set<string>
  matchString: string;
}

class Query extends React.Component<any, QueryState> {

  selectedSpeakers = new Set()

  constructor(props: any) {
    super(props)
    this.state = {
      "selectedSpeakers": new Set<string>(),
      'matchString': ''
    }
  }

  getColor(speaker: string) {
    if (speaker in colors) {
      return colors[speaker]
    } else {
      return "gray";
    }
  }

  selectSpeaker = (e: React.MouseEvent) => {
    var element = (e.currentTarget as HTMLButtonElement)
    var speaker = element.value
    var clonedMap = new Set<string>(this.state.selectedSpeakers)
    if (clonedMap.has(speaker)) {
      clonedMap.delete(speaker)
      element.style.removeProperty("background-color")
    } else {
      element.style.backgroundColor = this.getColor(speaker)
      clonedMap.add(speaker)
    }
    this.setState({ "selectedSpeakers": clonedMap })
  }

  handleChange = (e: React.FormEvent) => {
    var element = (e.currentTarget as HTMLButtonElement)
    this.setState({ 'matchString': element.value })
  }

  render() {
    return (
      <div className="query">
        <div className="selectors">
          <div className='godSelectors'>
            {godSpeakers.map((speaker: string) => {
              return <button className="speaker-select"
                key={speaker} value={speaker}
                onClick={this.selectSpeaker}>
                {speaker}
              </button>
            })}
          </div>
          <div className='houseSelectors'>
            {houseSpeakers.map((speaker: string) => {
              return <button className="speaker-select"
                key={speaker} value={speaker}
                onClick={this.selectSpeaker}>
                {speaker}
              </button>
            })}
          </div>
        </div>
        <div className="matchString">
          <label>
            Match text: 
            <input type='text' value={this.state.matchString} onChange={this.handleChange} />
          </label>
        </div>
        <Display selectedSpeakers={this.state.selectedSpeakers} matchString={this.state.matchString} />
      </div>
    );
  }
}

export default Query;
