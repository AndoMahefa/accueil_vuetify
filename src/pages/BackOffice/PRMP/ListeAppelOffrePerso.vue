<!-- eslint-disable vue/attributes-order -->
<!-- eslint-disable vue/max-attributes-per-line -->
<!-- eslint-disable vue/valid-v-slot -->
<!-- eslint-disable vue/v-slot-style -->
<template>
  <v-container>
    <h1>Liste des Appels d'Offres</h1>
    <br>
    <v-row>
      <v-col cols="12" md="4">
        <v-select
          v-model="selectedRef"
          :items="references"
          clearable
          label="Choisir un reference"
          item-title="reference"
          item-value="reference"
          @update:model-value="fetchAppelsOffres"
        />
      </v-col>
    </v-row>
    <br>
    <!-- Tableau des appels d'offres -->
    <v-data-table
      :headers="headers"
      :items="appelsOffres"
      item-value="id"
      class="elevation-1"
      outlined
      :hide-default-footer="true"
      :no-data-text="'Aucune donnée'"
      :loading-text="'Chargement des données...'"
    >
      <template v-slot:item.actions="{ item }">
        <v-icon
          color="#6EC1B4"
          class="icon-spacing"
          @click="viewDetails(item)"
        >
          mdi-eye
        </v-icon>
        <v-icon
          class="icon-spacing"
          color="#FF7043"
          @click="editAppelOffre(item)"
        >
          mdi-pencil
        </v-icon>
        <v-icon
          class="icon-spacing"
          color="red"
          @click="confirmDelete(item)"
        >
          mdi-delete
        </v-icon>

        <!-- Modification pour l'icône de création de compte -->
        <template v-if="item.date_publication != null">
          <v-tooltip bottom>
            <template #activator="{ on, attrs }">
              <v-icon
                color="green"
                class="mx-2"
                v-bind="attrs"
                v-on="on"
              >
                mdi-check
              </v-icon>
            </template>
            <span> Cet Appel d'offre a déjà été publié </span>
          </v-tooltip>
        </template>
        <template v-else>
          <v-icon
            color="blue"
            class="mx-2"
            @click="confirmPublish(item)"
          >
            mdi-publish
          </v-icon>
        </template>
      </template>
    </v-data-table>

    <v-btn
      fab
      color="primary"
      @click="showDeletedAppelOffre"
      rounded
      style="position: fixed; bottom: 70px; right: 50px; width: 60px; height: 60px; font-size: 25px;">
      <v-icon>mdi-delete</v-icon>
    </v-btn>

    <!-- Details appel d'offres -->
    <v-dialog v-model="isDetailsOpen" width="100%" max-width="800px">
      <v-card>
        <!-- Titre du modal -->
        <v-card-title class="blue darken-1 white--text">
          <v-icon class="mr-2">mdi-information-outline</v-icon>
          Détails de l'Appel d'Offre
        </v-card-title>

        <!-- Contenu des détails -->
        <v-card-text>
          <v-row v-for="(value, key) in selectedAppelDetails" :key="key" class="align-center">
            <v-col cols="5" class="font-weight-bold text-uppercase">
              {{ key.replace(/_/g, ' ').toUpperCase() }}
            </v-col>
            <v-col cols="7">
              <span v-if="key === 'Montant estimatif initial' || key === 'Montant estimatif par beneficiaire'">{{ value }} Ar</span>
              <span v-if="key === 'Date previsionnelle de lancement' || key==='Date previsionnelle ouverture des plis' || key==='Date previsionnelle d\'attribution'">{{ formatDate(value) }}</span>
              <span v-else>{{ value || 'Non spécifié' }}</span>
            </v-col>
            <v-col cols="12">
              <v-divider></v-divider>
            </v-col>
          </v-row>
        </v-card-text>

        <!-- Actions -->
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="blue darken-1" text @click="isDetailsOpen = false">
            <v-icon left>mdi-close</v-icon> Fermer
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Modal d'édition des appels d'offres -->
    <v-dialog v-model="isEditMode" width="100%" max-width="800px">
      <v-card>
        <!-- Titre du modal -->
        <v-card-title class="orange darken-1 white--text">
          <v-icon class="mr-2">mdi-pencil</v-icon>
          Modifier l'Appel d'Offre
        </v-card-title>

        <!-- Contenu du formulaire d'édition -->
        <v-card-text>
          <v-form ref="editForm">
            <v-row v-for="(value, key) in editableDetails" :key="key" class="align-center">
              <v-col cols="5" class="font-weight-bold text-uppercase">
                {{ key.replace(/_/g, ' ').toUpperCase() }}
              </v-col>
              <v-col cols="7">
                <!-- Champ select si le type est "select" -->
                <v-select
                  v-if="originalDetails[key] && originalDetails[key].type === 'select'"
                  v-model="editableDetails[key]"
                  :items="originalDetails[key].options"
                  outlined
                  dense
                />

                <!-- Textarea pour les descriptions longues -->
                <v-textarea
                  v-else-if="originalDetails[key] && originalDetails[key].type === 'textarea'"
                  v-model="editableDetails[key]"
                  outlined
                  dense
                  auto-grow
                  rows="3"
                />

                <!-- Champ date pour les dates -->
                <v-text-field
                  v-else-if="key.toLowerCase().includes('date')"
                  v-model="editableDetails[key]"
                  type="date"
                  outlined
                  dense
                />

                <v-text-field
                  v-else-if="key.toLowerCase().includes('number')"
                  v-model="editableDetails[key]"
                  type="number"
                  outlined
                  dense
                />

                <!-- Champ par défaut pour les autres types -->
                <v-text-field
                  v-else
                  v-model="editableDetails[key]"
                  outlined
                  dense
                />
              </v-col>
              <v-col cols="12">
                <v-divider></v-divider>
              </v-col>
            </v-row>
          </v-form>
        </v-card-text>

        <!-- Actions -->
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="grey darken-1" text @click="cancelEdit">
            <v-icon left>mdi-close</v-icon> Annuler
          </v-btn>
          <v-btn color="orange darken-1" text @click="saveChanges">
            <v-icon left>mdi-content-save</v-icon> Enregistrer
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Modal de confirmation de suppression -->
    <v-dialog v-model="isDeleteDialogOpen" width="100%" max-width="800px">
      <v-card>
        <v-card-title class="headline">Confirmer la suppression : {{ appelToDelete.objet }} </v-card-title>
        <v-card-text>
          Êtes-vous sûr de vouloir supprimer cet appel d'offre ?
        </v-card-text>
        <v-card-actions>
          <v-btn text @click="isDeleteDialogOpen = false">Annuler</v-btn>
          <v-btn color="red" text @click="deleteAppelOffre">Confirmer</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Modal de publication -->
    <v-dialog v-model="publishModal" max-width="500px">
      <v-card>
        <v-card-title>
          <span class="text-h6">Publier l'appel d'offre</span>
        </v-card-title>
        <v-card-text>
          <v-container>
            <v-row>
              <!-- Champ pour la date d'ouverture de plis -->
              <v-col cols="12">
                <v-text-field
                  v-model="publishData.dateOuverture"
                  label="Date d'ouverture des plis"
                  type="date"
                  outlined
                  required
                />
              </v-col>
              <!-- Champ pour l'heure limite -->
              <v-col cols="12">
                <v-text-field
                  v-model="publishData.heureLimite"
                  label="Heure limite"
                  type="time"
                  outlined
                  required
                />
              </v-col>
            </v-row>
          </v-container>
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <!-- Bouton Annuler -->
          <v-btn text @click="closePublishModal">Annuler</v-btn>
          <!-- Bouton Publier -->
          <v-btn color="primary" @click="sendPublish">Publier</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script>
import { del, get, put } from '@/service/ApiService';

export default {
  data() {
    return {
      appelsOffres: [], // Liste des appels d'offres
      headers: [
        { title: "Nature", align: 'start', value: 'nature', sortable: true },
        { title: "Objet", align: 'start', width: '700px', value: 'objet', sortable: true },
        { title: 'Actions', align: 'center', value: 'actions', sortable: false },
      ],
      references: [],
      selectedRef: null,

      selectedAppelDetails: {},
      isDetailsOpen: false,

      isDeleteDialogOpen: false,
      appelToDelete: null, // L'appel d'offre à supprimer

      publishModal: false,
      publishData: {
        dateOuverture: null,
        heureLimite: null,
      },
      selectedAppel: null,

      // Pour l'édition
      isEditMode: false,
      editableDetails: {},
      originalDetails: {},
      currentItemId: null, //
    };
  },
  mounted() {
    this.fetchAppelsOffres();
    this.fetchRef();
  },
  methods: {
    // Récupérer tous les appels d'offres depuis l'API
    async fetchAppelsOffres() {
      try {
        let url = 'prmp/appels-offres';
        if(this.selectedRef) {
          url += `?reference=${this.selectedRef}`
        }
        const response = await get(url)

        if (response.ok) {
          const data = await response.json();
          // console.log(data)
          this.appelsOffres = data;
        }
      } catch (error) {
        console.error("Erreur lors de la récupération des appels d'offres :", error);
      }
    },
    async fetchRef() {
      const response = await get('prmp/references')

      if(response.ok) {
        const refs = await response.json();
        this.references = refs;
      }
    },
    async viewDetails(item) {
      try {
        const response = await get(`prmp/appel-offre/${item.id}/details`)

        if (response.ok) {
          const data = await response.json();

           // Parser la chaîne JSON dans data.details[0].details
          const detailsString = data.details[0].details;
          const parsedDetails = JSON.parse(detailsString);

          console.log(detailsString)
          const formattedDetails = {};
          parsedDetails.forEach(detail => {
            formattedDetails[detail.nom_champ] = detail.valeur;
          });

          // console.log(data.details[0].details)
          this.selectedAppelDetails = formattedDetails;
          this.isDetailsOpen = true; // Ouvre le modal
        } else {
          console.error("Erreur lors de la récupération des détails :", response.statusText);
        }
      } catch (error) {
        console.error("Erreur lors de la récupération des détails :", error);
      }
    },
    formatBudget(value) {
      if (!value) return 'Non spécifié';
      return `${new Intl.NumberFormat('fr-FR').format(value)} Ar`;
    },
    formatDate(value) {
      if (!value) return 'Non spécifié';
      const options = { year: 'numeric', month: 'long', day: 'numeric' };
      return new Date(value).toLocaleDateString('fr-FR', options);
    },
    async editAppelOffre(item) {
      try {
        const response = await get(`prmp/appel-offre/${item.id}/details`);

        if (response.ok) {
          const data = await response.json();

          // Parser la chaîne JSON dans data.details[0].details
          const detailsString = data.details[0].details;
          const parsedDetails = JSON.parse(detailsString);

          // Créer un objet pour l'édition
          const formattedDetails = {};
          const originalDetailsWithIds = {};
          parsedDetails.forEach(detail => {
            formattedDetails[detail.nom_champ] = detail.valeur;
            // Stocker les détails originaux avec IDs pour l'API update
            originalDetailsWithIds[detail.nom_champ] = {
              id: detail.id_appel_offre_donnees,
              valeur: detail.valeur,
              type: detail.type_champ,
              options: Array.isArray(detail.options) ? detail.options :
                      (typeof detail.options === 'string' && detail.options ? JSON.parse(detail.options) : [])
            };
          });

          // Affecter les valeurs pour l'édition
          this.editableDetails = { ...formattedDetails };
          this.originalDetails = originalDetailsWithIds;
          this.currentItemId = item.id;
          this.isEditMode = true;
        } else {
          console.error("Erreur lors de la récupération des détails :", response.statusText);
        }
      } catch (error) {
        console.error("Erreur lors de la récupération des détails :", error);
      }
    },
    // Ajouter une méthode pour sauvegarder les modifications
    async saveChanges() {
      try {
        // Préparer les données pour l'API
        const updatedValues = [];

        for (const [champ, valeur] of Object.entries(this.editableDetails)) {
          if (this.originalDetails[champ]) {
            updatedValues.push({
              id: this.originalDetails[champ].id,
              valeur: valeur
            });
          }
        }

        const response = await put(`prmp/appel-offre/${this.currentItemId}/update`, {
          donnees: updatedValues
        });

        if (response.ok) {
          this.isEditMode = false;
          this.fetchAppelsOffres(); // Recharger la liste avec les données mises à jour
        } else {
          console.error("Erreur lors de la mise à jour des détails :", response.statusText);
        }
      } catch (error) {
        console.error("Erreur lors de la mise à jour des détails :", error);
      }
    },

    // Ajouter une méthode pour annuler l'édition
    cancelEdit() {
      this.isEditMode = false;
      this.editableDetails = {};
    },
    confirmDelete(item) {
      this.appelToDelete = item; // Sauvegarder l'appel d'offre à supprimer
      this.isDeleteDialogOpen = true; // Ouvrir la modal de confirmation
    },
    // Fonction pour supprimer un appel d'offre
    async deleteAppelOffre() {
      try {
        const response = await del(`prmp/appel-offre/${this.appelToDelete.id}/delete`)

        if (response.ok) {
          this.fetchAppelsOffres(); // Recharger la liste après suppression
          this.isDeleteDialogOpen = false
        } else {
          alert('Erreur lors de la suppression de l\'appel d\'offre');
        }
      } catch (error) {
        console.error("Erreur lors de la suppression de l'appel d'offre :", error);
      }
    },
    showDeletedAppelOffre() {
      this.$router.push({ name: 'DeletedAppelOffre' });
    },
    confirmPublish(item) {
      this.selectedAppel = item;
      this.publishModal = true;
    },
    closePublishModal() {
      this.publishModal = false;
    },
    async sendPublish() {
      const response = await put(`prmp/appel-offre/${this.selectedAppel.id}/publier`, {
        'date_ouverture_plis': this.publishData.dateOuverture,
        'heure_limite': this.publishData.heureLimite,
      })

      if(response.ok) {
        this.fetchAppelsOffres();
        this.closePublishModal();
      }
    },
  },
};
</script>
<style>
  .icon-spacing{
    margin: 0 8px;
  }

  ::v-deep(.v-data-table .v-data-table__th),
  ::v-deep(.v-data-table-header__content) {
    background-color: #000 !important;
    color: white !important;
    font-weight: bold;
  }
</style>
