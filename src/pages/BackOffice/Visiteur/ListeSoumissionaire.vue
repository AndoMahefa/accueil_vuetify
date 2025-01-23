<template>
  <v-container>
    <h1>Liste des soumissionaires</h1>
    <br />
    <v-row>
      <v-col cols="12" md="4">
        <v-select
          v-model="selectedAppel"
          :items="appelsPub"
          label="Choisir un appel d'offre"
          item-title="appel_offre"
          item-value="id"
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
      const response = await get(url);
      if (response.ok) {
        const data = await response.json();
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
