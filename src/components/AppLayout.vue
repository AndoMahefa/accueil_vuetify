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
      userName: 'Rakshith Bellare',
      idService : null,
      itemsAccueil: [
        { title: "Tableau de bord", icon: "mdi-view-dashboard", to: "#" },
        { title: "Enregistrer un visiteur", icon: "mdi-account-plus", to: "/home/enregistrer-visiteur" },
        { title: "Liste des visiteurs", icon: "mdi-format-list-bulleted", to: "/home/liste-visiteurs" },
        { title: "File d'attente", icon: "mdi-clock-outline", to: "/home/file-attente"}
      ],
      autreService: [
        { title: "Tableau de bord", icon: "mdi-view-dashboard", to: "#" },
        { title: "Demande Recu", icon: "mdi-inbox", to: "/home/demande-recu" },
        { title: "File d'attente", icon: "mdi-clock-outline", to: "/home/file-attente-service"},
        { title: "Disponibilités", icon: "mdi-calendar-clock", to: "/home/jour-creneaux" }
      ]
    };
  },
  computed: {
    // Renvoie les items du SideBar selon le service actuel
    sidebarItems() {
      console.log(this.idService)
      if (this.idService === "2") {
        return this.itemsAccueil;
      } else {
        return this.autreService;
      }
    }
  },
  mounted() {
    this.idService = localStorage.getItem("idService");
  },
  methods: {
    toggleSidebar() {
      this.drawer = !this.drawer;
    }
  }
};
</script>
