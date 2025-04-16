<template>
  <v-app>
    <v-container>
      <v-card class="main-card">
        <v-card-title class="headline text-center white--text py-4">
          <v-icon large color="blue" class="mr-2">mdi-briefcase-check</v-icon>
          Remise d'offre
        </v-card-title>
        <v-stepper
          :items="['Soumissionaire', 'Entreprise', 'Appel d\'offre']"
          prev-text="Précédent"
          next-text="Suivant"
        >
          <template v-slot:item.1>
            <v-card
              title="Information du soumissionnaire"
              flat
              class="pa-4"
            >
              <v-text-field
                v-model="nom"
                label="Nom"
              />
              <v-text-field
                v-model="prenom"
                label="Prenom"
              />
            </v-card>
          </template>

          <template v-slot:item.2>
            <v-card
              title="Informations sur l'entreprise"
              flat
              class="pa-4"
            >
              <v-text-field
                v-model="entreprise"
                label="Nom de l'entreprise"
              />
              <v-text-field
                v-model="nif_stat"
                label="NIF/STAT"
              />
              <v-text-field
                v-model="adresse_siege"
                label="Adresse siege"
              />
              <v-text-field
                v-model="fiscale"
                label="Numero fiscale"
              />
              <v-text-field
                v-model="rcs"
                label="Numero RCS ou CIN"
              />
              <v-text-field
                v-model="contact"
                label="Contact"
              />
            </v-card>
          </template>
          <template v-slot:item.3>
            <v-card
              title="Appel d'offre"
              flat
              class="pa-4"
            >
              <v-select
                v-model="selectedAppelOffre"
                :items="appelOffres"
                item-title="appel_offre"
                item-value="id"
                label="Sélectionner un appel d'offre"
                class="mt-4"
              />
              <v-card-action>
                <v-btn
                  color="primary"
                  block
                  class="mt-4"
                  @click="remise_offre"
                  :loading="loading"
                >
                  Enregistrer
                </v-btn>
              </v-card-action>
            </v-card>
          </template>
        </v-stepper>
      </v-card>

    </v-container>

    <!-- Snackbar pour les messages -->
    <v-snackbar
      v-model="snackbar.show"
      :color="snackbar.color"
      :timeout="3000"
    >
      {{ snackbar.text }}
    </v-snackbar>
  </v-app>
</template>

<script>
import { get, post } from '@/service/ApiService';

export default {
  name: 'RemiseOffre',
  data() {
    return {
      appelOffres: [],

      nom: '',
      prenom: '',
      entreprise: '',
      nif_stat: '',
      adresse_siege: '',
      fiscale: '',
      rcs: '',
      contact: '',

      selectedAppelOffre: null,
      snackbar: {
        show: false,
        text: '',
        color: 'success'
      }
    }
  },
  mounted() {
    this.fetchAppelOffresPublies();
  },
  methods: {
    async fetchAppelOffresPublies() {
      const response = await get('prmp/offre/publies');
      if(response.ok) {
        const data = await response.json();
        console.log(data);
        this.appelOffres = data.data;
      } else {
        this.showError('Erreur lors de la recupération des appels d\'offre');
      }
    },
    async remise_offre() {
      const response = await post('accueil/remise-offre', {
        'nom': this.nom,
        'prenom': this.prenom,
        'entreprise': this.entreprise,
        'nif_stat': this.nif_stat,
        'adresse_siege': this.adresse_siege,
        'fiscale': this.fiscale,
        'rcs': this.rcs,
        'contact': this.contact,
        'id_appel_offre': this.selectedAppelOffre
      });

      if(response.ok) {
        this.resetForm();
        this.showSuccess('Offre enregistree avec succes');
      } else {
        this.showError('Erreur lors de l\'enregistrement de l\'offre');
      }
    },
    resetForm() {
      this.nom = '',
      this.prenom = '',
      this.entreprise = '',
      this.nif_stat = '',
      this.adresse_siege = '',
      this.fiscale = '',
      this.rcs = '',
      this.contact = '',
      this.selectedAppelOffre = null
    },
    showSuccess(message) {
      this.snackbar.color = 'success';
      this.snackbar.text = message;
      this.snackbar.show = true;
    },

    showError(message) {
      this.snackbar.color = 'error';
      this.snackbar.text = message;
      this.snackbar.show = true;
    }
  }
}
</script>
