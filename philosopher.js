import {
    PHILOSOPHER_SIZE,
} from './params.js';
import {
    LeftRightStrategy,
} from './strategy.js';

export function init() {
    // show philosopher in the page.
    const icon = document.querySelector('#icon');
    const params = new URLSearchParams(location.search);

    const color = params.get('color');

    Object.assign(icon.style, {
        fontSize: `${PHILOSOPHER_SIZE}px`,
        color,
    });

    // initialize a strategy for this philosopher.
    const strat = new LeftRightStrategy({
        left: Number.parseInt(params.get('left')),
        right: Number.parseInt(params.get('right')),
        reportFork: (forkId, occupied) => {
            const owner = occupied ? {
                color,
            } : null;
            reportForkState(forkId, owner);
        },
    })

    strat.run();
}

function reportForkState(forkId, owner) {
    // report to the parent page that a fork is occupied.
    window.parent.postMessage({
        forkId,
        owner,
    }, location.origin);
}
