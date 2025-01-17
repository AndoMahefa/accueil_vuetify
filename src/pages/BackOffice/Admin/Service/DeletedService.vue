<template>
  <v-container>
    <v-card>
      <v-card-title>
        <v-icon
          color="primary"
          class="mr-2"
          @click="goBack"
          style="cursor: pointer"
        >
          mdi-arrow-left
        </v-icon>
        <span>
          Liste des services supprimes
        </span>
      </v-card-title>
      <!-- Tableau stylisé -->
      <v-data-table
        :headers="headers"
        :items="services"
        item-key="id"
        :loading="loading"
        :hide-default-footer="true"
      >
        <template #item="{ item }">
          <tr>
            <td> {{ item.nom }}</td>
            <td> {{ FormatDate(item.deleted_at) }} </td>
            <td>
              <!-- Icônes pour les actions -->
              <v-icon
                color="primary"
                class="mx-6"
                @click="restoreModal(item)"
              >
                mdi-restore
              </v-icon>
            </td>
          </tr>
        </template>
      </v-data-table>
      <Pagination
        :currentPage="page"
        :totalPages="totalPages"
        @page-changed="fetchServicesDeleted"
      />
    </v-card>

    <!-- Modal de confirmation pour restaurer -->
    <v-dialog v-model="restoreConfirmationDialog" width="100%" max-width="500px">
      <v-card>
        <v-card-title>Confirmer la restauration</v-card-title>
        <v-card-text>
          Êtes-vous sûr de vouloir restaurer le service
          <strong>{{ service?.nom }}</strong> ?
        </v-card-text>
        <v-card-actions>
          <v-btn color="red" @click="restoreService">Restaurer</v-btn>
          <v-btn color="secondary" @click="closeRestoreConfirmation">Annuler</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script>
import Pagination from '@/components/Pagination.vue';
import { get, post } from '@/service/ApiService';
import FormatDate from '@/service/FormatDate';

export default {
  components: {
    Pagination
  },
  data() {
    return {
      services: [],
      loading: false,

      headers: [
        { title: 'Nom', align: "start", value: 'nom' },
        { title: 'Supprimé le', value: 'deleted_at' },
        { title: 'Actions', width: '350px', sortable: 'false' },
      ],
      service: null,
      restoreConfirmationDialog: false,
      page: null,
      totalPages: null
    }
  },
  mounted() {
    this.fetchServicesDeleted();
  },
  methods: {
    async fetchServicesDeleted() {
      this.loading = true;
      const response = await get('services/deleted');

      if(response.ok) {
        const data = await response.json();
        this.services = data.services;
        this.totalPages = data.last_page;
        this.loading = false;
      }
    },
    goBack() {
      this.$router.push({ path: '/home/liste-services' }); // Remplacez par le bon chemin
    },
    restoreModal(item) {
      this.service = item
      this.restoreConfirmationDialog = true
    },
    closeRestoreConfirmation() {
      this.restoreConfirmationDialog = false
    },
    async restoreService() {
      const response = await post(`services/${this.service.id}/restore`)
      if(response.ok) {
        this.fetchServicesDeleted()
        this.closeRestoreConfirmation()
      }
    },
    FormatDate
  }
}
</script>

<style scoped>
</style>
