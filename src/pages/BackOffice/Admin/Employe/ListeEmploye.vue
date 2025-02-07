<template>
  <v-container fluid>
    <v-card>
      <v-card-title class="headline text-center">Liste des Employés</v-card-title>

      <!-- <v-card-text> -->
      <div class="d-flex justify-center align-center mb-4">
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
        class="elevation-1"
      >
        <template #item="{ item }">
          <tr>
            <td> {{ item.nom }}</td>
            <td> {{ item.prenom }}</td>
            <td> {{ item.genre }}</td>
            <td> {{ item.adresse }}</td>
            <td> {{ item.cin }}</td>
            <td> {{ item.telephone }}</td>
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

    <!-- Modal d'édition pour un employé -->
    <v-dialog v-model="editEmployeeDialog" max-width="800px">
      <v-card>
        <v-card-title>Modifier les informations de l'employé</v-card-title>
        <v-card-text>
          <v-stepper v-model="editCurrentStep" class="elevation-0">
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
    <v-dialog v-model="compteCreationDialog" max-width="500px">
      <v-card>
        <v-card-title>Créer un compte pour {{ selectedEmploye?.nom }} {{ selectedEmploye?.prenom }}</v-card-title>
        <v-card-text>
          <v-form ref="compteForm">
            <v-text-field
              v-model="newAccount.email"
              label="Email"
              placeholder="Entrez l'email"
              type="email"
              required
            />
            <v-text-field
              v-model="newAccount.mot_de_passe"
              label="Mot de passe"
              placeholder="Entrez le mot de passe"
              type="password"
              required
            />
          </v-form>
        </v-card-text>
        <v-card-actions>
          <v-btn color="primary" @click="createCompte">Créer</v-btn>
          <v-btn color="secondary" @click="closeCompteModal">Annuler</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script>
import { del, get, post, put } from '@/service/ApiService';

export default {
  data() {
    return {
      employes: [],
      loading: false,
      services: [],
      selectedService: null,
      headers: [
        { title: 'Nom', value: 'nom' },
        { title: 'Prenom', value: 'prenom' },
        { title: 'Genre', value: 'genre' },
        { title: 'Adresse', value: 'adresse' },
        { title: 'CIN', value: 'cin' },
        { title: 'telephone', value: 'nom' },
        { title: 'Actions', align: 'center', width: '190px', sortable: 'false' },
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

      if (this.selectedService) {
        endpoint = `service/${this.selectedService}/employes?page=${page}`;
      } else if (this.selectedDirection) {
        endpoint = `direction/${this.selectedDirection}/employes?page=${page}`;
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
          service: this.selectedService
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
    }
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
