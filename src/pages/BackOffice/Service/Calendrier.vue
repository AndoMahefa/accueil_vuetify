<template>
  <v-container>
    <v-card class="mb-4">
      <v-card-title class="title-card">
        Liste de tous les rendez-vous
      </v-card-title>
      <v-row>
        <v-col cols="12" md="4">
          <v-text-field
            label="Veuillez choisir une date"
            v-model="selectedDate"
            :min="minDate"
            type="date"
            @change="fetchRdv"
          >
          </v-text-field>
        </v-col>
      </v-row>
    </v-card>

    <!-- Tableau stylisé -->
    <v-card>
      <v-data-table
        :headers="headers"
        :items="rdv"
        item-key="id"
        :loading="loading"
        :hide-default-footer="true"
      >
        <template #item="{ item }">
          <tr>
            <td> {{ item.visiteur.nom }} {{ item.visiteur.prenom }}</td>
            <td> {{ item.motif }} </td>
            <td> {{ formatTime(item.date_heure) }} </td>
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
      rdv: [], // Liste des rendez-vous
      minDate: new Date().toISOString().substr(0, 10), // Date minimale (aujourd'hui)
      loading: false,
      headers: [
        {title:'Visiteur', value: 'visiteur'},
        { title: 'Motif', value: 'motif' },
        { title: 'Heure', value: 'date_heure' }
      ],
      selectedDate: null,
    }
  },
  mounted() {
    this.fetchRdv();
  },
  methods: {
    async fetchRdv() {
      this.loading = true;
      try {
        // const token = localStorage.getItem('token');
        const idService = localStorage.getItem('idService');

        // let url = `http://localhost:8000/api/service/${idService}/rendez-vous`;
        let url = `service/${idService}/rendez-vous`;
        if(this.selectedDate) {
          url += `?date=${this.selectedDate}`;
        }

        // const response = await fetch(url, {
        //   method: 'GET',
        //   headers: {
        //     'Content-Type': 'application/json',
        //     'Authorization': `Bearer ${token}`
        //   }
        // });
        const response = await get(url)

        if (response.ok) {
          const data = await response.json();
          this.rdv = data.rdv;
          // console.log(this.rdv);
        } else {
          console.error('Erreur lors de la récupération des rendez-vous');
        }
      } catch (error) {
        console.error(error);
      } finally {
        this.loading = false;
      }
    },
    formatTime(dateTime) {
      // Convertir la chaîne datetime en objet Date
      const date = new Date(dateTime);
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    },
  },
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
