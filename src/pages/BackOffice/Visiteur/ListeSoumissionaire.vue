<template>
  <v-container fluid>
    <v-card class="main-card">
      <v-card-title class="headline text-center white--text py-4">
        <v-icon large color="blue" class="mr-2">mdi-account-tie</v-icon>
        Liste des soumissionaires
      </v-card-title>
      <v-row justify="end">
        <v-col cols="12" md="4">
          <v-select
            v-model="selectedAppel"
            prepend-inner-icon="mdi-checkbox-marked-circle-outline"
            :items="appelsPub"
            label="Choisir un appel d'offre"
            item-title="appel_offre"
            item-value="id"
            clearable
            @update:model-value="fetchAppels"
          />
        </v-col>
      </v-row>
      <br>
      <v-data-table
        :headers="headers"
        :items="appels"
        item-value="id"
        class="elevation-1"
        outlined
        :hide-default-footer="true"
        :no-data-text="'Aucune donnée'"
        :loading-text="'Chargement des données...'"
      >
        <template v-slot:item.actions="{ item }">
          <v-icon
            color="#6EC1B4"
            class="icon-spacing"
            @click="viewDetails(item)"
          >
            mdi-eye
          </v-icon>
          <v-icon
            class="icon-spacing"
            color="blue"
            @click="editAppelOffre(item)"
          >
            mdi-pencil
          </v-icon>
          <v-icon
            class="icon-spacing"
            color="red"
            @click="confirmDelete(item)"
          >
            mdi-delete
          </v-icon>
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
  </v-container>
</template>

<script>
import { get } from "@/service/ApiService";

export default {
  data() {
    return {
      appels: [],
      selectedAppel: null,
      appelsPub: [],
      headers: [
        { title: "Soumissionaire", value: "soumissionaire" },
        { title: "Entreprise", value: "entreprise" },
        { title: "Contact", value: "contact" },
        { title: "Appel d'offre", value: "appel_offre" },
        { title: "Actions", align:'center', value: "actions", sortable: false },
      ],
      page: null,
      totalPages: null
    };
  },
  mounted() {
    this.fetchAppelOffresPublies();
  },
  methods: {
    async fetchAppels() {
      let url = "prmp/soumissionaires"
      if(this.selectedAppel) {
        url += `?id_appel_offre=${this.selectedAppel}`
      }
      if(this.page) {
        url += `&page=${this.page}`
      }
      const response = await get(url);
      if (response.ok) {
        const data = await response.json();
        this.totalPages = data.last_page;
        this.page = data.current_page;
        this.appels = data.soumissionaires.data.map((soumissionaire) => ({
          soumissionaire: `${soumissionaire.nom} ${soumissionaire.prenom}`,
          entreprise: soumissionaire.entreprise,
          contact: soumissionaire.contact,
          appel_offre:
            soumissionaire.remise_offres.length > 0
              ? soumissionaire.remise_offres
                  .map((remise) => remise.appel_offre.appel_offre)
                  .join(", ")
              : "Aucun appel d'offre",
        }));
      }
    },
    async fetchAppelOffresPublies() {
      const response = await get('prmp/offre/publies');
      if(response.ok) {
        const data = await response.json();
        console.log(data);
        this.appelsPub = data.data;
      } else {
        this.showError('Erreur lors de la recupération des appels d\'offre');
      }
    },
    viewDetails(item) {
      console.log("Voir les détails :", item);
    },
    editAppelOffre(item) {
      console.log("Éditer l'appel d'offre :", item);
    },
    confirmDelete(item) {
      console.log("Confirmer la suppression :", item);
    },
  },
  created() {
    this.fetchAppels();
  },
};
</script>

<style scoped>
  ::v-deep(.v-data-table .v-data-table__th),
  ::v-deep(.v-data-table-header__content) {
    background-color: #000 !important;
    color: white !important;
    font-weight: bold;
  }
</style>
