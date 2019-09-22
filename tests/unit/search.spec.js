import Search from '@/components/FuzzySearch/Search';
import { rankings } from '@/components/FuzzySearch/Constants';

// const query = '';
// const objs = [
//     {
//         a: 'A great person',
//         b: 'The greatest person',
//         c: 'The greatness of people',
//     },
//     {
//         a: '',
//         b: '',
//         c: '',
//     },
//     {
//         a: '',
//         b: '',
//         c: '',
//     },
// ];

// const flat = ['', '', ''];

test('the search results contain all the matching results (flat)', () => {
    const data = [
        'the sentabcence contains',
        'abcstartswith',
        'AbC',
        'any word abcstartswith',
        'abc',
        'a iosubsequence',
        'c ooosubsequence a',
    ];
    const search = new Search(data);
    const { results } = search.execute('AbC');
    const resultData = results.map(res => res.data);

    expect(resultData).toContain('the sentabcence contains');
    expect(resultData).toContain('abcstartswith');
    expect(resultData).toContain('AbC');
    expect(resultData).toContain('any word abcstartswith');
    expect(resultData).toContain('a iosubsequence');
    expect(resultData).toContain('c ooosubsequence a');
});

test('the search results are ranked correctly (flat)', () => {
    const data = [
        'the sentabcence contains',
        'abcstartswith',
        'AbC',
        'any word abcstartswith',
        'abc',
        'a subsequence',
        'c substring a',
    ];
    const search = new Search(data);
    const { results } = search.execute('AbC');
    const a = results.find(el => el.data === 'the sentabcence contains');
    const b = results.find(el => el.data === 'abcstartswith');
    const c = results.find(el => el.data === 'AbC');
    const d = results.find(el => el.data === 'any word abcstartswith');
    const e = results.find(el => el.data === 'abc');
    const f = results.find(el => el.data === 'a subsequence');
    const g = results.find(el => el.data === 'c substring a');

    expect(a.rank).toEqual(rankings.CONTAINS);
    expect(b.rank).toEqual(rankings.STARTS_WITH);
    expect(c.rank).toEqual(rankings.CASE_SENSITIVE_EQUAL);
    expect(d.rank).toEqual(rankings.WORD_STARTS_WITH);
    expect(e.rank).toEqual(rankings.EQUAL);
    expect(f.rank).toEqual(rankings.IO_SUBSEQUENCE);
    expect(g.rank).toEqual(rankings.SUBSEQUENCE);
});

test('the search results are sorted correctly (flat)', () => {
    const data = [
        'the sentabcence contains',
        'abcstartswith',
        'AbC',
        'any word abcstartswith',
        'abc',
        'a subsequence',
        'c substring a',
    ];
    const search = new Search(data);
    const { results } = search.execute('AbC');
    const resultData = results.map(res => res.data);
    expect(resultData).toEqual([
        'AbC',
        'abc',
        'abcstartswith',
        'any word abcstartswith',
        'the sentabcence contains',
        'a subsequence',
        'c substring a',
    ]);
});

// test('the search results contain correct results (objects)', () => {
//     const search = new Search();
//     const results = search.execute('test').map(res => res.rankedItem);
//     expect(results).toContain('test');
//     expect(results).toContain('abc test abc');
//     expect(results).toContain('test test');
//     expect(results).toContain('txexsxt');
//     expect(results).toContain('txexsxt txxexxsxxt');
//     expect(results).toContain('txxexxsxxt txexsxt');
// });

test('the results find the highest ranking item in an object given a set of keys (objects)', () => {
    const data = [
        {
            a: 'The greatest person',
            b: 'A great person',
            c: 'The greatness of people',
            d: 'A greater person than I',
            e: 'Great person',
        },
    ];
    const search = new Search(data, ['a', 'b', 'c', 'd', 'e']);
    const { results, totalResults } = search.execute('greate');
    expect(totalResults).toEqual(1);
    expect(results[0].rankedItem).toEqual('A greater person than I');
});
