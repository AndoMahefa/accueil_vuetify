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
          Liste des appels d'offres supprimes
        </span>
      </v-card-title>
      <!-- Tableau stylisé -->
      <v-data-table
        :headers="headers"
        :items="appelsOffres"
        item-key="id"
        :loading="loading"
        :hide-default-footer="true"
      >
        <template #item="{ item }">
          <tr>
            <td> {{ item.nature }}</td>
            <td> {{ item.objet }}</td>
            <td> {{ item.reference }}</td>
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
    </v-card>

    <!-- Modal de confirmation pour restaurer -->
    <v-dialog v-model="restoreConfirmationDialog" width="100%" max-width="500px">
      <v-card>
        <v-card-title>Confirmer la restauration</v-card-title>
        <v-card-text>
          Êtes-vous sûr de vouloir restaurer l'appel d'offre : 
          <strong>{{ appelOffre?.objet }}</strong> ?
        </v-card-text>
        <v-card-actions>
          <v-btn color="red" @click="restoreAppel">Restaurer</v-btn>
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
      appelsOffres: [],
      loading: false,

      headers: [
        { title: 'Nature', align: "start", value: 'nature' },
        { title: 'Objet', align: "start", value: 'objet' },
        { title: 'Reference', align: "start", value: 'reference' },
        { title: 'Supprimé le', value: 'deleted_at' },
        { title: 'Actions', width: '350px', sortable: 'false' },
      ],
      appelOffre: null,
      restoreConfirmationDialog: false,
      // page: null,
      // totalPages: null
    }
  },
  mounted() {
    this.fetchDeletedAppelOffre();
  },
  methods: {
    async fetchDeletedAppelOffre() {
      this.loading = true;
      const response = await get('prmp/appels-offres-deleted');

      if(response.ok) {
        const data = await response.json();
        this.appelsOffres = data;
        console.log(this.appelsOffres)
        this.loading = false;
      }
    },
    goBack() {
      this.$router.push({ path: '/home/liste-appels' }); // Remplacez par le bon chemin
    },
    restoreModal(item) {
      this.appelOffre = item
      this.restoreConfirmationDialog = true
    },
    closeRestoreConfirmation() {
      this.restoreConfirmationDialog = false
    },
    async restoreAppel() {
      const response = await post(`prmp/appel-offre/${this.appelOffre.id}/restore`)
      if(response.ok) {
        this.fetchDeletedAppelOffre()
        this.closeRestoreConfirmation()
      }
    },
    FormatDate
  }
}
</script>

<style scoped>
</style>
