<template>
  <v-sheet
    class="mx-auto mt-10"
    max-width="500 px"
    width="100%"
  >
    <div class="form-title">
      <span class="bold-text">Service</span> / Enregistrer
    </div>
    <v-form
      ref="form"
      v-model="valid"
    >
      <v-text-field
        v-model="service.nom"
        label="Nom"
        :rules="[rules.required]"

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
import { post } from '@/service/ApiService';

export default {
  data() {
    return {
      valid: false,
      service: {
        nom: ''
      },
      rules: {
        required: value => !!value || 'Ce champ est requis',
      }
    };
  },
  methods: {
    async submitForm(e) {
      e.preventDefault();

      const response = await post('service/register', {
        'nom' : this.service.nom
      });
      if(response.ok) {
        this.service = {}
      } else {
        alert("ajout non effectue")
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
