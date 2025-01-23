<template>
  <v-container class="d-flex justify-center align-center" style="margin-left: 30px;">
    <v-row
      class="align-center"
      justify="center"
    >
      <!-- Section de bienvenue -->
      <v-col cols="12" md="6" class="text-center">
        <v-img
          :src="loginImage"
          alt="Illustration"
          class="mt-5"
          contain
        />
      </v-col>

      <!-- Section de connexion -->
      <v-col
        cols="12"
        md="5"
      >
        <v-card
          class="pa-6"
          elevation="3"
          width="550px"
        >
          <p
            class="text-center mb-4"
            style="color: #01005d; font-size: 40px; line-height: normal; outline: none;"
          >
            Se connecter
          </p>
          <p class="text-center mb-5">
            Veuillez vous connecter pour profiter pleinement de la plateforme.
          </p>

          <v-form
            ref="form"
            @submit.prevent="login"
          >
            <v-text-field
              v-model="email"
              label="Email"
              prepend-inner-icon="mdi-account"
              type="email"
              outlined
              dense
              class="mb-4"
              required
            />

            <v-text-field
              v-model="mot_de_passe"
              label="Mot de passe"
              prepend-inner-icon="mdi-lock"
              type="password"
              outlined
              density="comfortable"
              class="mb-4"
              required
            />

            <div class="d-flex justify-space-between align-center mt-2">
              <v-checkbox
                v-model="rememberMe"
                label="Rester connecté"
                class="mt-2"
              />
              <a
                href="#"
                style="text-align: center; text-decoration: none;"
              >
                Mot de passe oublié ?
              </a>
            </div>

            <v-btn
              block
              class="mt-4"
              color="#01005d"
              type="submit"
            >
              Connexion
            </v-btn>

            <div class="text-center mt-3">
              <span>OU</span>
            </div>

            <v-btn
              block
              class="mt-3"
              outlined
              color="whitesmoke"
              @click="register"
            >
              Inscription
            </v-btn>
          </v-form>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
export default {
    data() {
        return {
            email: '',
            mot_de_passe: '',
            errorMessage: '',
            loginImage: new URL('@/assets/images/login.png', import.meta.url).href
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
                  alert("Connexion expire")
                  // this.errorMessage = 'Identifiants invalides. Veuillez réessayer.';
                } else {
                  alert("Une erreur est survenue. Veuillez réessayer.");
                  // this.errorMessage = 'Une erreur est survenue. Veuillez réessayer.';
                }
                return;
              }

              const data = await response.json();

              localStorage.setItem('token', data.token);
              localStorage.setItem('idUser', data.user.id);
              localStorage.setItem('idService', data.idService);
              localStorage.setItem('role', data.user.role)

              this.$router.push('/home');

            } catch (error) {
              this.errorMessage = error;
            }
        }
    }
};
</script>
<style>
  h1 {
    color: #1a237e;
  }
</style>
