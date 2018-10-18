/**
 * Web Locks API example: parent script.
 */

import {
    PHILOSOPHER_NUMBER,
    CIRCLE_R,
    PHILOSOPHER_SIZE,
    FORK_SIZE,
} from './params.js';

/**
 * One Dining Philosopher.
 */
class Philosopher {
    constructor({id, total}) {
        /**
         * ID of this philosopher.
         * Natural number in [0, total).
         */
        this.id = id;
        /**
         * Total number of philosophers.
         */
        this.total = total;

        /**
         * ID of left fork.
         */
        this.left = id;
        /**
         * ID of right fork.
         */
        this.right = (id - 1 + total) % total;
    }
    /**
     * Place Philosopher's page on this page.
     */
    place() {
        const {id, total, left, right} = this;

        // position of philosopher in [0, 1).
        const position = id / total;

        const iframe = document.createElement('iframe');
        iframe.src = `/philosopher.html?left=${left}&right=${right}&color=${encodeURIComponent(circleColor(position))}`;
        iframe.width = '160';
        iframe.height = '160';

        // calculate position of philosopher.

        const {x, y} = circlePosition(CIRCLE_R, position);
        const offset = PHILOSOPHER_SIZE / 2;

        Object.assign(iframe.style, {
            position: 'absolute',
            left: `calc(50vw + ${x - offset}px)`,
            top: `calc(50vh + ${y - offset}px)`,
            border: 'none',
        });
        document.body.append(iframe);
    }
}

class Fork {
    constructor({id, total}) {
        /**
         * ID of this fork.
         */
        this.id = id;
        /**
         * total number of forks (and philosophers).
         */
        this.total = total;
        /**
         * Current owner of this fork.
         */
        this.owner = null;
    }
    place() {
        const {id, total} = this;
        const i = this.icon = document.createElement('i');
        i.className = 'fas fa-utensils';

        const position = (id + 0.5) / total;
        const offset = FORK_SIZE / 2;
        const {x, y} = circlePosition(CIRCLE_R, position);
        Object.assign(i.style, {
            position: 'absolute',
            left: `calc(50vw + ${x - offset}px)`,
            top: `calc(50vh + ${y - offset}px)`,
            fontSize: `${FORK_SIZE}px`,
        });
        this.setColor();
        document.body.append(i);
    }
    setColor() {
        const {owner} = this;
        this.icon.style.color = owner == null ? '#aaaaaa' : owner.color;
    }
    setOwner(owner) {
        this.owner = owner;
        this.setColor();
    }
}

function circlePosition(radius, position) {
    // adjust angle so that 0rad comes to top.
    const rad = Math.PI * 2 * (position - 0.25);
    return {
        x: radius * Math.cos(rad),
        y: radius * Math.sin(rad),
    };
}
function circleColor(position) {
    return `hsl(${position}turn, 80%, 60%)`;
}

export function init() {
    // initialize forks.
    const forks = (new Array(PHILOSOPHER_NUMBER)).fill(0).map((_, i)=> {
        const fork = new Fork({
            id: i,
            total: PHILOSOPHER_NUMBER,
        });
        fork.place();
        return fork;
    });
    // initialize all philosophers.
    const phils = (new Array(PHILOSOPHER_NUMBER)).fill(0).map((_, i)=> {
        const p = new Philosopher({
            id: i,
            total: PHILOSOPHER_NUMBER,
        });
        p.place();
        return p;
    });
    // listen for message from philosophers.
    window.addEventListener('message', e => {
        const {forkId, owner} = e.data;
        if ('number' !== typeof forkId) {
            return;
        }
        const fork = forks[forkId];
        fork.setOwner(owner);
    });
}