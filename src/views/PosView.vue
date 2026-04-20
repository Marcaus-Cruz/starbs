<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import type { Size } from '../types';

const router = useRouter();

const drinks = ref([{ id: 1, name: 'Latte' }]);
const modifiers = ref([{ id: 1, name: 'Vanilla Syrup' }]);

const selectedDrinkId = ref<number | null>(null);
const selectedSize = ref<Size>('grande');
const iced = ref(false);
const selectedModifierIds = ref<number[]>([]);

const sizes: Size[] = ['short', 'tall', 'grande', 'venti', 'trenta'];

function toggleModifier(id: number) {
  const i = selectedModifierIds.value.indexOf(id);
  if (i === -1) selectedModifierIds.value.push(id);
  else selectedModifierIds.value.splice(i, 1);
}

function placeOrder() {
  if (selectedDrinkId.value === null) return;
  router.push({
    name: 'instructions',
    params: { drinkId: String(selectedDrinkId.value) },
    query: {
      size: selectedSize.value,
      iced: String(iced.value),
      modifiers: selectedModifierIds.value.join(','),
    },
  });
}
</script>

<template>
  <main class="pos">
    <h1>starbs POS</h1>

    <section>
      <h2>Drink</h2>
      <button
        v-for="drink in drinks"
        :key="drink.id"
        :class="{ active: selectedDrinkId === drink.id }"
        @click="selectedDrinkId = drink.id"
      >
        {{ drink.name }}
      </button>
    </section>

    <section>
      <h2>Size</h2>
      <button
        v-for="size in sizes"
        :key="size"
        :class="{ active: selectedSize === size }"
        @click="selectedSize = size"
      >
        {{ size }}
      </button>
    </section>

    <section>
      <label>
        <input type="checkbox" v-model="iced" />
        Iced
      </label>
    </section>

    <section>
      <h2>Modifiers</h2>
      <button
        v-for="m in modifiers"
        :key="m.id"
        :class="{ active: selectedModifierIds.includes(m.id) }"
        @click="toggleModifier(m.id)"
      >
        {{ m.name }}
      </button>
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
