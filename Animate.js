import React from 'react';
import shortid from 'shortid-36';
import ReactDOM from 'react-dom';

class Animate extends React.Component {
    state = {
        ready: false,
        width: 0,
    };
    animationsEnded = {};
    animationsStarted = {};
    animations = {};
    children = [];
    target = React.createRef();

    handleAnimationStart = e => {
        if ('boolean' !== typeof this.animationsStarted[e.animationName]) {
            return;
        }
        this.animationsStarted[e.animationName] = true;
        if (Object.values(this.animationsStarted).every(x => x)) {
            if ('function' === typeof this.props.onAnimationStart) {
                this.props.onAnimationStart();
            }
        }
    };

    handleAnimationEnd = e => {
        if ('boolean' !== typeof this.animationsEnded[e.animationName]) {
            return;
        }
        this.animationsEnded[e.animationName] = true;
        if (Object.values(this.animationsEnded).every(x => x)) {
            this.inProgress = false;

            document.body.removeChild(this.styleElement);
            this.styleElement = null;

            if ('function' === typeof this.props.onAnimationEnd) {
                this.props.onAnimationEnd();
            }
        }
    };

    render = () => {
        return React.Children.map(this.props.children, child => {
            const animation = `${Object.entries(this.animations)
                .map(([name, args]) => `${name} ${args}`)
                .join(', ')}`;

            if (!this.state.ready) {
                return React.cloneElement(child, {
                    style: {
                        ...child.props.style,
                        opacity: 0,
                    },
                    ref: this.target,
                });
            }

            return React.cloneElement(child, {
                style: {
                    ...child.props.style,
                    animation,
                },
            });
        });
    };

    initializing = false;

    init = () => {
        if (this.initializing) {
            return;
        }
        this.initializing = true;
        this.styleElement = document.createElement('style');

        const keyframesFrags = [];

        this.animations = {};
        this.animationsEnded = {};

        this.props.animations.forEach(({ args, keyframes: _keyframes }) => {
            const menuAnimationId = shortid.generate();
            let keyframes;
            if ('function' === typeof _keyframes) {
                keyframes = _keyframes({ ...this.props, width: this.state.width });
            } else {
                keyframes = _keyframes;
            }

            keyframesFrags.push(`@keyframes ${menuAnimationId} {
                ${keyframes}            
            }`);

            this.animations[menuAnimationId] = args;
            this.animationsEnded[menuAnimationId] = false;
            this.animationsStarted[menuAnimationId] = false;
        });
        this.styleElement.innerHTML = keyframesFrags.join('');
        document.body.appendChild(this.styleElement);

        this.setState({ ready: true });
    };

    pollTargetClientRect = () => {
        let clientRect;
        try {
            const node = ReactDOM.findDOMNode(this.target.current);
            clientRect = node.getBoundingClientRect();
            this.setState({ width: clientRect.width }, () => {
                this.init();
            });
        } catch (e) {}
        if (!clientRect) {
            window.requestAnimationFrame(this.pollTargetClientRect);
        }
    };

    componentDidMount = () => {
        window.addEventListener('animationend', this.handleAnimationEnd);
        window.addEventListener('animationstart', this.handleAnimationStart);

        this.pollTargetClientRect();
    };

    componentWillUnmount = () => {
        window.removeEventListener('animationend', this.handleAnimationEnd);
        window.removeEventListener('animationstart', this.handleAnimationStart);
    };
}

export default Animate;
