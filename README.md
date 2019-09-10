# Render

Render is a work in progress of potentially useful renderless Vue.js components. Renderless components, as the name suggests, have no UI definition. These components merely provide the logic and internal functionality for you to use. This allows for you to create the front-end look and feel, define accessiblity, and handle semantics without needing to code the logic behind the component.

Each component is/will be documented below and has/will have a live example of how it could be used.

## Getting started

Install from npm
Import component

## Fuzzy Search

### Configuration

| Prop        | Description                                                            | Type/Options              | Default |
| ----------- | ---------------------------------------------------------------------- | ------------------------- | ------- |
| data        | The data to search for results in                                      | Array                     | []      |
| query       | The query used to perform a search                                     | String                    | null    |
| useWorker   | Perform search work in a dedicated Web Worker ([when to use this]())   | Boolean                   | false   |
| paged       | Paginate the results                                                   | Boolean                   | false   |
| pageSize    | If paged, the number of results to return                              | Number                    | 50      |
| page        | The current page of results                                            | Number                    | 1       |
| threshold   | The threshold at which an item must rank to be included in the results | Number ([see](#rankings)) | 0       |
| maxDistance | The max distance between characters to match on for subsequences       | Number                    | 9       |

### Scoped Slots

| Slot Prop    | Description                       | Value Type |
| ------------ | --------------------------------- | ---------- |
| results      | Results of search                 | Array      |
| totalResults | Total results including all pages | Number     |
| searching    | Performing search                 | Boolean    |

### Events

| Event     | Description       | Value Type |
| --------- | ----------------- | ---------- |
| searching | Performing search | Boolean    |

#### How search is performed

Internally, the search functionality is similar to Kent Dodd's [match-sorter](https://github.com/kentcdodds/match-sorter) library. We rank the searchable strings and then sort them by those rankings.

<a name="rankings"></a>The rankings are as follows

-   **Case sensitive equality (7)** - The query matches the searchable string exactly e.g. HeLLo = HeLLo and HeLLo != Hello
-   **Case insensitive equality (6)** - The query matches the searchable string except in case e.g. HeLLo = hello and hello = Hello

Below rankings are case-insensitive

-   **Starts with (5)** - The query matches the beginning of a searchable string e.g. "excu" matches “<mark>Excuse</mark> me. I believe you have my stapler.”
-   **Any word starts with (4)** - The query matches the beginning of any word in the search string e.g. "belie" matches “Excuse me. I <mark>believe</mark> you have my stapler.”
-   **Contains (3)** - The searchable string contains the query somewhere e.g. "xcus" matches “<mark>Excuse</mark> me. I believe you have my stapler.”
-   **In-order subsequence (2)** - The searchable string contains the query in-order but may have letters in between the query letters e.g. "Ecse" matches "<mark>Excuse</mark> me. I believe you have my stapler.”
-   **Out-of-order subsequence (1)** - The searchable string contains the query but the letters may be out-of-order and have other letters or spaces in between the query letters e.g. "eecuxs" matches “<mark>Excuse</mark> me. I believe you have my stapler.”
-   **No Match (0)**

#### When to use a dedicated web worker

A dedicated web worker is most useful when you have a large set of data that you want to search through client-side. Typically, this would be handled server-side but there may be other considerations. Using a web worker allows us to perform the intensive task of searching and sorting through a large dataset without blocking the main UI thread of your application.

[Here]() is a test of this feature that allows you to search through around 60,000 records while keeping the UI responsive.

Internally, if the user's browser does not support web workers we fall back to searching on the UI thread.

## Potential Components

-   Data Grid (Sortable js)
-   Tree View
-   Number Input/Formatting
-   Drag and Drop
-   Button
-   Dropdown
-   Pagination
-   DatePicker
-   TimePicker
-   Carousel
-   Error boundary?
-   Fetch?
-   Media query (show component's based on size)
-   [Tags Input](https://adamwathan.me/renderless-components-in-vuejs/)
