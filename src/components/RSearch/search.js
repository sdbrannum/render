import { rankings } from './constants';

export default class Search {
    constructor(data = [], keys = [], options = {}) {
        this.data = data;
        this.keys = keys;
        this.paged = options.paged || false;
        this.pageSize = options.pageSize || data.length;
        this.threshold = options.threshold || rankings.SUBSEQUENCE;
        this.maxDistance = options.maxDistance || 9;
        this.results = [];
        this.cachedQuery = null;
    }

    /**
     * Get page from results
     * @param {Number} page
     */
    getPage(page) {
        const startIndex = this.pageSize * (page - 1);
        const endIndex = this.pageSize * page;
        const pagedResults = this.results.slice(startIndex, endIndex);
        const totalResults = this.results.length;
        return {
            results: pagedResults,
            totalResults,
        };
    }

    /**
     * Return sorted and matched results based on given query and data
     * @param {String} query
     * @param {Array} data
     * @remarks by reference
     */
    execute(query, page = 1) {
        if (this.results.length > 0 && this.cachedQuery === query) {
            return this.getPage(page);
        }
        this.cachedQuery = query;
        this.results = [];

        if (!query) {
            for (let i = 0; i < this.data.length; i++) {
                this.results.push({
                    rank: -1,
                    rankedItem: null,
                    positions: [],
                    data: this.data[i],
                });
            }
            if (this.paged) {
                return this.getPage(page);
            }

            return {
                results: this.results,
                totalResults: this.data.length,
            };
        }

        const hasKeys = this.keys.length > 0;

        for (let i = 0; i < this.data.length; i++) {
            const el = this.data[i];
            const valsForItem = this.flatten(el, this.keys);
            let rankResult = null;

            if (hasKeys) {
                // get highest rank for vals
                rankResult = valsForItem.reduce((acc, curr) => {
                    const ranked = this.rankItem(curr, query);
                    if (!acc.rank || ranked.rank > acc.rank) {
                        acc = ranked;
                    } else if (acc.rank == ranked.rank) {
                        const alphabetCompare = ranked.rankedItem.localeCompare(
                            acc.rankedItem
                        );
                        if (alphabetCompare < 0) {
                            acc = ranked;
                        }
                    }
                    return acc;
                }, {});
            } else {
                rankResult = this.rankItem(el, query);
            }

            // add the item back to the result, necessary so when an object is used the full object is returned
            rankResult.data = el;

            if (
                rankResult &&
                rankResult.rank >= this.threshold &&
                rankResult.distance <= this.maxDistance
            ) {
                this.results.push(rankResult);
            }
        }

        const sortRankedItems = (a, b) => {
            if (a.rank === b.rank) {
                if (a.distance && a.distance !== b.distance) {
                    return a.distance - b.distance;
                }
                return a.rankedItem.localeCompare(b.rankedItem);
            }
            return b.rank - a.rank;
        };

        this.results.sort(sortRankedItems);

        if (this.paged) {
            return this.getPage(1);
        }

        const totalResults = this.results.length;
        return { results: this.results, totalResults };
    }

    rankItem(el, query) {
        let beginPosition = 0;

        // case sensitive equals
        if (el === query) {
            return {
                rank: rankings.CASE_SENSITIVE_EQUAL,
                rankedItem: el,
                distance: 0,
                positions: [
                    ...this.range(beginPosition, beginPosition + query.length),
                ],
            };
        }

        // upper casing before further comparison
        const EL_UPPER = el.toUpperCase(),
            QUERY_UPPER = query.toUpperCase();

        // case insensitive equals
        if (EL_UPPER === QUERY_UPPER) {
            return {
                rank: rankings.EQUAL,
                rankedItem: el,
                distance: 0,
                positions: [
                    ...this.range(beginPosition, beginPosition + query.length),
                ],
            };
        }

        // starts with
        beginPosition = EL_UPPER.indexOf(QUERY_UPPER);
        if (beginPosition === 0) {
            return {
                rank: rankings.STARTS_WITH,
                rankedItem: el,
                distance: 0,
                positions: [
                    ...this.range(beginPosition, beginPosition + query.length),
                ],
            };
        }

        // any word except first starts with
        beginPosition = EL_UPPER.indexOf(` ${QUERY_UPPER}`);
        if (beginPosition !== -1) {
            return {
                rank: rankings.WORD_STARTS_WITH,
                rankedItem: el,
                distance: 0,
                positions: [
                    ...this.range(beginPosition, beginPosition + query.length),
                ],
            };
        }

        // contains
        beginPosition = EL_UPPER.indexOf(QUERY_UPPER);
        if (beginPosition !== -1) {
            return {
                rank: rankings.CONTAINS,
                rankedItem: el,
                distance: 0,
                positions: [
                    ...this.range(beginPosition, beginPosition + query.length),
                ],
            };
        }

        // in order subsequence
        let minWin = this.minWinInOrderSeq(QUERY_UPPER, EL_UPPER);
        if (minWin.minSequence && minWin.minSequence.length > 0) {
            return {
                rank: rankings.IO_SUBSEQUENCE,
                rankedItem: el,
                distance: minWin.minSequence.length - query.length,
                positions: minWin.positions,
            };
        }

        minWin = this.minWinOutOfOrderSeq(QUERY_UPPER, EL_UPPER);
        if (minWin.minSequence && minWin.minSequence.length > 0) {
            return {
                rank: rankings.SUBSEQUENCE,
                rankedItem: el,
                distance: minWin.minSequence.length - query.length,
                positions: minWin.positions,
            };
        }

        // didn't meet search criteria
        return {
            rank: rankings.NO_MATCH,
            rankedItem: el,
            distance: -1,
            position: [],
        };
    }

    /**
     * Minimum window subsequence
     * @param {String} query
     * @param {String} searchString
     * @returns {String} minimum subsequence window
     * @remarks https://www.youtube.com/watch?v=W2DvQcDPD9A
     */
    minWinInOrderSeq(query, searchString) {
        let minSequence = null;

        if (!query || !searchString) {
            return { minSequence: minSequence, positions: [] };
        }
        if (query.length > searchString.length) {
            return { minSequence: minSequence, positions: [] };
        }

        let end = 0,
            maxWinLength = searchString.length + 1,
            positions = [];

        for (let i = 0, j = 0; i < searchString.length; i++) {
            if (searchString[i] === query[j]) {
                j += 1;
                if (j >= query.length) {
                    positions = [];
                    end = i + 1;
                    j -= 1;
                    while (j >= 0) {
                        if (query[j] === searchString[i]) {
                            positions.unshift(i);
                            j -= 1;
                        }
                        i -= 1;
                    }
                    i += 1;
                    j += 1;
                    if (end - i < maxWinLength) {
                        maxWinLength = end - i;
                        minSequence = searchString.substring(end, i);
                    }
                }
            }
        }
        return { minSequence, positions };
    }
    /**
     * Minimum window substring
     * @param {String} query
     * @param {String} searchString
     */
    minWinOutOfOrderSeq(query, searchString) {
        let minSequence = null;
        let positions = [];
        if (!query || !searchString) {
            return { minSequence, positions };
        }
        if (query.length > searchString.length) {
            return { minSequence, positions };
        }

        // build map containing letters and counts of those letters for our query
        const queryCharMap = new Map();
        [...query].forEach(letter => {
            let letterVal = queryCharMap.get(letter);
            if (letterVal) {
                queryCharMap.set(letter, letterVal + 1);
            } else {
                queryCharMap.set(letter, 1);
            }
        });

        const incrementMapKeyVal = (map, key, val) => {
            let currVal = map.get(key);
            if (currVal) {
                map.set(key, currVal + val);
            } else {
                map.set(key, 1);
            }
        };

        /*
            Loop over search string.  Move the right index until we satisfy.
            Compare against the current best.  Squeeze and compare until we
            no longer satsify and then start moving the right again
        */
        let left = 0,
            right = 0,
            frequenciesThatMatch = 0;

        const windowCharMap = new Map(),
            totalFrequenciesToMatch = queryCharMap.size;

        while (right < searchString.length) {
            let rightLetter = searchString[right];

            incrementMapKeyVal(windowCharMap, rightLetter, 1);

            if (queryCharMap.has(rightLetter)) {
                // do the frequencies of this letter in window and query match?
                if (
                    queryCharMap.get(rightLetter) ===
                    windowCharMap.get(rightLetter)
                ) {
                    frequenciesThatMatch += 1;
                }
            }

            while (
                frequenciesThatMatch === totalFrequenciesToMatch &&
                left <= right
            ) {
                minSequence = searchString; // necessary to be here so we don't return the whole string if no match
                let leftLetter = searchString[left],
                    windowSize = right - left + 1;

                if (windowSize < minSequence.length) {
                    minSequence = searchString.substring(left, right + 1);

                    positions = [...minSequence].reduce((acc, curr, idx) => {
                        if (queryCharMap.has(curr)) {
                            acc.push(left + idx);
                        }
                        return acc;
                    }, []);
                }

                // left will increase so decrement val for letter at that position in windowCharMap
                incrementMapKeyVal(windowCharMap, leftLetter, -1);

                // is left character a requirement
                if (queryCharMap.has(leftLetter)) {
                    // does the letter frequency fail to meet the standard now>
                    if (
                        windowCharMap.get(leftLetter) <
                        queryCharMap.get(leftLetter)
                    ) {
                        frequenciesThatMatch -= 1;
                    }
                }

                left += 1;
            }
            right += 1;
        }

        return { minSequence, positions };
    }

    /**
     * Remove accents/diacritics from a given string
     * @param {String} str
     * @remarks https://stackoverflow.com/questions/990904/remove-accents-diacritics-in-a-string-in-javascript
     */
    removeDiacritics(str) {
        return str.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    }

    /**
     * Gets values from object by keys and returns values in an array
     * @param {Object} item
     * @param {Array} keys
     */
    flatten(item, keys) {
        return keys.map(key => item[key]);
    }

    /*
     * Generate an array filled from start..stop
     */
    range(start, stop) {
        return Array(Math.ceil((stop - start) / 1))
            .fill(start)
            .map((x, y) => x + y * 1);
    }
}
