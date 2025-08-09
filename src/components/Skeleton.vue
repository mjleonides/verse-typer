<template>
    <div v-if="paragraph" class="skeleton-paragraph">
        <div class="skeleton" style="width:90%"></div>
        <div class="skeleton" style="width:50%"></div>
        <div class="skeleton" style="width:35%"></div>
        <div class="skeleton" style="width:15%"></div>
        <div class="skeleton" style="width:75%"></div>
        <div class="skeleton" style="width:60%"></div>
        <div class="skeleton" style="width:20%"></div>
    </div>

    <div v-else class="skeleton" :style="{ height, width }"/>
</template>

<script setup lang="ts">

defineProps<{
    height?: string;
    width?: string;
    paragraph?: boolean;
}>()

</script>

<style scoped>
.skeleton {
    position: relative;
    display: block;
    overflow: hidden;
    background: #e2e8f077;
    height: 1.25rem;
    width: 5rem;
    border-radius: 6px;
    margin-bottom: 1rem;
}

.skeleton-paragraph {
    display: flex;
    flex-direction: row;
    gap: 1ch;
    width: 100%;
    flex-wrap: wrap;
}

.skeleton-paragraph .skeleton {
    margin-bottom: 0;
}

@keyframes skeleton-animation {
    from {
        transform: translateX(-100%);
    }

    to {
        transform: translateX(100%);
    }
}

.skeleton::after {
    content: '';
    animation: skeleton-animation 1.2s infinite;
    height: 100%;
    left: 0;
    position: absolute;
    right: 0;
    top: 0;
    transform: translateX(-100%);
    z-index: 1;
    background: linear-gradient(90deg, rgba(255, 255, 255, 0), rgba(255, 255, 255, 0.4), rgba(255, 255, 255, 0));
}
</style>