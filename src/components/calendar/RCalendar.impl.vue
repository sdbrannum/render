<template>
    <div>
        <div>
            <button @click="viewType = viewTypes.DAY">Day</button>
            <button @click="viewType = viewTypes.WEEK">Week</button>
            <button @click="viewType = viewTypes.MONTH">Month</button>
        </div>
        <div>
            <label for="iso">
                Week Starts On Monday
                <input type="checkbox" @change="iso = !iso" />
            </label>
        </div>
        {{ selectedDate }}
        <RCalendar
            :iso="iso"
            :date="selectedDate"
            :view="viewType"
            :events="events"
        >
            <div class="calendar" slot-scope="{ dates }">
                <template v-if="viewType === viewTypes.MONTH">
                    <div class="week" v-for="(week, idx) in dates" :key="idx">
                        <div
                            class="day"
                            v-for="(day, idx) in week"
                            :key="`${day}-${idx}`"
                            @click="setSelected(day)"
                        >
                            <header>
                                <span>{{ day.date | formatToDate }}</span>
                            </header>
                            <div class="events">
                                <div
                                    class="event"
                                    v-for="event in day.events"
                                    :key="event.id"
                                >
                                    {{ event.title }}
                                </div>
                            </div>
                        </div>
                    </div>
                </template>
                <template v-else>
                    <div class="week">
                        <div class="class" v-for="day in dates" :key="day">
                            {{ day.date | formatToDate }}
                        </div>
                    </div>
                </template>
            </div>
        </RCalendar>
    </div>
</template>

<script>
import RCalendar from './index';
import { view_types } from './constants';

export default {
    components: {
        RCalendar,
    },
    data() {
        return {
            selectedDate: new Date(),
            viewType: view_types.MONTH,
            viewTypes: view_types,
            iso: false,
            events: [
                {
                    id: 1,
                    start: new Date(2019, 9, 1),
                    end: null,
                    title: 'Meeting with Sabrina',
                    details: {
                        location: 'P1E Conference Room',
                    },
                },
                {
                    id: 1,
                    start: new Date(2019, 9, 1),
                    end: null,
                    title: "Mark's birthday",
                    details: {
                        location: 'Emperial Brewery',
                    },
                },
                {
                    id: 1,
                    start: new Date(2019, 9, 2),
                    end: new Date(2019, 9, 4),
                    title: 'Vue meetup',
                    details: {
                        location: {
                            place: 'Austin Convention Center',
                            city: 'Austin',
                            state: 'TX',
                            address: '500 E. Cesar Chavez St.',
                            zip: 78701,
                        },
                    },
                },
            ],
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
    height: 500px;
}

.week {
    display: flex;
    flex: 1;
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
