<template>
  <v-container>
    <v-card>
      <v-card-title>Liste des demandes reçues du jour</v-card-title>
      <v-row>
        <v-col cols="12" md="4">
          <v-select
            v-model="selectedDirection"
            :items="directions"
            label="Sélectionner une direction"
            item-title="nom"
            item-value="id"
            clearable
            @update:model-value="fetchDemandes"
          />
        </v-col>
      </v-row>
      <v-data-table
        :items="demandes"
        :headers="headers"
        item-value="id"
        class="elevation-1"
        loading-text="Chargement des données..."
        :hide-default-footer="true"
        :no-data-text="'Aucune donnée'"
      >
        <!-- Colonnes personnalisées -->
        <template #item="{ item }">
          <tr>
            <td> {{ item.nom }} </td>
            <td> {{ item.prenom }} </td>
            <td> {{ item.motif_visite }} </td>
            <td> {{ item.date_heure_arrivee }} </td>
            <td>
              <!-- Boutons avec des espacements -->
              <div class="d-flex">
                <v-tooltip location="bottom" attach="body">
                  <template #activator="{props}">
                    <v-icon
                      color="#6EC1B4"
                      class="mx-6"
                      v-bind="props"
                      @click="showDetails(item)"
                    >
                      mdi-eye
                    </v-icon>
                  </template>
                  <span>Détails du visiteur</span>
                </v-tooltip>
                <v-tooltip location="bottom" attach="body">
                  <template #activator="{props}">
                    <v-icon
                      color="green"
                      class="mx-6"
                      v-bind="props"
                      @click="acceptDemande(item)"
                    >
                      mdi-check
                    </v-icon> <!-- Icône "Oui" en vert -->
                  </template>
                  <span>Accepter la demande</span>
                </v-tooltip>
                <v-tooltip location="bottom" attach="body">
                  <template #activator="{props}">
                    <v-icon
                      color="red"
                      class="mx-6"
                      v-bind="props"
                      @click="refuseDemande(item)"
                    >
                      mdi-close
                    </v-icon> <!-- Icône "Oui" en vert -->
                  </template>
                  <span>Refuser la demande</span>
                </v-tooltip>
              </div>
            </td>
          </tr>
        </template>
      </v-data-table>
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
                <span class="visitor-detail">{{ visiteur.email }}</span>
              </div>
            </v-col>
            <v-col cols="12" md="6">
              <div class="d-flex align-center">
                <v-icon color="green" class="mr-2">mdi-card-account-details-outline</v-icon>
                <span class="visitor-detail">{{ visiteur.cin }}</span>
              </div>
            </v-col>
            <v-col cols="12" md="6">
              <div class="d-flex align-center">
                <v-icon color="orange" class="mr-2">mdi-phone</v-icon>
                <span class="visitor-detail">{{ visiteur.telephone }}</span>
              </div>
            </v-col>
            <v-col cols="12" md="6">
              <div class="d-flex align-center">
                <v-icon color="purple" class="mr-2">mdi-clock-time-four</v-icon>
                <span class="visitor-detail">{{ visiteur.date_heure_arrivee }}</span>
              </div>
            </v-col>
            <v-col cols="12" md="6">
              <div class="d-flex align-center">
                <v-icon color="pink" class="mr-2">mdi-comment-text</v-icon>
                <span class="visitor-detail">{{ visiteur.motif_visite }}</span>
              </div>
            </v-col>
          </v-row>
        </v-card-text>

        <v-card-actions>
          <v-btn color="blue" text @click="dialog = false">Fermer</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Modal pour accepter un demande et generer un ticket -->
    <v-dialog v-model="genererTicket" max-width="500px" width="100%">
      <v-card elevation="3" class="rounded-lg" style="background-color: #F9FAFB;">
        <v-card-title class="text-h5 font-weight-bold" style="color: #6EC1B4; border-bottom: 2px solid #E0E0E0;">
          <v-icon left color="#6EC1B4">mdi-printer</v-icon>
          Générer un ticket
        </v-card-title>
        <v-card-text>
          <span v-if="selectedRequest">
            <div><b>Direction</b> : {{ selectedRequest.nom_direction }}</div>
            <div><b>Visiteur</b> : {{ selectedRequest.nom }} {{ selectedRequest.prenom }}</div>
            <div><b>Motif</b> : {{ selectedRequest.motif_visite }}</div>
          </span>
          <span v-else>
            <b>Aucun visiteur sélectionné.</b>
          </span>
        </v-card-text>
        <v-card-text class="card-text">
          <v-form @submit.prevent="generateTicket">
            <v-text-field
              v-model="ticket.temps_estime"
              label="Temps estimé"
              type="time"
              required
              class="input-field"
            />
          </v-form>
        </v-card-text>
        <v-card-actions class="card-actions">
          <v-btn color="secondary" @click="genererTicket=false" class="action-btn">Annuler</v-btn>
          <v-btn color="primary" @click="generateTicket" class="action-btn">Générer</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-dialog v-model="refuserDemande" max-width="500px">
      <v-card class="reject-card">
        <v-card-title class="card-title">Traitement de la demande</v-card-title>
        <v-card-text class="card-text">
          <span class="warning-text">Voulez-vous vraiment refuser ?</span>
        </v-card-text>
        <v-card-actions class="card-actions">
          <v-btn color="secondary" @click="refuserDemande=false" class="action-btn">Annuler</v-btn>
          <v-btn color="error" @click="refus" class="action-btn">Refuser</v-btn>
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
import { get, post } from '@/service/ApiService';

export default {
  data() {
    return {
      demandes: [],
      headers: [
          { title: 'Nom', value: 'nom' },
          { title: 'Prenom', value: 'prenom' },
          { title: 'Motif', value: 'motif_visite' },
          { title: 'Date et heure arrivée', value: 'date_heure_arrivee' },
          { title: 'Actions', width: '250px', align: 'center', sortable: 'false' }
      ],
      visiteur: {
          nom: '',
          prenom: '',
          motif_visite: '',
          date_heure_arrivee: '',
          cin: '',
          telephone: '',
          email: '',
          nom_direction: ''
      },
      dialog: false,
      genererTicket: false,
      selectedRequest: null,
      ticket: {
          temps_estime: '',
      },
      refuserDemande: false,

      directions: [],
      selectedDirection: null,
      snackbar: {
        show: false,
        text: '',
        color: 'success'
      },
    }
  },
  async mounted() {
    this.fetchDirection();
    this.fetchDemandes();
  },
  methods: {
    async fetchDemandes() {
        try {
          let endpoint = 'directions/demandes';
          if(this.selectedDirection) {
            endpoint = `directions/${this.selectedDirection}/demandes`;
          }
          const response = await get(endpoint)
          if (response && response.ok) {
              const data = await response.json()
              this.demandes = data.visiteurs
          }
        } catch (error) {
            console.log(error)
        }
    },
    async fetchDirection() {
      const response = await get('directions');
      if(response.ok) {
        const data = await response.json();
        console.log("directions : " + data)
        this.directions = data.directions;
      }
    },
    showDetails(item) {
        this.visiteur = item;
        this.dialog = true;
    },
    acceptDemande(item) {
        this.selectedRequest = item;
        this.genererTicket = true;
    },
    async generateTicket() {
      const idVisiteur = this.selectedRequest.id;
      let idDirection = this.selectedRequest.id_direction;
      if(this.selectedDirection) {
        idDirection = this.selectedDirection;
      }
      // console.log("idVisiteur: " + idVisiteur + " idDirection: " + idDirection + " temps estime: " + this.ticket.temps_estime);
      try {
          const response = await post(`service/generer-ticket`, {
              'temps_estime' : this.ticket.temps_estime,
              'id_direction': idDirection,
              // 'id_service' : this.selectedService,
              'id_visiteur' : idVisiteur
          });

          if (response.ok) {
            this.showSuccess('Ticket generer avec succes');
            this.selectedRequest = null;
            this.ticket.temps_estime = '';
            this.genererTicket = false;
            this.fetchDemandes()
          }
      } catch (error) {
        this.showError('Une erreur est survenue : ', error);
      }
    },
    refuseDemande(item) {
        this.selectedRequest = item;
        this.refuserDemande = true;
    },
    async refus() {
        const idService = localStorage.getItem("idService");
        const idVisiteur = this.selectedRequest.id;
        try {
            const response = await post('service/refuser-demande', {
                'id_service' : idService,
                'id_visiteur' : idVisiteur
            });

            if (response && response.ok) {
                alert('Statut refuse avec succes');
                this.refuserDemande = false;
                this.fetchDemandes()
            }
        } catch (error) {
            console.log(error)
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
  }
}
</script>

<style>
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

    .visitor-detail {
        font-size: 16px;
        color: #333; /* Assurez-vous que la couleur du texte est bien contrastée */
        font-weight: 500;
    }

    .text-grey {
        color: #757575;
    }

    /* Styles généraux des cartes */
    .ticket-card, .reject-card {
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        background-color: #f7f9fc;
        padding: 20px;
    }

    .card-title {
        font-size: 18px;
        font-weight: 600;
        color: #333;
        padding-bottom: 10px;
    }

    .card-text {
        font-size: 16px;
        color: #666;
    }

    /* Champs de saisie */
    .input-field {
        margin-bottom: 20px;
    }

    /* Texte d'avertissement dans la carte de refus */
    .warning-text {
        color: #d32f2f;
        font-weight: 500;
        font-size: 16px;
    }

    /* Actions des boutons */
    .card-actions {
        justify-content: flex-end;
    }

    .action-btn {
        margin-left: 10px;
    }

    /* Bouton refuser */
    .v-btn.error {
        background-color: #f44336;
        color: white;
    }


</style>
