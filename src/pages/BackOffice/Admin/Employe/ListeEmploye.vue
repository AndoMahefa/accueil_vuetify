<template>
  <v-container>
    <v-card>
      <v-card-title>Liste des employes</v-card-title>

      <v-select
        v-model="selectedService"
        :items="services"
        item-title="nom"
        item-value="id"
        label="Selectionnez un service"
        @update:model-value="fetchEmployes"
      />
      <!-- Tableau stylisé -->
      <v-data-table
        :headers="headers"
        :items="employes"
        item-key="id"
        :loading="loading"
        :hide-default-footer="true"
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
                <v-icon
                  color="blue"
                  class="mx-2"
                  @click="compteModal(item)"
                >
                  mdi-account-key
                </v-icon>
              </template>
            </td>
          </tr>
        </template>
      </v-data-table>

      <v-btn
        fab
        color="primary"
        @click="showDeletedEmploye"
        rounded
        style="position: fixed; bottom: 70px; right: 50px; width: 60px; height: 60px; font-size: 25px;">
        <v-icon>mdi-delete</v-icon>
      </v-btn>
    </v-card>

    <!-- Modal d'édition pour un employé -->
    <v-dialog v-model="editEmployeeDialog" max-width="500px">
      <v-card>
        <v-card-title>Modifier les informations de l'employé</v-card-title>
        <v-card-text>
          <v-form ref="editEmployeeForm">
            <v-text-field
              v-model="editedEmployee.nom"
              label="Nom"
              placeholder="Entrez le nom"
              required
            />
            <v-text-field
              v-model="editedEmployee.prenom"
              label="Prénom"
              placeholder="Entrez le prénom"
              required
            />
            <v-select
              v-model="editedEmployee.genre"
              :items="['Homme', 'Femme']"
              label="Genre"
              required
            />
            <v-text-field
              v-model="editedEmployee.adresse"
              label="Adresse"
              placeholder="Entrez l'adresse"
              required
            />
            <v-text-field
              v-model="editedEmployee.cin"
              label="CIN"
              placeholder="Entrez le CIN"
              required
            />
            <v-text-field
              v-model="editedEmployee.telephone"
              label="Téléphone"
              placeholder="Entrez le téléphone"
              required
            />
          </v-form>
        </v-card-text>
        <v-card-actions>
          <v-btn color="primary" @click="updateEmployee">Modifier</v-btn>
          <v-btn color="secondary" @click="closeEditEmployeeModal">Annuler</v-btn>
        </v-card-actions>
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
      }
    }
  },
  async mounted() {
    await this.fetchServices();

    if (this.services.length > 0) {
      this.selectedService = this.services[0].id; // Utilise le premier service comme valeur par défaut
      this.fetchEmployes(); // Charger les employés pour le service par défaut
    }
  },
  methods: {
    async fetchEmployes() {
      this.loading = true;
      const response = await get(`service/${this.selectedService}/employes`);

      if(response.ok) {
        const data = await response.json();
        this.employes = data.employes;
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
    editModal(item) {
      this.editedEmployee = { ...item };
      this.editEmployeeDialog = true;
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
    }
  }
}
</script>

<style scoped>
</style>
