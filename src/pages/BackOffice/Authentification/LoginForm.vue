<template>
  <v-container>
    <v-card>
      <v-card-title>
        <h2>Connexion</h2>
      </v-card-title>
      <v-card-text>
        <v-form 
          ref="form" 
          @submit.prevent="login"
        >
          <v-text-field
            v-model="email"
            label="Email"
            type="email"
            required
          />
          <v-text-field
            v-model="mot_de_passe"
            label="Mot de passe"
            type="password"
            required
          />
          <v-btn 
            type="submit" 
            color="primary"
          >
            Se connecter
          </v-btn>
          <v-alert 
            v-if="errorMessage" 
            type="error" 
            dismissible
          >
            {{ errorMessage }}
          </v-alert>
        </v-form>
      </v-card-text>
    </v-card>
  </v-container>
</template>
  
<script>
export default {
    data() {
        return {
            email: '',
            mot_de_passe: '',
            errorMessage: ''
        };
    },
    methods: {
        async login() {
            this.errorMessage = ''; // Réinitialiser le message d'erreur
            try {
            const response = await fetch('http://localhost:8000/api/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    email: this.email,
                    mot_de_passe: this.mot_de_passe
                })
            });
    
            if (!response.ok) {
                // Gérer les erreurs de réponse
                if (response.status === 401) {
                  this.errorMessage = 'Identifiants invalides. Veuillez réessayer.';
                } else {
                  this.errorMessage = 'Une erreur est survenue. Veuillez réessayer.';
                }
                return;
            }
    
            const data = await response.json();
            
            // Stockez le token dans localStorage
            // const role = data.role;
            // localStorage.setItem('token_'+role, data.token);
            
            
            // if(role === 'accueil') {
            //   this.$router.push('/accueil/dashboard');
            // } else if(role === 'Directeur General') {
            //   this.$router.push('/dg/dashboard');
            // } else if(role === 'Ressources hunaine') {
            //   this.$router.push('/rh/dashboard');
            // } else if(role === 'Daf') {
            //   this.$router.push('daf/dashboard');
            // }

            localStorage.setItem('token', data.token);
            localStorage.setItem('idService', data.idService);
            this.$router.push('/home');

            } catch (error) {
              this.errorMessage = error;
            }
        }
    }
};
</script>