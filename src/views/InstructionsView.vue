<script setup lang="ts">
import { ref, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import type { ResolvedOrder } from "../types";

const route = useRoute();
const router = useRouter();

const order = ref<ResolvedOrder | null>(null);
const error = ref<string | null>(null);
const loading = ref(true);

onMounted(async () => {
  const name = route.params.drinkName as string;
  const params = new URLSearchParams({
    size: (route.query.size as string) ?? "grande",
    iced: (route.query.iced as string) ?? "false",
  });
  if (route.query.modifiers)
    params.set("modifiers", route.query.modifiers as string);
  if (route.query.milk) params.set("milk", route.query.milk as string);

  try {
    const res = await fetch(
      `/api/drinks/${encodeURIComponent(name)}?${params}`,
    );
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      throw new Error(body.error ?? `HTTP ${res.status}`);
    }
    order.value = await res.json();
    console.log({ order: order.value });
  } catch (e) {
    error.value = e instanceof Error ? e.message : "Failed to load drink";
  } finally {
    loading.value = false;
  }
});
</script>

<template>
  <main class="instructions">
    <button @click="router.push('/pos')">← Back to POS</button>

    <div v-if="loading" class="spinner" aria-label="Loading">
      <span class="dot"></span>
      <span class="dot"></span>
      <span class="dot"></span>
    </div>
    <p v-else-if="error" class="error">Error: {{ error }}</p>

    <template v-else-if="order">
      <h1>{{ order.name }}</h1>
      <p class="meta">
        {{ order.size }}{{ order.iced ? " · iced" : ""
        }}{{ order.milk ? ` · ${order.milk.name.toLowerCase()} milk` : "" }}
      </p>

      <section v-if="order.modifiers.length">
        <h2>Syrups</h2>
        <ul>
          <li v-for="mod in order.modifiers" :key="mod.id">
            {{ mod.name }} — {{ mod.quantity }} {{ mod.unit }}
          </li>
        </ul>
      </section>

      <section>
        <h2>Ingredients</h2>
        <ul>
          <li v-for="(info, name) in order.ingredients" :key="name">
            <template v-if="info.quantity !== null">
              {{ name }}: {{ info.quantity }} {{ info.unit }}
            </template>
            <template v-else>
              {{ name }}
            </template>
          </li>
        </ul>
      </section>

      <section>
        <h2>Steps</h2>
        <ol>
          <li v-for="step in order.steps" :key="step.stepNumber">
            {{ step.text }}
          </li>
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
</style>
