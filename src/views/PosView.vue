<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import type { Size } from '../types';

const router = useRouter();

const drinks = ref([{ id: 1, name: 'Latte' }]);
const selectedDrinkId = ref<number | null>(null);
const selectedSize = ref<Size>('grande');
const iced = ref(false);

const sizes: Size[] = ['short', 'tall', 'grande', 'venti'];

function placeOrder() {
  if (selectedDrinkId.value === null) return;
  router.push({
    name: 'instructions',
    params: { drinkId: String(selectedDrinkId.value) },
    query: { size: selectedSize.value, iced: String(iced.value) },
  });
}
</script>

<template>
  <main class="pos">
    <h1>starbs POS</h1>

    <section>
      <h2>Drink</h2>
      <button
        v-for="d in drinks"
        :key="d.id"
        :class="{ active: selectedDrinkId === d.id }"
        @click="selectedDrinkId = d.id"
      >
        {{ d.name }}
      </button>
    </section>

    <section>
      <h2>Size</h2>
      <button
        v-for="s in sizes"
        :key="s"
        :class="{ active: selectedSize === s }"
        @click="selectedSize = s"
      >
        {{ s }}
      </button>
    </section>

    <section>
      <label>
        <input type="checkbox" v-model="iced" />
        Iced
      </label>
    </section>

    <button class="primary" :disabled="selectedDrinkId === null" @click="placeOrder">
      Place order
    </button>
  </main>
</template>

<style scoped>
.pos {
  max-width: 640px;
  margin: 0 auto;
  padding: 2rem;
}
section {
  margin: 1.5rem 0;
}
button {
  margin-right: 0.5rem;
  padding: 0.5rem 1rem;
  cursor: pointer;
}
button.active {
  background: #006241;
  color: white;
}
button.primary {
  background: #006241;
  color: white;
  padding: 0.75rem 1.5rem;
  font-size: 1rem;
}
button.primary:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}
</style>
