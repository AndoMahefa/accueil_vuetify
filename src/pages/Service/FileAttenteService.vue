<template>
  <v-container>
    <!-- Filtre par service (sélection immédiate) -->
    <v-card>
        <v-card-title>File d'attente</v-card-title>

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
            tickets: [],  // Liste des tickets
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
        this.fetchTickets()
    },
    methods: {
        // Fonction pour récupérer les tickets filtrés par service
        async fetchTickets() {
            this.loading = true;
            const idService = localStorage.getItem("idService");
            const token = localStorage.getItem("token");
            try {
                const response = await fetch(`http://localhost:8000/api/accueil/file-d'attente`, {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        'id_service': idService // Filtrer par id_service
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
    }
};
</script>

<style scoped>
/* Ajoutez votre style personnalisé ici */
</style>
