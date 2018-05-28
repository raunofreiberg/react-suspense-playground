import React, {Timeout} from '../lib/react';
import ReactDOM from '../lib/react-dom';
import {createCache, createResource} from '../lib/simple-cache-provider';

const data = {
    '1337': 'Rauno',
    '1231': 'John',
    '99': 'Mary',
};

const fetchAsync = id => new Promise((resolve, reject) => {
    if (data[id]) {
        return setTimeout(
            () => resolve(data[id]),
            4000,
        );
    }

    return setTimeout(
        () => reject("Invalid ID"),
        4000,
    )
});

const cache = createCache();
const resource = createResource(fetchAsync);

const AsyncName = ({ id }) => {
    const name = resource.read(cache, id);
    return <p>{name}</p>
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

const AsyncComponent = () => (
    <ErrorBoundary>
        <Fallback timeout={2000} placeholder={<Loading />}>
            <AsyncName id="1337" />
            <p>Also, this text should appear with the async name.</p>
        </Fallback>
    </ErrorBoundary>
);

const App = () => (
    <React.Fragment>
        <AsyncComponent />
        <h1>This is a demo of React Suspense</h1>
        <ul>
            <li>An async API request is simulated using setTimeout with a 4 second delay.</li>
            <li>The placeholder is shown when the request takes <b>more than 2 seconds.</b></li>
        </ul>
        <p>Thus, on faster devices there is no need to clutter the UI with a immediate placeholder (i.e if the request were to resolve in a single second).</p>
        <p>Whereas on slower devices, a placeholder is shown after the request takes way too long (2 seconds in this case).</p>
    </React.Fragment>
);

ReactDOM.render(
    <React.unstable_AsyncMode>
        <App />
    </React.unstable_AsyncMode>,
    document.getElementById('root'),
);
