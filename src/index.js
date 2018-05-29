import React, {Timeout} from '../lib/react';
import ReactDOM from '../lib/react-dom';
import {createCache, createResource} from '../lib/simple-cache-provider';

const fetcher = () =>
    fetch('https://jsonplaceholder.typicode.com/todos')
        .then(res => res.json());

const cache = createCache();
const resource = createResource(fetcher);

const Todos = () => {
    const data = resource.read(cache);
    return (
        <div>
            {data.slice(0,20).map(item => <p key={item.id}>{item.title}</p>)}
        </div>
    )
};

const Loading = () => ReactDOM.createPortal(
    <div className="loading-bar" />,
    document.querySelector('aside')
);

class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { error: '' };
    }

    componentDidCatch(error) {
        this.setState({
            error,
        });
    }

    render() {
        if (this.state.error) {
            return this.state.error;
        }

        return this.props.children;
    }
}

class Fallback extends React.Component {
    constructor(props) {
        super(props);
        this.state = { shouldRender: false };
    }

    componentDidMount() {
        ReactDOM.unstable_deferredUpdates(() => {
            this.setState({ shouldRender: true });
        });
    }

    render() {
        const { timeout, children, placeholder } = this.props;
        const { shouldRender } = this.state;

        return shouldRender ? (
            <Timeout ms={timeout}>
                {didExpire => didExpire ? placeholder : children}
            </Timeout>
        ) : null;
    }
}

const App = () => (
    <React.Fragment>
        <ErrorBoundary>
            <Fallback timeout={1000} placeholder={<Loading />}>
                <Todos />
            </Fallback>
        </ErrorBoundary>
        <h1>This is a demo of React Suspense</h1>
        <h3>Switch to "Slow 3G" connection via the Network tab to simulate the experience of a slower connection.</h3>
        <ul>
            <li>An actual API request is executed which may take time based on the connection speed.</li>
            <li>The placeholder is shown when the request takes <b>more than one second.</b></li>
        </ul>
        <p>On faster devices there is no need to clutter the UI with a immediate placeholder (i.e if the request were to resolve in less than a second).</p>
        <p>Whereas on slower devices, a placeholder is shown after the request takes way too long (1 second in this case).</p>
    </React.Fragment>
);

ReactDOM.render(
    <React.unstable_AsyncMode>
        <App />
    </React.unstable_AsyncMode>,
    document.getElementById('root'),
);
