import React from 'react';
import axios from 'axios';
import Result from '../models/models';
import { useParams } from 'react-router';
import LinesDisplay from '../linesDisplay/linesDisplay';
import { serverUrl } from '../static';
import { SSL_OP_EPHEMERAL_RSA } from 'constants';

interface ConversationState {
    conversationName: string;
    results: Result[];
    searched: boolean;
}

interface ConversationProps {
    params: Params;
}

interface Params {
    conversationName: string;
}

class Conversation extends React.PureComponent<ConversationProps, ConversationState> {

    constructor(props: ConversationProps) {
        super(props)
        var conversationName = this.props.params.conversationName
        this.state = {
            'conversationName': conversationName,
            'results': new Array<Result>(),
            'searched': false
        }
    }

    componentDidMount() {
        if (this.state.conversationName) {
            this.queryConversation(this.state.conversationName)
        }

    }

    queryConversation = (conversationName: string) => {
        axios.post(`${serverUrl}/conversation`,
            { 'conversation_name': conversationName },
            { headers: { 'Content-Type': 'application/json' } })
            .then((response) => {
                this.setState({ 'results': response.data, 'searched': true })
            })
    }

    render() {
        if (this.state.conversationName === '') {
            return 
        } else if (this.state.searched && this.state.results.length == 0) {
            return (<p>Conversation {this.state.conversationName} not found.</p>)
        } else {
            return (
                <LinesDisplay lines={this.state.results} />
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

export default withRouter(Conversation);