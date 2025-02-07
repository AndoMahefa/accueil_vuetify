<template>
  <v-sheet class="mx-auto pa-6" max-width="1000" elevation="3">
    <div class="form-header mb-6">
      <h2 class="form-title">
        <span class="primary--text">Employé</span> / Enregistrer
      </h2>
      <div class="form-subtitle text-grey">
        Veuillez remplir les informations de l'employé
      </div>
    </div>

    <v-stepper v-model="currentStep" class="elevation-0">
      <!-- Stepper Header -->
      <v-stepper-header class="mb-6">
        <v-stepper-item value="1" class="stepper-item">
          <v-icon icon="mdi-account" class="mr-2"></v-icon>
          Informations personnelles
        </v-stepper-item>
        <v-stepper-divider></v-stepper-divider>
        <v-stepper-item value="2" class="stepper-item">
          <v-icon icon="mdi-office-building" class="mr-2"></v-icon>
          Département
        </v-stepper-item>
      </v-stepper-header>

      <!-- Stepper Content -->
      <v-stepper-window>
        <!-- Step 1 -->
        <v-stepper-window-item value="1">
          <v-form ref="form1" v-model="valid" class="form-grid">
            <v-text-field
              v-model="employe.nom"
              label="Nom"
              variant="outlined"
              density="comfortable"
              required
              class="form-field"
            />
            <v-text-field
              v-model="employe.prenom"
              label="Prénom"
              variant="outlined"
              density="comfortable"
              required
              class="form-field"
            />
            <v-text-field
              v-model="employe.date_de_naissance"
              type="date"
              label="Date de naissance"
              variant="outlined"
              density="comfortable"
              required
              class="form-field"
            />
            <v-text-field
              v-model="employe.adresse"
              label="Adresse"
              variant="outlined"
              density="comfortable"
              required
              class="form-field"
            />
            <v-text-field
              v-model="employe.cin"
              label="Numéro CIN"
              variant="outlined"
              density="comfortable"
              required
              class="form-field"
            />
            <v-text-field
              v-model="employe.telephone"
              label="Téléphone"
              variant="outlined"
              density="comfortable"
              required
              class="form-field"
            />
            <v-select
              v-model="selectedGenre"
              :items="genreOptions"
              label="Genre"
              item-title="label"
              item-value="value"
              variant="outlined"
              density="comfortable"
              required
              class="form-field"
            />

            <div class="d-flex justify-end mt-4">
              <v-btn
                color="primary"
                size="large"
                @click="currentStep = '2'"
                :disabled="!isStep1Valid"
              >
                Suivant
                <v-icon icon="mdi-arrow-right" class="ml-2"></v-icon>
              </v-btn>
            </div>
          </v-form>
        </v-stepper-window-item>

        <!-- Step 2 -->
        <v-stepper-window-item value="2">
          <v-form ref="form2" v-model="valid" class="form-grid">
            <v-select
              v-model="selectedDirection"
              :items="directions"
              label="Direction"
              item-title="nom"
              item-value="id"
              variant="outlined"
              density="comfortable"
              required
              @update:model-value="onDirectionChange"
              class="form-field"
            />
            <v-select
              v-model="selectedService"
              :items="filteredServices"
              label="Service"
              item-title="nom"
              item-value="id"
              variant="outlined"
              density="comfortable"
              clearable
              @update:model-value="onServiceChange"
              class="form-field"
            />
            <v-select
              v-model="selectedFonction"
              :items="filteredFonctions"
              label="Fonction"
              item-title="nom"
              item-value="id"
              variant="outlined"
              density="comfortable"
              required
              class="form-field"
            />
            <v-select
              v-model="selectedObservation"
              :items="observations"
              label="Observation"
              item-title="observation"
              item-value="id"
              variant="outlined"
              density="comfortable"
              required
              class="form-field"
            />

            <div class="d-flex justify-space-between mt-4">
              <v-btn
                color="grey-lighten-1"
                size="large"
                variant="outlined"
                @click="currentStep = '1'"
              >
                <v-icon icon="mdi-arrow-left" class="mr-2"></v-icon>
                Précédent
              </v-btn>
              <v-btn
                color="success"
                size="large"
                @click="submitForm"
                :loading="loading"
                :disabled="!isStep2Valid"
              >
                <v-icon icon="mdi-check" class="mr-2"></v-icon>
                Enregistrer
              </v-btn>
            </div>
          </v-form>
        </v-stepper-window-item>
      </v-stepper-window>
    </v-stepper>

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
import { get, post } from '@/service/ApiService';

export default {
  data() {
    return {
      currentStep: '1',
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
      selectedDirection: null,
      selectedFonction: null,
      selectedObservation: null,
      genreOptions: [
        {label: "Homme", value: "Homme"},
        {label: "Femme", value: "Femme"},
      ],
      services: [],
      directions: [],
      fonctions: [],
      observations: [],
      filteredServices: [],
      filteredFonctions: [],

      snackbar: {
        show: false,
        text: '',
        color: 'success'
      },
      loading: false,
    };
  },
  computed: {
    isStep1Valid() {
      return this.employe.nom &&
             this.employe.prenom &&
             this.employe.date_de_naissance &&
             this.employe.adresse &&
             this.employe.cin &&
             this.employe.telephone &&
             this.selectedGenre;
    },
    isStep2Valid() {
      return this.selectedDirection &&
             this.selectedFonction &&
             this.selectedObservation;
    }
  },
  mounted() {
    this.fetchService();
    this.fetchDirections();
    this.fetchFonctions();
    this.fetchObservations();
  },
  methods: {
    async submitForm(e) {
      e.preventDefault();
      const payload = {
        'nom': this.employe.nom,
        'prenom': this.employe.prenom,
        'date_de_naissance': this.employe.date_de_naissance,
        'adresse': this.employe.adresse,
        'cin': this.employe.cin,
        'telephone': this.employe.telephone,
        'genre': this.selectedGenre,
        'id_service': this.selectedService,
        'id_direction': this.selectedDirection,
        'id_fonction': this.selectedFonction,
        'id_observation': this.selectedObservation
      }

      try {
        const response = await post('employe', payload);
        if(response.ok) {
          this.showSuccess('Employé enregistré avec succès');
          this.employe = {
            nom: '',
            prenom: '',
            date_de_naissance: '',
            adresse: '',
            cin: '',
            telephone: '',
            genre: ''
          };
          this.selectedGenre = null;
          this.selectedService = null;
          this.selectedDirection = null;
          this.selectedFonction = null;
          this.selectedObservation = null;
          this.currentStep = '1';
        }
      } catch (error) {
        console.error('Erreur:', error);
        this.showError('Une erreur est survenue lors de l\'ajout');
      }
    },
    async fetchService() {
      const response = await get('services');
      if(response.ok) {
        const data = await response.json();
        this.services = data.services;
      }
    },
    async fetchDirections() {
      const response = await get('directions');
      if(response.ok) {
        const data = await response.json();
        this.directions = data.directions;
      }
    },
    async fetchFonctions() {
      const response = await get('fonctions');
      if(response.ok) {
        const data = await response.json();
        this.fonctions = data.fonctions;
      }
    },
    onDirectionChange() {
      this.selectedService = null;
      this.selectedFonction = null;

      if (this.selectedDirection) {
        // Filtrer les services pour la direction sélectionnée
        this.filteredServices = this.services.filter(
          service => service.id_direction === this.selectedDirection
        );
        // Charger les fonctions de la direction
        this.fetchFonctionsByDirection(this.selectedDirection);
      }
    },
    onServiceChange() {
      this.selectedFonction = null;

      if (this.selectedService) {
        // Si un service est sélectionné, charger les fonctions du service
        this.fetchFonctionsByService(this.selectedService);
      } else if (this.selectedDirection) {
        // Si pas de service mais une direction, charger les fonctions de la direction
        this.fetchFonctionsByDirection(this.selectedDirection);
      }
    },
    async fetchFonctionsByDirection(directionId) {
      const response = await fetch(`http://localhost:8000/api/fonctions/direction/${directionId}`);
      if(response.ok) {
        const data = await response.json();
        this.filteredFonctions = data.fonctions;
      }
    },
    async fetchFonctionsByService(serviceId) {
      const response = await fetch(`http://localhost:8000/api/fonctions/service/${serviceId}`);
      if(response.ok) {
        const data = await response.json();
        this.filteredFonctions = data.fonctions;
      }
    },
    async fetchObservations() {
      const response = await fetch('http://localhost:8000/api/observations');
      if(response.ok) {
        const data = await response.json();
        console.log(data)
        this.observations = data;
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
  },
};
</script>

<style scoped>
.form-header {
  text-align: left;
}

.form-title {
  font-size: 1.5rem;
  font-weight: 500;
  margin-bottom: 0.5rem;
}

.form-subtitle {
  font-size: 0.875rem;
}

.form-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1.5rem;
  padding: 1rem;
}

.form-field {
  width: 100%;
}

.stepper-item {
  display: flex;
  align-items: center;
}

/* Responsive adjustments */
@media (max-width: 600px) {
  .form-grid {
    grid-template-columns: 1fr;
  }

  .v-sheet {
    margin: 0.5rem;
  }
}

/* Optional: Animation for transitions */
.v-stepper-window-item {
  transition: all 0.3s ease-in-out;
}
</style>
