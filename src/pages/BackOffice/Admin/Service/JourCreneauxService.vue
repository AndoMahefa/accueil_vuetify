<template>
  <div class="container">
    <div class="page-title">
      <span class="title-text">Gestion des Disponibilités des jours et créneaux horaires</span>
    </div>

    <v-row>
      <v-col cols="12" md="3">
        <v-select
          v-model="selectedDirection"
          :items="directions"
          label="Sélectionner une direction"
          item-title="nom"
          item-value="id"
          clearable
          @update:model-value="onDirectionChange"
        />
      </v-col>
      <v-col cols="12" md="3">
        <v-select
          v-model="selectedService"
          :items="filteredServices"
          label="Sélectionner un service"
          item-title="nom"
          item-value="id"
          :disabled="!selectedDirection"
          clearable
        />
      </v-col>
      <v-col cols="12" md="3">
        <v-btn
          color="blue"
          height="55px"
          :disabled="!selectedDirection"
          @click="getCreneaux"
        >
          Choisir
        </v-btn>
      </v-col>
      <v-col cols="12" md="3">
        <v-btn color="blue" height="55px" @click="openIntervalModal">Paramétrer l'intervalle</v-btn>
      </v-col>
    </v-row>
    <v-row>
      <v-col>
        <div class="disponibilites-container">
          <v-card
            v-for="jour in jours"
            :key="jour.id"
            class="jour-card"
            style="background-color: #f5f5f5;"
          >
            <!-- Titre du jour avec un fond coloré -->
            <v-card-title class="jour-title py-4" style="background-color: #007BFF; color: white;">
              <h3 class="font-weight-bold">{{ jour.nom }}</h3>
              <div style="display:flex; gap: 10px;">
                <!-- Icône pour ajouter un créneau -->
                <v-btn icon color="primary" @click="ouvrirModal(jour.id)">
                  <v-icon size="25">mdi-plus</v-icon>
                </v-btn>
                <!-- Icône pour supprimer le jour -->
                <v-btn icon color="red" @click="openDeleteModal(jour.id)">
                  <v-icon size="25">mdi-delete</v-icon>
                </v-btn>
              </div>
            </v-card-title>

            <v-card-subtitle class="py-2">
              <div class="mb-3 text-center">
                <h3 style="color: #007BFF;">Matin</h3>
                <v-list>
                  <v-list-item
                    v-for="cre in matinCreneaux(jour.id)"
                    :key="'matin-' + cre.id"
                  >
                    <v-list-item-content>
                      <v-list-item-title>{{ cre.heure }}</v-list-item-title>
                    </v-list-item-content>
                  </v-list-item>
                </v-list>
              </div>

              <div class="time-section">
                <h4 class="mb-3 text-center" style="color: #007BFF;">Après-midi</h4>
                <v-list>
                  <v-list-item
                    v-for="cre in apresMidiCreneaux(jour.id)"
                    :key="'apres-midi-' + cre.id"
                  >
                    <v-list-item-content>
                      <v-list-item-title>{{ cre.heure }}</v-list-item-title>
                    </v-list-item-content>
                  </v-list-item>
                </v-list>
              </div>
            </v-card-subtitle>
          </v-card>
        </div>
      </v-col>
    </v-row>

    <!-- Modal -->
    <v-dialog v-model="modalVisible" max-width="750px" width="100%">
      <v-card>
        <v-card-title>
          <span class="text-h6">
            Ajouter des créneaux pour {{ nouveauJour[0].nom }}
          </span>
        </v-card-title>
        <v-card-text>
          <v-container>
            <v-row>
              <v-col cols="12" md="6">
                <v-select
                  v-model="selectedDirection"
                  :items="directions"
                  label="Sélectionner une direction"
                  item-title="nom"
                  item-value="id"
                  clearable
                  @update:model-value="onDirectionChange"
                />
              </v-col>
              <v-col cols="12" md="6">
                <v-select
                  v-model="selectedService"
                  :items="filteredServices"
                  label="Sélectionner un service"
                  item-title="nom"
                  item-value="id"
                  :disabled="!selectedDirection"
                  clearable
                />
              </v-col>
            </v-row>
            <v-row>
              <v-col cols="12" v-if="!jourSelectionne">
                <v-select
                  v-model="nouveauJour"
                  :items="jours"
                  label="Choisir un jour"
                  item-title="nom"
                  item-value="id"
                />
              </v-col>
              <v-col cols="6">
                <v-time-picker
                  v-model="heureDebut"
                  format="24hr"
                  label="Heure de début"
                  class="custom-time-picker"
                />
              </v-col>
              <v-col cols="6">
                <v-time-picker
                  v-model="heureFin"
                  label="Heure de fin"
                  format="24hr"
                  class="custom-time-picker"
                />
              </v-col>
            </v-row>
          </v-container>
        </v-card-text>
        <v-card-actions>
          <v-btn text class="btn-cancel" @click="fermerModal">Annuler</v-btn>
          <v-btn
            text class="btn-validate"
            :disabled="!heureDebut || !heureFin || (convertirEnMinutes(heureDebut) >= convertirEnMinutes(heureFin))"
            @click="ajouterCreneaux"
          >
            Ajouter
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Modal de confirmation -->
    <v-dialog v-model="isDeleteModalOpen" max-width="500px">
      <v-card>
        <v-card-title class="text-h6">
          Confirmer la suppression
        </v-card-title>
        <v-card-text>
          <p>Choisissez les créneaux horaires à supprimer :</p>
          <v-container>
            <v-checkbox
              v-model="selectedPeriodes"
              label="Matin"
              value="matin"
            />
            <v-checkbox
              v-model="selectedPeriodes"
              label="Apres-midi"
              value="apres-midi"
            />
          </v-container>
        </v-card-text>
        <v-card-actions>
          <v-btn text @click="cancelDelete">Annuler</v-btn>
          <v-btn color="error" @click="confirmDelete">Supprimer</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Modal pour paramétrer l'intervalle -->
    <v-dialog v-model="isIntervalModalOpen" max-width="500px" width="100%">
      <v-card>
        <v-card-title>
          <span class="text-h6">Définir l'intervalle de temps</span>
        </v-card-title>
        <v-card-text>
          <v-col cols="12">
            <v-select
              v-model="selectedDirectionIntervalle"
              :items="directions"
              label="Sélectionner une direction"
              item-title="nom"
              item-value="id"
              clearable
              @update:model-value="onDirectionChangeInt"
            />
          </v-col>
          <v-col cols="12">
            <v-select
              v-model="selectedServiceIntervalle"
              :items="filteredServices"
              label="Sélectionner un service"
              item-title="nom"
              item-value="id"
              :disabled="!selectedDirectionIntervalle"
              clearable
            />
          </v-col>
          <v-text-field
            v-model="intervalleTemps"
            label="Intervalle en minutes"
            type="number"
            min="1"
            clearable
          />
        </v-card-text>
        <v-card-actions>
          <v-btn text @click="fermerIntervalModal">Annuler</v-btn>
          <v-btn text @click="saveInterval">Enregistrer</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Snackbar -->
    <v-snackbar
      v-model="snackbar.show"
      :color="snackbar.color"
      :timeout="3000"
      location="top"
    >
      {{ snackbar.text }}
    </v-snackbar>
  </div>
</template>


<script>
import { del, get, post } from '@/service/ApiService';

export default {
  data() {
    return {
      intervalle: null,
      creneaux: [],
      jours: [
        { id: 1, nom: "Lundi" },
        { id: 2, nom: "Mardi" },
        { id: 3, nom: "Mercredi" },
        { id: 4, nom: "Jeudi" },
        { id: 5, nom: "Vendredi" }
      ],
      modalVisible: false,
      jourSelectionne: null, // Nom du jour en cours de modification
      nouveauJour: "", // Nom du jour pour un nouvel ajout
      heureDebut: null,
      heureFin: null,

      isDeleteModalOpen: false, // Contrôle l'ouverture du modal
      selectedPeriodes: [],     // Option sélectionnée (matin, après-midi, ou les deux)

      services: [],
      filteredServices: [],
      selectedService: null,

      directions: [],
      selectedDirection: null,

      snackbar: {
        show: false,
        text: '',
        color: 'success'
      },

      selectedDirectionIntervalle: null,
      selectedServiceIntervalle: null,
      isIntervalModalOpen: false,
      intervalleTemps: null,
    };
  },
  async mounted() {
    this.fetchDirections();
    this.fetchServices();
  },
  methods: {
    async fetchDirections() {
      const response = await get('directions');
      if(response.ok) {
        const data = await response.json();
        this.directions = data.directions;
      }
    },
    onDirectionChange() {
      this.selectedService = null;

      if (this.selectedDirection) {
        // Filtrer les services pour la direction sélectionnée
        this.filteredServices = this.services.filter(
          service => service.id_direction === this.selectedDirection
        );
      }
    },
    onDirectionChangeInt() {
      this.selectedService = null;

      if (this.selectedDirectionIntervalle) {
        // Filtrer les services pour la direction sélectionnée
        this.filteredServices = this.services.filter(
          service => service.id_direction === this.selectedDirection
        );
      }
    },
    matinCreneaux(jourId) {
      const response = this.creneaux.filter(cre => cre.jour == jourId && cre.heure <= '12:00:00')

      return response
    },
    apresMidiCreneaux(jourId) {
      const response = this.creneaux.filter(cre => cre.jour == jourId && cre.heure > '12:00:00')

      return response;
    },
    async ouvrirModal(jour) {
      this.jourSelectionne = jour;
      this.nouveauJour = await this.findJour();
      this.heureDebut = null;
      this.heureFin = null;
      this.modalVisible = true;
      this.selectedDirection = null;
      this.selectedService = null;
    },
    fermerModal() {
      this.modalVisible = false;
    },
    async saveCreneaux(data) {
      try {
        const response = await post('service/creneaux-register', {
          ...data
        })

        if (!response.ok) {
          throw new Error(`Erreur HTTP: ${response.status}`);
        }


        return await response.json();
      } catch (error) {
        console.error("Erreur d'appel API:", error);
        throw error;
      }
    },
    async ajouterCreneaux() {
      if (!this.heureDebut || !this.heureFin) {
        this.showError("Veuillez sélectionner des heures valides.");
        return;
      }

      const debut = this.convertirEnMinutes(this.heureDebut);
      const fin = this.convertirEnMinutes(this.heureFin);
      if (debut >= fin) {
        this.showError("L'heure de début doit être avant l'heure de fin.");
        return;
      }

      let id_service = null;
      if(this.selectedService) {
        id_service = this.selectedService;
        this.intervalle = await this.findIntervalByService();
        // console.log("service ny ato")
      }
      if(this.selectedDirection && !this.selectedService) {
        // console.log("direction no ato")
        this.intervalle = await this.findIntervalByDirection()
      }

      // this.intervalle = this.intervalleTemps || (this.selectedDirection === "1" ? 60 : this.selectedDirection === "4" ? 30 : 40);
      if(this.intervalle == null) {
        this.intervalle = 40;
      }
      console.log("intervalle utilise : "+this.intervalle)

      let creneaux = [];
      let heureActuelle = debut;
      while (heureActuelle <= fin) {
        creneaux.push(this.convertirEnHeure(heureActuelle));
        heureActuelle += this.intervalle;
      }

      let id_direction = this.selectedDirection;
      const jour = this.jourSelectionne || this.nouveauJour;
      const creneauData = {
        jour,
        creneaux,
        id_direction,
        id_service,
      };
      console.log("jour: " + creneauData.jour + " creneaux: " + creneauData.creneaux + " id_direction : "+ creneauData.id_direction +" id_service: " + creneauData.id_service)

      try {
        // Appel de la fonction saveCreneaux
        await this.saveCreneaux(creneauData);
        this.showSuccess("Créneaux ajoutés avec succès !");
        this.getCreneaux();
        creneaux = [];
        this.selectedDirection = null;
        this.selectedService = null;
      } catch (error) {
        console.error(error);
        this.showError("Une erreur est survenue lors de l'ajout des créneaux.")
      }

      this.fermerModal();
    },
    async getCreneaux() {
      try {
        let endpoint = '';
        if(this.selectedDirection && !this.selectedService) {
          endpoint = `direction/${this.selectedDirection}/creneaux`;
        } else if (this.selectedDirection && this.selectedService) {
          endpoint = `service/${this.selectedService}/creneaux`;
        }
        const response = await get(endpoint)

        if (!response.ok) {
          throw new Error(`Erreur HTTP: ${response.status}`);
        }

        if(response.ok) {
          const data = await response.json();
          if(data && data.length != 0) {
            this.creneaux = data.creneaux;
            console.log(this.creneaux)
          }
        }

      } catch (error) {
        console.error("Erreur d'appel API:", error);
        throw error;
      }
    },
    convertirEnMinutes(heure) {
      const [h, m] = heure.split(":").map(Number);
      return h * 60 + m;
    },
    convertirEnHeure(minutes) {
      const h = Math.floor(minutes / 60)
        .toString()
        .padStart(2, "0");
      const m = (minutes % 60).toString().padStart(2, "0");
      return `${h}:${m}`;
    },
    openDeleteModal(idJour) {
      this.jourSelectionne = idJour;
      this.isDeleteModalOpen = true;
    },
    cancelDelete() {
      this.isDeleteModalOpen = false;
      this.selectedPeriodes = []; // Réinitialise l'option sélectionnée
    },
    async confirmDelete() {
      if (this.selectedPeriodes && this.jourSelectionne) {
        console.log("selectedPeriodes: " + this.selectedPeriodes)
        console.log("joursSelectionne: " + this.jourSelectionne)
        // Appeler l'API pour supprimer les créneaux
        await this.deleteCreneaux(this.selectedPeriodes);
      } else {
        alert("Veuillez sélectionner une option !");
      }
    },
    async deleteCreneaux(option) {
      const idService = this.selectedService;
      try {
        const response = await del(`service/${idService}/delete-creneaux/${this.jourSelectionne}`, {
          'periodes': option
        })

        if (response.ok) {
          alert("Les créneaux ont été supprimés !");
          this.getCreneaux();
        } else {
          alert("Erreur lors de la suppression !");
        }
      } catch (error) {
        console.error("Erreur:", error);
      }
      this.cancelDelete(); // Fermer le modal après l'opération
    },
    async fetchServices() {
      // const idService = localStorage.getItem("idService");
      try {
          // const response = await get(`accueil/services/${idService}`); // Charger les services depuis votre API
          const response = await get(`accueil/services`); // Charger les services depuis votre API
          if (response && response.ok) {
              this.services = await response.json(); // Adapter selon la structure de réponse
          }
      } catch (error) {
          console.error("Erreur lors de la récupération des services :", error);
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
    openIntervalModal() {
      this.isIntervalModalOpen = true;
    },
    fermerIntervalModal() {
      this.isIntervalModalOpen = false;
    },
    async saveInterval() {
      const response = await post('intervalle', {
        'intervalle': this.intervalleTemps,
        'id_direction' : this.selectedDirectionIntervalle,
        'id_service' : this.selectedServiceIntervalle
      });
      if(response.ok) {
        this.showSuccess('Intervalle ajouté avec succes');
        this.selectedDirectionIntervalle = null;
        this.selectedServiceIntervalle = null;
        this.fermerIntervalModal();
      } else {
        this.showError('Echec de l\'ajout');
      }
    },
    async findIntervalByDirection() {
      const response = await get(`direction/${this.selectedDirection}/intervalle`);
      if(response.ok) {
        const data = await response.json();
        // this.intervalle = data.intervalle.intervalle;
        return data.intervalle.intervalle;
      }
    },
    async findIntervalByService() {
      const response = await get(`service/${this.selectedService}/intervalle`);
      if(response.ok) {
        const data = await response.json();
        // this.intervalle = data.intervalle.intervalle;
        return data.intervalle.intervalle;
      }
    },
    async findJour() {
      const response = await get(`jour/${this.jourSelectionne}`);
      if(response.ok) {
        const data = await response.json();
        console.log(data)

        return data;
      }
    }
  },
}
</script>

<style scoped>
  .container {
    display: flex;
    flex-direction: column;
    padding: 20px 50px;
  }

  .v-card-title {
    display: flex;
    justify-content: space-between;
  }
  /* Titre de la page */
  .page-title {
    display: flex;
    justify-content: center;
    align-items: center;
    font-family: 'Roboto', Arial, Helvetica, sans-serif;
    font-size: 1.8rem;
    font-weight: 500;
    color: #333;
    margin-bottom: 24px;
    text-transform: uppercase;
    letter-spacing: 1px;
  }

  /* Conteneur des cartes de disponibilités */
  .disponibilites-container {
    display: flex;
    flex-wrap: wrap;
    justify-content: space-around;
    gap: 5px;
    margin-top: 16px;
  }

  /* Style des cartes */
  .jour-card {
    width: 100%;
    max-width: 250px;
    background-color: #f5f5f5;
    border-radius: 8px;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    transition: transform 0.3s, box-shadow 0.3s;
  }

  .jour-card:hover {
    transform: translateY(-5px);
    box-shadow: 0 6px 12px rgba(0, 0, 0, 0.15);
  }

  /* Titre du jour */
  .jour-title {
    background-color: #007bff;
    color: white;
    font-family: 'Roboto', sans-serif;
    font-size: 1.2rem;
    font-weight: bold;
    text-align: left;
    border-top-left-radius: 8px;
    border-top-right-radius: 8px;
  }

  /* Bouton Planifier */
  .custom-btn {
    background-color: #007bff;
    color: white;
    text-transform: none;
    font-size: 0.9rem;
    font-weight: 500;
    padding: 6px 12px;
    border-radius: 4px;
  }

  .custom-btn:hover {
    background-color: #0056b3;
  }

  /* Liste des créneaux */
  .v-list {
    background: transparent !important;
  }

  .v-list-item {
    text-align: center !important;
    font-weight: 400 !important;
    padding: 8px 16px !important;
    border-bottom: 1px solid #e0e0e0 !important;
    transition: background-color 0.3s !important;
  }

  .v-list-item-content {
    font-size: 1.6rem !important;
    color: #000 !important;
  }

  /* Modal */
  .v-dialog .v-card {
    border-radius: 12px;
    box-shadow: 0 8px 16px rgba(0, 0, 0, 0.2);
  }

  .v-dialog .v-card-title {
    font-size: 1.25rem;
    font-weight: 600;
    background-color: #007bff;
    color: whitesmoke;
    padding: 16px;
  }

  .v-dialog .v-card-text {
    padding: 16px;
  }

  .v-dialog .btn-cancel {
    color: #ff4d4d;
  }

  .v-dialog .btn-validate {
    background-color: #007bff;
    color: white;
    text-transform: none;
  }

  .v-dialog .btn-validate:disabled {
    background-color: #b0c4de;
    color: #fff;
    cursor: not-allowed;
  }

/* Responsive Design */
  @media (max-width: 600px) {
    .disponibilites-container {
      flex-direction: column;
      align-items: center;
    }

    .jour-card {
      max-width: 100%;
    }
  }

/* icone */
  .bg-primary{
    background-color: transparent !important;
  }
  .v-btn--icon.v-btn--density-default {
    width: calc(var(--v-btn-height)) !important;
    height: calc(var(--v-btn-height)) !important;
  }
</style>
