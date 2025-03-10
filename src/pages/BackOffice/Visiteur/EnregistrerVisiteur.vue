<template>
  <v-sheet class="mx-auto mt-10" max-width="500 px" width="100%">
    <div class="form-title">
      <span class="bold-text">Visiteur</span> / Enregistrer
    </div>
    <v-form
      ref="form"
      v-model="valid"
    >
      <v-text-field
        v-model="visiteur.nom"
        label="Nom"
        :rules="[rules.required]"

        required
      />
      <v-text-field
        v-model="visiteur.prenom"
        label="Prenom"
        :rules="[rules.required]"

        required
      />
      <v-select
        v-model="selectedGenre"
        :items="genres"
        item-value="value"
        label="Sélectionner votre genre"
      />
      <v-text-field
        v-model="visiteur.cin"
        label="CIN"
        :rules="[rules.required]"

        required
      />
      <v-text-field
        v-model="visiteur.email"
        label="Email"
        :rules="[rules.required, rules.email]"

        required
      />

      <v-text-field
        v-model="visiteur.telephone"
        label="Numéro de téléphone"
      />

      <v-btn class="mt-2" type="submit" block @click="submitForm" color="success">Enregistrer</v-btn>
    </v-form>

    <!-- Snackbar -->
    <v-snackbar
      v-model="snackbar.show"
      :color="snackbar.color"
      :timeout="3000"
      location="top"
    >
      {{ snackbar.text }}
    </v-snackbar>
  </v-sheet>
</template>

<script>
import { post } from '@/service/ApiService';

export default {
  data() {
    return {
      valid: false,
      visiteur: {
          nom: '',
          prenom: '',
          email: '',
          cin: '',
          telephone: ''
      },
      genres: [
        { title: 'Homme', value: 'Homme' },
        { title: 'Femme', value: 'Femme' },
      ],
      selectedGenre: null,
      rules: {
        required: value => !!value || 'Ce champ est requis',
        email: value => /.+@.+\..+/.test(value) || 'L\'email doit être valide'
      },
      snackbar: {
        show: false,
        text: '',
        color: 'success'
      },
    };
  },
  methods: {
    async submitForm(e) {
      e.preventDefault()
      try {
        const response = await post('accueil/visiteur', {
          'nom' : this.visiteur.nom,
          'prenom' : this.visiteur.prenom,
          'email' : this.visiteur.email,
          'cin' : this.visiteur.cin,
          'telephone' : this.visiteur.telephone,
          'genre' : this.selectedGenre
        })

        if(response.ok) {
          this.showSuccess("Visiteur ajouté avec succès");// console.log(this.selectedGenre)
          this.visiteur = {};
          this.selectedGenre = null;
        }
      } catch (error) {
        console.log(error)
        this.showError("Une erreur est survenue lors de l'ajout");
      }
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
    },
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
