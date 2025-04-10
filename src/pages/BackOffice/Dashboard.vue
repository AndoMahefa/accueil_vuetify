<template>
  <v-app>
    <v-app-bar app color="primary" dark>
      <v-toolbar-title>Tableau de bord</v-toolbar-title>
    </v-app-bar>

    <v-main>
      <v-container fluid>
        <v-row v-if="loading">
          <v-col cols="12" class="text-center">
            <v-progress-circular indeterminate color="primary" size="64"></v-progress-circular>
          </v-col>
        </v-row>

        <template v-else>
          <!-- Cartes statistiques -->
          <v-row>
            <v-col cols="12">
              <h2 class="text-h4 font-weight-bold mb-4">Vue d'ensemble</h2>
            </v-col>

            <v-col cols="12" md="4" v-if="data.type_visiteurs && data.type_visiteurs.length > 0">
              <v-card elevation="2" height="100%">
                <v-card-title>Types de visiteurs</v-card-title>
                <v-card-text class="d-flex flex-column align-center">
                  <canvas ref="typeVisiteursChart"></canvas>
                </v-card-text>
              </v-card>
            </v-col>

            <v-col cols="12" md="4" v-if="data.frequentation_visiteurs && data.frequentation_visiteurs.length > 0">
              <v-card elevation="2" height="100%">
                <v-card-title>Fréquentation des visiteurs</v-card-title>
                <v-card-text class="d-flex flex-column align-center">
                  <canvas ref="frequentationChart"></canvas>
                </v-card-text>
              </v-card>
            </v-col>

            <v-col cols="12" md="4" v-if="data.visiteurs_par_direction && data.visiteurs_par_direction.length > 0">
              <v-card elevation="2" height="100%">
                <v-card-title>Visiteurs par direction</v-card-title>
                <v-card-text class="d-flex flex-column align-center">
                  <canvas ref="visiteursDirectionChart"></canvas>
                </v-card-text>
              </v-card>
            </v-col>
          </v-row>

          <!-- Rangée 2 -->
          <v-row class="mt-6">
            <v-col cols="12" md="6" v-if="data.visiteurs_par_service && data.visiteurs_par_service.length > 0">
              <v-card elevation="2" height="100%">
                <v-card-title>Visiteurs par service</v-card-title>
                <v-card-text>
                  <canvas ref="visiteursServiceChart"></canvas>
                </v-card-text>
              </v-card>
            </v-col>

            <v-col cols="12" md="6" v-if="data.visiteurs_par_periodes && data.visiteurs_par_periodes.length > 0">
              <v-card elevation="2" height="100%">
                <v-card-title>Évolution des visites</v-card-title>
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
        { title: 'Employé', value: 'nom_employe' },
        { title: 'Nombre de retards', value: 'nombre_retards' }
      ],
      visiteursRecents: [],
      charts: {}
    };
  },
  mounted() {
    this.fetchDashboardData();
  },
  updated() {
    // Permet de s'assurer que les graphiques sont rendus après la mise à jour du DOM
    this.$nextTick(() => {
      this.renderCharts();
    });
  },
  methods: {
    async fetchDashboardData() {
      try {
        // Remplacez cette URL par votre endpoint réel
        const response = await get('dashboard');
        this.data = await response.json();

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
      // Traiter les visiteurs récents pour le tableau
      this.visiteursRecents = [];

      if (!this.data.visiteurs_par_periodes || this.data.visiteurs_par_periodes.length === 0) {
        return;
      }

      this.data.visiteurs_par_periodes.forEach(periode => {
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
      if (!this.data.type_visiteurs || this.data.type_visiteurs.length === 0 || !this.$refs.typeVisiteursChart) {
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
    renderVisiteursPeriodesChart() {
      if (!this.data.visiteurs_par_periodes || this.data.visiteurs_par_periodes.length === 0 || !this.$refs.visiteursPeriodesChart) {
        return;
      }

      const ctx = this.$refs.visiteursPeriodesChart.getContext('2d');
      if (!ctx) return;

      // Trier les périodes par date
      const periodesSorted = [...this.data.visiteurs_par_periodes].sort((a, b) => {
        return new Date(a.jour) - new Date(b.jour);
      });

      const labels = periodesSorted.map(item => new Date(item.jour).toLocaleDateString('fr-FR'));
      const values = periodesSorted.map(item => item.total_visites);

      this.charts.visiteursPeriodesChart = new Chart(ctx, {
        type: 'line',
        data: {
          labels: labels,
          datasets: [{
            label: 'Visites journalières',
            data: values,
            fill: false,
            borderColor: 'rgba(75, 192, 192, 1)',
            tension: 0.1,
            pointBackgroundColor: 'rgba(75, 192, 192, 1)'
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
      const values = this.data.heures_moyennes_service.map(item => item.moyenne_heures);

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
      const values = this.data.heures_moyennes_direction.map(item => item.moyenne_heures);

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
</style>
