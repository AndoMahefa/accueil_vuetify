<template>
    <v-sheet class="mx-auto" width="450">
        <div class="form-title">
            <span class="bold-text">Visiteur</span> / Enregistrer
        </div>
        <v-form                 
        v-model="valid" 
        ref="form"
        >
        <v-text-field
            v-model="visiteur.nom"
            label="Nom"
            :rules="[rules.required]"
            
            required
            />
            <v-text-field
            v-model="visiteur.prenom"
            label="Prenom"
            :rules="[rules.required]"
            
            required
            />
            <v-text-field
            v-model="visiteur.cin"
            label="CIN"
            :rules="[rules.required]"
            
            required
            />
            <v-text-field
            v-model="visiteur.email"
            label="Email"
            :rules="[rules.required, rules.email]"
            
            required
            ></v-text-field>

            <v-text-field
            v-model="visiteur.telephone"
            label="Numéro de téléphone"
            
            ></v-text-field>
  
            <v-btn class="mt-2" type="submit" block @click="submitForm" color="success">Enregistrer</v-btn>
      </v-form>
    </v-sheet>
  </template>
  
  <script>
  export default {
    data() {
      return {
        valid: false,
        visiteur: {
            nom: '',
            prenom: '',
            email: '',
            cin: '',
            telephone: ''
        },
        rules: {
          required: value => !!value || 'Ce champ est requis',
          email: value => /.+@.+\..+/.test(value) || 'L\'email doit être valide'
        }
      };
    },
    methods: {
        async submitForm(e) {
            e.preventDefault()
            const token = localStorage.getItem("token");
            console.log(this.visiteur)
            try {
                const response = await fetch('http://localhost:8000/api/accueil/visiteurs', {
                    method: 'POST',
                    headers: {
                        Authorization: `Bearer ${token}`,
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(this.visiteur),
                });

                if (response.status === 401) {
                    localStorage.removeItem('token');
                    alert('Votre session a expiré ou le token est invalide. Veuillez vous reconnecter.');
                    this.$router.push('/');
                    return;
                }
                if (response.ok) {
                    console.log(await response.json());
                    alert('Visiteur ajouté avec succès.');
                    this.visiteur = {}
                } else {
                    throw new Error('Erreur lors de l\'ajout du visiteur.');
                }
            } catch (error) {
                console.error(error);
            }
        }
    }
  };
</script>
  
<style scoped>
    .form-title {
        display: flex;
        align-items: center;
        margin-bottom: 15px;
        font-size: 1.25rem; /* Taille de texte */
        font-weight: 400; /* Poids de texte par défaut */
        color: #333; /* Couleur de texte */
    }

    .bold-text {
        font-weight: 700; /* Texte en gras */
        margin-right: 4px; /* Espacement entre Visiteur et / */
    }
    .v-sheet {
        max-width: 600px;  /* Maximum width */
    }


    .v-text-field {
        /* margin-bottom: 10px; */
    }

    .v-btn {
        margin-top: 15px;
    }
</style>
  