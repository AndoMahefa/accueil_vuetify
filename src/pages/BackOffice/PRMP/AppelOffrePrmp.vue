<template>
  <v-sheet class="mx-auto mt-10" max-width="500 px" width="100%">
      <div class="form-title">
          <span class="bold-text">Appel d'offre</span> / Ajouter
      </div>
              <v-form ref="form">
          <!-- Titre -->
          <v-text-field
            label="Titre"
            v-model="appelOffre.titre"
            required
          ></v-text-field>

          <!-- Description -->
          <v-textarea
            label="Description"
            v-model="appelOffre.description"
            required
          ></v-textarea>

          <!-- Date de lancement -->
          <v-text-field
            label="Date de lancement"
            type="date"
            :min="minDate"
            v-model="appelOffre.date_lancement"
            required
          ></v-text-field>

          <!-- Date limite -->
          <v-text-field
            label="Date limite"
            type="date"
            :min="minDate"
            v-model="appelOffre.date_limite"
            required
          ></v-text-field>

          <!-- Budget estimé -->
          <v-text-field
            label="Budget estimé"
            v-model="appelOffre.budget_estime"
            type="number"
            required
          ></v-text-field>
        </v-form>

        <v-btn class="mt-2" block color="primary" @click="submitForm">
          Ajouter
        </v-btn>
  </v-sheet>
</template>

<script>
export default {
  data() {
    return {
      minDate: new Date().toISOString().substr(0, 10), // Date minimale (aujourd'hui)
      appelOffre: {
        titre: '',
        description: '',
        date_lancement: '',
        date_limite: '',
        budget_estime: null
      }
    };
  },
  methods: {
    resetForm() {
      this.appelOffre = {
        titre: '',
        description: '',
        date_lancement: '',
        date_limite: '',
        budget_estime: null
      };
      this.$refs.form.reset();
    },

    async submitForm() {
      const token = localStorage.getItem('token');
      console.log(this.appelOffre)
      try {
        const response = await fetch('http://localhost:8000/api/prmp/appel-offre', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(this.appelOffre),
        });
        if (response.ok) {
          alert('Appel d\'offre ajouté avec succès !');

          this.resetForm();
        } else {
          alert('Erreur lors de l\'ajout de l\'appel d\'offre.');
        }
      } catch (error) {
        console.error('Erreur réseau :', error);
      }
    }
  },
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
