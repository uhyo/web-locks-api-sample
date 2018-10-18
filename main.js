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
        /**
         * Reference to the iframe for this philosopher.
         */
        this.iframe = null;
        /**
         * Whether this philosopher is ready.
         */
        this.raedy = false;
        /**
         * Function to call when this philosopher is ready.
         */
        this.readyCallback = null;
    }
    /**
     * Place Philosopher's page on this page.
     */
    place() {
        const {id, total, left, right} = this;

        // position of philosopher in [0, 1).
        const position = id / total;

        const container = document.createElement('div');

        // color of this philosopher
        const color = circleColor(position);

        const iframe = this.iframe = document.createElement('iframe');
        iframe.src = `./philosopher.html?id=${id}&left=${left}&right=${right}&color=${encodeURIComponent(color)}`;
        iframe.width = String(PHILOSOPHER_SIZE);
        iframe.height = String(PHILOSOPHER_SIZE);
        iframe.style.border = 'none';

        // calculate position of philosopher.

        const {x, y} = circlePosition(CIRCLE_R, position);
        const offset = PHILOSOPHER_SIZE / 2;

        Object.assign(container.style, {
            position: 'absolute',
            left: `calc(50vw + ${x - offset}px)`,
            top: `calc(50vh + ${y - offset}px)`,
        });

        const nametag = document.createElement('p');
        Object.assign(nametag.style, {
            fontSize: '1.2rem',
            fontWeight: 'bold',
            textAlign: 'center',
            color,
        });
        nametag.append(`ID: ${id}`);

        container.append(iframe, nametag);
        document.body.append(container);
    }
    ready() {
        this.ready = true;
        if (this.readyCallback != null) {
            this.readyCallback();
        }
        this.readyCallback = null;
    }
    /**
     * Returns a Promise resolved when this philosopher is ready.
     * TODO: do not call this function twice!
     */
    whenReady() {
        if (this.ready) {
            return Promise.resolve();
        }
        return new Promise(resolve => {
            this.readyCallback = resolve;
        });
    }
    /**
     * Post messgae to underlying page.
     */
    postMessage(message) {
        if (this.iframe == null) {
            throw new Error('underlying iframe is not placed yet');
        }
        this.iframe.contentWindow.postMessage(message, location.origin);
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

        const wrapper = this.wrapper = document.createElement('div');

        const i = document.createElement('i');
        i.className = 'fas fa-utensils';
        i.style.fontSize = `${FORK_SIZE}px`;

        const position = (id + 0.5) / total;
        const offset = FORK_SIZE / 2;
        const {x, y} = circlePosition(CIRCLE_R, position);
        Object.assign(wrapper.style, {
            position: 'absolute',
            left: `calc(50vw + ${x - offset}px)`,
            top: `calc(50vh + ${y - offset}px)`,
            width: 'min-content',
            margin: 'auto',
        });
        this.setColor();

        const label = this.label = document.createElement('p');
        Object.assign(label.style, {
            margin: '0.2em 0',
            textAlign: 'center',
            fontSize: '1.1rem',
            fontWeight: 'bold',
        });

        wrapper.append(i, label);
        document.body.append(wrapper);
    }
    setColor() {
        const {owner} = this;
        this.wrapper.style.color = owner == null ? '#aaaaaa' : owner.color;
    }
    setLabel() {
        const {owner} = this;
        this.label.textContent = owner == null ? '' : String(owner.id);
    }
    setOwner(owner) {
        this.owner = owner;
        this.setColor();
        this.setLabel();
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
    return `hsl(${position}turn, 80%, 50%)`;
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
        const {data} = e;
        switch (data.type) {
            case 'ready': {
                // philosopher page is ready.
                phils[data.id].ready();
                break;
            }
            case 'fork': {
                // fork's owner is set.
                const { forkId, owner } = data;
                if ('number' !== typeof forkId) {
                    return;
                }
                const fork = forks[forkId];
                fork.setOwner(owner);
            }
        }
    });
    // set up the control form.
    const startButton = document.querySelector('#start-button');
    // enable the start button when all philosophers are ready.
    Promise.all(phils.map(p => p.whenReady())).then(()=> {
        startButton.disabled = false;
    });
    startButton.addEventListener('click', e=> {
        // send request to start to all philosophers.
        phils.forEach(p=> {
            p.postMessage({
                type: 'start',
                strategy: document.querySelector('#strategy').value,
            });
        });
        
        startButton.disabled = true;
    })
}