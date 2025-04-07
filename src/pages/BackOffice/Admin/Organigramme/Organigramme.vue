<template>
  <v-container>
    <!-- Boutons d'action -->
    <div class="action-buttons">
      <v-tooltip location="bottom" attach="body">
        <template #activator="{ props }">
          <v-btn color="primary" fab small class="action-btn" v-bind="props" @click="addDirection">
            <v-icon>mdi-office-building-plus</v-icon>
          </v-btn>
        </template>
        <span>Ajouter une direction</span>
      </v-tooltip>

      <v-tooltip location="bottom" attach="body">
        <template v-slot:activator="{ props }">
          <v-btn color="success" fab small class="action-btn" v-bind="props" @click="addService">
            <v-icon>mdi-domain-plus</v-icon>
          </v-btn>
        </template>
        <span>Ajouter un service</span>
      </v-tooltip>

      <v-tooltip location="bottom" attach="body">
        <template v-slot:activator="{ props }">
          <v-btn color="info" fab small class="action-btn" v-bind="props" @click="addFonction">
            <v-icon>mdi-account-plus</v-icon>
          </v-btn>
        </template>
        <span>Ajouter une fonction</span>
      </v-tooltip>
    </div>

    <div ref="orgChartContainer" class="org-chart-container" />

    <!-- Modal pour l'ajout de direction -->
    <v-dialog v-model="directionDialog" max-width="500px">
      <v-card>
        <v-card-title class="text-h5 font-weight-bold" style="color: #6EC1B4; border-bottom: 2px solid #E0E0E0;">
          <v-icon left color="#6EC1B4" class="mb-1">mdi-account-plus</v-icon>
          Ajouter une direction
        </v-card-title>

        <v-card-text>
          <v-container>
            <v-row>
              <v-col cols="12">
                <v-text-field v-model="newDirection.nom" label="Nom de la direction" required
                  :rules="[v => !!v || 'Le nom est requis']" />
              </v-col>
              <v-col cols="12">
                <v-select v-model="newDirection.id_parent_dir" :items="directionItems" item-title="nom" item-value="id"
                  label="Direction parente" hint="Sélectionnez la direction parente" persistent-hint />
              </v-col>
            </v-row>
          </v-container>
        </v-card-text>

        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="error" text @click="closeDirDialog">
            Annuler
          </v-btn>
          <v-btn color="success" text @click="saveDirection" :loading="loading" :disabled="!newDirection.nom">
            Enregistrer
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Modal pour l'ajout de service -->
    <v-dialog v-model="serviceDialog" max-width="500px">
      <v-card>
        <v-card-title class="text-h5 font-weight-bold" style="color: #6EC1B4; border-bottom: 2px solid #E0E0E0;">
          <v-icon left color="#6EC1B4" class="mb-1">mdi-account-plus</v-icon>
          Ajouter un service
        </v-card-title>

        <v-card-text>
          <v-container>
            <v-row>
              <v-col cols="12">
                <v-text-field v-model="newService.nom" label="Nom du service" required
                  :rules="[v => !!v || 'Le nom est requis']" />
              </v-col>
              <v-col cols="12">
                <v-select v-model="newService.id_direction" :items="directionItems" item-title="nom" item-value="id"
                  label="Direction" hint="Sélectionnez la direction" persistent-hint required
                  :rules="[v => !!v || 'La direction est requise']" />
              </v-col>
            </v-row>
          </v-container>
        </v-card-text>

        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="error" text @click="closeServiceDialog">
            Annuler
          </v-btn>
          <v-btn color="success" text @click="saveService" :loading="loading"
            :disabled="!newService.nom || !newService.id_direction">
            Enregistrer
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Modal pour l'ajout de fonction -->
    <v-dialog v-model="fonctionDialog" max-width="800px">
      <v-card>
        <v-card-title class="text-h5 font-weight-bold" style="color: #6EC1B4; border-bottom: 2px solid #E0E0E0;">
          <v-row>
            <v-col>
              <v-icon left color="#6EC1B4" class="mb-1">mdi-view-list</v-icon>
              <span>{{ showForm ? 'Nouvelle fonction' : 'Liste des fonctions' }}</span>
            </v-col>
            <v-col class="d-flex align-center justify-end">
              <v-btn color="primary" variant="flat" size="small" @click="toggleForm">
                <v-icon left>{{ showForm ? 'mdi-arrow-left' : 'mdi-plus' }}</v-icon>
                {{ showForm ? 'Retour à la liste' : 'Ajouter une fonction' }}
              </v-btn>
            </v-col>
          </v-row>
        </v-card-title>

        <v-card-text>
          <v-container>
            <!-- Affichage conditionnel -->
            <v-row v-if="!showForm">
              <v-col cols="12">
                <!-- Tableau des fonctions existantes -->
                <v-data-table :items="fonctions" :headers="headersFonctions" :items-per-page="perPage"
                  class="elevation-1" dense :hide-default-footer="true" :no-data-text="'Aucun employé'"
                  :loading-text="'Chargement des employés...'">
                  <!-- Templates des colonnes -->
                  <template v-slot:item.service.nom="{ item }">
                    {{ item.service ? item.service.nom : 'N/A' }}
                  </template>
                  <template v-slot:item.direction.nom="{ item }">
                    {{ item.direction ? item.direction.nom : 'N/A' }}
                  </template>
                </v-data-table>

                <!-- Pagination -->
                <v-row justify="center" class="mt-4">
                  <v-col cols="8">
                    <v-container class="max-width">
                      <v-pagination v-model="currentPage" :length="totalPages" class="my-4" rounded="circle"
                        @update:model-value="fetchFonctions" />
                    </v-container>
                  </v-col>
                </v-row>
              </v-col>
            </v-row>

            <!-- Formulaire (affiché uniquement quand showForm est true) -->
            <v-row v-if="showForm">
              <v-col cols="12">
                <v-text-field v-model="newFonction.nom" label="Nom de la fonction" required
                  :rules="[v => !!v || 'Le nom est requis']" />
                <v-select v-model="newFonction.id_direction" :items="directionItems" item-title="nom" item-value="id"
                  label="Direction" hint="Sélectionnez la direction" persistent-hint required
                  :rules="[v => !!v || 'La direction est requise']" @change="onDirectionChange" />
                <v-select v-model="newFonction.id_service" :items="filteredServiceItems" item-title="nom"
                  item-value="id" label="Service" hint="Sélectionnez le service (optionnel)" persistent-hint
                  :disabled="!newFonction.id_direction" clearable />
              </v-col>
            </v-row>
          </v-container>
        </v-card-text>

        <!-- Actions du formulaire -->
        <v-card-actions v-if="showForm">
          <v-spacer></v-spacer>
          <v-btn color="error" text @click="closeFonctionDialog">Annuler</v-btn>
          <v-btn color="success" text @click="saveFonction" :loading="loading"
            :disabled="!newFonction.nom || !newFonction.id_direction">
            Enregistrer
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
    <!-- <v-dialog v-model="fonctionDialog" max-width="500px">
      <v-card>
        <v-card-title>
          <span class="headline">Ajouter une fonction</span>
        </v-card-title>

        <v-card-text>
          <v-container>
            <v-row>
              <v-col cols="12">
                <v-text-field
                  v-model="newFonction.nom"
                  label="Nom de la fonction"
                  required
                  :rules="[v => !!v || 'Le nom est requis']"
                />
              </v-col>
              <v-col cols="12">
                <v-select
                  v-model="newFonction.id_direction"
                  :items="directionItems"
                  item-title="nom"
                  item-value="id"
                  label="Direction"
                  hint="Sélectionnez la direction"
                  persistent-hint
                  required
                  :rules="[v => !!v || 'La direction est requise']"
                  @change="onDirectionChange"
                />
              </v-col>
              <v-col cols="12">
                <v-select
                  v-model="newFonction.id_service"
                  :items="filteredServiceItems"
                  item-title="nom"
                  item-value="id"
                  label="Service"
                  hint="Sélectionnez le service (optionnel)"
                  persistent-hint
                  :disabled="!newFonction.id_direction"
                  clearable
                />
              </v-col>
            </v-row>
          </v-container>
        </v-card-text>

        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn
            color="error"
            text
            @click="closeFonctionDialog"
          >
            Annuler
          </v-btn>
          <v-btn
            color="success"
            text
            @click="saveFonction"
            :loading="loading"
            :disabled="!newFonction.nom || !newFonction.id_direction"
          >
            Enregistrer
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog> -->

    <!-- Modal de modification -->
    <v-dialog v-model="editDialog" max-width="500px">
      <v-card>
        <v-card-title>
          <span class="headline">Modifier {{ editedItem.type === 'service' ? 'le service' : 'la direction' }}</span>
        </v-card-title>

        <v-card-text>
          <v-container>
            <v-row>
              <v-col cols="12">
                <v-text-field v-model="editedItem.nom" label="Nom" required
                  :rules="[v => !!v || 'Le nom est requis']" />
              </v-col>
              <v-col cols="12" v-if="editedItem.type === 'service'">
                <v-select v-model="editedItem.id_direction" :items="directionItems" item-title="nom" item-value="id"
                  label="Direction" required />
              </v-col>
              <v-col cols="12" v-else>
                <v-select v-model="editedItem.id_direction" :items="directionItems" item-title="nom" item-value="id"
                  label="Direction parente" />
              </v-col>
            </v-row>
          </v-container>
        </v-card-text>

        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="error" text @click="editDialog = false">Annuler</v-btn>
          <v-btn color="success" text @click="saveEdit" :loading="loading" :disabled="!editedItem.nom">
            Modifier
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Modal de confirmation de suppression -->
    <v-dialog v-model="deleteDialog" max-width="500px">
      <v-card>
        <v-card-title class="text-h5">Confirmation de suppression</v-card-title>
        <v-card-text>
          Êtes-vous sûr de vouloir supprimer {{ selectedNode?.type === 'service' ? 'ce service' : 'cette direction' }} ?
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="error" text @click="deleteDialog = false">Annuler</v-btn>
          <v-btn color="success" text @click="confirmDelete" :loading="loading">
            Confirmer
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Snackbar pour les notifications -->
    <v-snackbar v-model="snackbar.show" :color="snackbar.color" :timeout="3000">
      {{ snackbar.text }}
    </v-snackbar>
  </v-container>
</template>

<script>
import { get, del, post, put } from '@/service/ApiService';
import OrgChart from '@balkangraph/orgchart.js'

export default {
  name: 'Organigramme',

  data() {
    return {
      chart: null,
      width_node: 320,
      height_node: 100,
      nodeMenuButton_x: 290, // width_node - 30
      nodeMenuButton_y: 90,  // height_node - 10
      directions: [],
      services: [],
      // Ajout des dialogues
      directionDialog: false,
      serviceDialog: false,
      fonctionDialog: false,
      loading: false,
      newDirection: {
        nom: '',
        id_parent_dir: null
      },
      newService: {
        nom: '',
        id_direction: null
      },
      newFonction: {
        nom: '',
        id_direction: null,
        id_service: null
      },
      snackbar: {
        show: false,
        text: '',
        color: 'success'
      },
      editDialog: false,
      deleteDialog: false,
      selectedNode: null,
      editedItem: {
        id: null,
        nom: '',
        id_direction: null,
        type: null
      },
      fonctions: [],
      headersFonctions: [
        { title: 'Nom', value: 'nom' },
        { title: 'Direction', value: 'direction.nom' },
        { title: 'Service', value: 'service.nom' }
      ],
      currentPage: null, // Page actuelle
      totalPages: 1, // Nombre total de pages
      perPage: 10, // Nombre d'éléments par page
      showForm: false,
    }
  },

  computed: {
    directionItems() {
      return this.directions.map(dir => ({
        id: dir.id,
        nom: dir.nom
      }));
    },
    filteredServiceItems() {
      if (!this.newFonction.id_direction) return [];
      return this.services
        .filter(service => service.id_direction === this.newFonction.id_direction)
        .map(service => ({
          id: service.id,
          nom: service.nom
        }));
    }
  },

  mounted() {
    this.initializeChart();
  },

  methods: {
    directionTemplate() {
      OrgChart.templates.direction = Object.assign({}, OrgChart.templates.ana);
      OrgChart.templates.direction.size = [350, 100];
      OrgChart.templates.direction.img_0 = "";
      OrgChart.templates.direction.node = `
        <rect x="0" y="0" width=${this.width_node} height=${this.height_node}
          fill="#4CAF50" stroke="#2E7D32" stroke-width="2" rx="10" ry="10">
        </rect>
      `;
      OrgChart.templates.direction.field_0 = `
        <foreignObject x="0" y="0" width=${this.width_node} height=${this.height_node}>
          <div xmlns="http://www.w3.org/1999/xhtml" style="
            display: flex;
            padding: 10px 20px;
            align-items: center;
            height: 100%;
            font-size: 20px;
            font-weight: bold;
            color: #fff;
            text-align: left;
            word-wrap: break-word;
            white-space: normal;
            overflow: hidden;
          "><span>{val}</span></div>
        </foreignObject>
      `;
      OrgChart.templates.direction.field_1 = "";
      OrgChart.templates.direction.nodeMenuButton = `
        <g style="cursor:pointer;" transform="matrix(1,0,0,1,${this.nodeMenuButton_x},${this.nodeMenuButton_y})" data-ctrl-n-menu-id="{id}">
          <rect x="-10" y="-5" fill="#000000" fill-opacity="0" width="30" height="30"></rect>
          <circle cx="-10" cy="0" r="5" fill="#fff"></circle>
          <circle cx="5" cy="0" r="5" fill="#fff"></circle>
          <circle cx="20" cy="0" r="5" fill="#fff"></circle>
        </g>
      `;
    },

    serviceTemplate() {
      OrgChart.templates.service = Object.assign({}, OrgChart.templates.ana);
      OrgChart.templates.service.size = [350, 100];
      OrgChart.templates.service.img_0 = "";
      OrgChart.templates.service.node = `
        <rect x="0" y="0" width=${this.width_node} height=${this.height_node}
          fill="#fff" stroke="#2E7D32" stroke-width="2" rx="10" ry="10">
        </rect>
      `;
      OrgChart.templates.service.field_0 = `
        <foreignObject x="0" y="0" width=${this.width_node} height=${this.height_node}>
          <div xmlns="http://www.w3.org/1999/xhtml" style="
            display: flex;
            padding: 10px 20px;
            align-items: center;
            height: 100%;
            font-size: 22px;
            font-weight: bold;
            color: #4CAF50;
            text-align: left;
            word-wrap: break-word;
            white-space: normal;
            overflow: hidden;
          "><span>{val}</span></div>
        </foreignObject>
      `;
      OrgChart.templates.service.field_1 = "";
      OrgChart.templates.service.nodeMenuButton = `
        <g style="cursor:pointer;" transform="matrix(1,0,0,1,${this.nodeMenuButton_x},${this.nodeMenuButton_y})" data-ctrl-n-menu-id="{id}">
          <rect x="-10" y="-5" fill="#4CAF50" fill-opacity="0" width="30" height="30"></rect>
          <circle cx="-10" cy="0" r="5" fill="#4CAF50"></circle>
          <circle cx="5" cy="0" r="5" fill="#4CAF50"></circle>
          <circle cx="20" cy="0" r="5" fill="#4CAF50"></circle>
        </g>
      `;
    },

    async fetchData() {
      try {
        // Récupérer les directions
        const dirResponse = await fetch('http://localhost:8000/api/directions');
        const dirData = await dirResponse.json();
        this.directions = dirData.directions;

        // Récupérer les services
        const servResponse = await fetch('http://localhost:8000/api/services');
        const servData = await servResponse.json();
        this.services = servData.services;

        return this.formatChartData();
      } catch (error) {
        console.error('Erreur lors du chargement des données:', error);
      }
    },

    formatChartData() {
      return [
        // Transformer les directions
        ...this.directions.map(dir => ({
          id: dir.id,
          pid: dir.id_parent_dir || '', // Si null, sera la racine
          name: dir.nom.toUpperCase(),
          type: "direction"
        })),
        // Transformer les services
        ...this.services.map(serv => ({
          id: `serv_${serv.id}`,
          pid: serv.id_direction,
          name: serv.nom.toUpperCase(),
          tags: ["assistant"],
          type: "service"
        }))
      ];
    },

    async initializeChart() {
      if (!this.$refs.orgChartContainer) return;

      this.directionTemplate();
      this.serviceTemplate();

      try {
        const chartData = await this.fetchData();

        this.chart = new OrgChart(this.$refs.orgChartContainer, {
          template: "direction",
          layout: OrgChart.normal,
          scaleInitial: 0.7,
          enableDragDrop: false,
          nodeMouseClick: OrgChart.action.none,
          nodeMouseDbClick: OrgChart.none,
          mouseScrool: OrgChart.none,
          enablePan: true,
          enableSearch: false,
          toolbar: {
            zoom: true,
            fit: true,
          },
          nodeBinding: {
            field_0: "name",
          },
          tags: {
            "assistant": {
              template: "service"
            }
          },
          nodeMenu: {
            edit: {
              text: "Modifier",
              icon: '<i class="mdi mdi-pencil"></i>',
              onClick: this.handleEdit
            },
            remove: {
              text: "Supprimer",
              icon: '<i class="mdi mdi-delete"></i>',
              onClick: this.handleDelete
            }
          }
        });

        this.chart.load(chartData);
      } catch (error) {
        console.error('Erreur:', error);
      }
    },

    addDirection() {
      this.newDirection = {
        nom: '',
        id_parent_dir: null
      };
      this.directionDialog = true;
    },

    closeDirDialog() {
      this.directionDialog = false;
      this.newDirection = {
        nom: '',
        id_parent_dir: null
      };
    },

    async saveDirection() {
      if (!this.newDirection.nom) return;

      this.loading = true;
      try {
        const response = await post('direction/register', this.newDirection);

        const data = await response.json();

        if (response.ok) {
          this.showSnackbar('Direction ajoutée avec succès', 'success');
          this.closeDirDialog();
          // Rafraîchir l'organigramme
          await this.initializeChart();
        } else {
          throw new Error(data.message || 'Erreur lors de l\'ajout de la direction');
        }
      } catch (error) {
        console.error('Erreur:', error);
        this.showSnackbar(error.message, 'error');
      } finally {
        this.loading = false;
      }
    },

    showSnackbar(text, color = 'success') {
      this.snackbar.text = text;
      this.snackbar.color = color;
      this.snackbar.show = true;
    },

    addService() {
      this.newService = {
        nom: '',
        id_direction: null
      };
      this.serviceDialog = true;
    },

    closeServiceDialog() {
      this.serviceDialog = false;
      this.newService = {
        nom: '',
        id_direction: null
      };
    },

    async saveService() {
      if (!this.newService.nom || !this.newService.id_direction) return;

      this.loading = true;
      try {
        const response = await post('service/register', this.newService);
        const data = await response.json();

        if (response.ok) {
          this.showSnackbar('Service ajouté avec succès', 'success');
          this.closeServiceDialog();
          // Rafraîchir l'organigramme
          await this.initializeChart();
        } else {
          throw new Error(data.message || 'Erreur lors de l\'ajout du service');
        }
      } catch (error) {
        console.error('Erreur:', error);
        this.showSnackbar(error.message, 'error');
      } finally {
        this.loading = false;
      }
    },

    toggleForm() {
      this.showForm = !this.showForm
      if (!this.showForm) {
        this.newFonction = { // Réinitialiser le formulaire
          nom: '',
          id_direction: null,
          id_service: null
        }
      }
    },

    async fetchFonctions() {
      try {
        let url = 'fonctions';
        if(this.currentPage) {
          url += `?page=${this.currentPage}`
        }

        console.log(url)
        const response = await get(url);

        if (response.ok) {
          const data = await response.json();
          this.fonctions = data.fonctions.data;
          this.currentPage = data.fonctions.current_page;
          this.totalPages = data.fonctions.last_page;
        }
      } catch (error) {
        console.error('Erreur lors de la récupération des fonctions:', error);
      }
    },

    addFonction() {
      this.newFonction = {
        nom: '',
        id_direction: null,
        id_service: null
      };
      this.fetchFonctions();
      this.fonctionDialog = true;
    },

    closeFonctionDialog() {
      this.fonctionDialog = false
      this.showForm = false // Réinitialiser l'état à la fermeture
      this.newFonction = {
        nom: '',
        id_direction: null,
        id_service: null
      };
    },

    onDirectionChange() {
      // Réinitialiser le service sélectionné quand la direction change
      this.newFonction.id_service = null;
    },

    async saveFonction() {
      if (!this.newFonction.nom || !this.newFonction.id_direction) return;

      this.loading = true;
      try {
        const response = await post('fonction/register', this.newFonction);

        const data = await response.json();

        if (response.ok) {
          this.showForm = false
          this.showSnackbar('Fonction ajoutée avec succès', 'success');
          this.closeFonctionDialog();
          // Rafraîchir l'organigramme
          await this.initializeChart();
        } else {
          throw new Error(data.message || 'Erreur lors de l\'ajout de la fonction');
        }
      } catch (error) {
        console.error('Erreur:', error);
        this.showSnackbar(error.message, 'error');
      } finally {
        this.loading = false;
      }
    },

    // Méthodes pour la modification
    handleEdit(nodeId) {
      const node = this.chart.get(nodeId);
      this.selectedNode = node;

      // Nettoyer l'ID si c'est un service (enlever le préfixe 'serv_')
      const cleanId = node.type === 'service' ? parseInt(nodeId.replace('serv_', '')) : nodeId;

      this.editedItem = {
        id: cleanId,
        nom: node.name,
        id_direction: node.type === 'service' ? node.pid : node.id_parent_dir,
        type: node.type
      };
      this.editDialog = true;
    },

    async saveEdit() {
      try {
        this.loading = true;
        const endpoint = this.editedItem.type === 'service' ? 'service' : 'direction';
        const response = await put(`${endpoint}/${this.editedItem.id}/update`, {
          nom: this.editedItem.nom,
          id_direction: this.editedItem.type === 'service' ? this.editedItem.id_direction : null,
          id_parent_dir: this.editedItem.type === 'direction' ? this.editedItem.id_direction : null
        });

        if (response.ok) {
          this.showSnackbar(`${this.editedItem.type === 'service' ? 'Service' : 'Direction'} modifié avec succès`, 'success');
          this.editDialog = false;
          await this.initializeChart();
        } else {
          throw new Error('Erreur lors de la modification');
        }
      } catch (error) {
        this.showSnackbar(error.message, 'error');
      } finally {
        this.loading = false;
      }
    },

    // Méthodes pour la suppression
    handleDelete(nodeId) {
      const node = this.chart.get(nodeId);
      // Nettoyer l'ID si c'est un service (enlever le préfixe 'serv_')
      const cleanId = node.type === 'service' ? parseInt(nodeId.replace('serv_', '')) : nodeId;

      this.selectedNode = {
        ...node,
        id: cleanId // Remplacer l'ID avec la version nettoyée
      };
      this.deleteDialog = true;
    },

    async confirmDelete() {
      try {
        this.loading = true;
        const endpoint = this.selectedNode.type === 'service' ? 'service' : 'direction';
        // const response = await fetch(`http://localhost:8000/api/admin/${endpoint}/${this.selectedNode.id}/delete`, {
        //   method: 'DELETE',
        //   headers: {
        //     'Content-Type': 'application/json',
        //   }
        // });
        const response = await del(`${endpoint}/${this.selectedNode.id}/delete`);

        if (response.ok) {
          this.showSnackbar(`${this.selectedNode.type === 'service' ? 'Service' : 'Direction'} supprimé avec succès`, 'success');
          this.deleteDialog = false;
          await this.initializeChart();
        } else {
          throw new Error('Erreur lors de la suppression');
        }
      } catch (error) {
        this.showSnackbar(error.message, 'error');
      } finally {
        this.loading = false;
      }
    }
  }
}
</script>

<style scoped>
.v-container {
  max-width: 100%;
  padding: 20px;
  position: relative;
}

.org-chart-container {
  height: 85vh;
  width: 100%;
  min-height: 500px;
  border-radius: 20px;
  background-color: white;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

/* Styles pour les boutons d'action */
.action-buttons {
  position: absolute;
  top: 20px;
  right: 20px;
  display: flex;
  gap: 10px;
  z-index: 100;
}

.action-btn {
  box-shadow: 0 2px 8px rgba(0,0,0,0.2);
  transition: transform 0.2s;
}

.action-btn:hover {
  transform: scale(1.1);
}

/* Couleurs spécifiques pour chaque bouton */
.v-btn.primary {
  background-color: #1976d2 !important;
}

.v-btn.success {
  background-color: #4CAF50 !important;
}

.v-btn.info {
  background-color: #2196F3 !important;
}

.v-dialog {
  border-radius: 8px;
}

.headline {
  color: #1976d2;
  font-weight: bold;
}

.v-card {
  border-radius: 8px;
}

.v-card__title {
  background-color: #f5f5f5;
  padding: 16px;
}

.v-card__text {
  padding-top: 20px;
}

.v-card__actions {
  padding: 16px;
}

/* Ajout de styles pour les tooltips */
:deep(.v-tooltip__content) {
  background-color: rgba(97, 97, 97, 0.9) !important;
  color: white !important;
  font-size: 12px !important;
  padding: 5px 10px !important;
  border-radius: 4px !important;
}
</style>
