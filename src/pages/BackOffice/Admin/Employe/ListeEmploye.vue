<template>
  <v-container fluid>
    <v-card>
      <v-card-title class="headline text-center">
        Liste des Employés
        <v-tooltip>
          <template #activator="{props}">
            <v-icon
              fab
              color="success"
              @click="genererTemplateExcel"
              rounded
              v-bind="props"
              large
              style="position: fixed; top: 120px; right: 150px; font-size: 30px;"
            >
              mdi-file-excel
            </v-icon>
          </template>
          <span>Generer un template excel</span>
        </v-tooltip>

        <v-tooltip>
          <template #activator="{props}">
            <v-icon
              fab
              color="success"
              @click="openImportDialog"
              rounded
              v-bind="props"
              large
              style="position: fixed; top: 120px; right: 100px; font-size: 30px;"
            >
              mdi-database-import
            </v-icon>
          </template>
          <span>Importer des données</span>
        </v-tooltip>

        <v-tooltip>
          <template #activator="{props}">
            <v-icon
              fab
              color="primary"
              @click="exportExcel"
              rounded
              v-bind="props"
              large
              style="position: fixed; top: 120px; right: 50px; font-size: 30px;"
            >
              mdi-file-export
            </v-icon>
          </template>
          <span>Exporter un fichier excel</span>
        </v-tooltip>
      </v-card-title>

      <!-- <v-card-text> -->
      <div class="d-flex justify-center align-center mb-4 mt-4">
        <v-text-field
          v-model="search"
          prepend-inner-icon="mdi-magnify"
          variant="solo"
          label="Recherche par nom/cin"
          clearable
          class="mx-2"
        />
        <v-select
          v-model="selectedDirection"
          :items="directions"
          item-title="nom"
          item-value="id"
          label="Sélectionnez une direction"
          clearable
          class="mx-2"
          @update:model-value="onFilterDirectionChange"
        />
        <v-select
          v-model="selectedService"
          :items="filteredServices"
          item-title="nom"
          item-value="id"
          label="Sélectionnez un service"
          clearable
          :disabled="!selectedDirection"
          class="mx-2"
        />
        <v-btn color="primary" @click="applyFilters" style="height: 55px; margin-bottom: 20px; margin-right: 10px;">Filtrer</v-btn>
      </div>
      <!-- </v-card-text> -->

      <v-data-table
        :headers="headers"
        :items="employes.data"
        :loading="loading"
        :hide-default-footer="true"
        :no-data-text="'Aucun employé'"
        :loading-text="'Chargement des employés...'"
        class="elevation-1"
      >
        <template #item="{ item }">
          <tr>
            <td>{{ item.nom }}</td>
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
            <td>
              <!-- Icônes pour les actions -->
              <v-tooltip location="bottom" attach="body">
                <template #activator="{props}">
                  <v-icon
                    color="primary"
                    class="mx-2"
                    v-bind="props"
                    @click="editModal(item)"
                  >
                    mdi-pencil
                  </v-icon>
                </template>
                <span>Editer</span>
              </v-tooltip>

              <v-tooltip location="bottom" attach="body">
                <template #activator="{props}">
                  <v-icon
                    color="red"
                    class="mx-2"
                    v-bind="props"
                    @click="deleteModal(item)"
                  >
                    mdi-delete
                  </v-icon>
                </template>
                <span>Supprimer</span>
              </v-tooltip>

              <template v-if="item.utilisateur">
                <v-tooltip location="bottom" attach="body">
                  <template #activator="{props}">
                    <v-icon
                      color="success"
                      class="mx-2"
                      v-bind="props"
                      @click="assignRoleModal(item)"
                    >
                      mdi-account-cog
                    </v-icon>
                  </template>
                  <span>Attribuer un role</span>
                </v-tooltip>
              </template>
              <template v-else>
                <v-tooltip location="bottom" attach="body">
                  <template #activator="{props}">
                    <v-icon
                      color="success"
                      class="mx-2"
                      v-bind="props"
                    >
                      mdi-account-off
                    </v-icon>
                  </template>
                  <span>L'employé n'a pas encore de compte</span>
                </v-tooltip>
              </template>

              <!-- Modification pour l'icône de création de compte -->
              <template v-if="item.utilisateur">
                <v-tooltip location="bottom" attach="body">
                  <template #activator="{ props }">
                    <v-icon
                      color="green"
                      class="mx-2"
                      v-bind="props"
                    >
                      mdi-check
                    </v-icon>
                  </template>
                  <span> Cet utilisateur a déjà un compte </span>
                </v-tooltip>
              </template>
              <template v-else>
                <v-tooltip location="bottom" attach="body">
                  <template #activator="{props}">
                    <v-icon
                      color="blue"
                      class="mx-2"
                      v-bind="props"
                      @click="compteModal(item)"
                    >
                      mdi-account-key
                    </v-icon>
                  </template>
                  <span>Créer un compte</span>
                </v-tooltip>
              </template>
            </td>
          </tr>
        </template>
      </v-data-table>
      <v-pagination
        v-model="currentPage"
        :length="totalPages"
        @input="fetchEmployes(currentPage)"
        circle
        class="mt-4"
        color="primary"
      />
    </v-card>

    <v-dialog v-model="isImportDialogOpen" max-width="600px">
      <v-card>
        <v-card-title>Importer un fichier Excel</v-card-title>
        <v-card-text>
          <v-file-input
            label="Sélectionnez un fichier Excel"
            v-model="importFile"
            accept=".xlsx"
            outlined
            dense
          />
        </v-card-text>
        <v-card-actions>
          <v-btn color="primary" @click="importExcel" :disabled="!importFile">
            Importer
          </v-btn>
          <v-btn text @click="closeImportDialog">Annuler</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Modal d'édition pour un employé -->
    <v-dialog v-model="editEmployeeDialog" max-width="800px">
      <v-card>
        <v-card-title>Modifier les informations de l'employé</v-card-title>
        <v-card-text>
          <v-stepper
            v-model="editCurrentStep"
            class="elevation-0"
            prev-text="Précédent"
            next-text="Suivant"
          >
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
                <v-form ref="editForm1" v-model="editValid" class="form-grid">
                  <v-text-field
                    v-model="editedEmployee.nom"
                    label="Nom"
                    variant="outlined"
                    density="comfortable"
                    required
                    class="form-field"
                  />
                  <v-text-field
                    v-model="editedEmployee.prenom"
                    label="Prénom"
                    variant="outlined"
                    density="comfortable"
                    required
                    class="form-field"
                  />
                  <v-text-field
                    v-model="editedEmployee.date_de_naissance"
                    type="date"
                    label="Date de naissance"
                    variant="outlined"
                    density="comfortable"
                    required
                    class="form-field"
                  />
                  <v-text-field
                    v-model="editedEmployee.adresse"
                    label="Adresse"
                    variant="outlined"
                    density="comfortable"
                    required
                    class="form-field"
                  />
                  <v-text-field
                    v-model="editedEmployee.cin"
                    label="Numéro CIN"
                    variant="outlined"
                    density="comfortable"
                    required
                    class="form-field"
                  />
                  <v-text-field
                    v-model="editedEmployee.telephone"
                    label="Téléphone"
                    variant="outlined"
                    density="comfortable"
                    required
                    class="form-field"
                  />
                  <v-select
                    v-model="editedEmployee.genre"
                    :items="genreOptions"
                    label="Genre"
                    item-title="label"
                    item-value="value"
                    variant="outlined"
                    density="comfortable"
                    required
                    class="form-field"
                  />
                </v-form>
                <div class="d-flex justify-end mt-4">
                  <v-btn
                    color="primary"
                    size="large"
                    @click="editCurrentStep = '2'"
                    :disabled="!isEditStep1Valid"
                  >
                    Suivant
                    <v-icon icon="mdi-arrow-right" class="ml-2"></v-icon>
                  </v-btn>
                </div>
              </v-stepper-window-item>

              <!-- Step 2 -->
              <v-stepper-window-item value="2">
                <v-form ref="editForm2" v-model="editValid" class="form-grid">
                  <v-select
                    v-model="editedEmployee.id_direction"
                    :items="directions"
                    label="Direction"
                    item-title="nom"
                    item-value="id"
                    variant="outlined"
                    density="comfortable"
                    required
                    @update:model-value="onEditDirectionChange"
                    class="form-field"
                  />
                  <v-select
                    v-model="editedEmployee.id_service"
                    :items="filteredServices"
                    label="Service"
                    item-title="nom"
                    item-value="id"
                    variant="outlined"
                    density="comfortable"
                    clearable
                    @update:model-value="onEditServiceChange"
                    class="form-field"
                    :disabled="!editedEmployee.id_direction"
                  />
                  <v-select
                    v-model="editedEmployee.id_fonction"
                    :items="filteredFonctions"
                    label="Fonction"
                    item-title="nom"
                    item-value="id"
                    variant="outlined"
                    density="comfortable"
                    required
                    clearable
                    class="form-field"
                  />
                  <v-select
                    v-model="editedEmployee.id_observation"
                    :items="observations"
                    label="Observation"
                    item-title="observation"
                    item-value="id"
                    variant="outlined"
                    density="comfortable"
                    required
                    class="form-field"
                  />
                </v-form>
                <div class="d-flex justify-space-between mt-4">
                  <v-btn
                    color="grey-lighten-1"
                    size="large"
                    variant="outlined"
                    @click="editCurrentStep = '1'"
                  >
                    <v-icon icon="mdi-arrow-left" class="mr-2"></v-icon>
                    Précédent
                  </v-btn>
                  <v-btn
                    color="success"
                    size="large"
                    @click="updateEmployee"
                    :loading="loading"
                    :disabled="!isEditStep2Valid"
                  >
                    <v-icon icon="mdi-check" class="mr-2"></v-icon>
                    Enregistrer
                  </v-btn>
                </div>
              </v-stepper-window-item>
            </v-stepper-window>
          </v-stepper>
        </v-card-text>
      </v-card>
    </v-dialog>

    <!-- Modal de confirmation pour supprimer -->
    <v-dialog v-model="deleteConfirmationDialog" max-width="500px">
      <v-card>
        <v-card-title>Confirmer la suppression</v-card-title>
        <v-card-text>
          Êtes-vous sûr de vouloir supprimer l'employe
          <strong>{{ selectedEmploye?.nom }} {{ selectedEmploye?.prenom }}</strong> ?
        </v-card-text>
        <v-card-actions>
          <v-btn color="red" @click="deleteEmploye">Supprimer</v-btn>
          <v-btn color="secondary" @click="closeDeleteConfirmation">Annuler</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Modal de création de compte -->
    <v-dialog v-model="compteCreationDialog" max-width="600px">
      <v-card class="rounded-lg">
        <!-- En-tête avec icône et titre -->
        <v-card-title class="text-h5 font-weight-bold" style="color: #6EC1B4; border-bottom: 2px solid #E0E0E0;">
          <v-icon left color="#6EC1B4" class="mb-1">mdi-account-question</v-icon>
          Création de compte
        </v-card-title>

        <!-- Section Informations employé -->
        <v-card-text class="pt-4">
          <div v-if="selectedEmploye" class="mb-6">
            <div class="d-flex align-center mb-2">
              <v-avatar color="primary lighten-2" size="40" class="mr-3">
                <span class="white--text text-subtitle-1">{{ selectedEmploye.prenom[0] }}{{ selectedEmploye.nom[0] }}</span>
              </v-avatar>
              <div>
                <h3 class="text-h6 primary--text">{{ selectedEmploye.prenom }} {{ selectedEmploye.nom }}</h3>
                <div class="text-caption grey--text">
                  <span v-if="selectedEmploye.direction" class="mr-2">• {{ selectedEmploye.direction.nom }}</span>
                  <span v-if="selectedEmploye.service">• {{ selectedEmploye.service.nom }}</span>
                </div>
              </div>
            </div>
            <v-divider></v-divider>
          </div>

          <!-- Formulaire -->
          <v-form ref="compteForm" class="px-2">
            <v-text-field
              v-model="newAccount.email"
              label="Email professionnel"
              outlined
              prepend-inner-icon="mdi-email-outline"
              class="mt-4"
              placeholder="exemple@entreprise.com"
              type="email"
              required
            />

            <v-text-field
              v-model="newAccount.mot_de_passe"
              label="Mot de passe temporaire"
              outlined
              prepend-inner-icon="mdi-lock-outline"
              placeholder="●●●●●●●●●●"
              :type="showPassword ? 'text' : 'password'"
              :append-icon="showPassword ? 'mdi-eye-off' : 'mdi-eye'"
              @click:append="showPassword = !showPassword"
              required
            />
          </v-form>
        </v-card-text>

        <!-- Actions -->
        <v-card-actions class="px-6 pb-4">
          <v-spacer></v-spacer>
          <v-btn
            @click="closeCompteModal"
            depressed
            large
            class="px-6"
            color="grey lighten-3"
          >
            Annuler
          </v-btn>
          <v-btn
            @click="createCompte"
            depressed
            large
            class="px-6 white--text"
            color="primary"
            :loading="loading"
          >
            Créer le compte
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
    >
      {{ snackbar.text }}
    </v-snackbar>
  </v-container>
</template>

<script>
import { del, exportExcel, get, post, postFormData, put } from '@/service/ApiService';

export default {
  data() {
    return {
      employes: [],
      loading: false,
      services: [],
      selectedService: null,
      // headers: [
      //   { title: 'Nom', value: 'nom' },
      //   { title: 'Prenom', value: 'prenom' },
      //   { title: 'Genre', value: 'genre' },
      //   { title: 'Adresse', value: 'adresse' },
      //   { title: 'CIN', value: 'cin' },
      //   { title: 'telephone', value: 'nom' },
      //   { title: 'Actions', align: 'center', width: '190px', sortable: 'false' },
      // ],
      headers: [
        { title: 'Nom', value: 'nom', align: 'start' },
        { title: 'Prénom', value: 'prenom', align: 'start' },
        { title: 'Direction', value: 'direction', align: 'start' },
        { title: 'Service', align: 'center', value: 'service'},
        { title: 'Actions', align: 'center', width: '250px', sortable: false },
      ],
      editEmployeeDialog: false,
      editedEmployee: {
        id: null,
        nom: '',
        prenom: '',
        genre: '',
        adresse: '',
        cin: '',
        telephone: ''
      },

      selectedEmploye: null,
      deleteConfirmationDialog: false,

      compteCreationDialog: false,
      newAccount: {
        email: '',
        mot_de_passe: ''
      },

      editCurrentStep: '1',
      editValid: false,
      genreOptions: [
        {label: "Homme", value: "Homme"},
        {label: "Femme", value: "Femme"},
      ],
      directions: [],
      fonctions: [],
      observations: [],
      filteredServices: [],
      filteredFonctions: [],
      selectedDirection: null,
      currentPage: 1,
      totalPages: 0,

      isImportDialogOpen: false,
      importFile: null, // Fichier sélectionné
      search: null,

      showPassword: false,

      snackbar: {
        show: false,
        text: '',
        color: 'success'
      },
    }
  },
  computed: {
    isEditStep1Valid() {
      return this.editedEmployee.nom &&
             this.editedEmployee.prenom &&
             this.editedEmployee.date_de_naissance &&
             this.editedEmployee.adresse &&
             this.editedEmployee.cin &&
             this.editedEmployee.telephone &&
             this.editedEmployee.genre;
    },
    isEditStep2Valid() {
      return this.editedEmployee.id_direction &&
             this.editedEmployee.id_fonction &&
             this.editedEmployee.id_observation;
    }
  },
  watch: {
    currentPage(newPage) {
      this.fetchEmployes(newPage);
    },
  },
  async mounted() {
    await this.fetchEmployes()
    await this.fetchDirections();
    await this.fetchServices();
  },
  methods: {
    async fetchEmployes(page = 1) {
      this.loading = true;
      let endpoint = `employes?page=${page}`;  // endpoint par défaut

      if(this.search && !this.selectedService && !this.selectedDirection) {
        endpoint += `&search=${this.search}`;
      } else if (this.selectedService) {
        if(this.search) {
          endpoint = `service/${this.selectedService}/employes?page=${page}&search=${this.search}`;
        } else {
          endpoint = `service/${this.selectedService}/employes?page=${page}`;
        }
      } else if (this.selectedDirection) {
        if(this.search) {
          endpoint = `direction/${this.selectedDirection}/employes?page=${page}&search=${this.search}`;
        } else {
          endpoint = `direction/${this.selectedDirection}/employes?page=${page}`;
        }
      }

      const response = await get(endpoint);

      if(response.ok) {
        const data = await response.json();
        this.employes = data.employes; // Contient data, total, current_page, etc.
        this.totalPages = data.last_page; // Assurez-vous que votre API renvoie last_page
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
    async editModal(item) {
      this.editedEmployee = { ...item };
      this.editCurrentStep = '1';
      this.editEmployeeDialog = true;
      await this.fetchDirections();
      await this.fetchFonctions();
      await this.fetchObservations();
      if (this.editedEmployee.id_direction) {
        this.onEditDirectionChange();
      }
    },
    async fetchFonctions() {
      const response = await get('fonctions');
      if(response.ok) {
        const data = await response.json();
        this.fonctions = data.fonctions;
      }
    },
    async fetchObservations() {
      const response = await get('observations');
      if(response.ok) {
        const data = await response.json();
        this.observations = data;
      }
    },
    onEditDirectionChange() {
      this.filteredServices = this.services.filter(
        service => service.id_direction === this.editedEmployee.id_direction
      );
      // Si le service sélectionné n'est plus valide, réinitialisez-le
      if (!this.filteredServices.some(service => service.id === this.editedEmployee.id_service)) {
        this.editedEmployee.id_service = null;
      }
      // Vous pouvez également appeler une méthode pour charger les fonctions si nécessaire
      this.fetchFonctionsByDirection(this.editedEmployee.id_direction);
    },
    onEditServiceChange() {
      if (this.editedEmployee.id_service) {
        this.fetchFonctionsByService(this.editedEmployee.id_service);
      } else if (this.editedEmployee.id_direction) {
        this.fetchFonctionsByDirection(this.editedEmployee.id_direction);
      }
    },
    async fetchFonctionsByDirection(directionId) {
      // const response = await get(`fonctions/direction/${directionId}`);
      const response = await fetch(`http://localhost:8000/api/fonctions/direction/${directionId}`)
      console.log(`http://localhost:8000/api/fonctions/direction/${directionId}`)
      if(response.ok) {
        const data = await response.json();
        this.filteredFonctions = data.fonctions;
      }
    },
    async fetchFonctionsByService(serviceId) {
      const response = await fetch(`http://localhost:8000/api/fonctions/service/${serviceId}`)
      console.log(`http://localhost:8000/api/fonctions/service/${serviceId}`)
      if(response.ok) {
        const data = await response.json();
        this.filteredFonctions = data.fonctions;
      }
    },
    // Ferme la modal d'édition
    closeEditEmployeeModal() {
      this.editEmployeeDialog = false;
    },
    // Envoie la requête pour mettre à jour les informations de l'employé
    async updateEmployee() {
      const response = await put(`employe/${this.editedEmployee.id}/update`, {
        ...this.editedEmployee
      });

      if (response.ok) {
        // Actualise la liste des employés
        this.fetchEmployes();
        this.closeEditEmployeeModal();
      }
    },
    deleteModal(item) {
      this.selectedEmploye = item
      this.deleteConfirmationDialog = true;
    },
    closeDeleteConfirmation() {
      this.deleteConfirmationDialog = false;
    },
    async deleteEmploye() {
      const response = await del(`employe/${this.selectedEmploye.id}/delete`);
      if (response.ok) {
        this.fetchEmployes();
        this.closeDeleteConfirmation();
      }
    },
    showDeletedEmploye() {
      this.$router.push({
        path: '/home/deleted-employes'
      })
    },
    assignRoleModal(employe) {
      this.$router.push({
        path: '/home/role-employe',
        query: {
          employe: JSON.stringify(employe),
          // service: this.selectedService
        }
      })
    },
    compteModal(item) {
      this.selectedEmploye = item;
      this.newAccount = {
        email: '',
        mot_de_passe: ''
      };
      this.compteCreationDialog = true;
    },
    closeCompteModal() {
      this.compteCreationDialog = false;
    },
    async createCompte() {
      const response = await post(`employe/create-compte`, {
        'email': this.newAccount.email,
        'mot_de_passe': this.newAccount.mot_de_passe,
        'id_employe': this.selectedEmploye.id
      });

      if(response.ok) {
        this.fetchEmployes();
        this.closeCompteModal();
      }
    },
    applyFilters() {
      this.currentPage = 1; // Réinitialiser à la première page lors de l'application des filtres
      this.fetchEmployes(this.currentPage);
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
    openImportDialog() {
      this.isImportDialogOpen = true;
    },

    // Fermer le dialogue d'importation
    closeImportDialog() {
      this.isImportDialogOpen = false;
      this.importFile = null;
    },
    async importExcel() {
      if (!this.importFile) return;

      const formData = new FormData();
      formData.append('file', this.importFile);

      try {
        const response = await postFormData('employe/import', formData);

        const result = await response.json();

        if (response.ok) {
          this.showSuccess(result.message);
          this.fetchEmployes();
          this.closeImportDialog();
        } else {
          this.showError(result.message || 'Erreur lors de l\'importation');
        }
      } catch (error) {
        console.error('Error:', error);
        this.showError('Erreur de connexion');
      }
    },
    async genererTemplateExcel() {
      try {
        await exportExcel('employes/export-template', 'template_excel.xlsx');
        this.showSuccess('Template Excel généré avec succès');
      } catch (error) {
        console.error('Erreur:', error);
        this.showError('Une erreur est survenue lors de la génération du template');
      }
    },
    async exportExcel() {
      try {
        const params = new URLSearchParams();

        if (this.selectedDirection) {
          params.append('direction_id', this.selectedDirection);
        }
        if (this.selectedService) {
          params.append('service_id', this.selectedService);
        }

        const endpoint = `employes/export?${params.toString()}`;
        await exportExcel(endpoint, 'employes.xlsx');
        this.showSuccess('Exportation réussie');
      } catch (error) {
        console.error('Erreur:', error);
        this.showError('Une erreur est survenue lors de l\'exportation');
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

}
</script>

<style scoped>
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

  .gap-4 {
    gap: 1rem;
  }

  .d-flex {
    display: flex;
    justify-content: center;
    align-items: center;
  }

  .mb-4 {
    margin-bottom: 16px;
  }

  .v-card {
    border-radius: 8px;
    overflow: hidden;
  }

  .v-card-title {
    padding: 16px;
  }

  .v-divider {
    margin: 16px 0;
  }

  .v-pagination {
    justify-content: center;
    margin-top: 20px;
  }
</style>
