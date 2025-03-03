<template>
  <v-container>
    <div class="d-flex align-center mb-4">
      <v-icon
        color="primary"
        class="mr-2"
        @click="goBack"
        style="cursor: pointer"
      >
        mdi-arrow-left
      </v-icon>
      <span class="text-h6 font-weight-medium">
        Employé : {{ employe?.nom }} {{ employe?.prenom }}
      </span>
    </div>

    <v-row>
      <!-- Carte d'attribution des rôles -->
      <v-col cols="12" md="6">
        <v-card height="100%" class="elevation-2">
          <v-card-title class="text-h5 font-weight-bold primary--text">
            <v-icon left color="primary">mdi-account-key</v-icon>
            Attribution des rôles
          </v-card-title>

          <v-divider></v-divider>

          <v-card-text class="pt-4">
            <v-row>
              <v-col cols="12">
                <v-checkbox
                  v-model="selectAll"
                  label="Tout sélectionner"
                  @change="toggleAllRoles"
                  class="mb-4"
                  :disabled="!hasSelectableRoles"
                  color="primary"
                />
              </v-col>
            </v-row>

            <!-- Section des fonctionnalités générales (statut = 0) -->
            <v-subheader class="text-h6 font-weight-bold primary--text">
              Fonctionnalités générales
            </v-subheader>
            <div v-for="parent in generalFeatures" :key="parent.id">
              <!-- Checkbox du parent -->
              <v-checkbox
                v-model="selectedRoles"
                :value="parent.id"
                :label="parent.titre"
                :disabled="isRoleAlreadyAssigned(parent.id)"
                :color="isRoleAlreadyAssigned(parent.id) ? 'grey' : 'primary'"
                @change="toggleChildren(parent)"
              >
                <template v-slot:label>
                  <div :class="{ 'text-grey': isRoleAlreadyAssigned(parent.id) }">
                    <v-icon small class="mr-1" :color="parent.icon ? 'primary' : 'grey'">
                      {{ parent.icon || 'mdi-check-circle-outline' }}
                    </v-icon>
                    {{ parent.titre }}
                    <v-chip
                      v-if="isRoleAlreadyAssigned(parent.id)"
                      x-small
                      class="ml-2"
                      color="grey"
                    >
                      Déjà attribué
                    </v-chip>
                  </div>
                </template>
              </v-checkbox>

              <!-- Checkbox des enfants -->
              <div v-for="child in parent.enfants" :key="child.id" style="margin-left: 30px;">
                <v-checkbox
                  v-model="selectedRoles"
                  :value="child.id"
                  :label="child.titre"
                  :disabled="!selectedRoles.includes(parent.id) || isRoleAlreadyAssigned(child.id)"
                  :color="isRoleAlreadyAssigned(child.id) ? 'grey' : 'primary'"
                >
                  <template v-slot:label>
                    <div :class="{ 'text-grey': isRoleAlreadyAssigned(child.id) }">
                      <v-icon small class="mr-1" :color="child.icon ? 'primary' : 'grey'">
                        {{ child.icon || 'mdi-check-circle-outline' }}
                      </v-icon>
                      {{ child.titre }}
                      <v-chip
                        v-if="isRoleAlreadyAssigned(child.id)"
                        x-small
                        class="ml-2"
                        color="grey"
                      >
                        Déjà attribué
                      </v-chip>
                    </div>
                  </template>
                </v-checkbox>
              </div>
            </div>

            <!-- Section des fonctionnalités spéciales pour admin (statut = 1) -->
            <v-subheader class="text-h6 font-weight-bold error--text mt-4">
              Fonctionnalités spéciales (Admin)
            </v-subheader>
            <div v-for="parent in adminFeatures" :key="parent.id">
              <!-- Checkbox du parent -->
              <v-checkbox
                v-model="selectedRoles"
                :value="parent.id"
                :label="parent.titre"
                :disabled="isRoleAlreadyAssigned(parent.id)"
                :color="isRoleAlreadyAssigned(parent.id) ? 'grey' : 'error'"
                @change="toggleChildren(parent)"
              >
                <template v-slot:label>
                  <div :class="{ 'text-grey': isRoleAlreadyAssigned(parent.id) }">
                    <v-icon small class="mr-1" :color="parent.icon ? 'error' : 'grey'">
                      {{ parent.icon || 'mdi-shield-account' }}
                    </v-icon>
                    {{ parent.titre }}
                    <v-chip
                      v-if="isRoleAlreadyAssigned(parent.id)"
                      x-small
                      class="ml-2"
                      color="grey"
                    >
                      Déjà attribué
                    </v-chip>
                    <v-chip
                      v-else
                      x-small
                      class="ml-2"
                      color="error"
                    >
                      Admin
                    </v-chip>
                  </div>
                </template>
              </v-checkbox>

              <!-- Checkbox des enfants -->
              <div v-for="child in parent.enfants" :key="child.id" style="margin-left: 30px;">
                <v-checkbox
                  v-model="selectedRoles"
                  :value="child.id"
                  :label="child.titre"
                  :disabled="isRoleAlreadyAssigned(child.id)"
                  :color="isRoleAlreadyAssigned(child.id) ? 'grey' : 'error'"
                >
                  <template v-slot:label>
                    <div :class="{ 'text-grey': isRoleAlreadyAssigned(child.id) }">
                      <v-icon small class="mr-1" :color="child.icon ? 'error' : 'grey'">
                        {{ child.icon || 'mdi-shield-account' }}
                      </v-icon>
                      {{ child.titre }}
                      <v-chip
                        v-if="isRoleAlreadyAssigned(child.id)"
                        x-small
                        class="ml-2"
                        color="grey"
                      >
                        Déjà attribué
                      </v-chip>
                      <v-chip
                        v-else
                        x-small
                        class="ml-2"
                        color="error"
                      >
                        Admin
                      </v-chip>
                    </div>
                  </template>
                </v-checkbox>
              </div>
            </div>
          </v-card-text>
          <v-divider></v-divider>

          <v-card-actions class="pa-4">
            <v-spacer />
            <v-btn
              color="primary"
              @click="assignRoles"
              :disabled="selectedRoles.length === 0"
              :loading="loading"
            >
              <v-icon left>mdi-account-plus</v-icon>
              Attribuer {{ selectedRoles.length > 0 ? `(${selectedRoles.length})` : '' }}
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-col>

      <!-- Carte des rôles actuels -->
      <v-col cols="12" md="6">
        <v-card height="100%" class="elevation-2">
          <v-card-title class="text-h5 font-weight-bold primary--text">
            <v-icon left color="primary">mdi-shield-account</v-icon>
            Rôles actuels
            <v-chip
              class="ml-2"
              color="primary"
              small
            >
              {{ rolesExistant.length }} rôle(s)
            </v-chip>
          </v-card-title>

          <v-divider />

          <v-card-text class="pa-0">
            <v-data-table
              :headers="headers"
              :items="rolesExistant"
              :loading="loading"
              class="elevation-0"
              :hide-default-footer="true"
              :no-data-text="'Aucun rôle attribué'"
              :loading-text="'Chargement des rôles...'"
              :items-per-page="-1"
            >
              <template #item.titre="{ item }">
                <div class="d-flex align-center">
                  <v-icon small class="mr-2" :color="item.fonctionnalite?.icon ? 'primary' : 'grey'">
                    {{ item.fonctionnalite?.icon || 'mdi-check-circle-outline' }}
                  </v-icon>
                  {{ item.fonctionnalite?.titre }}
                </div>
              </template>

              <template v-slot:item.actions="{ item }">
                <v-tooltip>
                  <template v-slot:activator="{ props }">
                    <v-icon
                      small
                      color="error"
                      v-bind="props"
                      @click="confirmRemoveRole(item)"
                    >
                      mdi-delete
                    </v-icon>
                  </template>
                  <span>Supprimer ce rôle</span>
                </v-tooltip>
              </template>
            </v-data-table>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- Dialogue de confirmation pour la suppression -->
    <v-dialog v-model="dialogDelete" max-width="400px">
      <v-card>
        <v-card-title class="text-h5 error--text">
          Confirmer la suppression
        </v-card-title>
        <v-card-text>
          Êtes-vous sûr de vouloir supprimer ce rôle ? Cette action est irréversible.
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="grey darken-1" text @click="dialogDelete = false">
            Annuler
          </v-btn>
          <v-btn color="error" text @click="removeRole">
            Supprimer
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Snackbar pour les notifications -->
    <v-snackbar
      v-model="snackbar.show"
      :color="snackbar.color"
      :timeout="6000"
      bottom
      right
    >
      {{ snackbar.message }}
      <template v-slot:action="{ attrs }">
        <v-btn
          text
          v-bind="attrs"
          @click="snackbar.show = false"
        >
          Fermer
        </v-btn>
      </template>
    </v-snackbar>
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
      employe: null,
      rolesExistant: [],
      loading: false,
      headers: [
        { title: 'Rôle', align: 'start', key: 'titre', sortable: true },
        { title: 'Actions', align: 'center', key: 'actions', sortable: false, width: '100px' }
      ],
      dialogDelete: false,
      selectedRoleToDelete: null,
      snackbar: {
        show: false,
        message: '',
        color: 'success'
      },
      idUtilisateur: null
    }
  },

  computed: {
    // filteredExistingRoles() {
    //   return this.rolesExistant.filter(role => {
    //     // Trouver la fonctionnalité correspondante dans la liste complète
    //     const fonctionnalite = this.roles.find(f => f.id === role.id_fonctionnalite);

    //     // Exclure les parents qui ont des enfants
    //     if (fonctionnalite && fonctionnalite.enfants && fonctionnalite.enfants.length > 0) {
    //       return false;
    //     }

    //     return true;
    //   });
    // },
    generalFeatures() {
      return this.roles.filter(role => role.statut === 0);
    },

    // Fonctionnalités spéciales pour admin (statut = 1)
    adminFeatures() {
      return this.roles.filter(role => role.statut === 1);
    },
    hasSelectableRoles() {
      return this.roles.some(parent =>
        !this.isRoleAlreadyAssigned(parent.id) ||
        parent.enfants.some(child => !this.isRoleAlreadyAssigned(child.id))
      );
    },

    // Grouper les rôles par parent pour une meilleure organisation
    roleGroups() {
      // Obtenir tous les rôles parents (ceux qui n'ont pas id_fonctionnalite)
      const parentRoles = this.roles.filter(role => !role.id_fonctionnalite);

      // Créer des groupes basés sur les rôles parents
      return parentRoles.map(parent => {
        return {
          id: parent.id,
          title: parent.titre,
          icon: parent.icon,
          roles: [
            // Inclure le parent lui-même
            parent,
            // Inclure tous les enfants de ce parent
            ...this.roles.filter(role => role.id_fonctionnalite === parent.id)
          ]
        };
      });
    }
  },

  watch: {
    selectedRoles() {
      this.checkSelectAll();
    }
  },

  mounted() {
    const employeReq = JSON.parse(this.$route.query.employe)
    if(employeReq) {
      this.employe = employeReq
      this.idUtilisateur = this.employe.utilisateur.id
      console.log(this.employe.utilisateur.id)
      console.log("hasCompte : " + this.employe.hasCompte)
      this.fetchRoleEmploye()
      this.fetchRoles()
    }
  },

  methods: {
    async fetchRoles() {
      this.loading = true;
      try {
        const response = await get('fonctionnalites');
        if(response.ok) {
          const data = await response.json();
          this.roles = data;
        } else {
          this.showSnackbar('Erreur lors de la récupération des fonctionnalités', 'error');
        }
      } catch (error) {
        console.error('Erreur lors de la récupération des fonctionnalités:', error);
        this.showSnackbar('Erreur lors de la récupération des fonctionnalités', 'error');
      } finally {
        this.loading = false;
      }
    },

    async fetchRoleEmploye() {
      this.loading = true;
      try {
        const response = await get(`roles/utilisateur/${this.idUtilisateur}`);

        if(response.ok) {
          const data = await response.json();
          this.rolesExistant = data.roles;
          console.log(this.rolesExistant)
        } else {
          this.showSnackbar('Erreur lors de la récupération des rôles de l\'employé', 'error');
        }
      } catch (error) {
        console.error('Erreur lors de la récupération des rôles:', error);
        this.showSnackbar('Erreur lors de la récupération des rôles', 'error');
      } finally {
        this.loading = false;
      }
    },

    // Modification de la méthode isRoleAlreadyAssigned pour les parents
    isRoleAlreadyAssigned(roleId) {
      // Trouver la fonctionnalité correspondante
      const fonctionnalite = this.roles.find(role => role.id === roleId);

      // Si c'est un parent avec des enfants
      if (fonctionnalite && fonctionnalite.enfants && fonctionnalite.enfants.length > 0) {
        // Vérifier si le parent lui-même est déjà attribué
        const isParentAssigned = this.rolesExistant.some(role => role.id_fonctionnalite === roleId);

        // Vérifier si tous les enfants sont déjà attribués
        const areAllChildrenAssigned = fonctionnalite.enfants.every(child =>
          this.rolesExistant.some(role => role.id_fonctionnalite === child.id)
        );

        // Le parent est considéré "déjà attribué" seulement si lui-même ET tous ses enfants sont attribués
        return isParentAssigned && areAllChildrenAssigned;
      }

      // Pour les fonctionnalités sans enfants, conserver le comportement original
      return this.rolesExistant.some(role => role.id_fonctionnalite === roleId);
    },

    // Aussi modifier la méthode toggleChildren pour gérer correctement les enfants déjà attribués
    toggleChildren(parent) {
      if (this.selectedRoles.includes(parent.id)) {
        // Si le parent est sélectionné, sélectionne tous les enfants non attribués
        parent.enfants.forEach(child => {
          if (!this.isRoleAlreadyAssigned(child.id) && !this.selectedRoles.includes(child.id)) {
            this.selectedRoles.push(child.id);
          }
        });
      } else {
        // Désélectionne tous les enfants si le parent est désélectionné
        const childIds = parent.enfants.map(child => child.id);
        this.selectedRoles = this.selectedRoles.filter(id => !childIds.includes(id));
      }
    },

    toggleAllRoles() {
      if (this.selectAll) {
        // Sélectionne tous les rôles non attribués (parents et enfants)
        const allRoles = this.roles.flatMap(parent => [parent, ...parent.enfants].filter(role =>!this.isRoleAlreadyAssigned(role.id)));
        this.selectedRoles = allRoles.map(role => role.id);
      } else {
        this.selectedRoles = [];
      }
    },

    checkSelectAll() {
      const allRoles = this.roles.flatMap(parent => [parent, ...parent.enfants]);
      const selectableRoles = allRoles.filter(role => !this.isRoleAlreadyAssigned(role.id));
      this.selectAll = this.selectedRoles.length === selectableRoles.length && selectableRoles.length > 0;
    },

    async assignRoles() {
      this.loading = true;
      try {
        // console.log("Rôles sélectionnés : " + this.selectedRoles + " id utilisateur : " + this.idUtilisateur);
        console.log(this.selectedRoles);
        console.log(this.idUtilisateur)
        const response = await post('fonctionnalite', {
          'id_utilisateur': this.idUtilisateur,
          'id_fonctionnalite': this.selectedRoles
        });

        if(response.ok) {
          this.showSnackbar(`${this.selectedRoles.length} rôle(s) attribué(s) avec succès`, 'success');
          this.selectedRoles = [];
          this.fetchRoleEmploye();
        } else {
          this.showSnackbar('Erreur lors de l\'attribution des rôles', 'error');
        }
      } catch (error) {
        console.error('Erreur lors de l\'attribution des rôles:', error);
        this.showSnackbar('Erreur lors de l\'attribution des rôles: ' + error.message, 'error');
      } finally {
        this.loading = false;
      }
    },

    confirmRemoveRole(item) {
      this.selectedRoleToDelete = item;
      this.dialogDelete = true;
    },

    async removeRole() {
      if (!this.selectedRoleToDelete) return;

      this.loading = true;
      try {
        const response = await del(`employe/${this.employe.id}/role/${this.selectedRoleToDelete.id_fonctionnalite}`);
        if (response.ok) {
          this.showSnackbar('Rôle supprimé avec succès', 'success');
          this.fetchRoleEmploye();
        } else {
          this.showSnackbar('Erreur lors de la suppression du rôle', 'error');
        }
      } catch (error) {
        console.error('Erreur lors de la suppression du rôle:', error);
        this.showSnackbar('Erreur lors de la suppression du rôle: ' + error.message, 'error');
      } finally {
        this.loading = false;
        this.dialogDelete = false;
        this.selectedRoleToDelete = null;
      }
    },

    showSnackbar(message, color = 'success') {
      this.snackbar.message = message;
      this.snackbar.color = color;
      this.snackbar.show = true;
    },

    goBack() {
      this.$router.push({ path: '/home/liste-employes' });
    },
  },
}
</script>
