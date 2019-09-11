import {
    eachDayOfInterval,
    startOfMonth,
    endOfMonth,
    lastDayOfMonth,
    isSameDay,
    isSameMonth,
    isToday,
    getDay,
    getISODay,
    addDays,
    addMonths,
    setDate,
    setMonth,
    getMonth,
} from 'date-fns';
import { day_labels, month_labels } from './constants';

export default {
    name: 'RCalendar',
    render() {
        return this.$scopedSlots.default({
            datesArray: this.datesArray,
        });
    },
    props: {
        selectedDate: {
            type: Date,
            required: false,
            default: new Date(),
        },
        month: {
            type: Number,
            required: false,
        },
        year: {
            type: Number,
            required: false,
        },
        asWeeks: {
            type: Boolean,
            required: false,
            default: true,
        },
        iso: {
            type: Boolean,
            required: false,
            default: false,
        },
    },
    data() {
        return {
            today: null,
            currDateCursor: null,
            dayLabels: null,
            monthLabels: null,
            internalMonth: 0,
            internalYear: 0,
        };
    },
    computed: {
        currentMonth() {
            return this.currDateCursor.getMonth();
        },
        currentYear() {
            return this.currDateCursor.getFullYear();
        },
        currentMonthLabel() {
            return this.monthLabels[this.currentMonth];
        },
        datesArray() {
            const date = this.currDateCursor;
            const start = startOfMonth(date);
            const end = endOfMonth(date);

            const days = eachDayOfInterval({
                start,
                end,
            }).map(day => ({
                date: day,
                isCurrentMonth: isSameMonth(
                    new Date(this.currentYear, this.currentMonth),
                    day
                ),
                isToday: isToday(day),
                isSelected: isSameDay(this.selectedDate, day),
            }));

            // gen the days from last month
            let previousMonthCursor = lastDayOfMonth(addMonths(date, -1));
            let begIndex = this.getDayEval(days[0].date);
            // iso uses 1 - 7
            if (this.iso) {
                begIndex -= 1;
            }
            for (let i = begIndex; i > 0; i--) {
                days.unshift({
                    date: previousMonthCursor,
                    isCurrentMonth: false,
                    isToday: isToday(previousMonthCursor),
                    isSelected: isSameDay(
                        this.selectedDate,
                        previousMonthCursor
                    ),
                });
                previousMonthCursor = addDays(previousMonthCursor, -1);
            }

            // gen days for next month
            const daysNeededAtEnd =
                days.length % 7 > 0 ? 7 - (days.length % 7) : 0;
            let nextMonthCursor = addMonths(date, 1);
            nextMonthCursor = setDate(nextMonthCursor, 1);
            for (let x = 1; x <= daysNeededAtEnd; x++) {
                days.push({
                    date: nextMonthCursor,
                    isCurrentMonth: false,
                    isToday: isToday(nextMonthCursor),
                    isSelected: isSameDay(this.selectedDate, nextMonthCursor),
                });
                nextMonthCursor = addDays(nextMonthCursor, 1);
            }
            if (this.asWeeks) {
                return days.reduce(function(acc, curr, idx) {
                    return (
                        (idx % 7 == 0
                            ? acc.push([curr])
                            : acc[acc.length - 1].push(curr)) && acc
                    );
                }, []);
            }
            return days;
        },
    },
    created() {
        this.dayLabels = day_labels.slice();
        this.monthLabels = month_labels.slice();
        this.today = new Date();
        this.currDateCursor = this.selectedDate;
        //
        this.internalMonth = this.month;
        this.internalYear = this.year;
    },
    mounted() {
        if (this.startDate) {
            this.currDateCursor = this.startDate;
            this.selectedDate = this.startDate;
        }
    },
    methods: {
        getDayEval(date) {
            return this.iso ? getISODay(date) : getDay(date);
        },
        dayClassObj(day) {
            return {
                today: day.isToday,
                current: day.isCurrentMonth,
                selected: day.isSelected,
            };
        },
        nextMonth() {
            this.currDateCursor = addMonths(this.currDateCursor, 1);
        },
        previousMonth() {
            this.currDateCursor = addMonths(this.currDateCursor, -1);
        },
        // TODO: make watcher on selectedDate call this
        setSelectedDate(day) {
            this.selectedDate = day.date;
            this.$emit('input', this.selectedDate);
            // change calendar to correct month if they select previous or next month's days
            if (!day.isCurrentMonth) {
                const selectedMonth = getMonth(this.selectedDate);
                this.currDateCursor = setMonth(
                    this.currDateCursor,
                    selectedMonth
                );
            }
        },
    },
};
