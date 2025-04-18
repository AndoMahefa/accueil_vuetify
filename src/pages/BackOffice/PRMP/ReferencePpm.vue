<!-- eslint-disable vue/singleline-html-element-content-newline -->
<!-- eslint-disable vue/max-attributes-per-line -->
<!-- eslint-disable vue/html-self-closing -->
<template>
  <v-container>
    <h1>Veuillez sélectionner ou entrer une référence</h1>
    <br>
    <v-form ref="form" @submit.prevent="submitForm">
      <!-- Choix entre référence existante ou nouvelle -->
      <v-select
        v-model="selectedReference"
        :items="references"
        label="Choisir une référence existante"
        outlined
        return-object
        item-title="reference"
        item-value="id"
      ></v-select>

      <v-divider class="my-4"></v-divider>

      <h3>Ou ajouter une nouvelle référence :</h3>
      <v-text-field
        v-model="newReference"
        label="Nouvelle Référence"
        :rules="[rules.max25]"
        outlined
      ></v-text-field>

      <v-btn type="submit" color="primary">Valider</v-btn>
    </v-form>
  </v-container>
</template>

<script>
import { get, post } from '@/service/ApiService';

export default {
  data() {
    return {
      selectedReference: null, // Pour référence existante
      newReference: '', // Pour nouvelle référence
      references: [], // Liste des références existantes
      rules: {
        max25: (v) => (v && v.length <= 25) || 'Maximum 25 caractères',
      },
    };
  },
  mounted() {
    // Charger les références existantes
    this.fetchReferences()
  },
  methods: {
    async fetchReferences() {
      try {
        const response = await get('prmp/references')

        if (response.ok) {
          const result = await response.json();
          this.references = result; // Charger les références
        } else {
          console.error("Erreur lors de la récupération des références");
        }
      } catch (error) {
        console.error(error);
      }
    },
    async submitForm() {
      try {
        let referenceToUse = null;

        // Si une nouvelle référence est saisie, l'enregistrer
        if (this.newReference) {
          console.log("nouvelle reference : " + this.newReference)
          const response = await post('prmp/reference', {
            'reference': this.newReference
          })

          if (response.ok) {
            const result = await response.json();
            referenceToUse = result.reference; // Nouvelle référence créée
          } else {
            const error = await response.json();
            alert(error.message || "Erreur lors de l'enregistrement");
            return;
          }
        } else if (this.selectedReference) {
          // Utiliser la référence sélectionnée
          referenceToUse = this.selectedReference;
        } else {
          alert("Veuillez sélectionner ou ajouter une référence.");
          return;
        }

        console.log("reference farany: " + JSON.stringify(referenceToUse))
        // Rediriger vers la page suivante avec la référence
        this.$router.push({
          path: "/home/ajouter-appel",
          query: { reference: JSON.stringify(referenceToUse) },
        });
      } catch (error) {
        console.error(error);
        alert("Une erreur est survenue.");
      }
    },
  },
};
</script>
