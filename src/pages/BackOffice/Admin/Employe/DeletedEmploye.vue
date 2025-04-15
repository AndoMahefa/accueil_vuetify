<!-- eslint-disable vue/attribute-hyphenation -->
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
          Liste des employes supprimes
        </span>
      </v-card-title>
      <!-- Tableau stylisé -->
      <v-data-table
        :headers="headers"
        :items="employes"
        item-key="id"
        :loading="loading"
        :hide-default-footer="true"
        :no-data-text="'Aucun employé supprimé'"
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
            <td> {{ FormatDate(item.deleted_at) }} </td>
            <td> {{ item.service.nom }} </td>
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

      <v-row justify="center">
        <v-col cols="8">
          <v-container class="max-width">
            <v-pagination
              v-model="page"
              :length="totalPages"
              class="my-4"
              rounded="circle"
              @update:model-value="fetchAppels"
            />
          </v-container>
        </v-col>
      </v-row>
    </v-card>

    <!-- Modal de confirmation pour restaurer -->
    <v-dialog v-model="restoreConfirmationDialog" width="100%" max-width="500px">
      <v-card>
        <v-card-title>Confirmer la restauration</v-card-title>
        <v-card-text>
          Êtes-vous sûr de vouloir restaurer le employe
          <strong>{{ employe?.nom }}  {{ employe?.prenom }}</strong> ?
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
import { get, post } from '@/service/ApiService';
import FormatDate from '@/service/FormatDate';

export default {
  data() {
    return {
      employes: [],
      loading: false,

      headers: [
        { title: 'Nom', value: 'nom' },
        { title: 'Prenom', value: 'prenom' },
        { title: 'Genre', value: 'genre' },
        { title: 'Adresse', value: 'adresse' },
        { title: 'CIN', value: 'cin' },
        { title: 'telephone', value: 'nom' },
        { title: 'Supprimé le', value: 'deleted_at' },
        { title: 'Service', value: 'service' },
        { title: 'Actions', align: 'center', width: '50px', sortable: 'false' },
      ],
      employe: null,
      restoreConfirmationDialog: false,
      page: null, // Page actuelle
      totalPages: null,
    }
  },
  mounted() {
    this.fetchServicesDeleted();
  },
  methods: {
    async fetchServicesDeleted() {
      this.loading = true;
      let url = 'employes/deleted';
      if(this.page) {
        url += `?page=${this.page}`
      }
      const response = await get(url);

      if(response.ok) {
        const data = await response.json();
        this.employes = data.employes.data;
        this.totalPages = data.last_pages
        this.loading = false;
      }
    },
    goBack() {
      this.$router.push({ path: '/home/liste-employes' }); // Remplacez par le bon chemin
    },
    restoreModal(item) {
      this.employe = item
      this.restoreConfirmationDialog = true
    },
    closeRestoreConfirmation() {
      this.restoreConfirmationDialog = false
    },
    async restoreService() {
      const response = await post(`employes/${this.employe.id}/restore`)
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
  ::v-deep(.v-data-table .v-data-table__th),
  ::v-deep(.v-data-table-header__content) {
    background-color: #000 !important;
    color: white !important;
    font-weight: bold;
  }
</style>
