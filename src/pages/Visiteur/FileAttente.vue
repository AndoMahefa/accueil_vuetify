<template>
  <v-container>
    <!-- Filtre par service (sélection immédiate) -->
    <v-card>
        <v-card-title>File d'attente</v-card-title>
        <v-row>
        <v-col cols="12" md="4">
            <v-select
            v-model="filters.service"
            :items="services"
            label="Choisir un service"
            item-title="nom"
            item-value="id"
            ></v-select>
        </v-col>
        </v-row>

        <!-- Tableau des tickets -->
        <v-data-table
        :headers="headers"
        :items="tickets"
        item-key="id"
        :loading="loading"
        :hide-default-footer="true"
        >
            <template #item="{ item, index }">
                <tr>
                    <td> {{ index + 1 }} </td>
                    <td> {{ item.visiteur.nom }} </td>
                    <td> {{ item.visiteur.prenom }} </td>
                    <td> {{ item.temps_estime }} </td>
                    <td> {{ item.date }} </td>
                </tr>
            </template>
        </v-data-table>
    </v-card>
  </v-container>
</template>

<script>
import { get } from '@/service/ApiService';

export default {
    data() {
        return {
            filters: {
                service: null,  // Service sélectionné
            },
            tickets: [],  // Liste des tickets
            services: [],  // Liste des services
            loading: false,
            headers: [
                { title: 'Rang' },
                { title: 'Nom', value: 'visiteur.nom' },
                { title: 'Prenom', value: 'visiteur.prenom' },
                { title: 'Temps Estimé', value: 'temps_estime' },
                { title: 'Date', value: 'date' }
            ],
        };
    },
    mounted() {
        this.fetchServices(); // Charger les services lors du montage
    },
    watch: {
        // Surveiller les changements du service sélectionné
        'filters.service'(newService) {
            if (newService) {
                this.fetchTickets(); // Recharger les tickets en fonction du service sélectionné
            }
        }
    },
    methods: {
        // Fonction pour récupérer les tickets filtrés par service
        async fetchTickets() {
            this.loading = true;
            const token = localStorage.getItem("token");
            try {
                const response = await fetch(`http://localhost:8000/api/accueil/file-d'attente`, {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        'id_service': this.filters.service // Filtrer par id_service
                    })
                });

                if (response.ok) {
                    const data = await response.json();
                    this.tickets = data; // Mettre à jour la liste des tickets
                }
            } catch (error) {
                console.error('Erreur lors de la récupération des tickets:', error);
            } finally {
                this.loading = false;
            }
        },

        // Fonction pour afficher les détails d'un ticket
        voirDetails(ticket) {
            console.log(ticket);
            // Ouvrir un dialogue ou afficher les détails du ticket ici
        },

        // Fonction pour récupérer la liste des services
        async fetchServices() {
            const idService = localStorage.getItem("idService");
            try {
                const response = await get(`accueil/services/${idService}`); // Charger les services depuis votre API
                if (response && response.ok) {
                    this.services = await response.json(); // Adapter selon la structure de réponse
                }
            } catch (error) {
                console.error("Erreur lors de la récupération des services :", error);
            }
        },
    }
};
</script>

<style scoped>
/* Ajoutez votre style personnalisé ici */
</style>
