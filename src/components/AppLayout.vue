<template>
  <v-app class="content">
    <SideBar
      :drawer="drawer"
      :toggle-mini="toggleMini"
      :items="sidebarItems"
      :user-name="userName"
      @toggle-sidebar="toggleSidebar"
    />
    <NavBar @toggle-sidebar="toggleSidebar" />

    <v-main>
      <v-container
        fluid
        class="pa-4"
      >
        <router-view />
      </v-container>
    </v-main>
  </v-app>
</template>

<script>
import SideBar from './SideBar.vue';
import NavBar from './NavBar.vue';

export default {
  components: {
    SideBar,
    NavBar
  },
  data() {
    return {
      drawer: false,
      toggleMini: false,
      serviceName: null,
      userName: 'Rakshith Bellare',
      idService : null,
      role: null,
      itemsAccueil: [
        { title: "Tableau de bord", icon: "mdi-view-dashboard", to: "#" },
        { title: "Enregistrer un visiteur", icon: "mdi-account-plus", to: "/home/enregistrer-visiteur" },
        { title: "Liste des visiteurs", icon: "mdi-format-list-bulleted", to: "/home/liste-visiteurs" },
        { title: "File d'attente", icon: "mdi-clock-outline", to: "/home/file-attente"},
        { title: "Remise d'offre", icon: "mdi-file-document", to: "/home/remise-offre" }
      ],
      autreService: [
        { title: "Tableau de bord", icon: "mdi-view-dashboard", to: "#" },
        { title: "Demande Recu", icon: "mdi-inbox", to: "/home/demande-recu" },
        { title: "File d'attente", icon: "mdi-clock-outline", to: "/home/file-attente-service"},
        { title: "Disponibilités", icon: "mdi-calendar-clock", to: "/home/jour-creneaux" },
        { title: "Calendrier des rdv", icon: "mdi-calendar", to: "/home/rendez-vous" }
      ],
      prmp: [
        { title: "Demande Recu", icon: "mdi-inbox", to: "/home/demande-recu" },
        { title: "File d'attente", icon: "mdi-clock-outline", to: "/home/file-attente-service"},
        { title: "Disponibilités", icon: "mdi-calendar-clock", to: "/home/jour-creneaux" },
        { title: "Calendrier des rdv", icon: "mdi-calendar", to: "/home/rendez-vous" },
        // { title: "Ajout d'un appel d'offre", icon: "mdi-plus", to: "/home/appel-offre" },
        // { title: "Liste des appels d'offres", icon: "mdi-format-list-bulleted", to: "/home/liste-appel-offre" },

        // Appel d'offre personalise
        { title: "Ajout d'un appel d'offre", icon: "mdi-plus", to: "/home/save-reference" },
        { title: "Liste des appels d'offres", icon: "mdi-format-list-bulleted", to: "/home/liste-appels" }
      ],
      itemsAdmin: [
        { title: "Tableau de bord", icon: "mdi-view-dashboard", to: "#" },
        // Organigramme
        {
          title: 'Organigramme',
          icon: 'mdi-sitemap',
          to: '/home/organigramme'
        },
        // Services
        {
          title: "Services",
          icon: "mdi-domain",
          items: [
            { title: "Ajouter un service", to: "/home/ajouter-service" },
            { title: "Liste des services", to: "/home/liste-services" }
          ]
        },
        // Employés
        {
          title: "Employés",
          icon: "mdi-account-group",
          items: [
            { title: "Ajouter un employé", to: "/home/ajouter-employe" },
            { title: "Liste des employés", to: "/home/liste-employes" }
          ]
        },
        {
          title: "Visiteurs",
          icon: "mdi-account-group",
          items: [
            { title: "Ajouter un visiteur", to: "/home/enregistrer-visiteur" },
            { title: "Liste des visiteurs", to: "/home/liste-visiteurs" }
          ]
        },
        // PRMP
        {
          title: "Appel d'offre",
          icon: "mdi-file-document",
          items: [
            { title: "Ajout d'un appel d'offre", to: "/home/save-reference" },
            { title: "Liste des appels d'offres", to: "/home/liste-appels" },
            { title: "Remise d'offre", to: "/home/remise-offre" },
            { title: "Liste soumissionaire", to: "/home/liste-soumissionaire" }
          ]
        },

        // Tous les autres services
        { title: "Demande Recu", icon: "mdi-inbox", to: "/home/demande-recu-service" },
        { title: "File d'attente", icon: "mdi-clock-outline", to: "/home/file-attente"},
        { title: "Disponibilités", icon: "mdi-calendar-clock", to: "/home/jour-creneaux-service" },
        { title: "Calendrier des rdv", icon: "mdi-calendar", to: "/home/rendez-vous" },
      ]
    };
  },
  computed: {
    // Renvoie les items du SideBar selon le service actuel
    sidebarItems() {
      console.log(this.idService)
      if(this.role === 'admin') {
        return this.itemsAdmin;
      } else {
        this.fetchServiceName()
        if(this.serviceName === "Accueil") {
          return this.itemsAccueil;
        } else if(this.idService === "PRMP") {
          return this.prmp;
        } else {
          return this.autreService;
        }
      }
    }
  },
  mounted() {
    this.idService = localStorage.getItem("idService");
    this.role = localStorage.getItem("role");
  },
  methods: {
    toggleSidebar() {
      this.drawer = !this.drawer;
    },
    async fetchServiceName() {
      const idService = localStorage.getItem('idService'); // Récupère l'idService
      if (!idService) {
        this.serviceName = 'Service Inconnu';
        return;
      }

      try {
        const token = localStorage.getItem('token');
        const idService = localStorage.getItem('idService');
        const response = await fetch(`http://localhost:8000/api/service/${idService}`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });

        if (response.ok) {
          const data = await response.json();
          this.serviceName = data.nom || 'Service Inconnu'; // Assurez-vous que l'API retourne un champ `name`
        } else {
          this.serviceName = 'Service Inaccessible';
        }
      } catch (error) {
        console.error('Erreur lors de la récupération du nom du service:', error);
        this.serviceName = 'Erreur de Chargement';
      }
    }
  }
};
</script>
