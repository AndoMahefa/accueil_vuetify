<template>
  <v-app-bar app color="primary" dark>
    <!-- Logo et Titre -->
    <div class="toolbar-title">
      <img :src="logoFull" alt="Logo" class="logo" />
      <span class="title">APIPA</span>
    </div>

    <!-- Menus -->
    <v-spacer></v-spacer>
    <div class="menu-container">
      <v-btn text v-for="menu in menus" :key="menu.text" @click="navigateTo(menu.route)" class="menu-btn">
        {{ menu.text }}
      </v-btn>
    </div>

    <!-- Actions -->
    <v-btn icon>
      <v-icon>mdi-account-circle</v-icon>
    </v-btn>
  </v-app-bar>
</template>

<script>
export default {
  data() {
    return {
      logoFull: new URL('@/assets/images/LogoApipa.png', import.meta.url).href,
      menus: [
        { text: "Accueil", route: "/" },
        { text: "Appel d'offre", route: "/appel-offre" },
        { text: "Rendez-vous", route: "/rendez-vous"},
        { text: "Contact", route: "/contact" },
      ],
    };
  },
  methods: {
    navigateTo(route) {
      this.$router.push(route);
    },
  },
};
</script>

<style scoped>
    .toolbar-title {
        display: flex;
        align-items: center;
        margin-left: 15px; /* Espace entre le logo et le titre */
    }
    /* Style du logo */
    .logo {
        height: 40px;
        filter: brightness(0) invert(1); /* Rend le logo blanc */
        margin-right: 15px; /* Espace entre le logo et le texte */
    }

    /* Style du titre */
    .title {
        font-size: 24px;
        font-weight: bold;
        color: white;
        font-family: 'Roboto', sans-serif; /* Ajoute une police élégante */
        text-transform: uppercase;
        letter-spacing: 1.2px; /* Espacement des lettres pour plus de style */
    }

    /* Conteneur des menus */
    .menu-container {
        display: flex;
        justify-content: space-evenly; /* Espacement égal entre les menus */
        align-items: center;
        width: 50%; /* Ajuste l'espace pour centrer les menus */
    }

    /* Style des boutons de menu */
    .menu-btn {
        font-weight: bold;
        font-size: 16px;
        text-transform: capitalize; /* Premier caractère en majuscule */
        font-family: 'Roboto', sans-serif;
        color: white;
        padding: 0 10px;
        transition: all 0.3s ease-in-out; /* Effet de transition sur hover */
    }

    .menu-btn:hover {
        color: #ffcc00; /* Couleur sur hover */
    }

    /* Style de la barre d'actions */
    .v-btn.icon {
        color: white;
    }
</style>
