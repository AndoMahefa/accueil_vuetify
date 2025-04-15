<template>
  <v-container>
    <v-card>
      <v-card-title>Liste des visiteurs</v-card-title>

      <div class="d-flex justify-end align-center mb-4 mt-4">
        <v-row justify="end">
          <v-col cols="6">
            <v-text-field
              v-model="search"
              prepend-inner-icon="mdi-magnify"
              label="Recherche par nom/email/cin"
              clearable
            />
          </v-col>
          <v-col cols="2">
            <v-btn
              height="55px"
              color="primary"
              style="margin-bottom: 20px;"
              type="submit" @click="fetchData"
            >
              Rechercher
            </v-btn>
          </v-col>
        </v-row>
      </div>

      <v-data-table :items="items" :headers="headers" item-value="id" class="elevation-1"
        :no-data-text="'Aucun visiteur'" :loading-text="'Chargement des visiteurs...'" :hide-default-footer="true">
        <!-- Colonnes personnalisées -->
        <template #item="{ item }">
          <tr>
            <td> {{ item.nom }} </td>
            <td> {{ item.prenom }} </td>
            <td>
              <!-- Boutons avec des espacements -->
              <div class="d-flex">
                <v-tooltip location="bottom" attach="body">
                  <template #activator="{props}">
                    <v-icon color="blue" rounded class="ml-10" v-bind="props" @click="showDetails(item)">
                      mdi-eye
                    </v-icon>
                  </template>
                  <span>Details du visiteur</span>
                </v-tooltip>

                <v-tooltip location="bottom" attach="body">
                  <template #activator="{props}">
                    <v-icon color="#FF7043" rounded class="ml-10" v-bind="props" @click="editVisitor(item)">
                      mdi-pencil
                    </v-icon>
                  </template>
                  <span>Modifier un visiteur</span>
                </v-tooltip>

                <v-tooltip location="bottom" attach="body">
                  <template #activator="{props}">
                    <v-icon color="#66BB6A" rounded class="ml-10" v-bind="props" @click="openDemandeDialog(item)">
                      mdi-email
                    </v-icon>
                  </template>
                  <span>Orientation</span>
                </v-tooltip>
              </div>
            </td>
          </tr>
        </template>
      </v-data-table>

      <v-row justify="center">
        <v-col cols="8">
          <v-container class="max-width">
            <v-pagination v-model="page" :length="totalPages" class="my-4" rounded="circle"
              @update:model-value="fetchData" />
          </v-container>
        </v-col>
      </v-row>
    </v-card>

    <!-- Modal pour afficher les détails du visiteur -->
    <v-dialog v-model="dialog" max-width="500px">
      <v-card :class="cardClass">
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
                <span>{{ visiteur.email ? visiteur.email : 'N/A' }}</span>
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

            <v-col cols="12" md="6">
              <div class="d-flex align-center">
                <v-icon v-if="visiteur.genre == 'Homme'" color="orange" class="mr-2">mdi-gender-male</v-icon>
                <v-icon v-if="visiteur.genre == 'Femme'" color="orange" class="mr-2">mdi-gender-female</v-icon>
                <span>{{ visiteur.genre }}</span>
              </div>
            </v-col>
            <v-col cols="12" md="6">
              <div class="d-flex align-center">
                <v-icon color="orange" class="mr-2">mdi-domain</v-icon>
                <span>{{ visiteur.entreprise ? visiteur.entreprise : 'N/A' }}</span>
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

    <v-dialog v-model="showDemandeDialog" max-width="700px" width="100%" persistent>
      <v-card elevation="3" class="rounded-lg" style="background-color: #F9FAFB;">
        <!-- Titre de la modal -->
        <v-card-title class="text-h5 font-weight-bold" style="color: #6EC1B4; border-bottom: 2px solid #E0E0E0;">
          <v-icon left color="#6EC1B4">mdi-account-question</v-icon>
          Demander un service
        </v-card-title>
        <!-- Contenu de la modal -->
        <v-card-text class="pa-4">
          <v-form @submit.prevent="sendDemande">
            <v-select v-model="selectedDirection" :items="directions" item-title="nom" item-value="id"
              label="Sélectionner une direction" dense clearable required style="color: #fffff; border-color: #6EC1B4;"
              @update:model-value="onChangeDirection" />
            <!-- Sélectionner un service -->
            <v-select v-model="selectedService" :items="filteredServices" item-title="nom" item-value="id"
              label="Sélectionner un service" outlined dense clearable style="color: #fffff; border-color: #6EC1B4;"
              :disabled="filteredServices.length == 0" />
            <!-- <v-select
              v-model="selectedFonction"
              :items="filteredFonctions"
              item-title="nom"
              item-value="id"
              label="Sélectionner une fonction"
              outlined
              dense
              clearable
            /> -->
            <!-- Motif de la demande -->
            <v-textarea v-model="demandeMotif" label="Motif de la demande" dense
              style="color: #fffff; border-color: #6EC1B4; margin-top: 1.5rem;" outlined rows="4" required />
          </v-form>
        </v-card-text>

        <!-- Actions de la modal -->
        <v-card-actions class="d-flex justify-end pa-3"
          style="background-color: #F4F4F4; border-top: 2px solid #E0E0E0;">
          <v-btn outlined color="#6EC1B4" class="mr-2 font-weight-bold" style="border-color: #6EC1B4; color: #6EC1B4;"
            @click="closeDemandeDialog">
            <v-icon left>mdi-close</v-icon>
            Annuler
          </v-btn>
          <v-btn class="font-weight-bold" style="background-color: #6EC1B4; color: white;" @click="sendDemande">
            <v-icon left>mdi-send</v-icon>
            Envoyer
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
    <!-- Snackbar pour les messages -->
    <v-snackbar v-model="snackbar.show" :color="snackbar.color" :timeout="3000">
      {{ snackbar.text }}
    </v-snackbar>
  </v-container>
</template>

<script>
import { get, put, post } from '@/service/ApiService.js';

export default {
  data() {
    return {
      page: null, // Page actuelle
      totalPages: null,
      items: [], // Liste des items
      headers: [
        { title: 'Nom', value: 'nom' },
        { title: 'Prénom', value: 'prenom' },
        { title: 'Actions', align: 'center', width: '250px', sortable: 'false' }
      ],
      loading: false, // Indicateur de chargement
      dialog: false, // Indicateur pour afficher le modal
      visiteur: {
        nom: '',
        prenom: '',
        cin: '',
        email: '',
        telephone: '',
        genre: ''
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

      services: [], // À remplir avec les services disponibles
      selectedService: null, // Service sélectionné
      demandeMotif: "", // Motif de la demande
      selectedVisiteur: {},
      directions: [],
      selectedDirection: null,
      filteredServices: [],
      snackbar: {
        show: false,
        text: '',
        color: 'success'
      },
      // selectedFonction: null,
      // filteredFonctions: [],
      search: null
    };
  },
  computed: {
    cardClass() {
      if (this.visiteur.genre === 'Femme') {
        return 'digital-id-card digital-id-card--femme';
      } else if (this.visiteur.genre === 'Homme') {
        return 'digital-id-card digital-id-card--homme';
      }
      return 'digital-id-card';
    }
  },
  mounted() {
    this.fetchDirection()
    this.fetchData();
    this.fetchServices()
  },
  methods: {
    async fetchData() {
      this.loading = true;
      try {
        console.log(this.search)
        let url = 'accueil/visiteurs'
        if(this.page && this.search) {
          url += `?page=${this.page}&search=${this.search}`
        } else if(this.page) {
          url += `?page=${this.page}`
        } else if(this.search) {
          url += `?search=${this.search}`
        }


        console.log(url)
        const data = await get(url);
        if (data && data.ok) {
          const response = await data.json();
          this.items = response.data;
          this.page = response.current_page;
          this.totalPages = response.last_page;
        }
      } catch (error) {
        console.error("Erreur lors de la récupération des données :", error);
      } finally {
        this.loading = false;
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
          const response = await put(`accueil/visiteur/${this.editVisiteur.id}`, this.editVisiteur);
          if (response && response.ok) {
            console.log(this.editVisiteur)
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
    async fetchDirection() {
      const response = await fetch('http://localhost:8000/api/directions');
      if(response.ok) {
        const data = await response.json();
        this.directions = data.directions;
      }
    },
    onChangeDirection() {
      this.selectedService = null;
      if(this.selectedDirection) {
        this.filteredServices = this.services.filter(
          service => service.id_direction === this.selectedDirection
        );
      }
      // Si le service sélectionné n'est plus valide, réinitialisez-le
      if (!this.filteredServices.some(service => service.id === this.selectedDirection)) {
        this.selectedService = null;
      }

      // this.fetchFonctionsByDirection(this.selectedDirection);
    },
    // async onServiceChange() {
    //   if (this.selectedDirection && this.selectedService) {
    //     console.log('ato')
    //     await this.fetchFonctionsByService(this.selectedService);
    //   }
    //   if (this.selectedService == null) {
    //     await this.fetchFonctionsByDirection(this.selectedDirection);
    //   }
    // },
    // async fetchFonctionsByDirection(directionId) {
    //   // const response = await get(`fonctions/direction/${directionId}`);
    //   const response = await fetch(`http://localhost:8000/api/fonctions/direction/${directionId}`)
    //   if(response.ok) {
    //     const data = await response.json();
    //     this.filteredFonctions = data.fonctions;
    //   }
    // },

    // async fetchFonctionsByService(serviceId) {
    //   const response = await fetch(`http://localhost:8000/api/fonctions/service/${serviceId}`)
    //   if(response.ok) {
    //     const data = await response.json();
    //     console.log(data.fonctions)
    //     this.filteredFonctions = data.fonctions;
    //   }
    // },
    async fetchServices() {
      try {
        const response = await get(`accueil/services`); // Charger les services depuis votre API
        if (response && response.ok) {
          const data = await response.json();
          this.services = data;// Adapter selon la structure de réponse
        }
      } catch (error) {
        this.showError("Erreur lors de la récupération des services : ", error);
      }
    },
    async sendDemande() {
      // Validation des champs
      if (!this.selectedDirection || !this.demandeMotif) {
        return; // Si les champs sont invalides, ne rien faire
      }
      try {
        console.log(this.selectedService);
        const response = await post('accueil/demande-service', {
          'id_visiteur': this.selectedVisiteur.id,
          'id_direction': this.selectedDirection,
          'id_service': this.selectedService,
          // 'id_fonction': this.selectedFonction,
          'motif_visite': this.demandeMotif
        });

        if (response && response.ok) {
          // Affichage d'un message de succès
          this.showSuccess("Demande envoyé avec succes");
          this.selectedDirection = null;
          this.selectedService = null;
          // this.selectedFonction = null;
          this.demandeMotif = ''
          this.closeDemandeDialog(); // Fermer la modal après l'envoi
          this.fetchData();
        }
      } catch (error) {
        this.showError("Erreur lors de l'envoi de la demande:", error);
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
  /* Carte pour un homme (bleue) */
  .digital-id-card--homme {
    background: linear-gradient(to right, #e3f2fd, #bbdefb);
  }

  /* Carte pour une femme (rose) */
  .digital-id-card--femme {
    background: linear-gradient(to right, #fce4ec, #f8bbd0);
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

  ::v-deep(.v-data-table .v-data-table__th),
  ::v-deep(.v-data-table-header__content) {
    background-color: #000 !important;
    color: white !important;
    font-weight: bold;
  }
</style>
