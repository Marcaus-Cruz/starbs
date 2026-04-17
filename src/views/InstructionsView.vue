<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import type { Drink, Size } from '../types';

const route = useRoute();
const router = useRouter();

const drink = ref<Drink | null>(null);
const error = ref<string | null>(null);
const loading = ref(true);

const size = computed<Size>(() => (route.query.size as Size) ?? 'grande');
const iced = computed<boolean>(() => route.query.iced === 'true');

const variant = computed(() =>
  drink.value?.variants.find((v) => v.size === size.value && v.iced === iced.value) ?? null
);

onMounted(async () => {
  const id = route.params.drinkId as string;
  try {
    const res = await fetch(`/api/drinks/${id}`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    drink.value = await res.json();
  } catch (e) {
    error.value = e instanceof Error ? e.message : 'Failed to load drink';
  } finally {
    loading.value = false;
  }
});
</script>

<template>
  <main class="instructions">
    <button @click="router.push('/pos')">← Back to POS</button>

    <p v-if="loading">Loading…</p>
    <p v-else-if="error" class="error">Error: {{ error }}</p>

    <template v-else-if="drink">
      <h1>{{ drink.name }}</h1>
      <p class="meta">{{ size }}{{ iced ? ' · iced' : '' }}</p>

      <section v-if="variant">
        <h2>Ingredients</h2>
        <ul>
          <li v-for="(info, name) in variant.ingredients" :key="name">
            {{ name }}: {{ info.quantity }} {{ info.unit }}
          </li>
        </ul>
      </section>
      <p v-else class="error">No recipe for size={{ size }}, iced={{ iced }}.</p>

      <section>
        <h2>Steps</h2>
        <ol>
          <li v-for="s in drink.steps" :key="s.stepNumber">{{ s.instruction }}</li>
        </ol>
      </section>
    </template>
  </main>
</template>

<style scoped>
.instructions {
  max-width: 640px;
  margin: 0 auto;
  padding: 2rem;
}
.meta {
  color: #666;
  text-transform: capitalize;
}
.error {
  color: #b00020;
}
</style>
