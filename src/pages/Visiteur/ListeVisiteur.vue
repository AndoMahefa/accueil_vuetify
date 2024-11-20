<template>
  <v-container>
    <v-card>
      <v-card-title>Liste des visiteurs</v-card-title>

      <v-data-table :items="items" :headers="headers" item-value="id" class="elevation-1"
        loading-text="Chargement des données..." :hide-default-footer="true">
        <!-- Colonnes personnalisées -->
        <template #item="{ item }">
          <tr>
            <td> {{ item.nom }} </td>
            <td> {{ item.prenom }} </td>
            <td>
              <!-- Boutons avec des espacements -->
              <div class="d-flex">
                <v-btn icon @click="showDetails(item)" color="#6EC1B4" rounded class="ml-10">
                  <v-icon>mdi-eye</v-icon> <!-- Icône pour afficher les détails -->
                </v-btn>
                <v-btn icon @click="editVisitor(item)" color="#FF7043" rounded class="ml-10">
                  <v-icon>mdi-pencil</v-icon> <!-- Icône pour modifier l'utilisateur -->
                </v-btn>
                <v-btn icon @click="openDemandeDialog(item)" color="#66BB6A" rounded class="ml-10">
                  <v-icon>mdi-email</v-icon> <!-- Icône pour la demande de service -->
                </v-btn>
              </div>
            </td>
          </tr>
        </template>
      </v-data-table>

      <!-- Pagination -->
      <Pagination :page="pagination.page" :totalPages="totalPages" @update:page="changePage" />
    </v-card>

    <!-- Modal pour afficher les détails du visiteur -->
    <v-dialog v-model="dialog" max-width="500px">
      <v-card class="digital-id-card">
        <v-card-title class="d-flex align-center justify-space-between">
          <div class="headline">Identité du Visiteur</div>
          <v-icon color="grey darken-2">mdi-account-circle</v-icon>
        </v-card-title>

        <v-card-text>
          <!-- En-tête de la carte -->
          <div class="d-flex align-center mb-3">
            <div class="universal-icon mr-4">
              <v-icon size="60" color="blue darken-2">mdi-account</v-icon>
            </div>

            <!-- Informations principales -->
            <div>
              <h3 class="mb-1">{{ visiteur.nom }} {{ visiteur.prenom }}</h3>
            </div>
          </div>

          <!-- Détails du visiteur -->
          <v-row>
            <v-col cols="12" md="6">
              <div class="d-flex align-center">
                <v-icon color="blue" class="mr-2">mdi-email</v-icon>
                <span>{{ visiteur.email }}</span>
              </div>
            </v-col>
            <v-col cols="12" md="6">
              <div class="d-flex align-center">
                <v-icon color="green" class="mr-2">mdi-card-account-details-outline</v-icon>
                <span>{{ visiteur.cin }}</span>
              </div>
            </v-col>
            <v-col cols="12" md="6">
              <div class="d-flex align-center">
                <v-icon color="orange" class="mr-2">mdi-phone</v-icon>
                <span>{{ visiteur.telephone }}</span>
              </div>
            </v-col>
            <!-- Ajoutez d'autres détails si nécessaire -->
          </v-row>
        </v-card-text>

        <v-card-actions>
          <v-btn color="blue" text @click="dialog = false">Fermer</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Modal pour modifier les visiteurs -->
    <v-dialog v-model="editDialog" max-width="500px">
      <v-card class="digital-id-card">
        <v-card-title class="d-flex align-center justify-space-between">
          <div class="headline">Modifier les Informations du Visiteur</div>
          <v-icon color="grey darken-2">mdi-account-edit</v-icon>
        </v-card-title>

        <v-card-text>
          <!-- Formulaire pour modifier les informations -->
          <v-form ref="editForm" v-model="formValid">
            <v-row>
              <v-col cols="12" md="6">
                <v-text-field label="Nom" v-model="editVisiteur.nom" :rules="[rules.required]"></v-text-field>
              </v-col>
              <v-col cols="12" md="6">
                <v-text-field label="Prénom" v-model="editVisiteur.prenom" :rules="[rules.required]"></v-text-field>
              </v-col>
              <v-col cols="12">
                <v-text-field label="Email" v-model="editVisiteur.email"
                  :rules="[rules.required, rules.email]"></v-text-field>
              </v-col>
              <v-col cols="12" md="6">
                <v-text-field label="Téléphone" v-model="editVisiteur.telephone"
                  :rules="[rules.required]"></v-text-field>
              </v-col>
              <v-col cols="12" md="6">
                <v-text-field label="CIN" v-model="editVisiteur.cin" :rules="[rules.required]"></v-text-field>
              </v-col>
            </v-row>
          </v-form>
        </v-card-text>

        <v-card-actions>
          <v-btn color="blue" text @click="saveChanges">Modifier</v-btn>
          <v-btn color="red" text @click="editDialog = false">Annuler</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-dialog v-model="showDemandeDialog" max-width="500px" persistent>
  <v-card elevation="3" class="rounded-lg" style="background-color: #F9FAFB;">
    <!-- Titre de la modal -->
    <v-card-title class="text-h5 font-weight-bold" style="color: #6EC1B4; border-bottom: 2px solid #E0E0E0;">
      <v-icon left color="#6EC1B4">mdi-account-question</v-icon>
      Demander un service
    </v-card-title>

    <!-- Contenu de la modal -->
    <v-card-text class="pa-4">
      <v-form @submit.prevent="sendDemande">
        <!-- Sélectionner un service -->
        <v-select
          v-model="selectedService"
          :items="services"
          item-value="id"
          item-title="nom"
          label="Sélectionner un service"
          outlined
          dense
          style="color: #6EC1B4; border-color: #6EC1B4;"
          required
        ></v-select>

        <!-- Motif de la demande -->
        <v-textarea
          label="Motif de la demande"
          v-model="demandeMotif"
          outlined
          dense
          style="color: #6EC1B4; border-color: #6EC1B4; margin-top: 1.5rem;"
          rows="4"
          required
        ></v-textarea>
      </v-form>
    </v-card-text>

    <!-- Actions de la modal -->
    <v-card-actions class="d-flex justify-end pa-3" style="background-color: #F4F4F4; border-top: 2px solid #E0E0E0;">
      <v-btn
        outlined
        color="#6EC1B4"
        class="mr-2 font-weight-bold"
        style="border-color: #6EC1B4; color: #6EC1B4;"
        @click="closeDemandeDialog"
      >
        <v-icon left>mdi-close</v-icon>
        Annuler
      </v-btn>
      <v-btn
        class="font-weight-bold"
        style="background-color: #6EC1B4; color: white;"
        @click="sendDemande"
      >
        <v-icon left>mdi-send</v-icon>
        Envoyer
      </v-btn>
    </v-card-actions>
  </v-card>
</v-dialog>


  </v-container>
</template>
  
  <script>
  import Pagination from '@/components/Pagination.vue';
  import { get, put, post } from '@/service/ApiService.js';
  
  export default {
    components: {
        Pagination,
    },
    data() {
        return {
            items: [], // Liste des items
            headers: [
                { title: 'Nom', value: 'nom' },
                { title: 'Prénom', value: 'prenom' },
            ], // Colonnes du tableau
            totalPages: 0, // Nombre total de pages
            loading: false, // Indicateur de chargement
            pagination: {
                page: 1,
            },
            dialog: false, // Indicateur pour afficher le modal
            visiteur: {
                nom: '',
                prenom: '',
                cin: '',
                email: '',
                telephone: ''
            }, 
            editDialog: false, // Indicateur pour la modal d'édition
            editVisiteur: {
              nom: '',
              prenom: '',
              email: '',
              telephone: '',
              cin: '',
            },
            formValid: false, // Validation du formulaire
            rules: {
              required: (value) => !!value || 'Ce champ est requis',
              email: (value) =>
                /.+@.+\..+/.test(value) || 'Veuillez entrer une adresse email valide',
            },
            showDemandeDialog: false,
            // Liste des services
            services: [], // À remplir avec les services disponibles
            selectedService: null, // Service sélectionné
            demandeMotif: "", // Motif de la demande
            selectedVisiteur: {}
          };
    },
    watch: {
      "pagination.page"() {
        this.fetchData();
      },
    },
    mounted() {
      if (this.pagination.page && this.pagination.page > 0) {
        this.fetchData();
      }
      this.fetchServices()
    },
    methods: {
      async fetchData() {
        this.loading = true;
        try {
          const data = await get(`accueil/visiteurs?page=${this.pagination.page}`);
          if (data && data.ok) {
            const response = await data.json();
            this.items = response.data;
            this.totalPages = response.last_page;
          }
        } catch (error) {
          console.error("Erreur lors de la récupération des données :", error);
        } finally {
          this.loading = false;
        }
      },
      changePage(page) {
        if (page > 0 && page <= this.totalPages) {
          this.pagination.page = page;
        }
      },
      showDetails(item) {
        // Affecter les détails du visiteur au visiteur sélectionné
        this.visiteur = item;
        // Ouvrir le modal
        this.dialog = true;
      },
      editVisitor(item) {
        // Ouvrir la modal d'édition avec les données de l'utilisateur sélectionné
        this.editVisiteur = { ...item };
        this.editDialog = true;
      },
      async saveChanges() {
        if (this.$refs.editForm.validate()) { // Validation du formulaire
          try {
            const response = put(`accueil/visiteurs/${this.editVisiteur.id}`, this.editVisiteur);
            if (response && response.ok) {
              this.editDialog = false;
              this.fetchData()
            }
          } catch (error) {
            console.error("erreur lors de la maj du visiteur : ", error);
          }
        }
      } ,   // Ouvrir la modal
      openDemandeDialog(item) {
        this.selectedVisiteur = item;
        this.selectedService = null;
        this.demandeMotif = '';
        this.showDemandeDialog = true;
      },

      // Fermer la modal
      closeDemandeDialog() {
        this.showDemandeDialog = false;
        this.demandeMotif = ""; // Réinitialiser les champs
        this.selectedService = null;
        this.selectedVisiteur = {}
      },
      async fetchServices() {
        const idService = localStorage.getItem("idService");
        try {
          const response = await get(`accueil/services/${idService}`); // Charger les services depuis votre API
          if (response && response.ok) {
            this.services = await response.json(); // Adapter selon la structure de réponse
          }
        } catch (error) {
          console.error("Erreur lors de la récupération des services :", error);
        }
      },
      async sendDemande() {
        // Validation des champs
        if (!this.selectedService || !this.demandeMotif) {
          return; // Si les champs sont invalides, ne rien faire
        }

        console.log(this.selectedService + " " + this.demandeMotif + " " + this.selectedVisiteur.id)
        try {
          const response = await post("accueil/associe-visiteur-service", {
            'id_service': this.selectedService,
            'motif_visite': this.demandeMotif,
            'id_visiteur': this.selectedVisiteur.id
          });

          if (response && response.ok) {
            // Affichage d'un message de succès
            alert("Demande envoyée avec succès.");
            this.closeDemandeDialog(); // Fermer la modal après l'envoi
            this.fetchData();
          } else {
            alert("Erreur lors de l'envoi de la demande.");
          }
        } catch (error) {
          console.error("Erreur lors de l'envoi de la demande:", error);
        }
      },
    },
  };
  </script>
  
<style scoped>
  .v-btn--active {
      background-color: #189fdd;
      color: white;
  }
  .digital-id-card {
  border-radius: 16px;
  background: linear-gradient(to right, #e3f2fd, #bbdefb);
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.2);
  padding: 16px;
  }
  .digital-id-card h3 {
  font-weight: bold;
  margin: 0;
  }
  .universal-icon {
  width: 80px;
  height: 80px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #e3f2fd;
  border-radius: 50%;
  border: 3px solid #42a5f5;
  }
  .text-grey {
  color: #757575;
  }
</style>
  