<template>
  <v-container>
    <v-card>
      <v-card-title>Liste des employes</v-card-title>

      <v-select
        v-model="selectedService"
        :items="services"
        item-title="nom"
        item-value="id"
        label="Selectionnez un service"
        @update:model-value="fetchEmployes"
      />
      <!-- Tableau stylisé -->
      <v-data-table
        :headers="headers"
        :items="employes"
        item-key="id"
        :loading="loading"
        :hide-default-footer="true"
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
      services: [],
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
    await this.fetchServices();

    if (this.services.length > 0) {
      this.selectedService = this.services[0].id; // Utilise le premier service comme valeur par défaut
      this.fetchEmployes(); // Charger les employés pour le service par défaut
    }
  },
  methods: {
    async fetchEmployes() {
      this.loading = true;
      const response = await get(`service/${this.selectedService}/employes`);

      if(response.ok) {
        const data = await response.json();
        this.employes = data.employes;
        this.loading = false;
      }
    },
    async fetchServices() {
      const response = await get('services');

      if(response.ok) {
        const data = await response.json();
        this.services = data.services;
      }
    }
  }
}
</script>

<style scoped>
</style>
