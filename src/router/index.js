import { createRouter, createWebHistory } from 'vue-router';
import AppLayout from '@/components/AppLayout.vue';
import LoginForm from '@/pages/Authentification/LoginForm.vue';
import EnregistrerVisiteur from '@/pages/Visiteur/EnregistrerVisiteur.vue';
import ListeVisiteur from '@/pages/Visiteur/ListeVisiteur.vue';

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
          }    
        ]
    }
    // {
    //     path: '/dg/dashboard',
    //     name: 'DgDashboard',
    //     component: DgDashboard,
    //     beforeEnter: (to, from, next) => {
    //         if(!localStorage.getItem('token_Directeur General')) {
    //             next("/");
    //         } else {
    //             next()
    //         }
    //     }
    // },
    // {
    //     path: '/rh/dashboard',
    //     name: 'RhDashboard',
    //     component: RhDashboard,
    //     beforeEnter: (to, from, next) => {
    //         if(!localStorage.getItem("token_Ressources Humaine")) {
    //             next("/")
    //         } else {
    //             next()
    //         }
    //     }
    // },
    // {
    //     path: '/daf/dashboard', // Ajoutez cette route
    //     name: 'DafDashboard',
    //     component: DafDashboard,
    //     beforeEnter: (to, from, next) => {
    //         if (!localStorage.getItem('admin_Daf')) {
    //             next('/');
    //         } else {
    //             next();
    //         }
    //     },
    // },
    // {
    //     path: '/accueil/dashboard',
    //     name: 'AccueilDashboard',
    //     component: AccueilDashboard,
    //     beforeEnter: (to, from, next) => {
    //         if (!localStorage.getItem('token_accueil')) {
    //             next('/');
    //         } else {
    //             next();
    //         }
    //     }
    // },
    // {
    //     path: '/accueil/visiteurs',
    //     name: 'VisiteurList',
    //     component: VisiteurList,
    //     beforeEnter: (to, from, next) => {
    //         if (!localStorage.getItem('token_accueil')) {
    //             next('/');
    //         } else {
    //             next();
    //         }
    //     }
    // },
    // {
    //     path: '/dg/demandes',
    //     name: 'DemandesRecu',
    //     component: DemandeRecu,
    //     beforeEnter: (to, from, next) => {
    //         if (!localStorage.getItem('token_Directeur General') && !localStorage.getItem('idService')) {
    //             next('/');
    //         } else {
    //             next();
    //         }
    //     }
    // }
];

const router = createRouter({
    // eslint-disable-next-line no-undef
    history: createWebHistory(process.env.BASE_URL),
    routes,
});

export default router;
