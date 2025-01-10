<!-- eslint-disable vue/attributes-order -->
<!-- eslint-disable vue/max-attributes-per-line -->
<!-- eslint-disable vue/valid-v-slot -->
<!-- eslint-disable vue/v-slot-style -->
<template>
  <v-container>
    <h1>Liste des Appels d'Offres</h1>
    <br>
    <v-row>
      <v-col cols="12" md="4">
        <v-select
          v-model="selectedRef"
          :items="references"
          label="Choisir un reference"
          item-title="reference"
          item-value="reference"
          @update:model-value="fetchAppelsOffres"
        />
      </v-col>
    </v-row>
    <br>
    <!-- Tableau des appels d'offres -->
    <v-data-table
      :headers="headers"
      :items="appelsOffres"
      item-value="id"
      class="elevation-1"
      outlined
      :hide-default-footer="true"
    >
      <template v-slot:item.actions="{ item }">
        <v-btn @click="viewDetails(item)" icon class="icon-spacing" color="#6EC1B4">
          <v-icon>mdi-eye</v-icon>
        </v-btn>
        <v-btn @click="editAppelOffre(item)" icon class="icon-spacing" color="#FF7043">
          <v-icon>mdi-pencil</v-icon>
        </v-btn>
        <v-btn @click="confirmDelete(item)" icon class="icon-spacing" color="#66BB6A">
          <v-icon>mdi-delete</v-icon>
        </v-btn>
      </template>
    </v-data-table>

    <!-- Details appel d'offres -->
    <v-dialog v-model="isDetailsOpen" width="100%" max-width="800px">
      <v-card>
        <!-- Titre du modal -->
        <v-card-title class="blue darken-1 white--text">
          <v-icon class="mr-2">mdi-information-outline</v-icon>
          Détails de l'Appel d'Offre
        </v-card-title>

        <!-- Contenu des détails -->
        <v-card-text>
          <v-row v-for="(value, key) in selectedAppelDetails" :key="key" class="align-center">
            <v-col cols="5" class="font-weight-bold text-uppercase">
              {{ key.replace(/_/g, ' ').toUpperCase() }}
            </v-col>
            <v-col cols="7">
              <span v-if="key === 'Montant estimatif initial' || key === 'Montant estimatif par beneficiaire'">{{ formatBudget(value) }}</span>
              <span v-else-if="key === 'Date previsionneloe de lancement' || key==='Date previsionnelle ouverture des plis' || key==='Date previsionnelle d\'attribution'">{{ formatDate(value) }}</span>
              <span v-else>{{ value || 'Non spécifié' }}</span>
            </v-col>
            <v-col cols="12">
              <v-divider></v-divider>
            </v-col>
          </v-row>
        </v-card-text>

        <!-- Actions -->
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="blue darken-1" text @click="isDetailsOpen = false">
            <v-icon left>mdi-close</v-icon> Fermer
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>


    <!-- Modal de confirmation de suppression -->
    <v-dialog v-model="isDeleteDialogOpen" max-width="400px">
      <v-card>
        <v-card-title class="headline">Confirmer la suppression</v-card-title>
        <v-card-text>
          Êtes-vous sûr de vouloir supprimer cet appel d'offre ?
        </v-card-text>
        <v-card-actions>
          <v-btn text @click="isDeleteDialogOpen = false">Annuler</v-btn>
          <v-btn color="red" text @click="deleteAppelOffreConfirmed">Confirmer</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script>
export default {
  data() {
    return {
      appelsOffres: [], // Liste des appels d'offres
      headers: [
        { title: "Nature", align: 'start', value: 'nature', sortable: true },
        { title: "Objet", align: 'start', width: '700px', value: 'objet', sortable: true },
        { title: 'Actions', value: 'actions', sortable: false },
      ],
      references: [],
      selectedRef: null,

      selectedAppelDetails: {},
      isDetailsOpen: false,

      isDeleteDialogOpen: false,
      appelToDelete: null, // L'appel d'offre à supprimer
    };
  },
  mounted() {
    this.fetchAppelsOffres();
    this.fetchRef();
  },
  methods: {
    // Récupérer tous les appels d'offres depuis l'API
    async fetchAppelsOffres() {
      try {
        const token = localStorage.getItem("token");
        let url = 'http://localhost:8000/api/prmp/appels-offres';
        if(this.selectedRef) {
          url += `?reference=${this.selectedRef}`
        }
        console.log(url)
        const response = await fetch(url, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        });

        if (response.ok) {
          const data = await response.json();
          console.log(data)
          this.appelsOffres = data;
        }
      } catch (error) {
        console.error("Erreur lors de la récupération des appels d'offres :", error);
      }
    },
    async fetchRef() {
      const token = localStorage.getItem("token")
      const response = await fetch('http://localhost:8000/api/prmp/references', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      })


      if(response.ok) {
        const refs = await response.json();
        this.references = refs;
      }
    },
    async viewDetails(item) {
      const token = localStorage.getItem("token");
      try {
        const response = await fetch(`http://localhost:8000/api/prmp/appels-offres/${item.id}`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`,
          },
        });

        if (response.ok) {
          const data = await response.json();
          this.selectedAppelDetails = data.details;
          this.isDetailsOpen = true; // Ouvre le modal
        } else {
          console.error("Erreur lors de la récupération des détails :", response.statusText);
        }
      } catch (error) {
        console.error("Erreur lors de la récupération des détails :", error);
      }
    },
    formatBudget(value) {
      if (!value) return 'Non spécifié';
      return `${new Intl.NumberFormat('fr-FR').format(value)} Ar`;
    },
    formatDate(value) {
      if (!value) return 'Non spécifié';
      const options = { year: 'numeric', month: 'long', day: 'numeric' };
      return new Date(value).toLocaleDateString('fr-FR', options);
    },
    // Fonction pour éditer un appel d'offre
    editAppelOffre(item) {
      this.$router.push({ name: 'appelOffreEdit', params: { id: item.id } });
    },
    confirmDelete(item) {
      this.appelToDelete = item; // Sauvegarder l'appel d'offre à supprimer
      this.isDeleteDialogOpen = true; // Ouvrir la modal de confirmation
    },
    // Fonction pour supprimer un appel d'offre
    async deleteAppelOffre(item) {
      try {
        const token = localStorage.getItem("token")
        const response = await fetch(`http://localhost:8000/api/prmp/appel-offre/${item.id}/delete`, {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        });

        if (response.ok) {
          this.fetchAppelsOffres(); // Recharger la liste après suppression
          this.isDeleteDialogOpen = false
          alert('Appel d\'offre supprimé avec succès');
        } else {
          alert('Erreur lors de la suppression de l\'appel d\'offre');
        }
      } catch (error) {
        console.error("Erreur lors de la suppression de l'appel d'offre :", error);
      }
    }
  },
};
</script>
<style>
  .icon-spacing{
    margin: 0 8px;
  }
</style>
