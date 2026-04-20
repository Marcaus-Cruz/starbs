<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import type { Size, Milk } from '../types';

const router = useRouter();

const drinks = ref([{ id: 1, name: 'Latte' }]);
const modifiers = ref([{ id: 1, name: 'Vanilla Syrup' }]);
const milks = ref<Milk[]>([]);

const selectedDrinkId = ref<number | null>(null);
const selectedSize = ref<Size>('grande');
const iced = ref(false);
const selectedModifierIds = ref<number[]>([]);
const selectedMilkId = ref<number | null>(null);

const sizes: Size[] = ['short', 'tall', 'grande', 'venti', 'trenta'];

onMounted(async () => {
  try {
    const res = await fetch('/api/milks');
    if (!res.ok) return;
    const list: Milk[] = await res.json();
    milks.value = list;
    const def = list.find((m) => m.isDefault);
    if (def) selectedMilkId.value = def.id;
  } catch {
    // Non-fatal: POS still usable, user just has to pick a milk manually if needed.
  }
});

function toggleModifier(id: number) {
  const i = selectedModifierIds.value.indexOf(id);
  if (i === -1) selectedModifierIds.value.push(id);
  else selectedModifierIds.value.splice(i, 1);
}

function placeOrder() {
  if (selectedDrinkId.value === null) return;
  const query: Record<string, string> = {
    size: selectedSize.value,
    iced: String(iced.value),
    modifiers: selectedModifierIds.value.join(','),
  };
  if (selectedMilkId.value !== null) query.milk = String(selectedMilkId.value);
  router.push({
    name: 'instructions',
    params: { drinkId: String(selectedDrinkId.value) },
    query,
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

    <section v-if="milks.length">
      <h2>Milk</h2>
      <button
        v-for="m in milks"
        :key="m.id"
        :class="{ active: selectedMilkId === m.id }"
        @click="selectedMilkId = m.id"
      >
        {{ m.name }}
      </button>
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
