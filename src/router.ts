import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router';
import PosView from './views/PosView.vue';
import InstructionsView from './views/InstructionsView.vue';

const routes: RouteRecordRaw[] = [
  { path: '/', redirect: '/pos' },
  { path: '/pos', name: 'pos', component: PosView },
  {
    path: '/instructions/:drinkId',
    name: 'instructions',
    component: InstructionsView,
    props: true,
  },
];

export const router = createRouter({
  history: createWebHistory(),
  routes,
});
