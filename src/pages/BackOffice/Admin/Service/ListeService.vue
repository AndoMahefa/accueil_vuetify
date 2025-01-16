<template>
  <v-container>
    <v-card>
      <v-card-title>Liste des services</v-card-title>

      <!-- Tableau stylisé -->
      <v-data-table
        :headers="headers"
        :items="services"
        item-key="id"
        :loading="loading"
        :hide-default-footer="true"
      >
        <template #item="{ item }">
          <tr>
            <td> {{ item.nom }}</td>
            <td>
              <!-- Icônes pour les actions -->
              <v-icon
                color="primary"
                class="mx-6"
                @click="editModal(item)"
              >
                mdi-pencil
              </v-icon>
              <v-icon
                color="red"
                class="mx-6"
                @click="deleteModal(item)"
              >
                mdi-delete
              </v-icon>
              <v-icon
                color="success"
                class="mx-6"
                @click="openAssignRoleModal(item)"
              >
                mdi-account-key
              </v-icon>
              <v-icon
                color="blue"
                class="mx-6"
                @click="viewEmployees(item)"
              >
                mdi-account-group
              </v-icon>
            </td>
          </tr>
        </template>
      </v-data-table>

      <v-btn
        fab
        color="primary"
        @click="showDeletedService"
        rounded
        style="position: fixed; bottom: 70px; right: 50px; width: 60px; height: 60px; font-size: 25px;">
        <v-icon>mdi-delete</v-icon>
      </v-btn>
    </v-card>

    <!-- Modal d'attribution de rôle -->
    <v-dialog v-model="assignRoleDialog" width="100%" max-width="500px">
      <v-card>
        <v-card-title>Attribuer un rôle</v-card-title>
        <v-card-text>
          <v-form ref="assignRoleForm">
            <v-text-field
              v-model="selectedRole"
              label="Rôle"
              placeholder="Entrez le rôle"
              required
            />
          </v-form>
        </v-card-text>
        <v-card-actions>
          <v-btn color="primary" @click="assignRole">Attribuer</v-btn>
          <v-btn color="secondary" @click="closeAssignRoleModal">Annuler</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Modal de confirmation pour supprimer -->
    <v-dialog v-model="deleteConfirmationDialog" max-width="500px">
      <v-card>
        <v-card-title>Confirmer la suppression</v-card-title>
        <v-card-text>
          Êtes-vous sûr de vouloir supprimer le service
          <strong>{{ selectedService?.nom }}</strong> ?
        </v-card-text>
        <v-card-actions>
          <v-btn color="red" @click="deleteService">Supprimer</v-btn>
          <v-btn color="secondary" @click="closeDeleteConfirmation">Annuler</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Modal d'édition pour un service -->
    <v-dialog v-model="editServiceDialog" max-width="500px">
      <v-card>
        <v-card-title>Modifier le service</v-card-title>
        <v-card-text>
          <v-form ref="editServiceForm">
            <v-text-field
              v-model="editedService.nom"
              label="Nom du service"
              placeholder="Entrez un nouveau nom"
              required
            />
          </v-form>
        </v-card-text>
        <v-card-actions>
          <v-btn color="primary" @click="updateService">Modifier</v-btn>
          <v-btn color="secondary" @click="closeEditServiceModal">Annuler</v-btn>
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
      services: [],
      loading: false,

      headers: [
        { title: 'Nom', align: "start", value: 'nom' },
        { title: 'Actions', align: "center", width: '350px', sortable: 'false' },
      ],
      selectedService: null,
      selectedRole: null,
      assignRoleDialog: false,
      deleteConfirmationDialog: false,
      editServiceDialog: false,
      editedService: {
        id: null,
        nom: ""
      },
    }
  },
  mounted() {
    this.fetchServices();
  },
  methods: {
    async fetchServices() {
      this.loading = true;
      const response = await get('services');

      if(response.ok) {
        const data = await response.json();
        this.services = data.services;
        this.loading = false;
      }
    },
    openAssignRoleModal(item) {
      this.selectedService = item;
      this.selectedRole = ""
      this.assignRoleDialog = true;
    },
    closeAssignRoleModal() {
      this.assignRoleDialog = false;
    },
    async assignRole() {
      console.log(this.selectedService)
      const response = await post('service/role', {
        'role': this.selectedRole,
        'id_service': this.selectedService.id
      });

      if(response.ok) {
        this.closeAssignRoleModal()
      }
    },
    viewEmployees(item) {
      this.$router.push({
        path: "/home/liste-employes-service",
        query: { service: JSON.stringify(item) }
      })
    },
    deleteModal(item) {
      this.selectedService = item
      this.deleteConfirmationDialog = true;
    },
    closeDeleteConfirmation() {
      this.deleteConfirmationDialog = false;
    },
    async deleteService() {
      const response = await del(`service/${this.selectedService.id}/delete`);
      if (response.ok) {
        this.fetchServices();
        this.closeDeleteConfirmation();
      }
    },
    showDeletedService() {
      this.$router.push({
        path: '/home/deleted-services'
      })
    },
    editModal(item) {
      this.editedService = { ...item}
      this.editServiceDialog = true
    },
    closeEditServiceModal() {
      this.editServiceDialog = false
    },
    async updateService() {
      const response = await put(`service/${this.editedService.id}/update`, {
        'nom' : this.editedService.nom
      })
      if(response.ok) {
        this.fetchServices()
        this.closeEditServiceModal()
      }
    }
  }
}
</script>

<style scoped>
</style>
