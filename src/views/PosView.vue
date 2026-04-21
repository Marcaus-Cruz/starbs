<script setup lang="ts">
import { ref } from "vue";
import { useRouter } from "vue-router";
import type { Size } from "../types";
import {
  drinks,
  sizes,
  milks,
  modifiers,
  type Drink,
  type Milk,
  type Modifier,
} from "../catalog";

const router = useRouter();

const selectedDrink = ref<Drink | null>(null);
const selectedSize = ref<Size>("grande");
const iced = ref(false);
const selectedModifiers = ref<Modifier[]>([]);
const selectedMilk = ref<Milk>("2%");

function toggleModifier(name: Modifier) {
  const i = selectedModifiers.value.indexOf(name);
  if (i === -1) selectedModifiers.value.push(name);
  else selectedModifiers.value.splice(i, 1);
}

function placeOrder() {
  if (selectedDrink.value === null) return;
  router.push({
    name: "instructions",
    params: { drinkName: selectedDrink.value },
    query: {
      size: selectedSize.value,
      iced: String(iced.value),
      modifiers: selectedModifiers.value.join(","),
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
        :key="drink"
        :class="{ active: selectedDrink === drink }"
        @click="selectedDrink = drink"
      >
        {{ drink }}
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
      <label :class="{ 'iced-active': iced }">
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
        :key="mod"
        :class="{ active: selectedModifiers?.includes(mod) }"
        @click="toggleModifier(mod)"
      >
        {{ mod }}
      </button>
    </section>

    <button
      class="primary"
      :disabled="selectedDrink === null"
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
  display: flex;
  flex-wrap: wrap;
  margin: 0.5em 0;
}

h1 {
  margin: auto;
}

h2 {
  margin: auto;
  font-size: 1em;
  flex-basis: 100%;
}

button {
  font-size: 0.5em;
  margin: 0.25em;
  padding: 0.5em 1em;
  cursor: pointer;
  flex: 0 0 10vw;
  min-height: 4em;
}

button.active {
  background: #006241;
  color: white;
}

label.iced-active {
  color: #006241;
  font-weight: 600;
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
