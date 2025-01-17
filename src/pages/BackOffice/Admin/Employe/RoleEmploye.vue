<template>
  <v-container>
    <v-icon
      color="primary"
      class="mr-2"
      @click="goBack"
      style="cursor: pointer"
    >
      mdi-arrow-left
    </v-icon>
    <span class=" mt-2">
      Employé : {{ employe?.nom }} {{ employe?.prenom }}
    </span>
    <v-row>
      <!-- Carte d'attribution des rôles -->
      <v-col cols="12" md="6">
        <v-card height="100%">
          <v-card-title class="text-h5 font-weight-bold">
            Attribution des rôles
          </v-card-title>

          <v-card-text>
            <v-row>
              <v-col cols="12">
                <v-checkbox
                  v-model="selectAll"
                  label="Tout sélectionner"
                  @change="toggleAllRoles"
                  class="mb-4"
                  :disabled="!hasSelectableRoles"
                />
              </v-col>
            </v-row>

            <v-row>
              <v-col
                v-for="role in roles"
                :key="role.id"
                cols="12"
              >
                <v-checkbox
                  v-model="selectedRoles"
                  :label="role.role"
                  :value="role.id"
                  hide-details
                  class="mb-2"
                  :disabled="isRoleAlreadyAssigned(role.id)"
                  :color="isRoleAlreadyAssigned(role.id) ? 'grey' : 'primary'"
                >
                  <template v-slot:label>
                    <div :class="{ 'text-grey': isRoleAlreadyAssigned(role.id) }">
                      {{ role.role }}
                      <v-chip
                        v-if="isRoleAlreadyAssigned(role.id)"
                        x-small
                        class="ml-2"
                        color="grey"
                      >
                        Déjà attribué
                      </v-chip>
                    </div>
                  </template>
                </v-checkbox>
              </v-col>
            </v-row>
          </v-card-text>

          <v-card-actions>
            <v-spacer />
            <v-btn
              color="primary"
              @click="assignRoles"
              :disabled="selectedRoles.length === 0"
            >
              Attribuer
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-col>

      <!-- Carte des rôles actuels -->
      <v-col cols="12" md="6">
        <v-card height="100%">
          <v-card-title class="text-h5 font-weight-bold">
            Rôles actuels
            <div class="text-subtitle-1 mt-2">
              {{ rolesExistant.length }} rôle(s) attribué(s)
            </div>
          </v-card-title>

          <v-data-table
            :headers="headers"
            :items="rolesExistant"
            :loading="loading"
            class="elevation-0"
            :hide-default-footer="rolesExistant.length <= 10"
          >
            <template v-slot:item.actions="{ item }">
              <v-icon
                color="red"
                class="mr-2"
                @click="removeRole(item)"
              >
                mdi-delete
              </v-icon>
            </template>

            <template v-slot:no-data>
              <div class="pa-4 text-center">
                Aucun rôle attribué
              </div>
            </template>
          </v-data-table>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import { get, del, post } from '@/service/ApiService';

export default {
  name: 'RoleAssignmentPage',

  data() {
    return {
      selectAll: false,
      selectedRoles: [],
      roles: [],
      idService: null,
      employe: null,
      rolesExistant: [],
      loading: false,
      headers: [
        { title: 'Rôle', align: 'start', key: 'role_service.role' },
        { title: 'Actions', align: 'center', key: 'actions', sortable: false, width: '100px' }
      ]
    }
  },

  computed: {
    hasSelectableRoles() {
      return this.roles.some(role => !this.isRoleAlreadyAssigned(role.id));
    }
  },

  watch: {
    selectedRoles() {
      this.checkSelectAll();
    }
  },

  mounted() {
    const serviceReq = Number(this.$route.query.service);
    const employeReq = JSON.parse(this.$route.query.employe)
    if(serviceReq && employeReq) {
      this.employe = employeReq
      this.idService = serviceReq
      console.log("hasCompte : " + this.employe.hasCompte)
      // this.rolesExistant = this.employe.roles
      this.fetchRoleEmploye()
      this.fetchRoles()
    }
  },
  methods: {
    async fetchRoles() {
      this.loading = true;
      const response = await get(`service/${this.idService}/roles`);
      if(response.ok) {
        const data = await response.json();
        this.roles = data.roles;
      }
      this.loading = false;
    },

    async fetchRoleEmploye() {
      const response = await get(`employe/${this.employe.id}/roles`);
      if(response.ok) {
        const data = await response.json();
        this.rolesExistant = data;
      }
    },

    isRoleAlreadyAssigned(roleId) {
      return this.rolesExistant.some(role => role.id_role === roleId);
    },

    toggleAllRoles() {
      if (this.selectAll) {
        // Sélectionne tous les rôles non attribués
        this.selectedRoles = this.roles
          .filter(role => !this.isRoleAlreadyAssigned(role.id))
          .map(role => role.id);
      } else {
        this.selectedRoles = [];
      }
    },

    checkSelectAll() {
      const selectableRoles = this.roles.filter(role => !this.isRoleAlreadyAssigned(role.id));
      this.selectAll = this.selectedRoles.length === selectableRoles.length;
    },

    async assignRoles() {
      console.log("selectedRoles : " + this.selectedRoles)
      const response = await post(`employe/role`, {
        'id_employe': this.employe.id,
        'id_roles': this.selectedRoles
      })
      if(response.ok) {
        this.selectedRoles = []
        this.fetchRoles()
        this.fetchRoleEmploye()
      }
    },

    async removeRole(item) {
      try {
        const response = await del(`employe/${this.employe.id}/role/${item.id_role}`);
        if (response.ok) {
          this.rolesExistant = this.rolesExistant.filter(role => role.id !== item.id);
          // Rafraîchir la liste des rôles disponibles
          await this.fetchRoles();
          this.fetchRoleEmploye();
        }
      } catch (error) {
        console.error('Erreur lors de la suppression du rôle:', error);
      }
    },
    goBack() {
      this.$router.push({ path: '/home/liste-employes' }); // Remplacez par le bon chemin
    },
  },
}
</script>
