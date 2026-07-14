import { createRouter, createWebHashHistory } from 'vue-router'
import LoginView from '@/views/LoginView.vue'
import RegisterView from '@/views/RegisterView.vue'
import HomeView from '@/views/HomeView.vue'
import DetailView from '@/views/DetailView.vue'
import PesanView from '@/views/PesanView.vue'
import ChatView from '@/views/ChatView.vue'
import LowonganView from '@/views/LowonganView.vue'
import ProfileView from '@/views/ProfileView.vue'
import UserView from '@/views/UserView.vue'
import CompanyDashboardView from '@/views/CompanyDashboardView.vue'

const routes = [
  { path: '/', redirect: '/login' },
  { path: '/login', component: LoginView },
  { path: '/register', component: RegisterView },
  { path: '/home', component: HomeView },
  { path: '/post/:id', component: DetailView },
  { path: '/pesan', component: PesanView },
  { path: '/pesan/:id', component: ChatView },
  { path: '/lowongan', component: LowonganView },
  { path: '/profil', component: ProfileView },
  { path: '/user/:id', component: UserView },
  { path: '/dashboard-perusahaan', component: CompanyDashboardView },
]

const router = createRouter({
  history: createWebHashHistory(),
  routes,
})

export default router