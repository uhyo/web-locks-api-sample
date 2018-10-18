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
    async run() {
        const {
            left,
            right,
        } = this;
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