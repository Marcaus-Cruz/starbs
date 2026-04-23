import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router';
import PosView from './views/PosView.vue';
import InstructionsView from './views/InstructionsView.vue';
import LearnView from './views/LearnView.vue';

const routes: RouteRecordRaw[] = [
  { path: '/', redirect: '/pos' },
  { path: '/pos', name: 'pos', component: PosView },
  { path: '/learn', name: 'learn', component: LearnView },
  {
    path: '/instructions/:drinkName',
    name: 'instructions',
    component: InstructionsView,
    props: true,
  },
];

export const router = createRouter({
  history: createWebHistory(),
  routes,
});
