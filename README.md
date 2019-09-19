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

## Calendar

[Demo]()

### Configuration

| Prop           | Description                                                                                                                                             | Type/Options | Default               |
| -------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------ | --------------------- |
| date           | Date to build dates array around                                                                                                                        | Date         | `new Date() // today` |
| view           | Date range to build (`'day'`, `'week'`, `'month'`)                                                                                                      | String       | `month`               |
| asWeeks        | Generate a 2d array representing arrays and days, otherwise a flat array ([see structure](#dates-array-structure)). Only valid when `view` is `'month'` | Boolean      | `true`                |
| iso            | Determines if Monday is the first day of the week                                                                                                       | Boolean      | `false`               |
| dayLabelType   | Type of day labels to generate (`'alt'` (Su), `'full'` (Sunday), `'abr'` (Sun))                                                                         | String       | `'full'`              |
| monthLabelType | Type of month label's to generate (`'abr'` (Sept) or `'full'` (September))                                                                              | String       | `'full'`              |
| events         | Array of event objects ([see below](#events) for detail)                                                                                                | Array        | `[]`                  |

### Scoped Slots

| Slot Prop         | Description                                                        | Value Type |
| ----------------- | ------------------------------------------------------------------ | ---------- |
| dates             | Array of dates ([see below](#dates-array-structure) for structure) | Array      |
| currentDayLabel   | Label of `date`                                                    | String     |
| currentMonthLabel | Label of `date`'s month                                            | String     |
| dayLabels         | Array of labels for days based on `dayLabelType`                   | Array      |
| monthLabels       | Array of labels for months based on `monthLabelType`               | Array      |

#### Dates Array Structure

The dates array can be either a 2d or 1d array of objects depending on the `asWeeks` and `view` props. If it is a 2d array then each 1st dimension array represents a week and each object within that array represents a date. The 1d array is just an array of objects representing the dates.

By default the dates array generates a full calendar month worth of dates with the option to generate a week or day at a time.

Note:

> The `'day'` view still generates an array, just with a single object.

The date object within the arrays is represented as such:

```
{
    date, // Date
    isCurrentMonth, // Boolean: refers to the current generated month
    isToday, // Boolean,
    events, // Array
}
```

#### Events

The events prop should be an array of objects with each object containing a single event. The only requirement for a date is that it has a `start` key with a `Date` value representing when the event starts. An optional key of `end` with a `Date` value can be supplied to make an event appear on multiple days. All other information within the object will be directly copied over so you can put anything within the object that may be of value such as an address, title, description, etc..

The events will be returned correspondingly within the `dates` scoped slot per day as an array of objects.

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
