<script setup lang="ts">
import { ref, computed, watch } from "vue";
import { useRouter } from "vue-router";
import { drinkCatalog } from "../catalog.generated";
import { milks as milkCatalog } from "../catalog";

type Kind = "syrup" | "milk";

const router = useRouter();

// Derive picker lists from the catalog (instant, no API call).
const syrups = computed(() => {
  const set = new Set<string>();
  for (const d of drinkCatalog) {
    for (const ing of d.recipeIngredients) {
      const lower = ing.toLowerCase();
      if (lower.includes("syrup") || lower.includes("sauce")) set.add(ing);
    }
  }
  return [...set].sort();
});

const milks = computed(() => [...milkCatalog]);

const selectedKind = ref<Kind | null>(null);
const selectedValue = ref<string | null>(null);

const drinks = ref<string[]>([]);
const loadingDrinks = ref(false);
const drinksError = ref<string | null>(null);

function pick(kind: Kind, value: string) {
  selectedKind.value = kind;
  selectedValue.value = value;
}

watch([selectedKind, selectedValue], async ([kind, value]) => {
  if (!kind || !value) return;
  drinks.value = [];
  drinksError.value = null;
  loadingDrinks.value = true;
  try {
    if (kind === "milk") {
      drinks.value = drinkCatalog
        .filter((d) => d.defaultMilk === value)
        .map((d) => d.name);
    } else {
      const params = new URLSearchParams({ kind, value });
      const res = await fetch(`/api/learn/drinks?${params}`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const body = await res.json();
      drinks.value = body.drinks;
    }
  } catch (e) {
    drinksError.value = e instanceof Error ? e.message : "Failed to load drinks";
  } finally {
    loadingDrinks.value = false;
  }
});

function openDrink(name: string) {
  const entry = drinkCatalog.find((d) => d.name === name);
  router.push({
    name: "instructions",
    params: { drinkName: name },
    query: {
      size: "grande",
      iced: String(entry?.defaultIced ?? false),
      milk: entry?.defaultMilk ?? "2%",
    },
  });
}

const heading = computed(() => {
  if (!selectedKind.value || !selectedValue.value) return "Pick an ingredient";
  const kindLabel = selectedKind.value === "syrup" ? "use" : "default to";
  return `Drinks that ${kindLabel} ${selectedValue.value}`;
});
</script>

<template>
  <main class="learn">
    <header>
      <button @click="router.push('/pos')">← Back to POS</button>
      <h1>Help me learn</h1>
    </header>

    <div class="layout">
      <aside class="picker">
        <section>
          <h2>Syrups & sauces</h2>
          <button
            v-for="s in syrups"
            :key="s"
            :class="{ active: selectedKind === 'syrup' && selectedValue === s }"
            @click="pick('syrup', s)"
          >
            {{ s }}
          </button>
        </section>
        <section>
          <h2>Milks</h2>
          <button
            v-for="m in milks"
            :key="m"
            :class="{ active: selectedKind === 'milk' && selectedValue === m }"
            @click="pick('milk', m)"
          >
            {{ m }}
          </button>
        </section>
      </aside>

      <section class="results">
        <h2>{{ heading }}</h2>
        <p v-if="drinksError" class="error">{{ drinksError }}</p>

        <ul v-if="drinks.length">
          <li v-for="d in drinks" :key="d">
            <button class="drink" @click="openDrink(d)">{{ d }}</button>
          </li>
        </ul>

        <div v-if="loadingDrinks" class="spinner" aria-label="Loading more">
          <span class="dot"></span>
          <span class="dot"></span>
          <span class="dot"></span>
        </div>

        <p v-else-if="selectedKind && drinks.length === 0">No drinks match.</p>
      </section>
    </div>
  </main>
</template>

<style scoped>
.learn {
  max-width: 80vw;
  font-size: 3vmin;
  padding: 2em;
  margin: 0 auto;
}

header {
  display: flex;
  align-items: center;
  gap: 1em;
}

h1 {
  margin: 0;
}

.layout {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 2em;
  margin-top: 1em;
}

.picker section {
  margin-bottom: 1.5em;
}

h2 {
  font-size: 0.6em;
  margin: 0 0 0.5em;
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

.results ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

.results li {
  margin: 0.25em 0;
}

button.drink {
  display: block;
  width: 100%;
  text-align: left;
  padding: 0.75em 1em;
}

.spinner {
  display: flex;
  justify-content: center;
  gap: 0.4em;
  padding: 1em;
}

.spinner .dot {
  width: 0.5em;
  height: 0.5em;
  border-radius: 50%;
  background: #006241;
  animation: bounce 1.2s infinite ease-in-out both;
}

.spinner .dot:nth-child(2) {
  animation-delay: 0.15s;
}
.spinner .dot:nth-child(3) {
  animation-delay: 0.3s;
}

@keyframes bounce {
  0%, 80%, 100% {
    transform: scale(0.4);
    opacity: 0.4;
  }
  40% {
    transform: scale(1);
    opacity: 1;
  }
}

.error {
  color: #b00020;
}
</style>
