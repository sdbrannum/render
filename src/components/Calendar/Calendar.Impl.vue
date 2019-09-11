<template>
    <div>
        {{ selectedDate }}
        <RCalendar :iso="true" :selectedDate="selectedDate">
            <div class="calendar" slot-scope="{ datesArray }">
                <div class="week" v-for="(week, idx) in datesArray" :key="idx">
                    <div
                        class="day"
                        v-for="(day, idx) in week"
                        :key="`${day}-${idx}`"
                        @click="setSelected(day)"
                    >
                        {{ day.date | formatToDate }}
                    </div>
                </div>
            </div>
        </RCalendar>
    </div>
</template>

<script>
import RCalendar from './index';
export default {
    components: {
        RCalendar,
    },
    data() {
        return {
            selectedDate: new Date(),
        };
    },
    filters: {
        formatToDate(val) {
            return val.getDate();
        },
    },
    methods: {
        setSelected(day) {
            this.selectedDate = day.date;
        },
    },
};
</script>

<style scoped>
.calendar {
    display: flex;
    flex-direction: column;
    border: 1px solid grey;
}

.week {
    display: flex;
    flex-direction: row;
    border-bottom: 1px solid grey;
}

.week:last-of-type {
    border-bottom: 0;
}

.day {
    flex: 1;
    padding: 0.25rem;
    border-right: 1px solid grey;
}

.day:last-of-type {
    border-right: 0;
}
</style>
