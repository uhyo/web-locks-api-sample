import {
    PHILOSOPHER_SIZE,
} from './params.js';
import {
    LeftRightStrategy,
    OrderingStrategy,
} from './strategy.js';

export function init() {
    // show philosopher in the page.
    const icon = document.querySelector('#icon');
    const params = new URLSearchParams(location.search);

    const id = Number.parseInt(params.get('id'));
    const color = params.get('color');

    Object.assign(icon.style, {
        fontSize: `${PHILOSOPHER_SIZE}px`,
        color,
    });

    // listen to message from parent.
    window.addEventListener('message', e=> {
        const {data} = e;
        if (data.type === 'start') {
            // start running.

            // initialize a strategy for this philosopher.
            const strat = makeStrategy(data.strategy, {
                left: Number.parseInt(params.get('left')),
                right: Number.parseInt(params.get('right')),
                reportFork: (forkId, occupied) => {
                    const owner = occupied ? {
                        id,
                        color,
                    } : null;
                    reportForkState(forkId, owner);
                },
            });

            strat.run();
        }
    });
    // tell the parent that this page is ready.true
    sendToParent({
        type: 'ready',
        id,
    });
}

/**
 * Make given type of strategy.
 */
function makeStrategy(strategyName, options) {
    switch (strategyName) {
        case 'left-right': {
            return new LeftRightStrategy(options);
        }
        case 'left-right-wait': {
            return new LeftRightStrategy({
                ...options,
                waitOnInit: true,
            });
        }
        case 'ordering': {
            return new OrderingStrategy(options);
        }
    }
}

function reportForkState(forkId, owner) {
    // report to the parent page that a fork is occupied.
    sendToParent({
        type: 'fork',
        forkId,
        owner,
    });
}

/**
 * Wrapper of window.parent.postMessage() to send message to the parent.
 */
function sendToParent(message) {
    window.parent.postMessage(message, location.origin);
}