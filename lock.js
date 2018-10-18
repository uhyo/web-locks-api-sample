/**
 * Simple wrapper of Web Locks API's lock model
 */
export class Lock {
    constructor(lockName) {
        /**
         * Name of lock.
         */
        this.lockName = lockName;
        /**
         * State of this lock.
         */
        this.state = 'initialized';
        /**
         * Actual Lock object.
         */
        this.lock = null;
        /**
         * Function to call when lock is released.
         */
        this.releaseFunc = null;
    }
    /**
     * Acquire the lock. 
     * Returns a Promise which resolves when lock is acquired.
     */
    acquire() {
        if (this.state !== 'initialized') {
            throw new Error('This lock is already acquired');
        }
        return new Promise(resolve => {
            const lockResultPromise = new Promise(resolve => {
                this.releaseFunc = resolve;
            });
            navigator.locks.request(this.lockName, lock => {
                // lock is now acquired.
                this.lock = lock;
                this.state = 'acquired';
                resolve();
                return lockResultPromise;
            });
        });
    }
    /**
     * Release the lock.
     */
    release() {
        if (this.state !== 'acquired') {
            throw new Error('This lock is not acquired');
        }
        this.state = 'released';
        this.releaseFunc();
    }
    /**
     * Utility function to create and acquire a new lock.
     * Returns Promise which is resolved when lock is acquired.
     */
    static async acquire(lockName) {
        const lock = new Lock(lockName);
        await lock.acquire();
        return lock;
    }
}