<template>
  <v-app>
    <!-- <v-app-bar
      app
      color="primary"
      dark
    >
      <v-toolbar-title>Tableau de bord</v-toolbar-title>
    </v-app-bar> -->

    <v-main>
      <v-container fluid>
        <v-row v-if="loading">
          <v-col
            cols="12"
            class="text-center"
          >
            <v-progress-circular
              indeterminate
              color="primary"
              size="64"
            />
          </v-col>
        </v-row>

        <template v-else>
          <!-- Cartes statistiques -->
          <v-row>
            <v-col cols="12">
              <h2 class="text-h4 font-weight-bold mb-4">Vue d'ensemble</h2>
            </v-col>

            <v-col
              v-if="data.type_visiteurs && data.type_visiteurs.length > 0"
              cols="12"
              md="4"
            >
              <v-card
                elevation="2"
                height="100%"
              >
                <v-card-title>Types de visiteurs</v-card-title>
                <v-card-text class="d-flex flex-column align-center">
                  <canvas
                    ref="typeVisiteursChart"
                    width="300"
                    height="300"
                  />
                </v-card-text>
              </v-card>
            </v-col>

            <v-col
              v-if="data.frequentation_visiteurs && data.frequentation_visiteurs.length > 0"
              md="4"
              cols="12"
            >
              <v-card elevation="2" height="100%">
                <v-card-title>Fréquentation des visiteurs</v-card-title>
                <v-card-text class="d-flex flex-column align-center">
                  <canvas ref="frequentationChart" />
                </v-card-text>
              </v-card>
            </v-col>

            <v-col
              v-if="data.visiteurs_par_direction && data.visiteurs_par_direction.length > 0"
              cols="12"
              md="4"
            >
              <v-card elevation="2" height="100%">
                <v-card-title>Visiteurs par direction</v-card-title>
                <v-card-text class="d-flex flex-column align-center">
                  <canvas ref="visiteursDirectionChart" />
                </v-card-text>
              </v-card>
            </v-col>
          </v-row>

          <!-- Rangée 2 -->
          <v-row class="mt-6">
            <v-col
              v-if="data.visiteurs_par_service && data.visiteurs_par_service.length > 0"
              cols="12"
              md="6"
            >
              <v-card elevation="2" height="100%">
                <v-card-title>Visiteurs par service</v-card-title>
                <v-card-text>
                  <canvas ref="visiteursServiceChart" />
                </v-card-text>
              </v-card>
            </v-col>

            <v-col cols="12" md="6" v-if="data.visiteurs_par_periodes && data.visiteurs_par_periodes.length > 0">
              <v-card elevation="2" height="100%">
                <v-card-title class="d-flex align-center">
                  <span>Évolution des visites</span>
                  <v-spacer></v-spacer>

                  <!-- Ajout du filtre année -->
                  <v-select
                    v-model="anneeSelectionnee"
                    :items="optionsAnnees"
                    label="Année"
                    dense
                    outlined
                    hide-details
                    class="filtre-select mr-2"
                    style="max-width: 120px;"
                    @update:model-value="rafraichirGraphiqueVisites"
                  ></v-select>

                  <!-- Filtre par type de vue (mois/semaine) -->
                  <v-select
                    v-model="typeVueSelectionnee"
                    :items="optionsTypeVue"
                    label="Vue"
                    dense
                    outlined
                    hide-details
                    class="filtre-select mr-2"
                    style="max-width: 120px;"
                    @update:model-value="changerTypeVue"
                  ></v-select>

                  <!-- Filtre de période (mois ou semaine selon la vue) -->
                  <v-select
                    v-model="periodeSelectionnee"
                    :items="optionsPeriodes"
                    :label="labelPeriode"
                    dense
                    outlined
                    hide-details
                    class="periode-select"
                    style="max-width: 150px;"
                    @update:model-value="rafraichirGraphiqueVisites"
                  ></v-select>
                </v-card-title>
                <v-card-text>
                  <canvas ref="visiteursPeriodesChart"></canvas>
                </v-card-text>
              </v-card>
            </v-col>
          </v-row>

          <!-- Ressources humaines -->
          <v-row class="mt-6" v-if="data.effectif_par_direction && data.effectif_par_direction.length > 0 || data.occupations_service && data.occupations_service.length > 0">
            <v-col cols="12">
              <h2 class="text-h4 font-weight-bold mb-4">Ressources humaines</h2>
            </v-col>

            <v-col cols="12" md="6" v-if="data.effectif_par_direction && data.effectif_par_direction.length > 0">
              <v-card elevation="2" height="100%">
                <v-card-title>Effectif par direction</v-card-title>
                <v-card-text>
                  <canvas ref="effectifDirectionChart"></canvas>
                </v-card-text>
              </v-card>
            </v-col>

            <v-col cols="12" md="6" v-if="data.occupations_service && data.occupations_service.length > 0">
              <v-card elevation="2" height="100%">
                <v-card-title>Occupation des services</v-card-title>
                <v-card-text>
                  <canvas ref="occupationServiceChart"></canvas>
                </v-card-text>
              </v-card>
            </v-col>
          </v-row>

          <!-- Heures moyennes -->
          <v-row class="mt-6" v-if="data.heures_moyennes_service && data.heures_moyennes_service.length > 0 || data.heures_moyennes_direction && data.heures_moyennes_direction.length > 0">
            <v-col cols="12">
              <h2 class="text-h4 font-weight-bold mb-4">Heures moyennes</h2>
            </v-col>

            <v-col cols="12" md="6" v-if="data.heures_moyennes_service && data.heures_moyennes_service.length > 0">
              <v-card elevation="2" height="100%">
                <v-card-title>Heures moyennes par service</v-card-title>
                <v-card-text>
                  <canvas ref="heuresMoyennesServiceChart"></canvas>
                </v-card-text>
              </v-card>
            </v-col>

            <v-col cols="12" md="6" v-if="data.heures_moyennes_direction && data.heures_moyennes_direction.length > 0">
              <v-card elevation="2" height="100%">
                <v-card-title>Heures moyennes par direction</v-card-title>
                <v-card-text>
                  <canvas ref="heuresMoyennesDirectionChart"></canvas>
                </v-card-text>
              </v-card>
            </v-col>
          </v-row>

          <!-- Tableaux -->
          <v-row class="mt-6" v-if="visiteursRecents && visiteursRecents.length > 0">
            <v-col cols="12">
              <h2 class="text-h4 font-weight-bold mb-4">Détails des visiteurs récents</h2>
            </v-col>

            <v-col cols="12">
              <v-card elevation="2">
                <v-card-title>
                  Liste des visiteurs récents
                  <v-spacer></v-spacer>
                  <v-text-field
                    v-model="search"
                    append-icon="mdi-magnify"
                    label="Rechercher"
                    single-line
                    hide-details
                  ></v-text-field>
                </v-card-title>
                <v-data-table
                  :headers="headers"
                  :items="visiteursRecents"
                  :search="search"
                  :items-per-page="5"
                  :items-per-page-text="'Eléments par page'"
                  class="elevation-1"
                >
                </v-data-table>
              </v-card>
            </v-col>
          </v-row>

          <!-- Retardataires -->
          <v-row class="mt-6" v-if="data.retardataires && data.retardataires.length > 0">
            <v-col cols="12">
              <h2 class="text-h4 font-weight-bold mb-4">Retardataires fréquents</h2>
            </v-col>

            <v-col cols="12">
              <v-card elevation="2">
                <v-card-title>
                  Liste des retardataires
                  <v-spacer></v-spacer>
                  <v-text-field
                    v-model="searchRetard"
                    append-icon="mdi-magnify"
                    label="Rechercher"
                    single-line
                    hide-details
                  ></v-text-field>
                </v-card-title>
                <v-data-table
                  :headers="headersRetard"
                  :items="data.retardataires"
                  :search="searchRetard"
                  :items-per-page="5"
                  :items-per-page-text="'Eléments par page'"
                  class="elevation-1"
                >
                </v-data-table>
              </v-card>
            </v-col>
          </v-row>
        </template>
      </v-container>
    </v-main>
  </v-app>
</template>

<script>
import { get } from '@/service/ApiService';
import Chart from 'chart.js/auto';
console.log('Chart.js disponible:', !!Chart);
export default {
  name: 'DashboardApp',
  data() {
    return {
      loading: true,
      search: '',
      searchRetard: '',
      data: {
        visiteurs_par_service: [],
        visiteurs_par_direction: [],
        visiteurs_par_periodes: [],
        frequentation_visiteurs: [],
        type_visiteurs: [],
        presence_journalier_emp: [],
        retardataires: [],
        effectif_par_direction: [],
        occupations_service: [],
        heures_moyennes_service: [],
        heures_moyennes_direction: []
      },
      headers: [
        { title: 'Nom', value: 'nom' },
        { title: 'Prénom', value: 'prenom' },
        { title: 'Date de visite', value: 'date' }
      ],
      headersRetard: [
        { title: 'Employé', value: 'employe' },
        { title: 'Nombre de retards', value: 'nombre_retards' }
      ],
      visiteursRecents: [],
      charts: {},

      // Nouveaux filtres
      anneeSelectionnee: new Date().getFullYear(),
      typeVueSelectionnee: 'mois',
      periodeSelectionnee: new Date().getMonth() + 1, // Par défaut mois actuel

      // Options pour les filtres
      optionsAnnees: [], // Sera rempli dynamiquement
      optionsTypeVue: [
        { title: 'Mois', value: 'mois' },
        { title: 'Semaine', value: 'semaine' }
      ],
      optionsPeriodes: [], // Sera rempli dynamiquement
    };
  },
  computed: {
    labelPeriode() {
      return this.typeVueSelectionnee === 'mois' ? 'Mois' : 'Semaine';
    }
  },
  mounted() {
    // Premièrement, initialiser les variables pour les graphiques vides
    this.initEmptyCharts();

    // Ensuite, récupérer les données
    this.fetchDashboardData().then(() => {
      console.log('Données récupérées, attente du DOM...');

      // Initialiser les options des filtres après avoir récupéré les données
      this.initialiserOptionsFiltres();

      // Attendre plus longtemps pour s'assurer que le DOM est rendu
      setTimeout(() => {
        console.log('Tentative de rendu des graphiques après 500ms');
        console.log('Références canvas disponibles:', Object.keys(this.$refs));
        this.renderCharts();
      }, 500);
    });
  },
  methods: {
    getEmp(row) {
      return row.nom + ' ' + row.prenom;
    },
    // Ajouter cette méthode pour initialiser des graphiques vides
    initEmptyCharts() {
      this.charts = {};
    },
    async fetchDashboardData() {
      try {
        // Remplacez cette URL par votre endpoint réel
        const response = await get('dashboard');
        this.data = await response.json();

        console.log('Données reçues:', this.data);

        // Important: s'assurer que les tableaux vides sont initialisés
        if (!this.data.type_visiteurs) this.data.type_visiteurs = [];
        if (!this.data.frequentation_visiteurs) this.data.frequentation_visiteurs = [];
        if (!this.data.visiteurs_par_direction) this.data.visiteurs_par_direction = [];
        // ... initialiser tous les autres tableaux de données si nécessaire

        this.data.retardataires = this.data.retardataires.map(item => ({
          ...item,
          employe: this.getEmp(item) // Combiner nom et prénom
        }));

        this.processVisiteursRecents();
        this.loading = false;
        // La méthode renderCharts sera appelée dans le hook updated
      } catch (error) {
        console.error('Erreur lors de la récupération des données:', error);
        alert('Erreur lors du chargement des données. Veuillez réessayer.');
        this.loading = false;
      }
    },
    processVisiteursRecents() {
      this.visiteursRecents = [];

      if (!this.data.visiteurs_par_periodes || this.data.visiteurs_par_periodes.length === 0) {
        return;
      }

      const aujourdHui = new Date();

      this.data.visiteurs_par_periodes
        .filter(periode => {
          const datePeriode = new Date(periode.jour);
          return datePeriode <= aujourdHui;
        })
        .forEach(periode => {
          const jour = new Date(periode.jour).toLocaleDateString('fr-FR');
          let visiteurs = [];

          try {
            if (typeof periode.visiteurs === 'string') {
              visiteurs = JSON.parse(periode.visiteurs);
            } else if (Array.isArray(periode.visiteurs)) {
              visiteurs = periode.visiteurs;
            }
          } catch (e) {
            console.error('Erreur de parsing JSON:', e);
          }

          if (Array.isArray(visiteurs)) {
            visiteurs.forEach(visiteur => {
              this.visiteursRecents.push({
                id: visiteur.id,
                nom: visiteur.nom,
                prenom: visiteur.prenom,
                date: jour
              });
            });
          }
        });
    },
    renderCharts() {
      // Détruire les graphiques existants si on rafraîchit
      Object.values(this.charts).forEach(chart => {
        if (chart) chart.destroy();
      });

      this.renderTypeVisiteursChart();
      this.renderFrequentationChart();
      this.renderVisiteursServiceChart();
      this.renderVisiteursDirectionChart();
      this.renderVisiteursPeriodesChart();
      this.renderEffectifDirectionChart();
      this.renderOccupationServiceChart();

      if (this.data.heures_moyennes_service && this.data.heures_moyennes_service.length > 0) {
        this.renderHeuresMoyennesServiceChart();
      }

      if (this.data.heures_moyennes_direction && this.data.heures_moyennes_direction.length > 0) {
        this.renderHeuresMoyennesDirectionChart();
      }
    },
    renderTypeVisiteursChart() {
      console.log('Tentative de rendu du graphique', this.data.type_visiteurs);
      if (!this.data.type_visiteurs || this.data.type_visiteurs.length === 0 || !this.$refs.typeVisiteursChart) {
        console.log('Impossible de rendre le graphique: données manquantes ou référence canvas invalide');
        return;
      }

      const ctx = this.$refs.typeVisiteursChart.getContext('2d');
      if (!ctx) return;

      const labels = this.data.type_visiteurs.map(item => item.type);
      const values = this.data.type_visiteurs.map(item => item.total);

      this.charts.typeVisiteurs = new Chart(ctx, {
        type: 'pie',
        data: {
          labels: labels,
          datasets: [{
            label: 'Type de visiteurs',
            data: values,
            backgroundColor: [
              'rgba(255, 99, 132, 0.7)',
              'rgba(54, 162, 235, 0.7)',
              'rgba(255, 206, 86, 0.7)',
              'rgba(75, 192, 192, 0.7)',
              'rgba(153, 102, 255, 0.7)'
            ],
            borderWidth: 1
          }]
        },
        options: {
          responsive: true,
          plugins: {
            legend: {
              position: 'bottom'
            }
          }
        }
      });
    },
    renderFrequentationChart() {
      if (!this.data.frequentation_visiteurs || this.data.frequentation_visiteurs.length === 0 || !this.$refs.frequentationChart) {
        return;
      }

      const ctx = this.$refs.frequentationChart.getContext('2d');
      if (!ctx) return;

      const labels = this.data.frequentation_visiteurs.map(item => item.type_visiteur);
      const values = this.data.frequentation_visiteurs.map(item => item.total);

      this.charts.frequentation = new Chart(ctx, {
        type: 'doughnut',
        data: {
          labels: labels,
          datasets: [{
            label: 'Fréquentation',
            data: values,
            backgroundColor: [
              'rgba(75, 192, 192, 0.7)',
              'rgba(153, 102, 255, 0.7)',
              'rgba(255, 159, 64, 0.7)',
              'rgba(255, 205, 86, 0.7)'
            ],
            borderWidth: 1
          }]
        },
        options: {
          responsive: true,
          plugins: {
            legend: {
              position: 'bottom'
            }
          }
        }
      });
    },
    renderVisiteursServiceChart() {
      if (!this.data.visiteurs_par_service || this.data.visiteurs_par_service.length === 0 || !this.$refs.visiteursServiceChart) {
        return;
      }

      const ctx = this.$refs.visiteursServiceChart.getContext('2d');
      if (!ctx) return;

      // Trier les services par nombre de visiteurs (décroissant)
      const servicesTriés = [...this.data.visiteurs_par_service]
        .sort((a, b) => b.total_visiteurs - a.total_visiteurs)
        .slice(0, 10); // Limiter à 10 services pour la lisibilité

      const labels = servicesTriés.map(item => item.service);
      const values = servicesTriés.map(item => item.total_visiteurs);

      this.charts.visiteursService = new Chart(ctx, {
        type: 'bar',
        data: {
          labels: labels,
          datasets: [{
            label: 'Nombre de visiteurs',
            data: values,
            backgroundColor: 'rgba(54, 162, 235, 0.7)',
            borderColor: 'rgba(54, 162, 235, 1)',
            borderWidth: 1
          }]
        },
        options: {
          indexAxis: 'y',
          responsive: true,
          scales: {
            x: {
              beginAtZero: true,
              ticks: {
                precision: 0
              }
            }
          },
          plugins: {
            legend: {
              display: false
            }
          }
        }
      });
    },
    renderVisiteursDirectionChart() {
      if (!this.data.visiteurs_par_direction || this.data.visiteurs_par_direction.length === 0 || !this.$refs.visiteursDirectionChart) {
        return;
      }

      const ctx = this.$refs.visiteursDirectionChart.getContext('2d');
      if (!ctx) return;

      const labels = this.data.visiteurs_par_direction.map(item => item.direction);
      const values = this.data.visiteurs_par_direction.map(item => item.total_visiteurs);

      this.charts.visiteursDirection = new Chart(ctx, {
        type: 'pie',
        data: {
          labels: labels,
          datasets: [{
            label: 'Visiteurs par direction',
            data: values,
            backgroundColor: [
              'rgba(255, 99, 132, 0.7)',
              'rgba(54, 162, 235, 0.7)',
              'rgba(255, 206, 86, 0.7)',
              'rgba(75, 192, 192, 0.7)',
              'rgba(153, 102, 255, 0.7)',
              'rgba(255, 159, 64, 0.7)'
            ],
            borderWidth: 1
          }]
        },
        options: {
          responsive: true,
          plugins: {
            legend: {
              position: 'bottom'
            }
          }
        }
      });
    },
    renderEffectifDirectionChart() {
      if (!this.data.effectif_par_direction || this.data.effectif_par_direction.length === 0 || !this.$refs.effectifDirectionChart) {
        return;
      }

      const ctx = this.$refs.effectifDirectionChart.getContext('2d');
      if (!ctx) return;

      const labels = this.data.effectif_par_direction.map(item => item.direction);
      const actifsData = this.data.effectif_par_direction.map(item => item.actifs);
      const inactifsData = this.data.effectif_par_direction.map(item => item.inactifs);

      this.charts.effectifDirection = new Chart(ctx, {
        type: 'bar',
        data: {
          labels: labels,
          datasets: [
            {
              label: 'Actifs',
              data: actifsData,
              backgroundColor: 'rgba(75, 192, 192, 0.7)',
              borderColor: 'rgba(75, 192, 192, 1)',
              borderWidth: 1
            },
            {
              label: 'Inactifs',
              data: inactifsData,
              backgroundColor: 'rgba(255, 99, 132, 0.7)',
              borderColor: 'rgba(255, 99, 132, 1)',
              borderWidth: 1
            }
          ]
        },
        options: {
          responsive: true,
          scales: {
            x: {
              stacked: true
            },
            y: {
              stacked: true,
              beginAtZero: true,
              ticks: {
                precision: 0
              }
            }
          }
        }
      });
    },
    renderOccupationServiceChart() {
      if (!this.data.occupations_service || this.data.occupations_service.length === 0 || !this.$refs.occupationServiceChart) {
        return;
      }

      const ctx = this.$refs.occupationServiceChart.getContext('2d');
      if (!ctx) return;

      // Filtrer pour afficher uniquement les services avec au moins un actif ou un congé
      const servicesActifs = this.data.occupations_service.filter(item =>
        item.actifs > 0 || item.conges > 0
      );

      // Si aucun service actif, ne pas rendre le graphique
      if (servicesActifs.length === 0) {
        return;
      }

      const labels = servicesActifs.map(item => item.service);
      const actifsData = servicesActifs.map(item => item.actifs);
      const congesData = servicesActifs.map(item => item.conges);

      this.charts.occupationService = new Chart(ctx, {
        type: 'bar',
        data: {
          labels: labels,
          datasets: [
            {
              label: 'Actifs',
              data: actifsData,
              backgroundColor: 'rgba(54, 162, 235, 0.7)',
              borderColor: 'rgba(54, 162, 235, 1)',
              borderWidth: 1
            },
            {
              label: 'En congés',
              data: congesData,
              backgroundColor: 'rgba(255, 206, 86, 0.7)',
              borderColor: 'rgba(255, 206, 86, 1)',
              borderWidth: 1
            }
          ]
        },
        options: {
          responsive: true,
          indexAxis: 'y',
          scales: {
            x: {
              stacked: false,
              beginAtZero: true,
              ticks: {
                precision: 0
              }
            },
            y: {
              stacked: false
            }
          }
        }
      });
    },
    renderHeuresMoyennesServiceChart() {
      if (!this.data.heures_moyennes_service || this.data.heures_moyennes_service.length === 0 || !this.$refs.heuresMoyennesServiceChart) {
        return;
      }

      const ctx = this.$refs.heuresMoyennesServiceChart.getContext('2d');
      if (!ctx) return;

      const labels = this.data.heures_moyennes_service.map(item => item.service);
      const values = this.data.heures_moyennes_service.map(item => item.heure_arrivee_moyenne);

      console.log(this.data.heures_moyennes_service)

      this.charts.heuresMoyennesService = new Chart(ctx, {
        type: 'bar',
        data: {
          labels: labels,
          datasets: [{
            label: 'Heures moyennes',
            data: values,
            backgroundColor: 'rgba(153, 102, 255, 0.7)',
            borderColor: 'rgba(153, 102, 255, 1)',
            borderWidth: 1
          }]
        },
        options: {
          responsive: true,
          indexAxis: 'y',
          scales: {
            x: {
              beginAtZero: true
            }
          }
        }
      });
    },
    renderHeuresMoyennesDirectionChart() {
      if (!this.data.heures_moyennes_direction || this.data.heures_moyennes_direction.length === 0 || !this.$refs.heuresMoyennesDirectionChart) {
        return;
      }

      const ctx = this.$refs.heuresMoyennesDirectionChart.getContext('2d');
      if (!ctx) return;

      const labels = this.data.heures_moyennes_direction.map(item => item.direction);
      const values = this.data.heures_moyennes_direction.map(item => item.heure_arrivee_moyenne);

      this.charts.heuresMoyennesDirection = new Chart(ctx, {
        type: 'bar',
        data: {
          labels: labels,
          datasets: [{
            label: 'Heures moyennes',
            data: values,
            backgroundColor: 'rgba(255, 159, 64, 0.7)',
            borderColor: 'rgba(255, 159, 64, 1)',
            borderWidth: 1
          }]
        },
        options: {
          responsive: true,
          indexAxis: 'y',
          scales: {
            x: {
              beginAtZero: true
            }
          }
        }
      });
    },
    // Nouvelle méthode pour rafraîchir uniquement le graphique des visites
    initialiserOptionsFiltres() {
      // Extraire les années uniques des données
      const annees = new Set();

      if (this.data.visiteurs_par_periodes && this.data.visiteurs_par_periodes.length > 0) {
        this.data.visiteurs_par_periodes.forEach(item => {
          const date = new Date(item.jour);
          annees.add(date.getFullYear());
        });
      }

      // Si aucune année n'est trouvée, ajouter l'année actuelle
      if (annees.size === 0) {
        annees.add(new Date().getFullYear());
      }

      console.log(annees)

      // Trier et formater pour le select
      this.optionsAnnees = Array.from(annees).sort().map(annee => ({
        title: annee.toString(),
        value: annee
      }));

      // Définir l'année par défaut à l'année la plus récente
      this.anneeSelectionnee = new Date().getFullYear();

      // Initialiser les options de périodes selon le type de vue
      this.mettreAJourOptionsPeriodes();
    },

    // Nouvelle méthode pour mettre à jour les options de périodes (mois ou semaines)
    mettreAJourOptionsPeriodes() {
      if (this.typeVueSelectionnee === 'mois') {
        // Options pour les mois
        this.optionsPeriodes = [
          { title: 'Janvier', value: 1 },
          { title: 'Février', value: 2 },
          { title: 'Mars', value: 3 },
          { title: 'Avril', value: 4 },
          { title: 'Mai', value: 5 },
          { title: 'Juin', value: 6 },
          { title: 'Juillet', value: 7 },
          { title: 'Août', value: 8 },
          { title: 'Septembre', value: 9 },
          { title: 'Octobre', value: 10 },
          { title: 'Novembre', value: 11 },
          { title: 'Décembre', value: 12 }
        ];

        // Par défaut, sélectionner le mois actuel ou le premier mois disponible
        const moisActuel = new Date().getMonth() + 1;
        this.periodeSelectionnee = moisActuel;
      } else {
        // Options pour les semaines
        // Calculer les semaines disponibles pour l'année sélectionnée
        const semaines = this.getSemainesPourAnnee(this.anneeSelectionnee);
        this.optionsPeriodes = semaines.map(semaine => ({
          title: `S${semaine}`,
          value: semaine
        }));

        // Par défaut, sélectionner la semaine actuelle
        const semaineActuelle = this.getNumeroSemaine(new Date());
        this.periodeSelectionnee = semaineActuelle;
      }
    },

    // Méthode pour changer le type de vue (mois/semaine)
    changerTypeVue() {
      this.mettreAJourOptionsPeriodes();
      this.rafraichirGraphiqueVisites();
    },

    // Méthode pour obtenir le numéro de semaine d'une date
    getNumeroSemaine(date) {
      const firstDayOfYear = new Date(date.getFullYear(), 0, 1);
      const pastDaysOfYear = (date - firstDayOfYear) / 86400000;
      return Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);
    },

    // Méthode pour obtenir toutes les semaines d'une année
    getSemainesPourAnnee(annee) {
      const nombreSemaines = 53; // Une année peut avoir 52 ou 53 semaines
      return Array.from({ length: nombreSemaines }, (_, i) => i + 1);
    },

    // Mise à jour de la méthode de rendu du graphique des visites
    renderVisiteursPeriodesChart() {
      if (!this.data.visiteurs_par_periodes || this.data.visiteurs_par_periodes.length === 0 || !this.$refs.visiteursPeriodesChart) {
        return;
      }

      const ctx = this.$refs.visiteursPeriodesChart.getContext('2d');
      if (!ctx) return;

      // Filtrer les données par année sélectionnée
      const donneesFiltreesParAnnee = this.data.visiteurs_par_periodes.filter(item => {
        const date = new Date(item.jour);
        return date.getFullYear() === this.anneeSelectionnee;
      });

      let labels = [];
      let values = [];

      if (this.typeVueSelectionnee === 'mois') {
        // Filtrer par mois sélectionné
        const donneesDuMois = donneesFiltreesParAnnee.filter(item => {
          const date = new Date(item.jour);
          return date.getMonth() + 1 === this.periodeSelectionnee;
        });

        // Trier par jour
        donneesDuMois.sort((a, b) => new Date(a.jour) - new Date(b.jour));

        // Générer les labels pour chaque jour du mois (1-31)
        labels = donneesDuMois.map(item => new Date(item.jour).getDate());
        values = donneesDuMois.map(item => item.total_visites || 0);

        // Si certains jours sont manquants, compléter avec des zéros
        const joursDuMois = new Date(this.anneeSelectionnee, this.periodeSelectionnee, 0).getDate();
        const tousLesJours = Array.from({ length: joursDuMois }, (_, i) => i + 1);

        const donneesCompletes = tousLesJours.map(jour => {
          const indice = labels.indexOf(jour);
          return indice !== -1 ? values[indice] : 0;
        });

        labels = tousLesJours;
        values = donneesCompletes;
      } else {
        // Vue par semaine
        const semaineSelectionnee = this.periodeSelectionnee;

        // Filtrer les données pour obtenir la semaine sélectionnée
        const donneesDeLaSemaine = donneesFiltreesParAnnee.filter(item => {
          const date = new Date(item.jour);
          return this.getNumeroSemaine(date) === semaineSelectionnee;
        });

        // Trier par jour
        donneesDeLaSemaine.sort((a, b) => new Date(a.jour) - new Date(b.jour));

        // Créer un tableau avec les 7 jours de la semaine
        const joursSemaine = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'];
        const donneesSemaine = [0, 0, 0, 0, 0, 0, 0]; // Valeurs par défaut

        // Remplir avec les données disponibles
        donneesDeLaSemaine.forEach(item => {
          const jourSemaine = new Date(item.jour).getDay(); // 0 = Dimanche, 1 = Lundi, etc.
          donneesSemaine[jourSemaine] = item.total_visites || 0;
        });

        labels = joursSemaine;
        values = donneesSemaine;
      }

      // Créer ou mettre à jour le graphique
      if (this.charts.visiteursPeriodesChart) {
        this.charts.visiteursPeriodesChart.destroy();
      }

      this.charts.visiteursPeriodesChart = new Chart(ctx, {
        type: 'bar', // Utiliser un graphique à barres pour mieux visualiser les données journalières
        data: {
          labels: labels,
          datasets: [{
            label: `Visites - ${this.typeVueSelectionnee === 'mois' ?
                    `${this.getMonthName(this.periodeSelectionnee)} ${this.anneeSelectionnee}` :
                    `Semaine ${this.periodeSelectionnee}, ${this.anneeSelectionnee}`}`,
            data: values,
            backgroundColor: 'rgba(75, 192, 192, 0.7)',
            borderColor: 'rgba(75, 192, 192, 1)',
            borderWidth: 1
          }]
        },
        options: {
          responsive: true,
          scales: {
            y: {
              beginAtZero: true,
              ticks: {
                precision: 0
              }
            }
          }
        }
      });
    },

    // Méthode utilitaire pour obtenir le nom du mois à partir de son numéro
    getMonthName(monthNumber) {
      const moisNoms = [
        'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
        'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'
      ];
      return moisNoms[monthNumber - 1];
    },

    // Mettre à jour la méthode pour rafraîchir le graphique
    rafraichirGraphiqueVisites() {
      this.renderVisiteursPeriodesChart();
    }
  }
};
</script>

<style scoped>
  .v-card {
    transition: transform 0.3s, box-shadow 0.3s;
  }
  .v-card:hover {
    transform: translateY(-5px);
    box-shadow: 0 12px 20px rgba(0, 0, 0, 0.2) !important;
  }
  ::v-deep(.v-data-table .v-data-table__th),
  ::v-deep(.v-data-table-header__content) {
    background-color: #000 !important;
    color: white !important;
    font-weight: bold;
  }
</style>
