import React from 'react';
import axios from 'axios';
import { useParams } from 'react-router';
import LinesDisplay from '../linesDisplay/linesDisplay';
import Result from '../models/models';
import { serverUrl } from '../static';
import './quest.css';

interface QuestState {
    questId: string;
    results: Result[];
    questResult: QuestResult;
    searched: boolean;
}

interface QuestProps {
    params: Params;
}

interface Params {
    questId: string;
}

interface QuestResult {
    quest_id: string;
    quest_name: string;
    level: number;
    place_id: number;
    place_name: string;
}

class Quest extends React.PureComponent<QuestProps, QuestState> {

    constructor(props: QuestProps) {
        super(props)
        var questId = this.props.params.questId
        this.state = {
            'questId': questId,
            'results': new Array<Result>(),
            'questResult': {} as QuestResult,
            'searched': false
        }
    }

    componentDidMount() {
        if (this.state.questId) {
            this.queryQuest(this.state.questId)
        }

    }

    queryQuest = (questId: string) => {
        axios.post(`${serverUrl}quest`,
            { 'questId': questId },
            { headers: { 'Content-Type': 'application/json' } })
            .then((response) => {
                this.setState({
                    'results': response.data.lines,
                    'searched': true,
                    'questResult': response.data.quest
                })
            })
    }

    render() {
        if (this.state.questId === '') {
            return
        } else if (this.state.searched && this.state.results.length === 0) {
            return (<p>Quest {this.state.questId} not found.</p>)
        } else {
            return (
                <div className='quest'>
                    <div className='questHeader'>
                        <h2 className='questTitle'>{this.state.questResult.quest_name}</h2>
                        <span className='questLevel'>Level: {this.state.questResult.level}</span>
                        <span className='questPlace'>Location: {this.state.questResult.place_name}</span>
                    </div>
                    <LinesDisplay lines={this.state.results} />
                </div>
            )
        }
    }

}

const withRouter = (WrappedComponent: any) => (props: any) => {
    const params = useParams();
    // etc... other react-router-dom v6 hooks

    return (
        <WrappedComponent
            {...props}
            params={params}
        // etc...
        />
    );
};

export default withRouter(Quest);