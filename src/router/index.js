import { createRouter, createWebHistory } from 'vue-router';
import AppLayout from '@/components/AppLayout.vue';
import LoginForm from '@/pages/Authentification/LoginForm.vue';
import EnregistrerVisiteur from '@/pages/Visiteur/EnregistrerVisiteur.vue';
import ListeVisiteur from '@/pages/Visiteur/ListeVisiteur.vue';
import FileAttente from '@/pages/Visiteur/FileAttente.vue';
import ListeDemandeRecu from '@/pages/Service/ListeDemandeRecu.vue';
import FileAttenteService from '@/pages/Service/FileAttenteService.vue';

const routes = [
  {
      path: '/',
      name: 'LoginForm',
      component: LoginForm,
  },
  {
    path: '/home',
    name: 'HomePage',
    component: AppLayout,
    beforeEnter: (to, from, next) => {
      if(!localStorage.getItem('token') && !localStorage.getItem('idService')) {
          next("/");
      } else {
          next()
      }
    },
    children: [
      {
        path: 'enregistrer-visiteur',
        name: 'EnregistrerVisiteur',
        component: EnregistrerVisiteur
      },
      {
        path: 'liste-visiteurs',
        name: 'ListeVisiteur',
        component: ListeVisiteur
      },
      {
        path: 'file-attente',
        name: 'FileAttente',
        component: FileAttente
      },

      {
        path: 'demande-recu',
        name: 'DemandeRecu',
        component: ListeDemandeRecu
      },
      {
        path: 'file-attente-service',
        name: 'FileAttenteService',
        component: FileAttenteService
      }
    ]
  }
];

const router = createRouter({
    // eslint-disable-next-line no-undef
    history: createWebHistory(process.env.BASE_URL),
    routes,
});

export default router;
