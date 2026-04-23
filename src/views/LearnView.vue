<script setup lang="ts">
import { ref, computed, onMounted, watch } from "vue";
import { useRouter } from "vue-router";
import { drinkCatalog } from "../catalog.generated";

type Kind = "syrup" | "milk";

const router = useRouter();

const syrups = ref<string[]>([]);
const milks = ref<string[]>([]);
const loadingIngredients = ref(true);
const ingredientsError = ref<string | null>(null);

const selectedKind = ref<Kind | null>(null);
const selectedValue = ref<string | null>(null);

const drinks = ref<string[]>([]);
const loadingDrinks = ref(false);
const drinksError = ref<string | null>(null);

onMounted(async () => {
  try {
    const res = await fetch("/api/learn/ingredients");
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const body = await res.json();
    syrups.value = body.syrups;
    milks.value = body.milks;
  } catch (e) {
    ingredientsError.value = e instanceof Error ? e.message : "Failed to load";
  } finally {
    loadingIngredients.value = false;
  }
});

function pick(kind: Kind, value: string) {
  selectedKind.value = kind;
  selectedValue.value = value;
}

watch([selectedKind, selectedValue], async ([kind, value]) => {
  if (!kind || !value) return;
  loadingDrinks.value = true;
  drinksError.value = null;
  drinks.value = [];
  try {
    if (kind === "milk") {
      // Filter the catalog client-side: drinks whose defaultMilk matches.
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
        <p v-if="loadingIngredients">Loading…</p>
        <p v-else-if="ingredientsError" class="error">
          {{ ingredientsError }}
        </p>
        <template v-else>
          <section>
            <h2>Syrups & sauces</h2>
            <button
              v-for="s in syrups"
              :key="s"
              :class="{
                active: selectedKind === 'syrup' && selectedValue === s,
              }"
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
              :class="{
                active: selectedKind === 'milk' && selectedValue === m,
              }"
              @click="pick('milk', m)"
            >
              {{ m }}
            </button>
          </section>
        </template>
      </aside>

      <section class="results">
        <h2>{{ heading }}</h2>
        <p v-if="loadingDrinks">Loading…</p>
        <p v-else-if="drinksError" class="error">{{ drinksError }}</p>
        <p v-else-if="selectedKind && drinks.length === 0">
          No drinks match.
        </p>
        <ul v-else>
          <li v-for="d in drinks" :key="d">
            <button class="drink" @click="openDrink(d)">{{ d }}</button>
          </li>
        </ul>
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

.error {
  color: #b00020;
}
</style>
