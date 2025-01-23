<template>
  <v-app>
    <v-container>
      <h1 class="text-center mt-15">
        Inscription administrateur
      </h1>
      <br>
      <br>
      <v-stepper :items="['Choix du service', 'Création Employe', 'Compte']">
        <template v-slot:item.1>
          <v-card
            title="Choix du service"
            flat
            class="pa-4"
          >
            <v-radio-group v-model="serviceChoice">
              <v-radio
                label="Service existant"
                value="existing"
              />
              <v-radio
                label="Nouveau service"
                value="new"
              />
            </v-radio-group>

            <v-select
              v-if="serviceChoice === 'existing'"
              v-model="service_id"
              :items="services"
              item-title="nom"
              item-value="id"
              label="Sélectionner un service"
              :rules="[v => !!v || 'Service est requis']"
              class="mt-4"
            />

            <v-text-field
              v-if="serviceChoice === 'new'"
              v-model="nom_service"
              label="Nom du nouveau service"
              :rules="[v => !!v || 'Nom du service est requis']"
              class="mt-4"
            />
          </v-card>
        </template>

        <template v-slot:item.2>
          <v-card title="Informations de l'employé" flat class="pa-4">
            <v-text-field
              v-model="nom"
              label="Nom"
              :rules="[v => !!v || 'Nom est requis']"
              maxlength="100"
            />
            <v-text-field
              v-model="prenom"
              label="Prenom"
              :rules="[v => !!v || 'Prénom est requis']"
              maxlength="100"
            />
            <v-text-field
              v-model="date_de_naissance"
              type="date"
              label="Date de naissance"
              :rules="[v => !!v || 'Date de naissance est requise']"
            />
            <v-select
              v-model="genre"
              :items="genres"
              item-title="title"
              item-value="value"
              label="Genre"
              :rules="[v => !!v || 'Genre est requis']"
            />
            <v-text-field
              v-model="adresse"
              label="Adresse"
              :rules="[v => !!v || 'Adresse est requise']"
              maxlength="75"
            />
            <v-text-field
              v-model="cin"
              label="CIN"
              :rules="[v => !!v || 'CIN est requis']"
              maxlength="25"
            />
            <v-text-field
              v-model="telephone"
              label="Téléphone"
              :rules="[v => !!v || 'Téléphone est requis']"
              maxlength="25"
            />
          </v-card>
        </template>

        <template v-slot:item.3>
          <v-card title="Création du compte" flat class="pa-4">
            <v-text-field
              v-model="email"
              label="Email"
              type="email"
              :rules="[
                v => !!v || 'Email est requis',
                v => /.+@.+\..+/.test(v) || 'Email doit être valide'
              ]"
            />
            <v-text-field
              v-model="mot_de_passe"
              label="Mot de passe"
              type="password"
              :rules="[v => !!v || 'Mot de passe est requis']"
            />

            <v-btn
              color="primary"
              block
              class="mt-4"
              @click="createAdmin"
              :loading="loading"
            >
              Enregistrer l'administrateur
            </v-btn>
          </v-card>
        </template>
      </v-stepper>
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
export default {
  data() {
    return {
      // Service
      serviceChoice: 'existing',
      service_id: null,
      nom_service: '',
      services: [],

      // Employé
      nom: '',
      prenom: '',
      date_de_naissance: '',
      adresse: '',
      cin: '',
      telephone: '',
      genre: '',

      // Compte
      email: '',
      mot_de_passe: '',

      // UI
      genres: [
        { title: 'Homme', value: 'Homme' },
        { title: 'Femme', value: 'Femme' }
      ],
      loading: false,
      snackbar: {
        show: false,
        text: '',
        color: 'success'
      }
    }
  },

  mounted() {
    this.getServices();
  },

  methods: {
    async getServices() {
      try {
        const response = await fetch('http://localhost:8000/api/services');
        if(response.ok) {
          const data = await response.json();
          this.services = data.services;
        }
      } catch (error) {
        console.error('Erreur lors du chargement des services:', error);
        this.showError('Erreur lors du chargement des services');
      }
    },

    async createAdmin() {
      this.loading = true;

      const payload = {
        service_choice: this.serviceChoice,
        ...(this.serviceChoice === 'existing' ? { service_id: this.service_id } : { nom_service: this.nom_service }),
        nom: this.nom,
        prenom: this.prenom,
        date_de_naissance: this.date_de_naissance,
        adresse: this.adresse,
        cin: this.cin,
        telephone: this.telephone,
        genre: this.genre,
        email: this.email,
        mot_de_passe: this.mot_de_passe
      };

      try {
        const response = await fetch('http://localhost:8000/api/admin/create', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(payload)
        });

        const data = await response.json();

        if(response.ok) {
          this.showSuccess('Administrateur créé avec succès');
          this.resetForm();
        } else {
          this.showError(data.message || 'Erreur lors de la création');
        }
      } catch (error) {
        console.error('Erreur:', error);
        this.showError('Erreur de connexion au serveur');
      } finally {
        this.loading = false;
      }
    },

    resetForm() {
      this.serviceChoice = 'existing';
      this.service_id = null;
      this.nom_service = '';
      this.nom = '';
      this.prenom = '';
      this.date_de_naissance = '';
      this.adresse = '';
      this.cin = '';
      this.telephone = '';
      this.genre = '';
      this.email = '';
      this.mot_de_passe = '';
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

<style scoped>
h1 {
    font-family: "Roboto", sans-serif;
    font-weight: bold;
    color: #1976d2;
}
h2 {
    margin-bottom: 16px;
    font-family: "Roboto", sans-serif;
    color: #424242;
}
</style>
