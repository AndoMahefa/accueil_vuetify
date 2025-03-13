<!-- eslint-disable vue/singleline-html-element-content-newline -->
<!-- eslint-disable vue/order-in-components -->
<!-- eslint-disable vue/attributes-order -->
<!-- eslint-disable vue/max-attributes-per-line -->
<template>
  <v-container>
    <h1 v-if="reference_ppm != null">Gestion des Champs pour Appel d'Offre : {{ reference_ppm.reference }}</h1>
    <br>

    <!-- Liste des champs -->
    <v-row>
      <v-col
        v-for="champ in champs"
        :key="champ.id"
        cols="12"
        md="4"
        class="mb-4"
      >
        <v-card class="pa-2">
          <!-- Ligne avec checkbox et icônes -->
          <v-card-title class="d-flex align-center justify-space-between">
            <!-- Checkbox avec label -->
            <div class="d-flex align-center">
              <v-checkbox
                v-model="selectedChamps"
                :value="champ.id"
                :label="champ.nom_champ"
                hide-details
                class="ma-0"
              />
            </div>

            <!-- Icônes Modifier et Supprimer -->
            <div class="d-flex align-center justify-space-between" style="gap: 10px">
              <v-btn icon small color="primary" @click="editChamp(champ)">
                <v-icon style="font-size: 20px;">mdi-pencil</v-icon>
              </v-btn>
              <v-btn
                icon
                small
                color="error"
                @click="openDeleteDialog(champ.id)"
              >
                <v-icon style="font-size: 20px;">mdi-delete</v-icon>
              </v-btn>
            </div>
          </v-card-title>
        </v-card>
      </v-col>
    </v-row>

    <br>

    <v-btn
      color="success"
      @click="openDynamicFormModal"
      :disabled="selectedChamps.length === 0"
    >
      Valider les Champs
    </v-btn>

    <v-btn
      color="primary"
      @click="exportToExcel"
      :disabled="selectedChamps.length === 0"
      style="left: 25px;"
    >
      Exporter en Excel
    </v-btn>

    <v-tooltip>
      <template #activator="{props}">
        <v-btn
          fab
          color="success"
          @click="openImportDialog"
          rounded
          v-bind="props"
          large
          style="position: fixed; bottom: 135px; right: 50px; width: 60px; height: 60px; font-size: 30px;"
        >
          <v-icon>mdi-upload</v-icon>
        </v-btn>
      </template>
      <span>Importer des données</span>
    </v-tooltip>

    <v-tooltip>
      <template #activator="{props}">
        <v-btn
          fab
          color="primary"
          @click="openAddChampDialog"
          rounded
          v-bind="props"
          large
          style="position: fixed; bottom: 70px; right: 50px; width: 60px; height: 60px; font-size: 30px;">
          <v-icon>mdi-plus</v-icon>
        </v-btn>
      </template>
      <span>Ajouter un nouveau champ</span>
    </v-tooltip>

    <v-dialog v-model="isImportDialogOpen" max-width="600px">
      <v-card>
        <v-card-title>Importer un fichier Excel</v-card-title>
        <v-card-text>
          <v-file-input
            label="Sélectionnez un fichier Excel"
            v-model="importFile"
            accept=".xlsx"
            outlined
            dense
          />
        </v-card-text>
        <v-card-actions>
          <v-btn color="primary" @click="importExcel" :disabled="!importFile">
            Importer
          </v-btn>
          <v-btn text @click="closeImportDialog">Annuler</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Dialog Ajouter un Champ (version stylisée) -->
    <v-dialog v-model="isDialogOpen" max-width="600px">
      <v-card class="rounded-lg">
        <!-- En-tête coloré -->
        <v-card-title class="primary white--text pa-4">
          <span class="headline font-weight-bold">Nouveau Champ Personnalisé</span>
          <v-spacer />
        </v-card-title>

        <v-card-text class="pa-6">
          <v-form ref="addChampForm" v-model="isFormValid">
            <v-text-field
              label="Nom du champ*"
              v-model="newChamp.nom_champ"
              :rules="[rules.required]"
              outlined
              dense
              class="mb-4"
              prepend-inner-icon="mdi-form-textbox"
            />

            <v-select
              label="Type de champ*"
              :items="typesChamps"
              v-model="newChamp.type_champ"
              :rules="[rules.required]"
              outlined
              dense
              class="mb-4"
              prepend-inner-icon="mdi-form-dropdown"
              item-title="text"
              item-value="value"
            />

            <!-- Remplacer le textarea par ce v-combobox dans les deux modals -->
            <v-combobox
              v-if="newChamp.type_champ === 'select' || newChamp.type_champ === 'radio'"
              v-model="newChamp.options"
              label="Options disponibles"
              multiple
              chips
              outlined
              dense
              hint="Appuyez sur Entrée ou tapez une virgule pour ajouter une option"
              persistent-hint
              append-icon=""
              class="mb-4"
              prepend-inner-icon="mdi-format-list-bulleted"
              @keydown.enter.prevent
            >
              <template v-slot:selection="{ item, index }">
                <v-chip
                  close
                  @click:close="removeOption(index)"
                  class="ma-1"
                  color="primary"
                  small
                >
                  {{ item }}
                </v-chip>
              </template>
            </v-combobox>
          </v-form>
        </v-card-text>

        <v-divider></v-divider>

        <v-card-actions class="pa-4">
          <v-spacer></v-spacer>
          <v-btn
            text
            @click="closeAddChampDialog"
            class="mr-2"
          >
            Annuler
          </v-btn>
          <v-btn
            color="primary"
            depressed
            @click="addChamp"
            :disabled="!isFormValid"
            class="px-6"
          >
            <v-icon left>mdi-check</v-icon>
            Créer
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Dialog Modifier un Champ -->
    <v-dialog v-model="isEditDialogOpen" width="100%" max-width="600px">
      <v-card>
        <v-card-title>
          <span class="headline">Modifier le Champ</span>
        </v-card-title>

        <v-card-text>
          <v-form ref="editChampForm" v-model="isEditFormValid">
            <v-text-field
              label="Nom du Champ"
              v-model="editedChamp.nom_champ"
              :rules="[rules.required]"
              required
            />
            <v-select
              label="Type de Champ"
              :items="typesChamps"
              v-model="editedChamp.type_champ"
              item-title="text"
              :rules="[rules.required]"
              required
            />
            <!-- Dans le modal d'édition -->
            <v-combobox
              v-if="editedChamp.type_champ === 'select' || editedChamp.type_champ === 'radio'"
              v-model="editedChamp.options"
              label="Options disponibles"
              multiple
              chips
              outlined
              dense
              hint="Appuyez sur Entrée ou tapez une virgule pour ajouter une option"
              persistent-hint
              append-icon=""
              class="mb-4"
              prepend-inner-icon="mdi-format-list-bulleted"
              @keydown.enter.prevent
            >
              <template v-slot:selection="{ item, index }">
                <v-chip
                  close
                  @click:close="removeEditedOption(index)"
                  class="ma-1"
                  color="primary"
                  small
                >
                  {{ item }}
                </v-chip>
              </template>
            </v-combobox>
          </v-form>
        </v-card-text>

        <v-card-actions>
          <v-btn color="primary" @click="saveEditedChamp" :disabled="!isEditFormValid">
            Sauvegarder
          </v-btn>
          <v-btn text @click="closeEditChampDialog">Annuler</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Dialog Formulaire Dynamique -->
    <v-dialog v-model="isFormModalOpen" width="100%" max-width="700px">
      <v-card>
        <v-card-title>
          <span class="headline">Ajouter un appel d'offre</span>
        </v-card-title>

        <v-card-text>
          <v-form ref="dynamicForm">
            <div v-for="field in dynamicFormFields" :key="field.id" class="mb-4">
              <v-text-field
                v-if="field.type_champ === 'text'"
                :label="field.nom_champ"
                v-model="formData[field.nom_champ]"
              />
              <v-textarea
                v-else-if="field.type_champ === 'textarea'"
                :label="field.nom_champ"
                v-model="formData[field.nom_champ]"
              />
              <v-select
                v-else-if="field.type_champ === 'select'"
                :label="field.nom_champ"
                :items="field.options"
                v-model="formData[field.nom_champ]"
              />
              <v-checkbox
                v-else-if="field.type_champ === 'checkbox'"
                :label="field.nom_champ"
                v-model="formData[field.nom_champ]"
              />
              <v-radio-group
                v-else-if="field.type_champ === 'radio'"
                :label="field.nom_champ"
                v-model="formData[field.nom_champ]"
              >
                <v-radio
                  v-for="option in field.options"
                  :key="option"
                  :label="option"
                  :value="option"
                />
              </v-radio-group>
              <v-file-input
                v-else-if="field.type_champ === 'file'"
                :label="field.nom_champ"
                v-model="formData[field.nom_champ]"
              />
              <v-text-field
                v-else-if="field.type_champ === 'date'"
                type="date"
                :label="field.nom_champ"
                v-model="formData[field.nom_champ]"
              />
            </div>
          </v-form>
        </v-card-text>

        <v-card-actions>
          <v-btn color="primary" @click="submitForm">Soumettre</v-btn>
          <v-btn text @click="closeDynamicFormModal">Annuler</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-dialog v-model="isDeleteDialogOpen" width="100%" max-width="500px">
      <v-card>
        <v-card-title class="headline">Confirmer la suppression</v-card-title>
        <v-card-text>
          Êtes-vous sûr de vouloir supprimer définitivement ce champ ?
        </v-card-text>
        <v-card-actions>
          <v-btn color="error" @click="confirmDelete">Confirmer</v-btn>
          <v-btn text @click="closeDeleteDialog">Annuler</v-btn>
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
import { del, get, post, postFormData, put } from '@/service/ApiService';
import * as XLSX from 'xlsx';

export default {
  data() {
    return {
      champs: [], // Liste des champs récupérés
      selectedChamps: [], // Liste des IDs de champs sélectionnés

      dynamicFormFields: [],
      formData: {},
      isFormModalOpen: false,

      isDialogOpen: false, // État de la fenêtre modale
      newChamp: {
        nom_champ: "",
        type_champ: "",
        options: [], // Changer en tableau
      },
      editedChamp: {
        nom_champ: "",
        type_champ: "",
        options: [] // Changer en tableau
      },
      isFormValid: false,
      rules: {
        required: (value) => !!value || "Ce champ est obligatoire",
      },

      isEditDialogOpen: false,
      isEditFormValid: false,
      reference_ppm: null,

      isDeleteDialogOpen: false,
      champToDeleteId: null,

      typesChamps: [
        {
          text: "Texte court",
          value: "text",
          icon: "mdi-form-textbox"
        },
        {
          text: "Texte long",
          value: "textarea",
          icon: "mdi-text-box"
        },
        {
          text: "Date",
          value: "date",
          icon: "mdi-calendar"
        },
        {
          text: "Liste déroulante",
          value: "select",
          icon: "mdi-menu-down"
        },
        {
          text: "Case à cocher",
          value: "checkbox",
          icon: "mdi-checkbox-marked"
        },
        {
          text: "Boutons radio",
          value: "radio",
          icon: "mdi-radiobox-marked"
        },
        {
          text: "Fichier",
          value: "file",
          icon: "mdi-file-upload"
        }
      ],

      isImportDialogOpen: false,
      importFile: null, // Fichier sélectionné

      snackbar: {
        show: false,
        text: '',
        color: 'success'
      },
    };
  },
  mounted() {
    this.fetchChamps();
    const referenceQuery = this.$route.query.reference;
    console.log("reference query : " + referenceQuery )
    if (referenceQuery) {
      this.reference_ppm = JSON.parse(referenceQuery);
    }
  },
  methods: {
    removeOption(index) {
      this.newChamp.options.splice(index, 1);
    },
    removeEditedOption(index) {
      this.editedChamp.options.splice(index, 1);
    },
    // Récupérer les champs depuis l'API
    async fetchChamps() {
      try {
        const response = await get('prmp/appel-offre-champs')

        if(response.ok) {
          const data = await response.json();
          this.champs = data;
        }
      } catch (error) {
        console.error("Erreur lors de la récupération des champs :", error);
      }
    },
    openDeleteDialog(champId) {
      this.champToDeleteId = champId;
      this.isDeleteDialogOpen = true;
    },

    closeDeleteDialog() {
      this.isDeleteDialogOpen = false;
      this.champToDeleteId = null;
    },
    async confirmDelete() {
      if (!this.champToDeleteId) return;

      try {
        const response = await del(`prmp/delete-champ/${this.champToDeleteId}`)

        if(response.ok) {
          const data = await response.json()
          await this.fetchChamps();
          this.showSuccess(data.message);
        } else {
          this.showError('Erreur lors de la suppression');
        }
      } catch (error) {
        console.error("Erreur lors de la suppression :", error);
      } finally {
        this.closeDeleteDialog();
      }
    },
    // Ouvrir la boîte de dialogue pour ajouter un champ
    openAddChampDialog() {
      this.isDialogOpen = true;
    },
    // Fermer la boîte de dialogue
    closeAddChampDialog() {
      this.isDialogOpen = false;
      this.resetNewChamp();
    },
    // Réinitialiser les données du nouveau champ
    resetNewChamp() {
      this.newChamp = {
        nom_champ: "",
        type_champ: "",
        options: "",
      };
    },
    // Ajouter un nouveau champ via l'API
    async addChamp() {
      try {

        const payload = {
          nom_champ: this.newChamp.nom_champ,
          type_champ: this.newChamp.type_champ,
          options: this.newChamp.options // Envoi direct du tableau
        };


        const response = await post('prmp/ajout-champ', {
          ...payload
        })

        if(response.ok) {
          this.showSuccess('Champ ajouté avec succès');
          this.closeAddChampDialog();
          this.fetchChamps(); // Recharger la liste des champs
        }
      } catch (error) {
        this.showError('Erreur lors de l\'ajout du champ');
        console.error("Erreur lors de l'ajout du champ :", error);
      }
    },
    openDynamicFormModal() {
      this.dynamicFormFields = this.champs.filter((champ) =>
        this.selectedChamps.includes(champ.id)
      );
      this.formData = {};
      this.isFormModalOpen = true;
    },
    closeDynamicFormModal() {
      this.isFormModalOpen = false;
    },
    async submitForm() {
    // Construire les données à partir des champs dynamiques
      const formDataArray = this.dynamicFormFields.map((field) => ({
        id_appel_offre_champs: field.id,
        valeur: this.formData[field.nom_champ],
      }));

      console.log(formDataArray)
      const response = await post('prmp/appel-offre-donnees', {
        'data': formDataArray,
        'id_reference': this.reference_ppm.id
      })

      if(response.ok) {
        const data = await response.json();
        alert(data.message)
        this.closeDynamicFormModal();
      } else {
        alert('Erreur lors de la soumission du formulaire')
      }
    },
    // edit champ
    editChamp(champ) {
      this.editedChamp = { ...champ }; // Crée une copie du champ à modifier
      this.isEditDialogOpen = true; // Ouvre la boîte de dialogue
    },
    // Fermer la boîte de dialogue de modification
    closeEditChampDialog() {
      this.isEditDialogOpen = false;
      this.resetEditedChamp();
    },
    resetEditedChamp() {
      this.editedChamp = {
        nom_champ: "",
        type_champ: "",
        options: "",
      };
    },
    // Sauvegarder les modifications du champ
    async saveEditedChamp() {
      try {
        const payload = {
          nom_champ: this.editedChamp.nom_champ,
          type_champ: this.editedChamp.type_champ,
          options: this.editChamp.options
        };

        console.log(payload)
        const response = await put(`prmp/modif-champ-appel/${this.editedChamp.id}`, {
          ...payload
        })

        if (response.ok) {
          alert('Champ modifié avec succès');
          this.closeEditChampDialog();
          this.fetchChamps(); // Recharger la liste des champs
        } else {
          alert('Erreur lors de la modification du champ');
        }
      } catch (error) {
        console.error("Erreur lors de la modification du champ :", error);
      }
    },
    exportToExcel() {
      try {
        // 1. Filtrer les champs sélectionnés
        const selectedFields = this.champs.filter(champ =>
          this.selectedChamps.includes(champ.id)
        );

        // 2. Créer un tableau avec les en-têtes
        const headers = selectedFields.map(field => field.nom_champ);
        const data = [headers]; // Première ligne = en-têtes

        // 3. Créer la feuille Excel
        const worksheet = XLSX.utils.aoa_to_sheet(data);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Champs");

        // 4. Télécharger le fichier
        const excelBuffer = XLSX.write(workbook, { type: "array" });
        const blob = new Blob([excelBuffer], { type: "application/octet-stream" });
        const link = document.createElement("a");
        link.href = URL.createObjectURL(blob);
        link.download = "Appel d'offre.xlsx";
        link.click();
        URL.revokeObjectURL(link.href);

      } catch (error) {
        console.error("Erreur lors de l'export :", error);
        this.showError("Échec de l'exportation");
      }
    },

    openImportDialog() {
      this.isImportDialogOpen = true;
    },

    // Fermer le dialogue d'importation
    closeImportDialog() {
      this.isImportDialogOpen = false;
      this.importFile = null;
    },

    async importExcel() {
      if (!this.importFile) return;

      const formData = new FormData();
      formData.append('file', this.importFile);
      formData.append('id_reference', this.reference_ppm.id);

      try {
        const response = await postFormData('prmp/appel-offre/import', formData);

        const result = await response.json();

        if (response.ok) {
          this.showSuccess(result.message);
          this.closeImportDialog();
        } else {
          this.showError(result.message || 'Erreur lors de l\'importation');
        }
      } catch (error) {
        console.error('Error:', error);
        this.showError('Erreur de connexion');
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
};
</script>
