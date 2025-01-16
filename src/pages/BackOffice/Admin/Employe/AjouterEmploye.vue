<template>
  <v-sheet
    class="mx-auto mt-10"
    max-width="500 px"
    width="100%"
  >
    <div class="form-title">
      <span class="bold-text">Employe</span> / Enregistrer
    </div>
    <v-form
      ref="form"
      v-model="valid"
    >
      <v-text-field
        v-model="employe.nom"
        label="Nom"

        required
      />
      <v-text-field
        v-model="employe.prenom"
        label="Prenom"

        required
      />
      <v-text-field
        v-model="employe.date_de_naissance"
        type="date"
        label="Date de naissance"

        required
      />
      <v-text-field
        v-model="employe.adresse"
        label="Adresse"

        required
      />
      <v-text-field
        v-model="employe.cin"
        label="Numero CIN"

        required
      />
      <v-text-field
        v-model="employe.telephone"
        label="telephone"

        required
      />
      <v-select
        v-model="selectedGenre"
        :items="genreOptions"
        label="Genre"
        item-title="label"
        item-value="value"

        required
      />
      <v-select
        v-model="selectedService"
        :items="services"
        label="Veuillez choisir un service"
        item-title="nom"
        item-value="id"

        required
      />

      <v-btn
        class="mt-2"
        type="submit"
        block
        color="success"
        @click="submitForm"
      >
        Enregistrer
      </v-btn>
    </v-form>
  </v-sheet>
</template>

<script>
import { get, post } from '@/service/ApiService';

export default {
  data() {
    return {
      valid: false,
      employe: {
        nom: '',
        prenom: '',
        date_de_naissance: '',
        adresse: '',
        cin: '',
        telephone: '',
        genre: ''
      },
      selectedGenre: null,
      selectedService: null,
      genreOptions: [
        {label: "Homme", value: "Homme"},
        {label: "Femme", value: "Femme"},
      ],
      services: []
    };
  },
  mounted() {
    this.fetchService()
  },
  methods: {
    async submitForm(e) {
      e.preventDefault();

      const response = await post('employe', {
        'nom' : this.employe.nom,
        'prenom': this.employe.prenom,
        'date_de_naissance': this.employe.date_de_naissance,
        'adresse': this.employe.adresse,
        'cin': this.employe.cin,
        'telephone': this.employe.telephone,
        'genre': this.selectedGenre,
        'id_service': this.selectedService
      });
      if(response.ok) {
        this.employe = {};
        this.selectedGenre = null;
        this.selectedGenre = null;
      } else {
        alert("ajout non effectue")
      }
    },
    async fetchService() {
      const response = await get('services');
      console.log()
      if(response.ok) {
        const data = await response.json();
        this.services = data.services;
      }
    }
  }
};
</script>

<style scoped>
  .form-title {
      display: flex;
      align-items: center;
      margin-bottom: 15px;
      font-size: 1.25rem; /* Taille de texte */
      font-weight: 400; /* Poids de texte par défaut */
      color: #333; /* Couleur de texte */
  }

  .bold-text {
      font-weight: 700; /* Texte en gras */
      margin-right: 4px; /* Espacement entre Visiteur et / */
  }
  .v-sheet {
      max-width: 600px;  /* Maximum width */
  }

  .v-btn {
      margin-top: 15px;
  }
</style>
