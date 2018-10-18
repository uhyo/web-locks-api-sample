import {
    LOCK_PREFIX,
} from './params.js';
import {
    Lock,
} from './lock.js';

class StrategyBase {
    constructor({left, right, reportFork}) {
        /**
         * Function to report fork state.
         */
        this.reportFork = reportFork;
        /**
         * ID of left fork.
         */
        this.left = left;
        /**
         * ID of right fork.
         */
        this.right = right;
    }
    /**
     * Acquires a lock for fork of given id,
     * and then reports occupation of the fork.
     */
    async getFork(id) {
        const lock = await Lock.acquire(lockName(id));
        this.reportFork(id, true);
        return lock;
    }
    releaseFork(id, lock) {
        this.reportFork(id, false);
        lock.release();
    }
}

/**
 * Strategy which first acuires left fork and then right fork
 */
 export class LeftRightStrategy extends StrategyBase {
     constructor(options) {
         super(options);
         /**
          * Whether to wait for randm duration at the beginning.
          */
         this.waitOnInit = !!options.waitOnInit;
     }
    async run() {
        const {
            left,
            right,
            waitOnInit,
        } = this;
        // if waitOnInit flag is set, wait before running.
        if (waitOnInit) {
            await randomSleep();
        }
        while (true) {
            // First, acquire left fork.
            const leftForkLock = await this.getFork(left);
            // Then, acquire right fork.
            const rightForkLock = await this.getFork(right);
            // Use forks for some time.
            await randomSleep();
            // release forks.
            this.releaseFork(right, rightForkLock);
            this.releaseFork(left, leftForkLock);
            // have interval.
            await randomSleep();
        }
    }
 }

 /**
  * Strategy which acquires forks with smaller id.
  */
 export class OrderingStrategy extends StrategyBase {
    async run() {
        const {
            left,
            right,
            waitOnInit,
        } = this;
        // reorder two forks.
        const first = Math.min(left, right);
        const last = Math.max(left, right);
        while (true) {
            // First, acquire fork with smaller id..
            const firstForkLock = await this.getFork(first);
            // Then, acquire the other fork.
            const lastForkLock = await this.getFork(last);
            // Use forks for some time.
            await randomSleep();
            // release forks.
            this.releaseFork(last, lastForkLock);
            this.releaseFork(first, firstForkLock);
            // have interval.
            await randomSleep();
        }
    }
 }

 function lockName(id) {
     return LOCK_PREFIX + id;
 }

 /**
  * Asynchronously sleep for given duration.
  */
 function sleep(time) {
     return new Promise(resolve => {
         setTimeout(resolve, time);
     });
 }

 /**
  * Sleep for random duration.
  */
 function randomSleep() {
     return sleep(Math.floor(400 + 400 * Math.random()));
 }