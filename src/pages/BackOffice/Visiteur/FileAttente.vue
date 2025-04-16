<template>
  <v-container>
    <!-- Filtre par service (sélection immédiate) -->
    <v-card>
      <v-card-title class="headline text-center white--text py-4">
        📅 File d'attente du {{dateDuJour}}
      </v-card-title>

      <div class="d-flex justify-center align-center my-4 px-4">
        <v-select
          v-model="selectedDirection"
          :items="directions"
          item-title="nom"
          item-value="id"
          label="Sélectionnez une direction"
          clearable
          class="mx-2"
          outlined
          dense
          prepend-inner-icon="mdi-office-building"
          @update:model-value="onFilterDirectionChange"
        />
        <v-select
          v-model="selectedService"
          :items="filteredServices"
          item-title="nom"
          item-value="id"
          label="Sélectionnez un service"
          clearable
          outlined
          dense
          prepend-inner-icon="mdi-domain"
          :disabled="!selectedDirection"
          class="mx-2"
        />
        <v-btn
          color="primary"
          class="filter-btn"
          elevation="2"
          rounded
          @click="applyFilters"
        >
          <v-icon left>mdi-filter</v-icon>
          Filtrer
        </v-btn>
      </div>

      <!-- Tableau des tickets -->
      <v-data-table
        :headers="headers"
        :items="tickets"
        item-key="id"
        :no-data-text="'Aucune donnée'"
        :loading-text="'Chargement des données...'"
        :hide-default-footer="true"
      >
        <template #item="{ item, index }">
          <tr>
            <td v-if="selectedDirection || selectedService"> {{ index + 1 }} </td>
            <td v-else>  </td>
            <td> {{ item.visiteur.nom }} {{ item.visiteur.prenom }} </td>
            <td> {{ item.direction.nom }} </td>
            <td v-if="item.service"> {{ item.service.nom }} </td>
            <td v-else> Pas de service </td>
            <td> {{ item.heure_prevu }} </td>
            <td> {{ item.heure_validation }} </td>
            <td> {{ item.temps_estime }} </td>
          </tr>
        </template>
      </v-data-table>
    </v-card>
  </v-container>
</template>

<script>
import { get } from '@/service/ApiService';
import FormatDate from '@/service/FormatDate';

export default {
  data() {
    return {
      tickets: [],  // Liste des tickets
      loading: false,
      headers: [
        { title: 'Rang', width: '10px' },
        { title: 'Visiteur', value: 'visiteur' },
        { title: 'Direction', value: 'direction' },
        { title: 'Service', value: 'service' },
        { title: 'Heure Prevu', value: 'heure_prevu' },
        { title: 'Heure Validation', value: 'heure_validation' },
        { title: 'Temps Estimé', value: 'temps_estime' }
      ],
      dateDuJour: 'jour',
      directions: [],
      selectedDirection: null,
      services: [],
      filteredServices: [],
      selectedService: null
    };
  },
  mounted() {
    this.fetchDirections();
    this.fetchTickets();
    this.fetchServices();
  },
  methods: {
    async fetchDirections() {
      const response = await get('directions');
      if(response.ok) {
        const data = await response.json();
        this.directions = data.directions;
      }
    },
    async fetchServices() {
      const response = await get('services');

      if(response.ok) {
        const data = await response.json();
        this.services = data.services;
      }
    },
    onFilterDirectionChange() {
      this.selectedService = null; // Réinitialiser le service sélectionné
      if (this.selectedDirection) {
        // Filtrer les services pour la direction sélectionnée
        this.filteredServices = this.services.filter(
          service => service.id_direction === this.selectedDirection
        );
      } else {
        this.filteredServices = []; // Réinitialiser si aucune direction n'est sélectionnée
      }
    },
    async applyFilters() {
      await this.fetchTickets();
    },
    // Fonction pour récupérer les tickets filtrés par service
    async fetchTickets() {
      this.loading = true;
      try {
          let endpoint = 'tickets'
          if(this.selectedDirection && !this.selectedService) {
            endpoint += `/${this.selectedDirection}`;
          } else if(this.selectedService) {
            endpoint =  `service/${this.selectedService}/tickets`
          }

          console.log(endpoint);
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
  ::v-deep(.v-data-table .v-data-table__th),
  ::v-deep(.v-data-table-header__content) {
    background-color: #000 !important;
    color: white !important;
    font-weight: bold;
  }
</style>
