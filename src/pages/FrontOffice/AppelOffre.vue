<template>
  <v-container>
    <v-card class="mb-4">
      <v-card-title class="title-card">
        Tous les appels d'offres
      </v-card-title>
    </v-card>

    <!-- Liste d'appels d'offres -->
    <v-row class="mt-10">
      <v-col v-for="appel in appels" :key="appel.id" cols="12" md="6" lg="4">
        <v-card class="appel-card" elevation="2">
          <v-card-title class="card-title">
            {{ appel.titre }}
          </v-card-title>
          <v-card-subtitle>
            <strong>Date limite :</strong> {{ formatDate(appel.date_limite) }}
          </v-card-subtitle>
          <v-card-text>
            {{ appel.description }}
          </v-card-text>
          <v-card-actions>
            <v-btn text color="primary">Voir plus</v-btn>
            <v-spacer></v-spacer>
            <v-btn outlined color="success">
              Budget : {{ formatBudget(appel.budget_estime) }}
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-col>
    </v-row>

    <v-row justify="center">
      <v-col cols="8">
        <v-container class="max-width">
          <v-pagination
            v-model="page"
            :length="totalPages"
            class="my-4"
            rounded="circle"
            @update:model-value="fetchAppels"
          ></v-pagination>
        </v-container>
      </v-col>
    </v-row>

    <!-- Spinner de chargement -->
    <v-row v-if="loading" justify="center">
      <v-progress-circular indeterminate color="primary"></v-progress-circular>
    </v-row>
  </v-container>
</template>

<script>
export default {
  data() {
    return {
      appels: [], // Liste des appels d'offres
      loading: false, // État de chargement
      page: null, // Page actuelle
      totalPages: null
    };
  },
  methods: {
    // Charger les données depuis l'API
    async fetchAppels() {
      this.loading = true;
      try {
        let url = "http://localhost:8000/api/appel-offre";
        if(this.page) {
          url += `?page=${this.page}`;
        }
        const response = await fetch(url, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        });

        if (response.ok) {
          const data = await response.json();
          this.appels = data.data;
          this.page = data.current_page;
          this.totalPages = data.last_page;
        } else {
          console.error("Erreur lors de la récupération des appels d'offres");
        }
      } catch (error) {
        console.error("Erreur réseau :", error);
      } finally {
        this.loading = false;
      }
    },
    // Formater une date
    formatDate(date) {
      const options = { year: "numeric", month: "long", day: "numeric" };
      return new Date(date).toLocaleDateString("fr-FR", options);
    },
    formatBudget(amount) {
        // Ajoute des séparateurs pour les milliers et 'Ar' à la fin
        return new Intl.NumberFormat('fr-MG', {
        style: 'currency',
        currency: 'MGA',
        minimumFractionDigits: 0
        }).format(amount).replace('MGA', 'Ar');
    }
  },
  mounted() {
    this.fetchAppels();
  },
};
</script>

<style scoped>
.title-card {
  font-size: 1.8rem;
  font-weight: bold;
  text-align: center;
  text-transform: uppercase;
  margin-bottom: 1rem;
}

.appel-card {
    margin-bottom: 20px;
    min-height: 200px; /* Hauteur minimale */
    max-height: 200px; /* Hauteur maximale pour uniformité */
    display: flex;
    flex-direction: column;
    justify-content: space-between;
}

.appel-card .v-card-text {
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 3; /* Nombre maximum de lignes */
  -webkit-box-orient: vertical;
}

.card-title {
  font-size: 1.2rem;
  font-weight: bold;
  color: #3f51b5;
}
</style>
