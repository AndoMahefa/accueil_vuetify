<template>
  <v-app>
    <v-container>
      <h1 class="text-center mt-15">
        Inscription administrateur
      </h1>
      <br>
      <br>
      <v-stepper :items="['Direction, Service, Fonction', 'Création Employe', 'Compte']">
        <template v-slot:item.1>
          <v-card
            flat
            class="pa-4"
          >
            <div class="d-flex flex-wrap align-stretch">
              <!-- Section Direction -->
              <div class="section-container">
                <h3 class="text-h6 mb-4 primary--text">Direction</h3>
                <v-radio-group v-model="directionChoice" class="mb-4">
                  <v-radio
                    label="Direction existante"
                    value="existing"
                  />
                  <v-radio
                    label="Nouvelle Direction"
                    value="new"
                  />
                </v-radio-group>

                <v-select
                  v-if="directionChoice === 'existing'"
                  v-model="selectedDirection"
                  :items="directions"
                  item-title="nom"
                  item-value="id"
                  label="Sélectionner une direction"
                  class="mb-4"
                  variant="outlined"
                  @update:model-value="getServicesByDirection"
                />

                <v-text-field
                  v-if="directionChoice === 'new'"
                  v-model="nom_direction"
                  label="Nom de la nouvelle direction"
                  class="mb-4"
                  variant="outlined"
                />
              </div>

              <!-- Section Service -->
              <div v-if="(directionChoice === 'existing' && selectedDirection) || (directionChoice === 'new' && nom_direction)"
                   class="section-container">
                <h3 class="text-h6 mb-4 primary--text">Service</h3>
                <v-radio-group v-model="serviceChoice" class="mb-4">
                  <v-radio
                    v-if="directionChoice === 'existing'"
                    label="Service existant"
                    value="existing"
                  />
                  <v-radio
                    label="Nouveau service"
                    value="new"
                  />
                  <v-radio
                    label="Pas de service"
                    value="none"
                  />
                </v-radio-group>

                <v-select
                  v-if="serviceChoice === 'existing' && directionChoice === 'existing'"
                  v-model="service_id"
                  :items="services"
                  item-title="nom"
                  item-value="id"
                  label="Sélectionner un service"
                  class="mb-4"
                  variant="outlined"
                  @update:model-value="getFonctionsByService"
                />

                <v-text-field
                  v-if="serviceChoice === 'new'"
                  v-model="nom_service"
                  label="Nom du nouveau service"
                  class="mb-4"
                  variant="outlined"
                />
              </div>

              <!-- Section Fonction -->
              <div v-if="((serviceChoice !== 'none' && ((serviceChoice === 'existing' && service_id) || (serviceChoice === 'new' && nom_service))) ||
                          (serviceChoice === 'none' && directionChoice === 'existing' && selectedDirection))"
                   class="section-container">
                <h3 class="text-h6 mb-4 primary--text">Fonction</h3>
                <v-radio-group v-model="fonctionChoice" class="mb-4">
                  <v-radio
                    v-if="serviceChoice === 'existing' || serviceChoice === 'none'"
                    label="Fonction existante"
                    value="existing"
                  />
                  <v-radio
                    label="Nouvelle fonction"
                    value="new"
                  />
                </v-radio-group>

                <v-select
                  v-if="fonctionChoice === 'existing'"
                  v-model="fonction_id"
                  :items="fonctions"
                  item-title="nom"
                  item-value="id"
                  label="Sélectionner une fonction"
                  variant="outlined"
                  class="mb-4"
                />

                <v-text-field
                  v-if="fonctionChoice === 'new'"
                  v-model="nom_fonction"
                  label="Nom de la nouvelle fonction"
                  variant="outlined"
                  class="mb-4"
                />
              </div>

              <!-- Section Observation -->
              <div v-if="showObservationSection"
                   class="section-container">
                <h3 class="text-h6 mb-4 primary--text">Observation</h3>
                <v-select
                  v-model="observation_id"
                  :items="observations"
                  item-title="observation"
                  item-value="id"
                  label="Sélectionner une observation"
                  variant="outlined"
                  class="mb-4"
                />
              </div>
            </div>
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
      //Direction
      directions: [],
      directionChoice: 'existing',
      nom_direction: '',
      selectedDirection: null,

      // Service
      serviceChoice: 'existing',
      service_id: null,
      nom_service: '',
      services: [],

      // Fonction
      fonctionChoice: 'existing',
      fonction_id: null,
      nom_fonction: '',
      fonctions: [],

      // Observation
      observation_id: null,
      observations: [],

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
      },
    }
  },
  computed: {
    showObservationSection() {
      // Pour direction existante
      if (this.directionChoice === 'existing') {
        if (!this.selectedDirection) return false;

        if (this.serviceChoice === 'none') {
          return this.fonctionChoice === 'existing' && this.fonction_id ||
                 (this.fonctionChoice === 'new' && this.nom_fonction);
        }

        if (this.serviceChoice === 'existing') {
          if (!this.service_id) return false;
          return this.fonctionChoice === 'existing' && this.fonction_id ||
                 (this.fonctionChoice === 'new' && this.nom_fonction);
        }

        if (this.serviceChoice === 'new') {
          if (!this.nom_service) return false;
          return this.fonctionChoice === 'new' && this.nom_fonction;
        }
      }

      // Pour nouvelle direction
      if (this.directionChoice === 'new') {
        if (!this.nom_direction) return false;

        if (this.serviceChoice === 'none' || this.serviceChoice === 'new') {
          if (this.serviceChoice === 'new' && !this.nom_service) return false;
          return this.fonctionChoice === 'new' && this.nom_fonction;
        }
      }

      return false;
    }
  },
  watch: {
    serviceChoice: {
      handler: 'serviceChoiceChanged',
      immediate: true
    }
  },

  mounted() {
    this.getDirections();
    this.getObservations();
  },

  methods: {
    async getDirections() {
      try {
        const response = await fetch('http://localhost:8000/api/directions');

        if(response.ok) {
          const data = await response.json();
          this.directions = data.directions;
        }
      } catch (error) {
        console.error('Erreur lors du chargement des directions:', error);
        this.showError('Erreur lors du chargement des directions');
      }
    },
    async getServicesByDirection() {
      try {
        const response = await fetch(`http://localhost:8000/api/services/direction/${this.selectedDirection}`);

        if(response.ok) {
          const data = await response.json();
          console.log("services by direction : "+data);
          this.services = data.services;
        }
      } catch (error) {
        console.error('Erreur lors du chargement des services:', error);
        this.showError('Erreur lors du chargement des services');
      }
    },
    async getFonctionsByService() {
      try {
        const response = await fetch(`http://localhost:8000/api/fonctions/service/${this.service_id}`);

        if(response.ok) {
          const data = await response.json();
          console.log("fonctions by service : " . data);
          this.fonctions = data.fonctions;
        }
      } catch (error) {
        console.error('Erreur lors du chargement des fonctions:', error);
        this.showError('Erreur lors du chargement des fonctions');
      }
    },
    async getFonctionsByDirection() {
      try {
        const response = await fetch(`http://localhost:8000/api/fonctions/direction/${this.selectedDirection}`);
        if(response.ok) {
          const data = await response.json();
          this.fonctions = data.fonctions;
        }
      } catch (error) {
        console.error('Erreur lors du chargement des fonctions:', error);
        this.showError('Erreur lors du chargement des fonctions');
      }
    },
    async getObservations() {
      try {
        const response = await fetch('http://localhost:8000/api/observations');
        if(response.ok) {
          const data = await response.json();
          console.log("observations : " + JSON.stringify(data));
          this.observations = data;
        }
      } catch (error) {
        console.error('Erreur lors du chargement des observations:', error);
        this.showError('Erreur lors du chargement des observations');
      }
    },
    async createAdmin() {
      this.loading = true;

      const payload = {
        // Choix
        directionChoice: this.directionChoice,
        serviceChoice: this.serviceChoice,
        fonctionChoice: this.fonctionChoice,
        observation: this.observation_id,

        // Direction
        selectedDirection: this.directionChoice === 'existing' ? this.selectedDirection : null,
        nom_direction: this.directionChoice === 'new' ? this.nom_direction : null,

        // Service
        service_id: this.serviceChoice === 'existing' ? this.service_id : null,
        nom_service: this.serviceChoice === 'new' ? this.nom_service : null,

        // Fonction
        fonction_id: this.fonctionChoice === 'existing' ? this.fonction_id : null,
        nom_fonction: this.fonctionChoice === 'new' ? this.nom_fonction : null,

        // Informations employé
        nom: this.nom,
        prenom: this.prenom,
        date_de_naissance: this.date_de_naissance,
        adresse: this.adresse,
        cin: this.cin,
        telephone: this.telephone,
        genre: this.genre,

        // Informations compte
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
    },

    async serviceChoiceChanged() {
      if (this.serviceChoice === 'none' && this.directionChoice === 'existing') {
        await this.getFonctionsByDirection();
      } else if (this.serviceChoice === 'existing') {
        await this.getFonctionsByService();
      }
    }
  },

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

.v-card {
  border-radius: 8px;
}

.section-container {
  flex: 1;
  min-width: 300px;
  margin-right: 24px;
  margin-bottom: 16px;
  padding: 16px;
  background-color: #fafafa;
  border-radius: 8px;
  border: 1px solid #e0e0e0;
  height: 100%;
  display: flex;
  flex-direction: column;
}

.section-container:last-child {
  margin-right: 0;
}

h3.text-h6 {
  font-weight: 500;
  border-bottom: 2px solid #1976d2;
  padding-bottom: 8px;
  margin-bottom: 16px;
}

.v-radio-group {
  background-color: #f5f5f5;
  padding: 12px;
  border-radius: 4px;
}

.v-radio {
  margin-bottom: 4px;
}

@media (max-width: 959px) {
  .section-container {
    margin-right: 0;
    width: 100%;
  }
}
</style>
