import {
    eachDayOfInterval,
    startOfWeek,
    endOfWeek,
    startOfMonth,
    lastDayOfMonth,
    isSameMonth,
    isToday,
    getDay,
    getISODay,
    addDays,
} from 'date-fns';
import { day_labels, month_labels, view_types } from './constants';

export default {
    name: 'RCalendar',
    render() {
        return this.$scopedSlots.default({
            dates: this.dates,
            currentDayLabel: this.currentDayLabel,
            currentMonthLabel: this.currentMonthLabel,
            dayLabels: this.dayLabels,
            monthLabels: this.monthLabels,
        });
    },
    props: {
        /**
         * Date that we build the days around
         */
        date: {
            type: Date,
            required: false,
            default: () => new Date(),
        },
        /**
         * View type ie day, week, month, year
         */
        view: {
            type: String,
            required: false,
            default: view_types.MONTH,
            validator(val) {
                return Object.values(view_types).indexOf(val) !== -1;
            },
        },
        /**
         * Build as 2d array if longer than 1 week otherwise as 1d array of days
         */
        asWeeks: {
            type: Boolean,
            required: false,
            default: true,
        },
        /**
         * Controls if sunday is the first (default) or last day of week
         */
        iso: {
            type: Boolean,
            required: false,
            default: false,
        },
        /**
         * Type of day label abr, full, alt
         */
        dayLabelType: {
            type: String,
            required: false,
            default: 'full',
            validator(val) {
                return ['abr', 'full', 'alt'].indexOf(val) !== -1;
            },
        },
        /**
         * Type of month label abr, full
         */
        monthLabelType: {
            type: String,
            required: false,
            default: 'full',
            validator(val) {
                return ['abr', 'full'].indexOf(val) !== -1;
            },
        },
    },
    data() {
        return {};
    },
    computed: {
        /**
         * Day labels depending on dayLabelType
         */
        dayLabels() {
            const dayLabels =
                this.dayLabelType === 'alt'
                    ? day_labels.map(label => label.alt)
                    : this.dayLabelType === 'abr'
                    ? day_labels.map(label => label.abr)
                    : day_labels.map(label => label.full);

            if (this.iso) {
                dayLabels.push(dayLabels.shift());
            }
            return dayLabels;
        },
        /**
         * Month labels depending on monthLabelType
         */
        monthLabels() {
            return this.monthLabelType === 'abr'
                ? month_labels.map(label => label.abr)
                : month_labels.map(label => label.full);
        },
        /**
         * this.date's label
         */
        currentDayLabel() {
            return this.dayLabels[this.getDayEval(this.date)];
        },
        /**
         * this.date's month
         */
        currentMonth() {
            return this.date.getMonth();
        },
        /**
         * this.date's month label
         */
        currentMonthLabel() {
            return this.monthLabels[this.currentMonth];
        },
        /**
         * this.date's year label
         */
        currentYear() {
            return this.date.getFullYear();
        },
        /**
         * first day of the interval
         */
        startDate() {
            const date =
                this.view === view_types.DAY
                    ? this.date
                    : this.view === view_types.WEEK
                    ? startOfWeek(this.date, { weekStartsOn: this.iso ? 1 : 0 })
                    : startOfMonth(this.date);

            if (this.view === view_types.MONTH) {
                const daysNeededAtStart = this.getDayEval(date);
                return addDays(date, -daysNeededAtStart);
            }
            return date;
        },
        /**
         * last day of the interval
         */
        endDate() {
            const date =
                this.view === view_types.DAY
                    ? this.date
                    : this.view === view_types.WEEK
                    ? endOfWeek(this.date, { weekStartsOn: this.iso ? 1 : 0 })
                    : lastDayOfMonth(this.date);

            if (this.view === view_types.MONTH) {
                const daysNeededAtEnd =
                    7 - (this.getDayEval(date) + 1) > 6
                        ? 0
                        : 7 - this.getDayEval(date) - 1;
                return addDays(date, daysNeededAtEnd);
            }

            return date;
        },
        /**
         * Dates array
         */
        dates() {
            const tempDates = eachDayOfInterval({
                start: this.startDate,
                end: this.endDate,
            }).map(date => ({
                date,
                isCurrentMonth: isSameMonth(this.date, date),
                isToday: isToday(date),
            }));

            if (this.asWeeks && this.view === view_types.MONTH) {
                return tempDates.reduce(function(acc, curr, idx) {
                    return (
                        (idx % 7 == 0
                            ? acc.push([curr])
                            : acc[acc.length - 1].push(curr)) && acc
                    );
                }, []);
            }
            return tempDates;
        },
    },
    methods: {
        /**
         * Get day index accounting for iso prop
         * @param {Date} date
         */
        getDayEval(date) {
            let dayIndex = this.iso ? getISODay(date) : getDay(date);
            if (this.iso) {
                dayIndex -= 1;
            }
            console.log('getDayEval', date, dayIndex);
            return dayIndex;
        },
    },
};
