// import Worker from 'web-worker:./search.worker.js'; // build
// import Worker from 'worker-loader!./search.worker.js'; // dev
import PromiseWorker from 'promise-worker';
const Worker =
    process.env.NODE_ENV === 'production'
        ? require('web-worker:./search.worker.js')
        : require('worker-loader!./search.worker.js');
import Search from './search';
import { msg_type } from './constants';

export default {
    name: 'RSearch',
    render() {
        return this.$scopedSlots.default({
            results: this.results,
            totalResults: this.totalResults,
            searching: this.searching,
        });
    },
    props: {
        data: {
            type: Array,
            required: false,
            default: () => [],
        },
        /**
         * Prefill the results when data is set before query
         */
        prefill: {
            type: Boolean,
            required: false,
            default: true,
        },
        keys: {
            type: Array,
            required: false,
            default: () => [],
        },
        query: {
            type: String,
            required: false,
            validator(val) {
                return typeof val === 'string' || !val;
            },
        },
        useWorker: {
            type: Boolean,
            required: false,
            default: false,
        },
        /**
         * Page the data
         */
        paged: {
            type: Boolean,
            required: false,
            default: false,
        },
        page: {
            type: Number,
            required: false,
            default: 1,
            validator(val) {
                return typeof val === 'number' && val > 0;
            },
        },
        pageSize: {
            type: Number,
            required: false,
            default: 50,
        },
        /**
         * Minimum ranking
         */
        threshold: {
            type: [String, Number],
            required: false,
            default: 1,
        },
        /**
         * Max dist between subsequences
         */
        maxDistance: {
            type: Number,
            required: false,
            default: 9,
        },
        /**
         * Debounce wait time
         */
        wait: {
            type: Number,
            required: false,
            default: 200,
        },
    },
    data() {
        return {
            worker: null,
            results: [],
            totalResults: this.data.length,
            searching: false,
        };
    },
    computed: {
        searchOptions() {
            return {
                paged: this.paged,
                pageSize: this.pageSize,
                threshold: this.threshold,
                maxDistance: this.maxDistance,
            };
        },
    },
    watch: {
        data(newData) {
            if (this.worker) {
                this.worker
                    .postMessage({
                        type: msg_type.DATA,
                        payload: newData,
                    })
                    .then(() => {
                        if (this.prefill) {
                            this.worker
                                .postMessage({
                                    type: msg_type.SEARCH,
                                    payload: { query: null, page: this.page },
                                })
                                .then(payload => this.onSearchResults(payload));
                        }
                    });
            } else {
                this.search.data = newData;
                if (this.prefill) {
                    this.search.execute(null, this.page);
                }
            }
        },
        keys(newKeys) {
            if (this.worker) {
                this.worker.postMessage({
                    type: msg_type.KEYS,
                    payload: newKeys,
                });
            } else {
                this.search.keys = newKeys;
            }
        },
        page(newPage) {
            // console.log('new page >>', newPage);
            if (this.worker) {
                this.worker
                    .postMessage({
                        type: msg_type.SEARCH,
                        payload: { query: this.query, page: newPage },
                    })
                    .then(payload => this.onSearchResults(payload));
            } else {
                this.search.execute(this.query, newPage);
            }
        },
        query(newQuery) {
            this.debouncedSearch(newQuery);
        },
    },
    created() {
        const debounce = (callback, time = 250, interval) => (...args) =>
            clearTimeout(
                interval,
                (interval = setTimeout(callback, time, ...args))
            );

        if (this.useWorker && !!window.Worker) {
            this.worker = new PromiseWorker(new Worker());
            this.worker.postMessage({
                type: msg_type.CONFIG,
                payload: this.searchOptions,
            });
            this.debouncedSearch = debounce(query => {
                this.setSearching(true);
                this.worker
                    .postMessage({
                        type: msg_type.SEARCH,
                        payload: { query },
                    })
                    .then(payload => this.onSearchResults(payload));
            }, this.wait);
        } else {
            this.search = new Search(this.data, this.keys, this.searchOptions);
            this.debouncedSearch = debounce(query => {
                this.setSearching(true);
                this.onSearchResults(this.search.execute(query));
            }, this.wait);
        }
    },
    mounted() {},
    methods: {
        setSearching(isSearching) {
            this.searching = isSearching;
            this.$emit('searching', isSearching);
        },
        onSearchResults(payload) {
            console.log('hit', this.page, payload);
            this.setSearching(false);
            this.results = payload.results;
            this.totalResults = payload.totalResults;
        },
    },
};
