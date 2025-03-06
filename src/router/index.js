import { createRouter, createWebHistory } from 'vue-router';
import AppLayout from '@/components/AppLayout.vue';
import LoginForm from '@/pages/BackOffice/Authentification/LoginForm.vue';
import EnregistrerVisiteur from '@/pages/BackOffice/Visiteur/EnregistrerVisiteur.vue';
import ListeVisiteur from '@/pages/BackOffice/Visiteur/ListeVisiteur.vue';
import FileAttente from '@/pages/BackOffice/Visiteur/FileAttente.vue';
import ListeDemandeRecu from '@/pages/BackOffice/Service/ListeDemandeRecu.vue';
import FileAttenteService from '@/pages/BackOffice/Service/FileAttenteService.vue';
import JourCreneaux from '@/pages/BackOffice/Service/JourCreneaux.vue';
import AppelOffrePrmp from '@/pages/BackOffice/PRMP/AppelOffrePrmp.vue';
import ListeAppelOffre from '@/pages/BackOffice/PRMP/ListeAppelOffre.vue';
import AjouterAppel from '@/pages/BackOffice/PRMP/AjouterAppel.vue'

import NavBarFrontOffice from '@/components/FrontOffice/NavBarFrontOffice.vue';
import RendezVous from '@/pages/FrontOffice/RendezVous.vue';
import AppOffre from '@/pages/FrontOffice/AppelOffre.vue'
import ListeAppelOffrePerso from '@/pages/BackOffice/PRMP/ListeAppelOffrePerso.vue';
import ReferencePpm from '@/pages/BackOffice/PRMP/ReferencePpm.vue';
import AjouterService from '@/pages/BackOffice/Admin/Service/AjouterService.vue';
import AjouterEmploye from '@/pages/BackOffice/Admin/Employe/AjouterEmploye.vue';
import ListeService from '@/pages/BackOffice/Admin/Service/ListeService.vue';
import ListeEmploye from '@/pages/BackOffice/Admin/Employe/ListeEmploye.vue';
import ListeEmployeParService from '@/pages/BackOffice/Admin/Employe/ListeEmployeParService.vue';
import DeletedService from '@/pages/BackOffice/Admin/Service/DeletedService.vue';
import DeletedEmploye from '@/pages/BackOffice/Admin/Employe/DeletedEmploye.vue';
import RoleEmploye from '@/pages/BackOffice/Admin/Employe/RoleEmploye.vue';
import ListeDemandeRecuService from '@/pages/BackOffice/Admin/Service/ListeDemandeRecuService.vue';
import JourCreneauxService from '@/pages/BackOffice/Admin/Service/JourCreneauxService.vue';
import Inscription from '@/pages/BackOffice/Admin/Inscription/Inscription.vue';
import DeletedAppelOffre from '@/pages/BackOffice/Admin/AO/DeletedAppelOffre.vue';
import RemiseOffre from '@/pages/BackOffice/Visiteur/RemiseOffre.vue';
import ListeSoumissionaire from '@/pages/BackOffice/Visiteur/ListeSoumissionaire.vue';
import Organigramme from '@/pages/BackOffice/Admin/Organigramme/Organigramme.vue';
import Pointage from '@/pages/BackOffice/Admin/Employe/Pointage.vue';
import ListePointage from '@/pages/BackOffice/Admin/Employe/ListePointage.vue';
import Calendrier from '@/pages/BackOffice/Service/Calendrier.vue';
import CalendrierService from '@/pages/BackOffice/Service/CalendrierService.vue';


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
        path: 'organigramme',
        name: 'Organigramme',
        component: Organigramme
      },
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
        path: 'demande-recu-service',
        name: 'DemandeRecuService',
        component: ListeDemandeRecuService
      },

      {
        path: 'file-attente-service',
        name: 'FileAttenteService',
        component: FileAttenteService
      },
      {
        path: 'jour-creneaux',
        name: 'JourCreneaux',
        component: JourCreneaux
      },
      {
        path: 'jour-creneaux-service',
        name: 'JourCreneauxService',
        component: JourCreneauxService
      },
      {
        path: 'rendez-vous',
        name: 'Calendrier',
        component: Calendrier
      },
      {
        path: 'rendez-vous-service',
        name: 'CalendrierService',
        component: CalendrierService
      },
      {
        path: 'appel-offre',
        name: 'AppelOffrePrmp',
        component: AppelOffrePrmp
      },
      {
        path: 'liste-appel-offre',
        name: 'ListeAppelOffre',
        component: ListeAppelOffre
      },
      {
        path: 'ajouter-appel',
        name: 'AjouterAppel',
        component: AjouterAppel
      },
      {
        path: 'liste-appels',
        name: 'ListeAppelOffrePerso',
        component: ListeAppelOffrePerso
      },
      {
        path: 'save-reference',
        name: 'ReferencePpm',
        component: ReferencePpm
      },
      //admin only
      {
        path: 'ajouter-service',
        name: 'AjouterService',
        component: AjouterService
      },
      {
        path: 'liste-services',
        name: 'ListeService',
        component: ListeService
      },
      {
        path: 'ajouter-employe',
        name: 'AjouterEmploye',
        component: AjouterEmploye
      },
      {
        path: 'liste-employes',
        name: 'ListeEmploye',
        component: ListeEmploye
      },
      {
        path: 'liste-employes-service',
        name: 'ListeEmployeParService',
        component: ListeEmployeParService
      },
      {
        path: 'deleted-services',
        name: 'DeletedService',
        component: DeletedService
      },
      {
        path: 'deleted-employes',
        name: 'DeletedEmploye',
        component: DeletedEmploye
      },
      {
        path: 'role-employe',
        name: 'RoleEmploye',
        component: RoleEmploye
      },
      {
        path: 'deleted-appel-offre',
        name: 'DeletedAppelOffre',
        component: DeletedAppelOffre
      },
      {
        path: 'remise-offre',
        name: 'RemiseOffre',
        component: RemiseOffre
      },
      {
        path: 'liste-soumissionaire',
        name: 'ListeSoumissionaire',
        component: ListeSoumissionaire
      },
      {
        path: 'pointage',
        name: 'Pointage',
        component: Pointage
      },
      {
        path: 'liste-pointages',
        name: 'ListePointage',
        component: ListePointage
      }
    ]
  },

  {
    path: '/client',
    name: 'Client',
    component: NavBarFrontOffice,
    children: [
      {
        path: 'rendez-vous',
        name: 'RendezVous',
        component: RendezVous
      },
      {
        path: 'liste-appel-offre',
        name: 'AppelOffre',
        component: AppOffre
      }
    ]
  },

  {
    path: '/admin/inscription',
    name: 'Inscription',
    component: Inscription
  }
];

const router = createRouter({
    // eslint-disable-next-line no-undef
    history: createWebHistory(process.env.BASE_URL),
    routes,
});

export default router;
