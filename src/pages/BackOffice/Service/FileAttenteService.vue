<template>
  <v-container>
    <!-- Titre stylisé -->
    <v-card class="mb-4">
      <v-card-title class="title-card">
        📅 File d'attente du <span class="highlight-date">{{ dateDuJour }}</span>
      </v-card-title>
    </v-card>

    <!-- Tableau stylisé -->
    <v-card>
      <v-data-table
        :headers="headers"
        :items="tickets"
        item-key="id"
        :loading="loading"
        :hide-default-footer="true"
        :no-data-text="'Aucune donnée'"
        :loading-text="'Chargement des données...'"
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
import { get } from '@/service/ApiService';
import FormatDate from '@/service/FormatDate';

export default {
  data() {
    return {
      tickets: [], // Liste des tickets
      loading: false,
      headers: [
        { title: 'Rang', align: 'start', value: 'rang' },
        { title: 'Nom', value: 'visiteur.nom' },
        { title: 'Prénom', value: 'visiteur.prenom' },
        { title: 'Heure Prévue', value: 'heure_prevu' },
        { title: 'Heure Validation', value: 'heure_validation' },
        { title: 'Temps Estimé', value: 'temps_estime' }
      ],
      dateDuJour: null,
    };
  },
  mounted() {
    this.fetchTickets();
  },
  methods: {
    async fetchTickets() {
      this.loading = true;
      const direction = JSON.parse(localStorage.getItem('direction'));
      const idDirection = direction.id;
      const idService = localStorage.getItem('idService');
      let url;

      try {
        if(idService) {
          url = `service/${idService}/tickets`;
        } else {
          url = `tickets/${idDirection}`
        }

        const response = await get(url);

        if (response.ok) {
          const data = await response.json();
          this.dateDuJour = FormatDate(data[0].date); // Utiliser une méthode pour formater la date
          this.tickets = data; // Mettre à jour la liste des tickets
        }
      } catch (error) {
        console.error('Erreur lors de la récupération des tickets:', error);
      } finally {
        this.loading = false;
      }
    }
  },
};
</script>

<style scoped>
  /* Style pour le titre */
  .title-card {
    font-size: 1.5rem;
    font-weight: bold;
    text-align: center;
    text-transform: uppercase;
    color: #3a31312a; /* Bleu */
    margin-bottom: 0;
  }

  .highlight-date {
      color: #6EC1B4; /* Vert */
  }

  ::v-deep(.v-data-table .v-data-table__th),
  ::v-deep(.v-data-table-header__content) {
    background-color: #000 !important;
    color: white !important;
    font-weight: bold;
  }
</style>
