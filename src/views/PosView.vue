<script setup lang="ts">
import { computed, ref } from "vue";
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
import { drinkCatalog } from "../catalog.generated";

const drinkGroups = computed(() => {
  const groups: { label: string; drinks: Drink[] }[] = [
    { label: "Espresso", drinks: [] },
    { label: "Tea", drinks: [] },
    { label: "Other", drinks: [] },
  ];
  for (const drink of drinks) {
    const entry = drinkCatalog.find((d) => d.name === drink);
    const category = entry?.category;
    if (category === "espresso") groups[0].drinks.push(drink);
    else if (category === "tea") groups[1].drinks.push(drink);
    else groups[2].drinks.push(drink);
  }
  return groups.filter((g) => g.drinks.length > 0);
});

const router = useRouter();

const selectedDrink = ref<Drink | null>(null);
const selectedSize = ref<Size>("grande");
const iced = ref(false);
const selectedModifiers = ref<Modifier[]>([]);
const selectedMilk = ref<Milk>("2%");
const showCheatSheet = ref(false);

function selectDrink(drink: Drink) {
  selectedDrink.value = drink;
  const entry = drinkCatalog.find((d) => d.name === drink);
  if (!entry) return;
  iced.value = entry.defaultIced;
  if (entry.defaultMilk) selectedMilk.value = entry.defaultMilk as Milk;
}

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
    <section class="header">
      <h1>STARBS POS</h1>
      <div class="header-actions">
        <button @click="showCheatSheet = true">CHEAT SHEET</button>
        <button class="learn-link" @click="router.push('/learn')">
          LEARN →
        </button>
      </div>
    </section>
    
    <section v-for="group in drinkGroups" :key="group.label" class="drink-group">
      <h2>{{ group.label }}</h2>
      <button
        v-for="drink in group.drinks"
        :key="drink"
        :class="{ active: selectedDrink === drink }"
        @click="selectDrink(drink)"
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

    <div
      v-if="showCheatSheet"
      class="cheat-sheet-overlay"
      @click.self="showCheatSheet = false"
    >
      <div class="cheat-sheet" role="dialog" aria-label="Cheat sheet">
        <button class="cheat-sheet-close" @click="showCheatSheet = false">
          ×
        </button>
        <h2>Cheat Sheet</h2>

        <div class="cheat-section">
          <h3>Hot Bevs <span class="sizes">S / T / G / V</span></h3>
          <p>Shots: 1 / 1 / 2 / 2</p>
          <p>Syrups: 2 / 3 / 4 / 5</p>
          <p>Flat white = Ristretto + 1 shot</p>
        </div>

        <div class="cheat-section">
          <h3>Cold Bevs <span class="sizes">T / G / V</span></h3>
          <p>Shots: 1 / 2 / 3</p>
          <p>Syrups: 3 / 4 / 6</p>
        </div>

        <div class="cheat-section">
          <h3>Shaken Espressos <span class="sizes">T / G / V</span></h3>
          <p>Shots: 2 / 3 / 4</p>
          <p>Syrups: 1 / 2 / 3 (cold brews as well)</p>
        </div>

        <div class="cheat-section">
          <h3>Frapps <span class="sizes">T / G / V</span></h3>
          <p>Pumps / Scoops: 2 / 3 / 4</p>
        </div>
      </div>
    </div>
  </main>
</template>

<style scoped>
.header {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
}

.header-actions {
  display: flex;
  gap: 0.5em;
}

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

h1 {}

h2 {
  margin: auto;
  font-size: 1em;
  flex-basis: 100%;
}

button {
  font-size: 0.5em;
  margin: 0.25em;
  flex: 0 0 10vw;
  min-height: 4em;
}

label {
  cursor: pointer;
}

label input[type="checkbox"] {
  cursor: pointer;
}

label.iced-active {
  color: #006241;
  font-weight: 600;
}

button.primary {
  padding: 0.75em 1.5em;
  font-size: 1em;
}

.cheat-sheet-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 100;
}

.cheat-sheet {
  position: relative;
  background: #ffffff;
  color: #1a1a1a;
  border-radius: 8px;
  padding: 2em;
  max-width: 90vw;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.3);
  font-size: 0.6em;
}

.cheat-sheet h2 {
  margin: 0 0 1em;
  flex-basis: auto;
  font-size: 1.4em;
}

.cheat-sheet-close {
  position: absolute;
  top: 0.5em;
  right: 0.5em;
  font-size: 1.2em;
  line-height: 1;
  padding: 0.25em 0.5em;
  min-height: auto;
  flex: none;
  margin: 0;
}

.cheat-section {
  margin-bottom: 1.25em;
}

.cheat-section h3 {
  margin: 0 0 0.4em;
  font-size: 1.1em;
}

.cheat-section .sizes {
  font-weight: 400;
  color: #555;
  margin-left: 0.5em;
}

.cheat-section p {
  margin: 0.2em 0;
}
</style>
