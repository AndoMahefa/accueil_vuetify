<template>
    <v-container>
        <v-card>
            <v-card-title>Liste des visiteurs</v-card-title>
        
            <v-data-table
                :items="items"
                :headers="headers"
                item-value="id"
                class="elevation-1"
                loading-text="Chargement des données..."
                :hide-default-footer="true"
            >
            <!-- Colonnes personnalisées -->
            <template #item="{ item }">
                <tr>
                    <td> {{ item.nom }} </td>
                    <td> {{ item.prenom }} </td>
                    <td>
                        <div class="d-flex">
                            <v-btn icon @click="showDetails(item)" color="blue" rounded class="ml-10">
                                <v-icon>mdi-eye</v-icon>  <!-- Icône pour afficher les détails -->
                            </v-btn>
                            <v-btn icon @click="editVisitor(item)" color="orange" rounded class="ml-10">
                                <v-icon>mdi-pencil</v-icon>  <!-- Icône pour modifier lutilisateur -->
                            </v-btn>
                            <v-btn icon @click="requestService(item)" color="green" rounded class="ml-10">
                                <v-icon>mdi-email</v-icon>  <!-- Icône pour la demande de service -->
                            </v-btn>
                        </div>
                    </td>
                </tr>
            </template>
            </v-data-table>
    
            <!-- Utilisation du composant Pagination -->
            <Pagination
                :page="pagination.page"
                :totalPages="totalPages"
                @update:page="changePage"
            />
        </v-card>
    </v-container>
</template>
  
  <script>
  import Pagination from '@/components/Pagination.vue';
  import { get } from '@/service/ApiService.js';
  export default {
    components: {
      Pagination
    },
    data() {
      return {
        items: [], // Liste des items
        headers: [
          { title: 'Nom', value: 'nom' },
          { title: 'Prénom', value: 'prenom' }
        ], // Colonnes du tableau
        totalPages: 0, // Nombre total de pages
        loading: false, // Indicateur de chargement
        pagination: {
          page: 1,
        },
      };
    },
    watch: {
      "pagination.page"() {
        this.fetchData();
      },
    },
    mounted() {
      if (this.pagination.page && this.pagination.page > 0) {
          this.fetchData();
      }
    },
    methods: {
      async fetchData() {
        this.loading = true;
        try {
            const data = await get(`accueil/visiteurs?page=${this.pagination.page}`)
            this.items = data.data;
            this.totalPages = data.last_page;
        } catch (error) {
            console.error("Erreur lors de la récupération des données :", error);
        } finally {
            this.loading = false;
        }
      },
      changePage(page) {
        if (page > 0 && page <= this.totalPages) {
          this.pagination.page = page;
        }
      },
    },
  };
  </script>
  
  <style scoped>
    .v-btn--active {
      background-color: #189fdd;
      color: white;
    }
  </style>
  