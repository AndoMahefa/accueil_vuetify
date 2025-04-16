<template>
  <v-sheet class="mx-auto mt-10 pa-8 rounded-lg elevation-5" max-width="700px" width="100%">
    <div class="form-title mb-6">
      <v-icon icon="mdi-account-circle" color="primary" class="mr-2"></v-icon>
      <span class="text-h5 font-weight-bold text-primary">Enregistrement Visiteur</span>
    </div>

    <v-form ref="form" v-model="valid" class="d-flex flex-column gap-4">
      <div class="d-flex gap-4">
        <v-text-field
          v-model="visiteur.nom"
          label="Nom"
          :rules="[rules.required]"
          variant="outlined"
          density="comfortable"
          color="primary"
          rounded="lg"
          class="mr-2"
        />
        <v-text-field
          v-model="visiteur.prenom"
          label="Prénom"
          :rules="[rules.required]"
          variant="outlined"
          density="comfortable"
          color="primary"
          rounded="lg"
          class="ml-2"
        />
      </div>

      <v-select
        v-model="selectedGenre"
        :items="genres"
        item-value="value"
        label="Genre"
        variant="outlined"
        density="comfortable"
        color="primary"
        rounded="lg"
        menu-icon="mdi-chevron-down"
        :menu-props="{ rounded: 'lg' }"
      />

      <v-text-field
        v-model="visiteur.cin"
        label="CIN"
        :rules="[rules.required]"
        variant="outlined"
        density="comfortable"
        color="primary"
        rounded="lg"
      />

      <v-text-field
        v-model="visiteur.email"
        label="Email"
        :rules="[rules.email]"
        variant="outlined"
        density="comfortable"
        color="primary"
        rounded="lg"
        type="email"
      />

      <v-text-field
        v-model="visiteur.telephone"
        label="Numéro de téléphone"
        variant="outlined"
        density="comfortable"
        color="primary"
        rounded="lg"
        type="tel"
      />

      <v-text-field
        v-model="visiteur.entreprise"
        label="Entreprise / Organisme"
        variant="outlined"
        density="comfortable"
        color="primary"
        rounded="lg"
      />

      <v-btn
        class="mt-4"
        type="submit"
        block
        @click="submitForm"
        color="primary"
        size="large"
        rounded="lg"
        :disabled="!valid"
        variant="flat"
      >
        <v-icon icon="mdi-content-save-check" class="mr-2"></v-icon>
        Enregistrer
      </v-btn>
    </v-form>

    <v-snackbar
      v-model="snackbar.show"
      :color="snackbar.color"
      :timeout="3000"
      location="top"
      elevation="24"
      rounded="pill"
    >
      <v-icon :icon="snackbar.icon" class="mr-2"></v-icon>
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
        telephone: '',
        entreprise: ''
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
          'genre': this.selectedGenre,
          'entreprise': this.entreprise
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
  .v-sheet {
    background: rgba(255, 255, 255, 0.95);
    backdrop-filter: blur(10px);
    border: 1px solid rgba(255, 255, 255, 0.3);
  }

  .form-title {
    display: flex;
    align-items: center;
    padding-bottom: 1rem;
    border-bottom: 2px solid rgb(var(--v-theme-primary));
  }

  .v-btn {
    transition: all 0.3s ease;
    letter-spacing: 0.05em;
    text-transform: uppercase;
    font-weight: 600;
  }

  .v-btn:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(var(--v-theme-primary), 0.2);
  }

  .v-text-field :deep(.v-field) {
    background-color: rgba(245, 245, 245, 0.8);
  }
</style>
