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
              <v-btn icon small color="error" @click="deleteChamp(champ.id)">
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

    <!-- Bouton Ajouter un Champ -->
    <!-- <v-btn color="primary" @click="openAddChampDialog">
      Ajouter un Champ
    </v-btn> -->

    <v-btn
      fab
      color="primary"
      @click="openAddChampDialog"
      rounded
      large
      style="position: fixed; bottom: 100px; right: 100px; width: 60px; height: 60px; font-size: 30px;">
      <v-icon>mdi-plus</v-icon>
    </v-btn>


    <!-- Dialog Ajouter un Champ -->
    <v-dialog v-model="isDialogOpen" width="100%" max-width="600px">
      <v-card>
        <v-card-title>
          <span class="headline">Ajouter un Nouveau Champ</span>
        </v-card-title>

        <v-card-text>
          <v-form ref="addChampForm" v-model="isFormValid">
            <v-text-field
              label="Nom du Champ"
              v-model="newChamp.nom_champ"
              :rules="[rules.required]"
              required
            />
            <v-select
              label="Type de Champ"
              :items="typesChamps"
              v-model="newChamp.type_champ"
              :rules="[rules.required]"
              required
            />
            <v-textarea
              v-if="newChamp.type_champ === 'select' || newChamp.type_champ === 'radio'"
              label="Options (séparées par une virgule)"
              v-model="newChamp.options"
            />
          </v-form>
        </v-card-text>

        <v-card-actions>
          <v-btn color="primary" @click="addChamp" :disabled="!isFormValid">
            Ajouter
          </v-btn>
          <v-btn text @click="closeAddChampDialog">Annuler</v-btn>
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
              :rules="[rules.required]"
              required
            />
            <v-textarea
              v-if="editedChamp.type_champ === 'select' || editedChamp.type_champ === 'radio'"
              label="Options (séparées par une virgule)"
              v-model="editedChamp.options"
            />
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
  </v-container>
</template>

<script>
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
        options: "",
      }, // Données du nouveau champ
      typesChamps: ["text", "textarea", "date", "select", "checkbox", "radio", "file"], // Types possibles de champs
      isFormValid: false,
      rules: {
        required: (value) => !!value || "Ce champ est obligatoire",
      },

      isEditDialogOpen: false,
      editedChamp: {
        nom_champ: "",
        type_champ: "",
        options: ""
      },
      isEditFormValid: false,
      reference_ppm: null
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
    // Récupérer les champs depuis l'API
    async fetchChamps() {
      try {
        const token = localStorage.getItem("token")
        const response = await fetch("http://localhost:8000/api/prmp/appel-offre-champs", {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization':  `Bearer ${token}`
          }
        });

        if(response.ok) {
          const data = await response.json();
          console.log("data: " + data)
          this.champs = data;
          console.log(this.champs)
        }
      } catch (error) {
        console.error("Erreur lors de la récupération des champs :", error);
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
        const options = this.newChamp.options
          ? this.newChamp.options.split(",").map((opt) => opt.trim())
          : [];
        const payload = {
          nom_champ: this.newChamp.nom_champ,
          type_champ: this.newChamp.type_champ,
          options: options,
        };

        console.log(payload)
        const token = localStorage.getItem("token")
        const response = await fetch('http://localhost:8000/api/prmp/ajout-champ', {
          method: 'POST',
          headers: {
            'Content-type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(payload)
        })

        if(response.ok) {
          alert('Champ ajouter avec succes')
          this.closeAddChampDialog();
          this.fetchChamps(); // Recharger la liste des champs
        }
      } catch (error) {
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
      // Envoyer les données à l'API
      const token = localStorage.getItem("token");
      const response = await fetch('http://localhost:8000/api/prmp/appel-offre-donnees', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ data: formDataArray, id_reference: this.reference_ppm.id }),
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
        const options = typeof this.editedChamp.options === 'string'
          ? this.editedChamp.options.split(",").map((opt) => opt.trim())
          : [];
        const payload = {
          nom_champ: this.editedChamp.nom_champ,
          type_champ: this.editedChamp.type_champ,
          options: options,
        };

        console.log(payload)
        const token = localStorage.getItem("token");
        const response = await fetch(`http://localhost:8000/api/prmp/modif-champ-appel/${this.editedChamp.id}`, {
          method: 'PUT',
          headers: {
            'Content-type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
        });

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
    }
  }
};
</script>
