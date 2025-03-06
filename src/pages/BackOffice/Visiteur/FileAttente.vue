<template>
  <v-container>
    <!-- Filtre par service (sélection immédiate) -->
    <v-card>
      <v-card-title>File d'attente du {{dateDuJour}}</v-card-title>
      <v-row>
        <v-col cols="12" md="4">
          <v-select
            v-model="selectedDirection"
            :items="directions"
            label="Sélectionner une direction"
            item-title="nom"
            item-value="id"
            clearable
            :no-data-text="'Aucune donnée'"
            :loading-text="'Chargement des données...'"
            @update:model-value="fetchTickets"
          />
        </v-col>
      </v-row>

      <!-- Tableau des tickets -->
      <v-data-table
        :headers="headers"
        :items="tickets"
        item-key="id"
        :loading="loading"
        :hide-default-footer="true"
      >
        <template #item="{ item, index }">
          <tr>
            <td> {{ index + 1 }} </td>
            <td> {{ item.visiteur.nom }} </td>
            <td> {{ item.visiteur.prenom }} </td>
            <td> {{ item.heure_prevu }} </td>
            <td> {{ item.heure_validation }} </td>
            <td> {{ item.temps_estime }} </td>
            <td> {{ item.date }} </td>
          </tr>
        </template>
      </v-data-table>
    </v-card>
  </v-container>
</template>

<script>
import { get, post } from '@/service/ApiService';
import FormatDate from '@/service/FormatDate';

export default {
  data() {
    return {
      tickets: [],  // Liste des tickets
      loading: false,
      headers: [
        { title: 'Rang' },
        { title: 'Nom', value: 'visiteur.nom' },
        { title: 'Prenom', value: 'visiteur.prenom' },
        { title: 'Heure Prevu', value: 'heure_prevu' },
        { title: 'Heure Validation', value: 'heure_validation' },
        { title: 'Temps Estimé', value: 'temps_estime' },
        { title: 'Date', value: 'date' }
      ],
      dateDuJour: 'jour',
      directions: [],
      selectedDirection: null
    };
  },
  mounted() {
    this.fetchDirections();
    this.fetchTickets();
  },
  methods: {
    async fetchDirections() {
      const response = await get('directions');
      if(response.ok) {
        const data = await response.json();
        this.directions = data.directions;
      }
    },
    // Fonction pour récupérer les tickets filtrés par service
    async fetchTickets() {
      this.loading = true;
      try {
          let endpoint = 'tickets'
          if(this.selectedDirection) {
            endpoint += `/${this.selectedDirection}`;
          }
          const response = await get(endpoint)

          if (response.ok) {
              const data = await response.json();
              // console.log(data.length)
              if(data.length == 0) {
                  this.tickets = data;
                  this.dateDuJour = "jour"
              } else {
                  this.dateDuJour = FormatDate(data[0].date)
                  this.tickets = data; // Mettre à jour la liste des tickets
              }
          }
      } catch (error) {
          console.error('Erreur lors de la récupération des tickets:', error);
      } finally {
          this.loading = false;
      }
    },
  }
};
</script>

<style scoped>
/* Ajoutez votre style personnalisé ici */
</style>
