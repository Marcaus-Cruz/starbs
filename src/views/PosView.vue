<script setup lang="ts">
import { ref } from "vue";
import { useRouter } from "vue-router";
import type { Size } from "../types";

const router = useRouter();

const drinks = ref([{ id: 1, name: "Latte" }]);
const modifiers = ref([{ id: 1, name: "Vanilla Syrup" }]);

const sizes: Size[] = ["short", "tall", "grande", "venti", "trenta"];
const milks = [
  "2%",
  "Whole",
  "Nonfat",
  "Oat",
  "Almond",
  "Soy",
  "Coconut",
  "Half & Half",
  "Heavy Cream",
  "Protein",
] as const;
type Milk = (typeof milks)[number];

const selectedDrinkId = ref<number | null>(null);
const selectedSize = ref<Size>("grande");
const iced = ref(false);
const selectedModifierIds = ref<number[]>([]);
const selectedMilk = ref<Milk>("2%");

function toggleModifier(id: number) {
  const i = selectedModifierIds.value.indexOf(id);
  if (i === -1) selectedModifierIds.value.push(id);
  else selectedModifierIds.value.splice(i, 1);
}

function placeOrder() {
  if (selectedDrinkId.value === null) return;
  router.push({
    name: "instructions",
    params: { drinkId: String(selectedDrinkId.value) },
    query: {
      size: selectedSize.value,
      iced: String(iced.value),
      modifiers: selectedModifierIds.value.join(","),
      milk: selectedMilk.value,
    },
  });
}
</script>

<template>
  <main class="pos">
    <h1>STARBS POS</h1>

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
      <h2>Milk</h2>
      <button
        v-for="milk in milks"
        :key="milk"
        :class="{ active: selectedMilk === milk }"
        @click="selectedMilk = milk"
      >
        {{ milk }}
      </button>
    </section>

    <section>
      <h2>Modifiers</h2>
      <button
        v-for="mod in modifiers"
        :key="mod.id"
        :class="{ active: selectedModifierIds.includes(mod.id) }"
        @click="toggleModifier(mod.id)"
      >
        {{ mod.name }}
      </button>
    </section>

    <button
      class="primary"
      :disabled="selectedDrinkId === null"
      @click="placeOrder"
    >
      Place order
    </button>
  </main>
</template>

<style scoped>
.pos {
  max-width: 80vw;
  font-size: 3vmin;
  padding: 2em;
  margin: 0 auto;
}
section {
  margin: 0.5em 0;
}

h1 {
  margin: auto;
}

h2 {
  margin: auto;
  font-size: 1em;
}

button {
  font-size: 0.5em;
  margin: 0.25em;
  padding: 0.5em 1em;
  cursor: pointer;
}
button.active {
  background: #006241;
  color: white;
}
button.primary {
  background: #006241;
  color: white;
  padding: 0.75em 1.5em;
  font-size: 1em;
}
button.primary:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}
</style>
