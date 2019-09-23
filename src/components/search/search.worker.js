import Search from './search';
import registerPromiseWorker from 'promise-worker/register';

import { msg_type } from './constants';

class Comms {
    constructor() {
        this.search = new Search();
        this.data = [];
        this.results = [];
    }

    handleMessage(msg) {
        switch (msg.type.toString()) {
            case msg_type.CONFIG:
                this.search.paged = msg.payload.paged;
                this.search.pageSize = msg.payload.pageSize;
                this.search.threshold = msg.payload.threshold;
                break;
            case msg_type.DATA:
                this.search.data = msg.payload;
                break;
            case msg_type.KEYS:
                this.search.keys = msg.payload;
                break;
            case msg_type.SEARCH:
                return this.search.execute(
                    msg.payload.query,
                    msg.payload.page || 1
                );
            default:
                break;
        }
        // return to promiseWorker
        return;
    }
}

(function() {
    const comm = new Comms();
    registerPromiseWorker(msg => comm.handleMessage(msg));
    // onmessage = e => comm.handleMessage(e);
})();
