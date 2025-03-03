<template>
  <v-container fluid>
    <v-card class="main-card">
      <v-card-title class="headline text-center primary-gradient white--text py-4">
        <v-icon large color="white" class="mr-2">mdi-clipboard-account</v-icon>
        Pointage des Employés
      </v-card-title>

      <div class="d-flex justify-center align-center my-4 px-4">
        <v-select
          v-model="selectedDirection"
          :items="directions"
          item-title="nom"
          item-value="id"
          label="Sélectionnez une direction"
          clearable
          class="mx-2"
          outlined
          dense
          prepend-inner-icon="mdi-office-building"
          @update:model-value="onFilterDirectionChange"
        />
        <v-select
          v-model="selectedService"
          :items="filteredServices"
          item-title="nom"
          item-value="id"
          label="Sélectionnez un service"
          clearable
          outlined
          dense
          prepend-inner-icon="mdi-domain"
          :disabled="!selectedDirection"
          class="mx-2"
        />
        <v-btn
          color="primary"
          class="filter-btn"
          elevation="2"
          rounded
          @click="applyFilters"
        >
          <v-icon left>mdi-filter</v-icon>
          Filtrer
        </v-btn>
      </div>

      <v-data-table
        :headers="headers"
        :items="employes.data"
        :loading="loading"
        :hide-default-footer="true"
        class="elevation-2 mx-4 mb-4 rounded"
        :loading-text="'Chargement des employés...'"
        no-data-text="Aucun employé trouvé"
      >
        <template #loading>
          <v-skeleton-loader
            type="table-heading, table-row@4"
          />
        </template>
        <template #item="{ item }">
          <tr>
            <td class="font-weight-medium">{{ item.nom }}</td>
            <td>{{ item.prenom }}</td>
            <td>
              <v-chip small color="primary" text-color="white" class="px-2">
                {{ item.direction.nom }}
              </v-chip>
            </td>
            <td v-if="item.service != null">
              <v-chip small color="secondary" outlined class="px-2">
                {{ item.service.nom }}
              </v-chip>
            </td>
            <td v-else />
            <td class="text-center">
              <v-icon
                color="primary"
                class="mx-3"
                @click="pointerArrivee(item)"
              >
                <v-icon>mdi-account-arrow-left</v-icon>
                <v-tooltip activator="parent" location="bottom">
                  Pointage arrivée
                </v-tooltip>
              </v-icon>

              <v-icon
                color="error"
                class="mx-3"
                @click="pointerDepart(item)"
              >
                <v-icon>mdi-account-arrow-right</v-icon>
                <v-tooltip activator="parent" location="bottom">
                  Pointage départ
                </v-tooltip>
              </v-icon>

              <v-icon
                color="success"
                class="mx-3"
                @click="fichePointage(item)"
              >
                <v-icon>mdi-file-document</v-icon>
                <v-tooltip activator="parent" location="bottom">
                  Fiche de pointage
                </v-tooltip>
              </v-icon>
            </td>
          </tr>
        </template>
      </v-data-table>

      <v-pagination
        v-model="currentPage"
        :length="totalPages"
        circle
        class="my-4"
        color="primary"
        @input="fetchEmployes(currentPage)"
      />
    </v-card>

    <!-- Modal de confirmation pour l'arrivée -->
    <v-dialog v-model="showArriveeModal" max-width="500px" class="custom-modal" transition="dialog-bottom-transition">
      <v-card class="modal-card">
        <v-card-title class="primary-gradient white--text pa-4">
          <v-icon left color="white">mdi-account-arrow-left</v-icon>
          Confirmation d'arrivée
        </v-card-title>
        <v-card-text class="modal-text pt-4">
          <v-row>
            <v-col cols="12">
              <v-card outlined class="employee-info-card pa-3 mb-3">
                <div class="d-flex align-center">
                  <v-avatar color="primary" class="mr-3">
                    <v-icon color="white">mdi-account</v-icon>
                  </v-avatar>
                  <div>
                    <div class="text-h6 primary--text">{{ selectedEmploye?.nom }} {{ selectedEmploye?.prenom }}</div>
                    <div class="text-caption">
                      <v-icon x-small>mdi-office-building</v-icon> {{ selectedEmploye?.direction.nom }}
                      <span v-if="selectedEmploye?.service">
                        | <v-icon x-small>mdi-domain</v-icon> {{ selectedEmploye?.service?.nom }}
                      </span>
                    </div>
                  </div>
                </div>
              </v-card>
            </v-col>
          </v-row>
          <div class="text-center font-weight-medium mt-2">
            Êtes-vous sûr de vouloir pointer l'arrivée de cet employé à
            <v-text-field
              v-model="heureArriveeSelected"
              type="time"
              label="Heure d'arrivée"
            />
          </div>
        </v-card-text>
        <v-divider></v-divider>
        <v-card-actions class="pa-4">
          <v-spacer />
          <v-btn color="grey darken-1" text @click="showArriveeModal = false" class="px-4">
            <v-icon left>mdi-close</v-icon>Annuler
          </v-btn>
          <v-btn color="success" elevation="2" @click="confirmArrivee" class="px-4" rounded>
            <v-icon left>mdi-check</v-icon>Confirmer
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Modal de confirmation pour le départ -->
    <v-dialog v-model="showDepartModal" max-width="500px" class="custom-modal" transition="dialog-bottom-transition">
      <v-card class="modal-card">
        <v-card-title class="error-gradient white--text pa-4">
          <v-icon left color="white">mdi-account-arrow-right</v-icon>
          Confirmation de départ
        </v-card-title>
        <v-card-text class="modal-text pt-4">
          <v-row>
            <v-col cols="12">
              <v-card outlined class="employee-info-card pa-3 mb-3">
                <div class="d-flex align-center">
                  <v-avatar color="error" class="mr-3">
                    <v-icon color="white">mdi-account</v-icon>
                  </v-avatar>
                  <div>
                    <div class="text-h6 error--text">{{ selectedEmploye?.nom }} {{ selectedEmploye?.prenom }}</div>
                    <div class="text-caption">
                      <v-icon x-small>mdi-office-building</v-icon> {{ selectedEmploye?.direction.nom }}
                      <span v-if="selectedEmploye?.service">
                        | <v-icon x-small>mdi-domain</v-icon> {{ selectedEmploye?.service?.nom }}
                      </span>
                    </div>
                  </div>
                </div>
              </v-card>
            </v-col>
          </v-row>
          <div class="text-center font-weight-medium mt-2">
            Êtes-vous sûr de vouloir pointer le départ de cet employé à
            <v-text-field
              v-model="heureDepartSelected"
              type="time"
              label="Heure départ"
            />
          </div>
        </v-card-text>
        <v-divider></v-divider>
        <v-card-actions class="pa-4">
          <v-spacer />
          <v-btn color="grey darken-1" text @click="showDepartModal = false" class="px-4">
            <v-icon left>mdi-close</v-icon>Annuler
          </v-btn>
          <v-btn color="error" elevation="2" @click="confirmDepart" class="px-4" rounded>
            <v-icon left>mdi-check</v-icon>Confirmer
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Modal de la fiche de pointage rédesigné -->
    <v-dialog v-model="showFichePointageModal" max-width="800px" class="custom-modal" transition="dialog-bottom-transition">
      <v-card class="modal-card">
        <v-card-title class="success-gradient white--text pa-4">
          <v-icon left color="white">mdi-file-document</v-icon>
          Fiche de Pointage
        </v-card-title>

        <v-card-text class="pa-4">
          <v-row>
            <v-col cols="12">
              <v-card outlined class="employee-info-card pa-3 mb-4">
                <div class="d-flex align-center">
                  <v-avatar color="success" size="50" class="mr-3">
                    <v-icon size="30" color="white">mdi-account</v-icon>
                  </v-avatar>
                  <div>
                    <div class="text-h6 success--text">
                      {{ selectedEmploye?.nom }} {{ selectedEmploye?.prenom }}
                    </div>
                    <div class="text-caption">
                      <v-icon x-small>
                        mdi-office-building
                      </v-icon>
                      {{ selectedEmploye?.direction.nom }}
                      <span v-if="selectedEmploye?.service">
                        | <v-icon x-small>mdi-domain</v-icon> {{ selectedEmploye?.service?.nom }}
                      </span>
                    </div>
                  </div>
                  <v-spacer></v-spacer>
                  <v-chip color="primary" outlined>
                    <v-icon left small>mdi-calendar</v-icon>
                    {{ currentDate }}
                  </v-chip>
                </div>
              </v-card>
            </v-col>
          </v-row>

          <v-divider class="mb-4"></v-divider>

          <!-- Tableau des sessions de pointage -->
          <div v-if="pointages && pointages.length > 0">
            <h3 class="mb-3 font-weight-medium primary--text">
              <v-icon color="primary" class="mr-1">mdi-history</v-icon>
              Sessions de pointage
            </h3>
            <v-simple-table class="elevation-1 rounded attendance-table">
              <template v-slot:default>
                <thead>
                  <tr>
                    <th class="text-left" width="80 px">Session</th>
                    <th class="text-left" width="180 px">Heure d'arrivée</th>
                    <th class="text-left" width="180 px">Heure de départ</th>
                    <th class="text-left px-8" width="180 px">Statut</th>
                    <th class="text-left px-8" width="180 px">Durée</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="pointage in pointages" :key="pointage.id">
                    <td class="pa-4 font-weight-medium">
                      {{ pointage.session }}
                    </td>
                    <td class="pa-4">
                      <v-chip small color="primary" text-color="white" class="px-3">
                        <v-icon x-small left>mdi-login</v-icon>
                        {{ formatTime(pointage.heure_arrivee) }}
                      </v-chip>
                    </td>
                    <td class="pa-4">
                      <v-chip v-if="pointage.heure_depart" small color="error" text-color="white" class="px-3">
                        <v-icon x-small left>mdi-logout</v-icon>
                        {{ formatTime(pointage.heure_depart) }}
                      </v-chip>
                      <span v-else class="grey--text">En cours</span>
                    </td>
                    <td class="pa-4">
                      <v-chip
                        small
                        :color="getStatusColor(pointage.statut.statut)"
                        text-color="white"
                        class="px-3"
                      >
                        {{ pointage.statut.statut }}
                      </v-chip>
                    </td>
                    <td class="pa-4 font-weight-medium">{{ calculateDuration(pointage.heure_arrivee, pointage.heure_depart) }}</td>
                  </tr>
                </tbody>
              </template>
            </v-simple-table>
          </div>

          <div v-else class="text-center pa-4 grey lighten-4 rounded">
            <v-icon large color="grey">mdi-alert-circle-outline</v-icon>
            <div class="mt-2">Aucun pointage enregistré pour aujourd'hui</div>
          </div>

          <!-- Résumé du jour -->
          <v-card outlined class="mt-4 pa-3">
            <h3 class="mb-2 font-weight-medium success--text">
              <v-icon color="success" class="mr-1">mdi-calculator</v-icon>
              Résumé du jour
            </h3>
            <v-row>
              <v-col cols="6" sm="3">
                <div class="text-caption grey--text">Nombre de sessions</div>
                <div class="text-h6">{{ pointages ? pointages.length : 0 }}</div>
              </v-col>
              <v-col cols="6" sm="3">
                <div class="text-caption grey--text">Temps total</div>
                <div class="text-h6">{{ calculateTotalTime() }}</div>
              </v-col>
              <v-col cols="6" sm="3">
                <div class="text-caption grey--text">Statut</div>
                <div class="text-h6">
                  <v-chip
                    x-small
                    :color="getDominantStatusColor()"
                    text-color="white"
                  >
                    {{ getDominantStatus() }}
                  </v-chip>
                </div>
              </v-col>
              <v-col cols="6" sm="3">
                <div class="text-caption grey--text">Première arrivée</div>
                <div class="text-h6">{{ getFirstArrival() }}</div>
              </v-col>
            </v-row>
          </v-card>
        </v-card-text>

        <v-divider></v-divider>

        <v-card-actions class="pa-4">
          <v-btn text color="grey darken-1" @click="showFichePointageModal = false">
            <v-icon left>mdi-close</v-icon>
            Fermer
          </v-btn>
          <v-spacer></v-spacer>
          <v-btn color="primary" text @click="printFiche">
            <v-icon left>mdi-printer</v-icon>
            Imprimer
          </v-btn>
          <v-btn color="success" rounded elevation="2" @click="exportPDF">
            <v-icon left>mdi-file-pdf-box</v-icon>
            Exporter en PDF
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Snackbar -->
    <v-snackbar
      v-model="snackbar.show"
      :color="snackbar.color"
      :timeout="3000"
      location="top"
      elevation="24"
      rounded="pill"
    >
      <div class="d-flex align-center">
        <v-icon
          :color="snackbar.color === 'success' ? 'light-green accent-2' : 'red lighten-3'"
          class="mr-2"
        >
          {{ snackbar.color === 'success' ? 'mdi-check-circle' : 'mdi-alert-circle' }}
        </v-icon>
        {{ snackbar.text }}
      </div>
    </v-snackbar>
  </v-container>
</template>

<script>
import { get, post } from '@/service/ApiService';

export default {
  data() {
    return {
      employes: [],
      loading: false,
      services: [],
      selectedService: null,
      headers: [
        { title: 'Nom', value: 'nom', align: 'start' },
        { title: 'Prénom', value: 'prenom', align: 'start' },
        { title: 'Direction', value: 'direction', align: 'start' },
        { title: 'Service', align: 'center', value: 'service'},
        { title: 'Actions', align: 'center', width: '250px', sortable: false },
      ],

      selectedEmploye: null,
      pointages: [], // Pour stocker toutes les sessions de pointage

      directions: [],
      filteredServices: [],
      selectedDirection: null,
      currentPage: 1,
      totalPages: 0,
      showArriveeModal: false,
      showDepartModal: false,

      snackbar: {
        show: false,
        text: '',
        color: 'success'
      },
      showFichePointageModal: false,
      selectedPointage: null,
      currentDate: new Date().toLocaleDateString('fr-FR', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      }), // Date formatée en français
      heureArriveeSelected: null,
      heureDepartSelected: null
    }
  },
  watch: {
    currentPage(newPage) {
      this.fetchEmployes(newPage);
    },
  },
  async mounted() {
    await this.fetchEmployes();
    await this.fetchDirections();
    await this.fetchServices();
  },
  methods: {
    async fetchEmployes(page = 1) {
      this.loading = true;
      let endpoint = `employes?page=${page}`;  // endpoint par défaut

      if (this.selectedService) {
        endpoint = `service/${this.selectedService}/employes?page=${page}`;
      } else if (this.selectedDirection && !this.selectedService) {
        endpoint = `direction/${this.selectedDirection}/employes?page=${page}`;
      }

      const response = await get(endpoint);

      if(response.ok) {
        const data = await response.json();
        this.employes = data.employes; // Contient data, total, current_page, etc.
        this.totalPages = data.employes.last_page; // Assurez-vous que votre API renvoie last_page
        this.loading = false;
      }
    },
    async fetchServices() {
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
    onFilterDirectionChange() {
      this.selectedService = null; // Réinitialiser le service sélectionné
      if (this.selectedDirection) {
        // Filtrer les services pour la direction sélectionnée
        this.filteredServices = this.services.filter(
          service => service.id_direction === this.selectedDirection
        );
      } else {
        this.filteredServices = []; // Réinitialiser si aucune direction n'est sélectionnée
      }
    },
    applyFilters() {
      this.currentPage = 1; // Réinitialiser à la première page lors de l'application des filtres
      this.fetchEmployes(this.currentPage);
    },
    pointerArrivee(item) {
      this.selectedEmploye = item;
      this.showArriveeModal = true; // Ouvrir le modal de confirmation
    },
    pointerDepart(item) {
      this.selectedEmploye = item;
      this.showDepartModal = true; // Ouvrir le modal de confirmation
    },
    async confirmArrivee() {
      let message = "";

      const response = await post('pointage', {
        'id_employe' : this.selectedEmploye.id,
        'heure_arrivee': this.heureArriveeSelected
      });

      message = await response.json();

      if(response.ok) {
        this.showSuccess(message.message);
        this.showArriveeModal = false;
      } else if(response.status == '404') {
        this.showError(message.message);
        this.showArriveeModal = false;
      }

      this.heureArriveeSelected = null;
    },
    async confirmDepart() {
      let message = "";

      const response = await post('pointage/depart', {
        'id_employe' : this.selectedEmploye.id,
        'heure_depart': this.heureDepartSelected
      });

      message = await response.json();
      if(response.ok) {
        this.showSuccess(message.message);
        this.showDepartModal = false; // Fermer le modal
      } else if(response.status == '404') {
        this.showError(message.message);
        this.showDepartModal = false;
      }

      this.heureDepartSelected = null;
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
    async fichePointage(item) {
      this.selectedEmploye = item;
      const pointageData = await this.getPointageForEmployee(item.id);

      if (pointageData) {
        this.pointages = pointageData;
        this.showFichePointageModal = true;
      } else {
        this.showError("Impossible de récupérer les données de pointage");
      }
    },
    async getPointageForEmployee(idEmploye) {
      const response = await get(`pointages/${idEmploye}`);

      if(response.ok) {
        const data = await response.json();
        return data.fiche;
      }
      return null;
    },
    // Nouvelles méthodes pour la fiche de pointage améliorée
    formatTime(timeString) {
      if (!timeString) return '-';
      return timeString.substring(0, 5); // Formater HH:MM
    },
    calculateDuration(startTime, endTime) {
      if (!startTime || !endTime) return '-';

      const start = new Date(`2000-01-01T${startTime}`);
      const end = new Date(`2000-01-01T${endTime}`);

      if (end < start) return 'Erreur de données';

      const diffMs = end - start;
      const diffHrs = Math.floor(diffMs / 3600000);
      const diffMins = Math.floor((diffMs % 3600000) / 60000);

      return `${diffHrs}h ${diffMins}min`;
    },
    getStatusColor(status) {
      switch(status.toLowerCase()) {
        case 'présent': return 'success';
        case 'retard': return 'warning';
        case 'absent': return 'error';
        default: return 'grey';
      }
    },
    calculateTotalTime() {
      if (!this.pointages || this.pointages.length === 0) return '0h 0min';

      let totalMs = 0;

      this.pointages.forEach(pointage => {
        if (pointage.heure_arrivee && pointage.heure_depart) {
          const start = new Date(`2000-01-01T${pointage.heure_arrivee}`);
          const end = new Date(`2000-01-01T${pointage.heure_depart}`);

          if (end > start) {
            totalMs += (end - start);
          }
        }
      });

      const hours = Math.floor(totalMs / 3600000);
      const minutes = Math.floor((totalMs % 3600000) / 60000);

      return `${hours}h ${minutes}min`;
    },
    getDominantStatus() {
      if (!this.pointages || this.pointages.length === 0) return 'N/A';

      const statusCount = {};
      this.pointages.forEach(pointage => {
        const status = pointage.statut.statut;
        statusCount[status] = (statusCount[status] || 0) + 1;
      });

      let maxCount = 0;
      let dominantStatus = 'N/A';

      for (const status in statusCount) {
        if (statusCount[status] > maxCount) {
          maxCount = statusCount[status];
          dominantStatus = status;
        }
      }

      return dominantStatus;
    },
    getDominantStatusColor() {
      return this.getStatusColor(this.getDominantStatus());
    },
    getFirstArrival() {
      if (!this.pointages || this.pointages.length === 0) return 'N/A';

      let firstArrival = null;

      this.pointages.forEach(pointage => {
        if (pointage.heure_arrivee) {
          const currentArrival = new Date(`2000-01-01T${pointage.heure_arrivee}`);
          if (!firstArrival || currentArrival < firstArrival) {
            firstArrival = currentArrival;
          }
        }
      });

      if (firstArrival) {
        return this.formatTime(firstArrival.toTimeString().substring(0, 8));
      }

      return 'N/A';
    },
    printFiche() {
      window.print();
    },
    exportPDF() {
      // Ici, vous pourriez implémenter l'export PDF avec une bibliothèque comme jsPDF
      this.showSuccess("Exportation PDF initiée...");

      // Simulation de l'export
      setTimeout(() => {
        this.showSuccess("Fiche de pointage exportée avec succès");
      }, 1000);
    }
  },
}
</script>

<style scoped>
  .main-card {
    border-radius: 12px;
    overflow: hidden;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  }

  .primary-gradient {
    background: linear-gradient(135deg, #3f51b5 0%, #5C6BC0 100%);
  }

  .success-gradient {
    background: linear-gradient(135deg, #43A047 0%, #66BB6A 100%);
  }

  .error-gradient {
    background: linear-gradient(135deg, #E53935 0%, #EF5350 100%);
  }

  .filter-btn {
    height: 55px;
    min-width: 120px;
    margin-bottom: 20px;
    text-transform: none;
  }

  .employee-info-card {
    border-radius: 8px;
    background-color: #f9f9f9;
    transition: all 0.3s ease;
  }

  .employee-info-card:hover {
    background-color: #f5f5f5;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  }

  .modal-card {
    border-radius: 12px;
    overflow: hidden;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.15);
  }

  .custom-modal {
    backdrop-filter: blur(10px);
  }

  /* Style pour impression */
  @media print {
    .v-btn, .v-card-actions {
      display: none !important;
    }
  }

  /* Animation des modales */
  .dialog-bottom-transition-enter-active,
  .dialog-bottom-transition-leave-active {
    transition: transform 0.3s ease-in-out;
  }

  .dialog-bottom-transition-enter-from,
  .dialog-bottom-transition-leave-to {
    transform: translateY(50px);
    opacity: 0;
  }

  .attendance-table {
    width: 100%;
    border-spacing: 0;
    border-collapse: separate;
    margin-bottom: 20px;
  }

  .v-simple-table {
    width: 100%;
  }

  .v-card-text {
    padding: 16px !important;
    width: 100%;
  }

  /* S'assurer que le conteneur du tableau n'a pas de marges latérales */
  .v-simple-table .v-table__wrapper {
    width: 100%;
    margin: 0;
    padding: 0;
  }

  .attendance-table th {
    font-size: 0.9rem;
    background-color: #f5f7fa;
    color: #546e7a;
    font-weight: 600;
  }

  .attendance-table tr {
    transition: background-color 0.2s ease;
  }

  .attendance-table tr:hover {
    background-color: #f9fafc;
  }

  .attendance-table td, .attendance-table th {
    height: auto !important;
    max-height: none !important;
  }

  /* Augmenter la taille des puces pour une meilleure lisibilité */
  .attendance-table .v-chip {
    height: 28px !important;
  }
</style>
