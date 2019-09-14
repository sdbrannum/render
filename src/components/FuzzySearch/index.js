import Search from './search';
// import Worker from 'worker-loader!./search.worker.js'; // use during dev
import Worker from 'web-worker:./search.worker.js'; // use for build
import { msg_type } from './constants';

export default {
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
                this.workerMessenger(msg_type.DATA, newData);
            } else {
                this.search.data = newData;
            }
        },
        keys(newKeys) {
            if (this.worker) {
                this.workerMessenger(msg_type.KEYS, newKeys);
            } else {
                this.search.keys = newKeys;
            }
        },
        page(newPage) {
            if (this.worker) {
                this.workerMessenger(msg_type.PAGE, newPage);
            } else {
                this.search.getPage(newPage);
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
            this.worker = new Worker();
            this.worker.onmessage = e => this.workerListener(e);
            this.workerMessenger(msg_type.CONFIG, this.searchOptions);
            this.debouncedSearch = debounce(query => {
                this.setSearching(true);
                this.workerMessenger(msg_type.SEARCH, query);
            }, this.wait);
        } else {
            this.search = new Search(this.data, this.keys, this.searchOptions);
            this.debouncedSearch = debounce(query => {
                this.setSearching(true);
                ({
                    results: this.results,
                    totalResults: this.totalResults,
                } = this.search.execute(query));
                this.setSearching(false);
            }, this.wait);
        }
    },
    mounted() {},
    methods: {
        workerMessenger(type, payload) {
            this.worker.postMessage({ type, payload });
        },
        workerListener(e) {
            this.setSearching(false);
            const msg = e.data;
            this.results = msg.payload.results;
            this.totalResults = msg.payload.totalResults;
        },
        setSearching(isSearching) {
            this.searching = isSearching;
            this.$emit('searching', isSearching);
        },
    },
};
