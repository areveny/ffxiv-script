import React from 'react';
import axios from 'axios';
import { useParams } from 'react-router';
import LinesDisplay from '../linesDisplay/linesDisplay';
import Result from '../models/models';
import { serverUrl } from '../static';
import { text } from 'node:stream/consumers';

interface QuestState {
    questId: string;
    results: Result[];
    searched: boolean;
}

interface QuestProps {
    params: Params;
}

interface Params {
    questId: string;
}

class Quest extends React.PureComponent<QuestProps, QuestState> {

    constructor(props: QuestProps) {
        super(props)
        var questId = this.props.params.questId
        this.state = {
            'questId': questId,
            'results': new Array<Result>(),
            'searched': false
        }
    }

    componentDidMount() {
        if (this.state.questId) {
            this.queryQuest(this.state.questId)
        }

    }

    queryQuest = (questId: string) => {
        axios.post(`${serverUrl}/quest`,
            { 'questId': questId },
            { headers: { 'Content-Type': 'application/json' } })
            .then((response) => {
                this.setState({ 'results': response.data, 'searched': true })
            })
    }

    render() {
        if (this.state.questId === '') {
            return
        } else if (this.state.searched && this.state.results.length == 0) {
            return (<p>Quest {this.state.questId} not found.</p>)
        } else {
                console.log(this.state.results[0])
            return (
                <div className='quest'>
                    <h2>{this.state.results.length > 0 ? this.state.results[0].quest_name : ''}</h2>
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