<template>
  <v-app>
    <v-container>
      <h1 class="text-center mt-15">Prise de Rendez-vous</h1>

      <v-stepper
        v-model="currentStep"
        :items="['Etape 1', 'Etape 2', 'Etape 3']"
        prev-text="Précédent"
        next-text="Suivant"
        @update:model-value="handleStepChange"
      >
        <template v-slot:item.1>
          <v-card-text>
            <v-form>
              <v-select
                v-model="selectedDirection"
                :items="directions"
                item-title="nom"
                item-value="id"
                label="Sélectionner une direction"
                dense
                clearable
                required
                style="color: #fffff; border-color: #6EC1B4;"
                @update:model-value="onChangeDirection"
              />
              <!-- Sélectionner un service -->
              <v-select
                v-model="selectedService"
                :items="filteredServices"
                item-title="nom"
                item-value="id"
                label="Sélectionner un service"
                outlined
                dense
                clearable
                style="color: #fffff; border-color: #6EC1B4;"
                :disabled="!selectedDirection"
                @update:model-value="findJourDispo"
              />

              <!-- Motif de la demande -->
              <v-textarea
                label="Motif de la demande"
                v-model="demandeMotif"
                outlined
                dense
                style="color: #fffff; border-color: #6EC1B4; margin-top: 1.5rem;"
                rows="4"
                required
              />
            </v-form>
          </v-card-text>
        </template>
        <template v-slot:item.2>
          <v-row justify="center" class="mt-4">
            <!-- Colonne: Sélection de la date -->
            <v-col cols="12" md="6">
              <v-date-picker
                v-model="selectedDate"
                :min="minDate"
                :allowed-dates="isAllowedDate"
                color="primary"
                header-color="primary"
                locale="fr"
                style="max-width: 400px; width: 100%"
                @update:model-value="fetchAvailableSlots"
              />
            </v-col>

            <!-- Colonne: Créneaux horaires -->
            <v-col cols="12" md="6" v-if="availableSlots.length > 0">
              <h2>Créneaux disponibles pour le {{ formatDate(selectedDate) }}</h2>
              <v-row>
                <v-col cols="12" sm="6" v-for="slot in availableSlots" :key="slot">
                  <v-btn
                    block
                    outlined
                    :color="selectedSlot === slot.heure ? 'primary' : ''"
                    class="mb-2"
                    @click="selectSlot(slot)"
                  >
                    {{ slot.heure }} - {{ slot.heure_fin }}
                  </v-btn>
                </v-col>
              </v-row>
            </v-col>
          </v-row>
        </template>
        <template v-slot:item.3>
          <v-card title="Information sur vous"   flat>
            <v-form ref="form">
              <v-row>
                <!-- Recherche de visiteur -->
                <v-col cols="12">
                  <v-text-field
                    v-model="searchKey"
                    label="Rechercher par email ou cin"
                    clearable
                    @blur="searchVisitor"
                  />
                </v-col>

                <!-- Informations sur le visiteur -->
                <v-col cols="12" md="6">
                  <v-text-field
                    v-model="visitor.nom"
                    label="Nom"
                    :rules="[rules.required]"
                    :disabled="visitorExists"
                  />
                </v-col>
                <v-col cols="12" md="6">
                  <v-text-field
                    v-model="visitor.prenom"
                    label="Prenom"
                    :rules="[rules.required]"
                    :disabled="visitorExists"
                  />
                </v-col>
                <v-col cols="12" md="6">
                  <v-text-field
                    v-model="visitor.cin"
                    label="Numero CIN"
                    :rules="[rules.required]"
                    :disabled="visitorExists"
                  />
                </v-col>
                <v-col cols="12" md="6">
                  <v-text-field
                    v-model="visitor.email"
                    label="Email"
                    :rules="[rules.email]"
                    :disabled="visitorExists"
                  />
                </v-col>
                <v-col cols="12" md="6">
                  <v-text-field
                    v-model="visitor.telephone"
                    label="Téléphone"
                    :disabled="visitorExists"
                  />
                </v-col>
                <v-col cols="12" md="6">
                  <v-select
                    v-model="selectedGenre"
                    :items="genres"
                    label="Sélectionner votre genre"
                    :rules="[rules.required]"
                    :disabled="visitorExists"
                  />
                </v-col>
                <v-col cols="12" md="6">
                  <v-text-field
                    v-model="visitor.entreprise"
                    label="Entreprise / Organisme"
                    :disabled="visitorExists"
                  />
                </v-col>
              </v-row>

              <v-btn
                color="primary"
                class="mt-4"
                @click="confirmRdv"
              >
                Confirmer
              </v-btn>
              <v-btn color="secondary" class="mt-4" @click="step = 1">Retour</v-btn>
            </v-form>
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
import Holidays from 'date-holidays';

export default {
  data() {
    return {
      // Etape 2
      selectedDate: null, // Date sélectionnée
      selectedSlot: null, // Créneau horaire sélectionné
      availableSlots: [], // Créneaux disponibles
      minDate: new Date().toISOString().substr(0, 10), // Date minimale (aujourd'hui)
      holidays: [], // Jours fériés
      allTimeSlots: [], // Tous les créneaux horaires
      joursDispo: [],

      // Etape 3
      visitor: {
        nom: "",
        prenom: "",
        cin: "",
        email: "",
        telephone: "",
        entreprise: ""
      },
      genres: [
        { title: 'Homme', value: 'Homme' },
        { title: 'Femme', value: 'Femme' },
      ],
      selectedGenre: null,
      visitorExists: false, // Flag pour désactiver les champs si un visiteur est trouvé
      idVisiteurExistant: null,
      searchKey: "", // Clé pour chercher dans la base (email ou téléphone)
      valid: false,
      rules: {
        required: (value) => !!value || "Ce champ est requis.",
        email: (value) =>
          /.+@.+\..+/.test(value) || "Veuillez entrer un email valide.",
      },

      // Etape 1
      services: [], // À remplir avec les services disponibles
      selectedService: null, // Service sélectionné
      demandeMotif: "", // Motif de la demande
      directions: [],
      selectedDirection: null,
      filteredServices: [],
      snackbar: {
        show: false,
        text: '',
        color: 'success'
      },

      currentStep: 1,
      step1Valid: false,
    };
  },
  watch: {
    // Watch for changes in direction and service selection
    selectedDirection(newVal) {
      this.step1Valid = newVal !== null;
      this.onChangeDirection();
    },
    selectedService(newVal) {
      if (newVal !== null) {
        this.step1Valid = true;
      } else {
        // If service is cleared, validity depends on direction
        this.step1Valid = this.selectedDirection !== null;
      }
    }
  },
  mounted() {
    this.fetchServices()
    this.fetchDirection()
    this.getHolidays()
  },
  methods: {
    async handleStepChange(newStep) {
      console.log("Changing to step:", newStep);
      console.log("Direction:", this.selectedDirection);
      console.log("Service:", this.selectedService);

      // Moving from step 1 to step 2
      if(newStep === 2) {
        if (!this.selectedDirection) {
          this.showError("Veuillez sélectionner une direction");
          this.currentStep = 1;
          return;
        }

        if(this.selectedDirection && !this.selectedService) {
          console.log("tonga ato ve?");
          await this.findJourDispo();
        }
      }
    },
    async fetchDirection() {
      const response = await fetch('http://localhost:8000/api/directions');
      if(response.ok) {
        const data = await response.json();
        this.directions = data.directions;
      }
    },
    onChangeDirection() {
      this.selectedService = null;
      if(this.selectedDirection) {
        this.filteredServices = this.services.filter(
          service => service.id_direction === this.selectedDirection
        );
      }
      // Si le service sélectionné n'est plus valide, réinitialisez-le
      if (!this.filteredServices.some(service => service.id === this.selectedDirection)) {
        this.selectedService = null;
      }
    },
    getHolidays(country = 'MG') {
      const hd = new Holidays();
      hd.init(country); // Charger les jours fériés du pays

      const currentYear = new Date().getFullYear();
      const nextYear = currentYear + 1;

      // Obtenir les jours fériés pour l'année en cours et l'année suivante
      const holidaysCurrentYear = hd.getHolidays(currentYear).map(holiday => holiday.date.split(' ')[0]);
      const holidaysNextYear = hd.getHolidays(nextYear).map(holiday => holiday.date.split(' ')[0]);

      const custom_holidays = [
        "2024-12-11",
        "2024-12-31",
        "2025-12-31"
      ]
      // Fusionner les deux années
      this.holidays = [...holidaysCurrentYear, ...holidaysNextYear, ...custom_holidays];

      // console.log(this.holidays);
    },
    async findJourDispo() {
      this.joursDispo = []; 
      const idService = this.selectedService;
      try {
        let url = 'http://localhost:8000/api/';
        if(this.selectedDirection && !this.selectedService) {
          url += `direction/${this.selectedDirection}/jours-disponible`;
        } else if(this.selectedService) {
          url += `service/${idService}/jours-disponible`;
        }
        console.log("url findJourDipo : " + url);
        const response = await fetch(url);

        if(response.ok) {
          const data = await response.json();
          const jourDispo = data.joursDispo;
          jourDispo.forEach(jour => {
            this.joursDispo.push(jour.jour);
          });
        }
      } catch (error) {
        console.log("error: " + error)
      }

    },
    toISODate(date) {
      const local = new Date(date);
        return `${local.getFullYear()}-${(local.getMonth() + 1).toString().padStart(2, "0")}-${local.getDate().toString().padStart(2, "0")}`;
    },
    // Vérifie si une date est autorisée
    isAllowedDate(date) {
      const isoDate = this.toISODate(date); // Convertir la date en ISO pour comparaison
      // console.log(isoDate)
      const day = new Date(date).getDay(); // Récupérer le jour de la semaine (0-6)

      // Vérification : jour présent dans joursDispo, non week-end, et pas un jour férié
      return (
          this.joursDispo.includes(day) && // Vérifie si le jour est autorisé
          day !== 0 && day !== 6 && // Facultatif : pour exclure week-ends si nécessaire
          !this.holidays.includes(isoDate) // Exclure les jours fériés
      );
    },
    async fetchCreneauxJour() {
      if(!this.selectedDate) return

      try {
        const idService = this.selectedService;
        const dayOfWeek = new Date(this.selectedDate).getDay();
        let url = 'http://localhost:8000/api';
        if(this.selectedDirection && !this.selectedService) {
          url += `/direction/${this.selectedDirection}/creneaux/${dayOfWeek}`;
        } else if(this.selectedService) {
          url += `/service/${idService}/creneaux/${dayOfWeek}`;
        }
        console.log("url fetchCreneauxJour : " + url);
        const response = await fetch(url);

        if(response.ok) {
          const data = await response.json();
          // const creneaux = data.creneaux;
          // creneaux.forEach(creneau => {
          //   this.allTimeSlots.push(this.formatTime(creneau.heure));
          // });
          this.allTimeSlots = data.creneaux.map(creneau => ({
            heure: this.formatTime(creneau.heure),
            heure_fin: this.formatTime(creneau.heure_fin)
          }));

          console.log(this.allTimeSlots)
          return this.allTimeSlots;
        }
      } catch (error) {
        console.log("error: " + error)
      }
    },
    // Charger les créneaux disponibles pour une date et un service
    async loadAvailableSlots() {
      if (!this.selectedDate || !this.selectedDirection) return;

      try {
        const date = this.toISODate(this.selectedDate);
        console.log("selectedDate: " + date + " selectedService: " + this.selectedService)
        let url = 'http://localhost:8000/api/rdv/heure-indisponible/';
        if(this.selectedDirection && !this.selectedService) {
          url += `direction/?date=${date}&id_direction=${this.selectedDirection}`;
        } else if(this.selectedService) {
          url += `service?date=${date}&id_service=${this.selectedService}`;
        }
        console.log("url avalaible slots : " + url);
        const response = await fetch(url);
        if (!response.ok) throw new Error("Erreur lors du chargement des indisponibilités.");

        // console.log("heure indispo: " + await response.json())
        const unavailableSlots = await response.json();
        console.log("invalide slots: " + unavailableSlots)
        // Filtrer les créneaux horaires en fonction des heures déjà prises
        const allSlots = await this.fetchCreneauxJour(); // Liste complète des créneaux
        this.allTimeSlots = [];

        return allSlots.filter(slot => !unavailableSlots.includes(slot.heure));
      } catch (error) {
          console.error(error);
          alert("Une erreur s'est produite lors du chargement des créneaux.");
      }
    },
    // Récupère les créneaux horaires disponibles
    async fetchAvailableSlots() {
      const isoDate = this.toISODate(this.selectedDate)
      // Exemple: vous pouvez remplacer par un appel API backend pour les disponibilités réelles
      if (this.holidays.includes(isoDate)) {
        this.availableSlots = []; // Pas de créneaux pour les jours fériés
      } else {
        this.availableSlots = await this.loadAvailableSlots();
      }
      this.selectedSlot = null; // Réinitialiser la sélection de créneau
    },
    // Sélection d'un créneau horaire
    selectSlot(slot) {
      this.selectedSlot = slot.heure;
    },
    // Formate une date
    formatDate(date) {
      return new Date(date).toLocaleDateString("fr-FR", {
          weekday: "long",
          year: "numeric",
          month: "long",
          day: "numeric",
      });
    },
    formatTime(time) {
      return time.split(":").slice(0, 2).join(":"); // Garde seulement les heures et minutes
    },
    async searchVisitor() {
      if (!this.searchKey) return;

      try {
        const search = encodeURIComponent(this.searchKey)
        console.log(search)
        const response = await fetch(
          `http://localhost:8000/api/visiteur/search?search=${search}`
        );
        if (!response.ok) throw new Error("Erreur lors de la recherche.");

        const data = await response.json();
        if (data && data.id) {
          // Visiteur trouvé
          this.visitor = {
            nom: data.nom,
            prenom: data.prenom,
            cin: data.cin,
            email: data.email,
            telephone: data.telephone,
          };
          this.idVisiteurExistant = data.id;
          console.log("idVisiteur: " + this.idVisiteurExistant)
          this.visitorExists = true;
          alert("Visiteur existant trouvé et informations chargées.");
        } else {
          // Aucun visiteur trouvé
          this.visitorExists = false;
          alert("Aucun visiteur trouvé, vous pouvez remplir les informations.");
        }
      } catch (error) {
        console.error(error);
        alert("Une erreur s'est produite lors de la recherche.");
      }
    },
    async createVisitor() {
      this.visitor = {...this.visitor, genre: this.selectedGenre};
      try {
          const response = await fetch("http://localhost:8000/api/visiteur", {
              method: "POST",
              headers: {
                  "Content-Type": "application/json",
              },
              body: JSON.stringify(this.visitor),
          });

          if (!response.ok) throw new Error("Erreur lors de la création du visiteur.");

          const data = await response.json();
          return data.id; // Retourne l'ID du visiteur créé
      } catch (error) {
          console.error(error);
          alert("Une erreur s'est produite lors de la création du visiteur.");
          return null;
      }
    },
    async fetchServices() {
      try {
        // const response = await get(`services`); // Charger les services depuis votre API
        const response = await fetch('http://localhost:8000/api/services'); // Charger les services depuis votre API
        if (response && response.ok) {
          const data = await response.json();
          this.services = data.services;// Adapter selon la structure de réponse
        }
      } catch (error) {
        this.showError("Erreur lors de la récupération des services : ", error);
      }
    },
    async fetchIntervalleDirection(idDir) {
      const response = await fetch(`http://localhost:8000/api/direction/${idDir}/intervalle`);

      let intervalle = null;
      if(response.ok) {
        const data = await response.json();
        if(data.intervalle) {
          intervalle = data.intervalle.intervalle;
        } else {
          intervalle = 30;
        }
      }

      return intervalle;
    },
    async fetchIntervalleService(idSer) {
      const response = await fetch(`http://localhost:8000/api/service/${idSer}/intervalle`);

      let intervalle = null;
      if(response.ok) {
        const data = await response.json();
        if(data.intervalle) {
          intervalle = data.intervalle.intervalle;
        } else {
          intervalle = 30;
        }
      }

      return intervalle;
    },
    async confirmRdv() {
      if (!this.selectedDate || !this.selectedSlot || !this.selectedDirection || !this.visitor.nom || !this.visitor.prenom || !this.visitor.cin || !this.demandeMotif) {
          alert("Veuillez remplir tous les champs requis.");
          return;
      }

      try {
          const date = this.toISODate(this.selectedDate);
          const dateHeure = `${date} ${this.selectedSlot}`;

          let [hours, minutes] = this.selectedSlot.split(":").map(Number);
          let selectedDateTime = new Date(date); // Créer un objet Date basé sur la date sélectionnée
          selectedDateTime.setHours(hours, minutes, 0); // Ajouter l'heure et les minutes


          let idVisiteur = null;
          if(!this.visitorExists) {
            idVisiteur = await this.createVisitor();
          } else {
            idVisiteur = this.idVisiteurExistant;
          }

          let intervalle = null;
          let heure_fin = null;
          if(this.selectedDirection && !this.selectedService) {
            intervalle = await this.fetchIntervalleDirection(this.selectedDirection);
          } else if(this.selectedService) {
            intervalle = await this.fetchIntervalleService(this.selectedService);
          }

          selectedDateTime.setMinutes(selectedDateTime.getMinutes() + intervalle);

          console.log("heure debut : ", this.selectedSlot)
          console.log("intervalle : ", intervalle);
          heure_fin = selectedDateTime.toTimeString().substring(0, 5);
          console.log("heure fin : ", heure_fin)
          const payload = {
              date_heure: dateHeure,
              heure_fin: heure_fin,
              id_direction: this.selectedDirection,
              id_service: this.selectedService,
              id_visiteur: idVisiteur, // Si le visiteur existe, utilisez son ID
              motif: this.demandeMotif,
          };
          console.log("date_heure: " + payload.date_heure + " id_direction: " + payload.id_direction + " id_service: " + payload.id_service + " id_visiteur: " + payload.id_visiteur + " motif: " + payload.motif)

          const response = await fetch("http://localhost:8000/api/rendez-vous/register", {
              method: "POST",
              headers: {
                  "Content-Type": "application/json",
              },
              body: JSON.stringify(payload),
          });

          if (!response.ok) {
              const errorData = await response.json();
              this.showError("Une erreur s'est produite lors de l'enregistrement du rendez-vous.");
              return;
          }

          const data = await response.json();
          this.showSuccess("Rendez-vous enregistré avec succès !");
          // console.log("Rendez-vous :", data.rdv);

          // // Réinitialisez le formulaire si nécessaire
          this.resetForm();
          this.currentStep = 1;
      } catch (error) {
        console.log(error)
          this.showError("Erreur réseau :", error);
      }
    },
    resetForm() {
      this.selectedDirection = null;
      this.selectedDate = null;
      this.selectedSlot = null;
      this.selectedService = null;
      this.demandeMotif = "";
      this.visitor = {
          nom: "",
          prenom: "",
          cin: "",
          email: "",
          telephone: "",
      };
      this.visitorExists = false;
      this.idVisiteurExistant = null;
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
