<template>
  <v-app>
    <v-container>
      <h1 class="text-center mt-15">Prise de Rendez-vous</h1>

      <v-stepper :items="['Etape 1', 'Etape 2', 'Etape 3']">
        <template v-slot:item.1>
          <v-card-text>
            <v-form>
              <!-- Sélectionner un service -->
              <v-select
                v-model="selectedService"
                :items="services"
                item-value="id"
                item-title="nom"
                label="Sélectionner un service"
                outlined
                dense
                style="color: #fffff; border-color: #6EC1B4;"
                required
                @update:model-value="findJourDispo"
              ></v-select>

              <!-- Motif de la demande -->
              <v-textarea
                label="Motif de la demande"
                v-model="demandeMotif"
                outlined
                dense
                style="color: #fffff; border-color: #6EC1B4; margin-top: 1.5rem;"
                rows="4"
                required
              ></v-textarea>
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
              ></v-date-picker>
            </v-col>

            <!-- Colonne: Créneaux horaires -->
            <v-col cols="12" md="6" v-if="availableSlots.length > 0">
              <h2>Créneaux disponibles pour le {{ formatDate(selectedDate) }}</h2>
              <v-row>
                <v-col cols="12" sm="6" v-for="slot in availableSlots" :key="slot">
                  <v-btn
                    block
                    outlined
                    :color="selectedSlot === slot ? 'primary' : ''"
                    class="mb-2"
                    @click="selectSlot(slot)"
                  >
                    {{ slot }}
                  </v-btn>
                </v-col>
              </v-row>
            </v-col>
          </v-row>
        </template>

        <template v-slot:item.3>
          <v-card title="Information sur vous"   flat>
            <v-form ref="form" v-model="valid">
            <v-row>
              <!-- Recherche de visiteur -->
              <v-col cols="12">
                <v-text-field
                  v-model="searchKey"
                  label="Rechercher par email ou cin"
                  @blur="searchVisitor"
                  :rules="[rules.required]"
                  clearable
                ></v-text-field>
              </v-col>

              <!-- Informations sur le visiteur -->
              <v-col cols="12" md="6">
                <v-text-field
                  v-model="visitor.nom"
                  label="Nom"
                  :rules="[rules.required]"
                  :disabled="visitorExists"
                ></v-text-field>
              </v-col>
              <v-col cols="12" md="6">
                <v-text-field
                  v-model="visitor.prenom"
                  label="Prenom"
                  :rules="[rules.required]"
                  :disabled="visitorExists"
                ></v-text-field>
              </v-col>
              <v-col cols="12" md="6">
                <v-text-field
                  v-model="visitor.cin"
                  label="Numero CIN"
                  :rules="[rules.required]"
                  :disabled="visitorExists"
                ></v-text-field>
              </v-col>
              <v-col cols="12" md="6">
                <v-text-field
                  v-model="visitor.email"
                  label="Email"
                  :rules="[rules.required, rules.email]"
                  :disabled="visitorExists"
                ></v-text-field>
              </v-col>
              <v-col cols="12" md="6">
                <v-text-field
                  v-model="visitor.telephone"
                  label="Téléphone"
                  :rules="[rules.required]"
                  :disabled="visitorExists"
                ></v-text-field>
              </v-col>
            </v-row>

            <v-btn
              color="primary"
              class="mt-4"
              :disabled="!valid"
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
  </v-app>
</template>


<script>
import { get } from '@/service/ApiService.js';
import Holidays from 'date-holidays';

export default {
  data() {
    return {
      // Etape 2
      selectedDate: null, // Date sélectionnée
      selectedSlot: null, // Créneau horaire sélectionné
      availableSlots: [], // Créneaux disponibles
      minDate: new Date().toISOString().substr(0, 10), // Date minimale (aujourd'hui)
      // holidays: ["2024-12-25", "2024-12-31"], // Jours fériés
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
      },
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
    };
  },
  mounted() {
    this.fetchServices()
    this.getHolidays()
  },
  methods: {
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
      if(this.selectedService) {
        console.log(this.selectedService)
        const token = localStorage.getItem('token');
        const idService = this.selectedService;
        try {
          const response = await fetch(`http://localhost:8000/api/service/${idService}/jours-disponible`, {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            }
          });

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
        const token = localStorage.getItem('token');
        const response = await fetch(`http://localhost:8000/api/service/${idService}/creneaux/${dayOfWeek}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        });

        if(response.ok) {
          const data = await response.json();
          const creneaux = data.creneaux;
          creneaux.forEach(creneau => {
            this.allTimeSlots.push(this.formatTime(creneau.heure));
          });

          console.log(this.allTimeSlots)
          return this.allTimeSlots;
        }
      } catch (error) {
        
      }
    },
    // Charger les créneaux disponibles pour une date et un service
    async loadAvailableSlots() {
      if (!this.selectedDate || !this.selectedService) return;

      try {
        const date = this.toISODate(this.selectedDate);
        console.log("selectedDate: " + date + " selectedService: " + this.selectedService)
        const response = await fetch(`http://localhost:8000/api/rdv/heure-indisponible?date=${date}&id_service=${this.selectedService}`,
          {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
            }
        });
        if (!response.ok) throw new Error("Erreur lors du chargement des indisponibilités.");

        // console.log("heure indispo: " + await response.json())
        const unavailableSlots = await response.json();
        console.log("invalide slots: " + unavailableSlots)
        // Filtrer les créneaux horaires en fonction des heures déjà prises
        const allSlots = await this.fetchCreneauxJour(); // Liste complète des créneaux
        this.allTimeSlots = [];

        return allSlots.filter(slot => !unavailableSlots.includes(slot));
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
      this.selectedSlot = slot;
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
        const response = await get('services'); // Charger les services depuis votre API
        if (response && response.ok) {
          const data = await response.json();
          this.services = data.services // Adapter selon la structure de réponse
        }
      } catch (error) {
        console.error("Erreur lors de la récupération des services :", error);
      }
    },
    async confirmRdv() {
      if (!this.selectedDate || !this.selectedSlot || !this.selectedService || !this.visitor.nom || !this.visitor.prenom || !this.visitor.cin || !this.visitor.email || !this.visitor.telephone || !this.demandeMotif) {
          alert("Veuillez remplir tous les champs requis.");
          return;
      }

      try {
          const date = this.toISODate(this.selectedDate);
          const dateHeure = `${date} ${this.selectedSlot}`;
          let idVisiteur = null;
          if(!this.visitorExists) {
            idVisiteur = await this.createVisitor();
          } else {
            idVisiteur = this.idVisiteurExistant;
          }
          const payload = {
              date_heure: dateHeure,
              id_service: this.selectedService,
              id_visiteur: idVisiteur, // Si le visiteur existe, utilisez son ID
              motif: this.demandeMotif,
          };
          console.log("date_heure: " + payload.date_heure + " id_service: " + payload.id_service + " id_visiteur: " + payload.id_visiteur + " motif: " + payload.motif)

          const response = await fetch("http://localhost:8000/api/rendez-vous/register", {
              method: "POST",
              headers: {
                  "Content-Type": "application/json",
              },
              body: JSON.stringify(payload),
          });

          if (!response.ok) {
              const errorData = await response.json();
              console.error("Erreur lors de l'enregistrement :", errorData);
              alert("Une erreur s'est produite lors de l'enregistrement du rendez-vous.");
              return;
          }

          const data = await response.json();
          alert("Rendez-vous enregistré avec succès !");
          console.log("Rendez-vous :", data.rdv);

          // Réinitialisez le formulaire si nécessaire
          this.resetForm();
      } catch (error) {
          console.error("Erreur réseau :", error);
          alert("Une erreur réseau s'est produite.");
      }
    },
    resetForm() {
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