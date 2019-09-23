## Render.R-Calendar

A renderless vue calendar component

### Demo

[Demo]()

### Installation

### Usage

### Configuration

| Prop           | Description                                                                                                                                                   | Type/Options | Default               |
| -------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------ | --------------------- |
| date           | Date to build dates array around                                                                                                                              | Date         | `new Date() // today` |
| view           | Date range to build (`'day'`, `'week'`, `'month'`)                                                                                                            | String       | `month`               |
| asWeeks        | Generate a 2d array representing arrays and days, otherwise a flat array ([see structure](#dates-array-structure)). Only works valid when `view` is `'month'` | Boolean      | `true`                |
| iso            | Determines if Monday is the first day of the week                                                                                                             | Boolean      | `false`               |
| dayLabelType   | Type of day labels to generate (`'alt'` (Su), `'full'` (Sunday), `'abr'` (Sun))                                                                               | String       | `'full'`              |
| monthLabelType | Type of month label's to generate (`'abr'` (Sept) or `'full'` (September))                                                                                    | String       | `'full'`              |

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
}
```
