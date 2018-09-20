import React from 'react';
import shortid from 'shortid-36';

class Animate extends React.Component {
    animationsEnded = {};
    animations = {};
    children = [];
    handleAnimationEnd = e => {
        if ('boolean' !== typeof this.animationsEnded[e.animationName]) {
            return;
        }
        this.animationsEnded[e.animationName] = true;
        if (Object.values(this.animationsEnded).every(x => x)) {
            Object.keys(this.animationsEnded).forEach(x => {
                this.animationsEnded[x] = false;
            });

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
            return React.cloneElement(child, {
                style: {
                    ...child.props.style,
                    animation,
                },
            });
        });
    };

    componentDidMount = () => {
        window.addEventListener('animationend', this.handleAnimationEnd);

        this.styleElement = document.createElement('style');

        const keyframesFrags = [];

        this.props.animations.forEach(({ args, keyframes: _keyframes }) => {
            const menuAnimationId = shortid.generate();
            let keyframes;
            if ('function' === typeof _keyframes) {
                keyframes = _keyframes(this.props);
            } else {
                keyframes = _keyframes;
            }

            keyframesFrags.push(`@keyframes ${menuAnimationId} {
                ${keyframes}            
            }`);

            this.animations[menuAnimationId] = args;
            this.animationsEnded[menuAnimationId] = false;
        });
        this.styleElement.innerHTML = keyframesFrags.join('');
        document.body.appendChild(this.styleElement);
    };

    componentWillUnmount = () => {
        window.removeEventListener('animationend', this.handleAnimationEnd);
        document.body.removeChild(this.styleElement);
        this.styleElement = null;
    };
}

export default Animate;
