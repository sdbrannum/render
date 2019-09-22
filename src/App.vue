<template>
    <div id="app">
        <RCalendarImpl />
        <RSearchImpl />
    </div>
</template>

<script>
import RCalendarImpl from '@/components/RCalendar/RCalendar.impl.vue';
import RSearchImpl from '@/components/RSearch/RSearch.impl.vue';

export default {
    name: 'app',
    components: {
        RCalendarImpl,
        RSearchImpl,
    },
};
</script>

<style>
#app {
    font-family: 'Avenir', Helvetica, Arial, sans-serif;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    color: #2c3e50;
    margin-top: 60px;
}
</style>
