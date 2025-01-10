<template>
  <v-container>
    <v-card class="mb-4">
      <v-card-title class="title-card">
        Liste de tous les appels d'offres
      </v-card-title>
      <v-row>
        <v-col cols="12" md="4">
          <v-select
            :items="status"
            label="Status"
            v-model="selectedStatus"
            item-value="id"
            item-title="nom"
            @update:model-value="fetchAppel"
          >
          </v-select>
        </v-col>
      </v-row>
    </v-card>

    <!-- Tableau stylisé -->
    <v-card>
      <v-data-table
        :headers="headers"
        :items="appels"
        item-key="id"
        :loading="loading"
        :hide-default-footer="true"
      >
        <template #item="{ item }">
          <tr>
            <td> {{ item.titre }}</td>
            <td> {{ item.description }} </td>
            <td> {{ item.date_limite }} </td>
            <td> {{ item.budget_estime }} </td>
          </tr>
        </template>
      </v-data-table>
    </v-card>
  </v-container>
</template>

<script>
export default {
  data() {
    return {
      appels: [], // Liste des rendez-vous
      minDate: new Date().toISOString().substr(0, 10), // Date minimale (aujourd'hui)
      loading: false,
      headers: [
        { title: 'Titre', value: 'titre' },
        { title: 'Description', value: 'description' },
        { title: 'Date limite', value: 'date_limite' },
        { title: 'Budget estimé', value: 'budget_estime' }
      ],
      status: [
        { id: 0, nom: 'Ouvert' },
        { id: 1, nom: 'Fermé' },
        { id: 2, nom: 'Soumis' }
      ],
      selectedStatus: null,
    }
  },
  methods: {
    async fetchAppel() {
      this.loading = true;
      try {
        const token = localStorage.getItem('token');

        console.log("status selected: ", this.selectedStatus)
        let url = `http://localhost:8000/api/prmp/appel-offre`;
        if(this.selectedStatus) {
          url += `?status=${this.selectedStatus}`;
        }

        const response = await fetch(url, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        });

        if (response.ok) {
          const data = await response.json();
          this.appels = data.data;
          console.log(this.appels);
        } else {
          console.error('Erreur lors de la récupération des rendez-vous');
        }
      } catch (error) {
        console.error(error);
      } finally {
        this.loading = false;
      }
    }
  },
  mounted() {
    this.fetchAppel();
  }
}
</script>

<style scoped>
  .title-card {
    font-size: 1.5rem;
    font-weight: bold;
    text-align: center;
    text-transform: uppercase;
    margin-bottom: 0;
  }
</style>
