<template>
  <v-container>
    <v-card>
      <v-card-title v-if="selectedService != null">
        <v-icon
          color="primary"
          class="mr-2"
          @click="goBack"
          style="cursor: pointer"
        >
          mdi-arrow-left
        </v-icon>
        <span v-if="selectedService != null">
          Liste des employés du service : {{ selectedService.nom }}
        </span>
      </v-card-title>

      <!-- Tableau stylisé -->
      <v-data-table
        :headers="headers"
        :items="employes"
        item-key="id"
        :loading="loading"
        :hide-default-footer="true"
        :no-data-text="'Aucune donnée'"
        :loading-text="'Chargement des données...'"
      >
        <template #item="{ item }">
          <tr>
            <td> {{ item.nom }}</td>
            <td> {{ item.prenom }}</td>
            <td> {{ item.genre }}</td>
            <td> {{ item.adresse }}</td>
            <td> {{ item.cin }}</td>
            <td> {{ item.telephone }}</td>
            <td>
              <!-- Icônes pour les actions -->
              <v-icon
                color="primary"
                class="mx-2"
                @click="editModal(item)"
              >
                mdi-pencil
              </v-icon>
              <v-icon
                color="red"
                class="mx-2"
                @click="deleteModal(item)"
              >
                mdi-delete
              </v-icon>
              <v-icon
                color="success"
                class="mx-2"
                @click="assignRoleModal(item)"
              >
                mdi-account-key
              </v-icon>
              <v-icon
                color="blue"
                class="mx-2"
                @click="viewEmployees(item)"
              >
                mdi-account-group
              </v-icon>
            </td>
          </tr>
        </template>
      </v-data-table>
    </v-card>
  </v-container>
</template>

<script>
import { get } from '@/service/ApiService';

export default {
  data() {
    return {
      employes: [],
      loading: false,
      selectedService: null,
      headers: [
        { title: 'Nom', value: 'nom' },
        { title: 'Prenom', value: 'prenom' },
        { title: 'Genre', value: 'genre' },
        { title: 'Adresse', value: 'adresse' },
        { title: 'CIN', value: 'cin' },
        { title: 'telephone', value: 'nom' },
        { title: 'Actions', align: 'center', width: '190px', sortable: 'false' },
      ]
    }
  },
  async mounted() {
    const service = this.$route.query.service;
    if(service) {
      this.selectedService = JSON.parse(service)
      console.log(this.selectedService.id)
    }

    this.fetchEmployes();
  },
  methods: {
    async fetchEmployes() {
      this.loading = true;
      const response = await get(`service/${this.selectedService.id}/employes`);

      if(response.ok) {
        const data = await response.json();
        this.employes = data.employes;
        this.loading = false;
      }
    },
    goBack() {
      this.$router.push({ path: '/home/liste-services' }); // Remplacez par le bon chemin
    },
  }
}
</script>

<style scoped>
</style>
