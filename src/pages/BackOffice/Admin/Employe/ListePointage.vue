<template>
  <div class="pointage-dashboard">
    <h2 class="dashboard-title">Tableau de Pointages</h2>

    <!-- Filtre par date -->
    <div class="filter-container">
      <div class="date-filter">
        <label for="date-filter">Filtrer par date:</label>
        <input
          v-model="dateFilter"
          id="date-filter"
          type="date"
          class="date-input"
          :max="getCurrentDate()"
        />
        <button @click="resetFilter" class="reset-button">
          Réinitialiser
        </button>
      </div>
    </div>

    <!-- Table des pointages -->
    <div class="table-container">
      <table class="pointage-table">
        <thead>
          <tr>
            <th>Employé</th>
            <th>Date</th>
            <th class="text-center">Session</th>
            <th>Heure d'arrivée</th>
            <th>Heure de départ</th>
            <th>Statut</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="pointage in filteredPointages" :key="pointage.id">
            <td class="employee-cell">
              <div class="employee-name">{{ pointage.employe.nom }} {{ pointage.employe.prenom }}</div>
              <div class="employee-details">{{ pointage.employe.telephone }}</div>
            </td>
            <td>{{ formatDate(pointage.date) }}</td>
            <td class="text-center">
              <span>{{ pointage.session }}</span>
            </td>
            <td>{{ formatTime(pointage.heure_arrivee) }}</td>
            <td>{{ pointage.heure_depart ? formatTime(pointage.heure_depart) : '—' }}</td>
            <td>
              <span :class="getStatusClass(pointage.statut.statut)">
                {{ pointage.statut.statut }}
              </span>
            </td>
          </tr>
          <tr v-if="filteredPointages.length === 0">
            <td colspan="6" class="no-data">Aucun pointage trouvé pour cette date</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script>
import { get } from '@/service/ApiService';
import { format, parseISO } from 'date-fns';
import { fr } from 'date-fns/locale';

export default {
  data() {
    return {
      pointages: [],
      dateFilter: null
    };
  },
  computed: {
    filteredPointages() {
      if (!this.dateFilter) {
        return this.pointages;
      }
      return this.pointages.filter(pointage => pointage.date === this.dateFilter);
    }
  },
  mounted() {
    this.fetchPointages();
  },
  methods: {
    async fetchPointages() {
      const response = await get('pointages');
      if(response.ok) {
        const data = await response.json();
        this.pointages = data.pointages;

        // Set default filter to most recent date if available
        if (this.pointages.length > 0) {
          const dates = [...new Set(this.pointages.map(p => p.date))];
          dates.sort((a, b) => new Date(b) - new Date(a));
          this.dateFilter = dates[0];
        }
      }
    },
    formatDate(dateString) {
      try {
        return format(parseISO(dateString), 'EEEE d MMMM yyyy', { locale: fr });
      } catch (e) {
        return dateString;
      }
    },
    formatTime(timeString) {
      try {
        const [hours, minutes] = timeString.split(':');
        return `${hours}h${minutes}`;
      } catch (e) {
        return timeString;
      }
    },
    getStatusClass(status) {
      const statusMap = {
        'Present': 'status-present',
        'Absent': 'status-absent',
        'Retard': 'status-late',
        'En congé': 'status-vacation'
      };
      return statusMap[status] || 'status-default';
    },
    resetFilter() {
      this.dateFilter = null;
    },
    getCurrentDate() {
      return new Date().toISOString().split('T')[0];
    }
  }
};
</script>

<style scoped>
.pointage-dashboard {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
  font-family: 'Inter', 'Segoe UI', sans-serif;
  color: #374151;
  background-color: #f9fafb;
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}

.dashboard-title {
  font-size: 1.75rem;
  font-weight: 600;
  color: #1f2937;
  margin-bottom: 1.5rem;
  text-align: center;
  letter-spacing: -0.025em;
  border-bottom: 2px solid #e5e7eb;
  padding-bottom: 1rem;
}

/* Filtre styles */
.filter-container {
  margin-bottom: 1.5rem;
  display: flex;
  justify-content: flex-end;
}

.date-filter {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  background-color: white;
  padding: 0.75rem 1rem;
  border-radius: 8px;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
}

.date-filter label {
  font-weight: 500;
  color: #4b5563;
}

.date-input {
  padding: 0.5rem;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  color: #1f2937;
  outline: none;
  transition: border-color 0.2s ease;
}

.date-input:focus {
  border-color: #3b82f6;
  box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.1);
}

.reset-button {
  background-color: #f3f4f6;
  border: none;
  padding: 0.5rem 0.75rem;
  border-radius: 6px;
  font-weight: 500;
  color: #4b5563;
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.reset-button:hover {
  background-color: #e5e7eb;
}

/* Table styles */
.table-container {
  background-color: white;
  border-radius: 10px;
  overflow: hidden;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
}

.pointage-table {
  width: 100%;
  border-collapse: collapse;
  table-layout: fixed;
}

.pointage-table th {
  background-color: #f9fafb;
  font-weight: 600;
  color: #4b5563;
  text-align: left;
  padding: 1rem;
  font-size: 0.875rem;
  letter-spacing: 0.025em;
  text-transform: uppercase;
  border-bottom: 1px solid #e5e7eb;
}

.pointage-table td {
  padding: 1rem;
  border-bottom: 1px solid #f3f4f6;
  vertical-align: middle;
}

.pointage-table tr:last-child td {
  border-bottom: none;
}

.pointage-table tr:hover {
  background-color: #f3f4f6;
  transition: background-color 0.15s ease;
}

/* Cellules spécifiques */
.employee-cell {
  width: 25%;
}

.employee-name {
  font-weight: 600;
  color: #1f2937;
  margin-bottom: 0.25rem;
}

.employee-details {
  font-size: 0.875rem;
  color: #6b7280;
}

/* Badges de statut */
.status-present {
  display: inline-flex;
  align-items: center;
  padding: 0.375rem 0.75rem;
  border-radius: 9999px;
  font-size: 0.75rem;
  font-weight: 600;
  background-color: #d1fae5;
  color: #047857;
}

.status-present::before {
  content: "•";
  margin-right: 0.375rem;
  font-size: 1.25rem;
  line-height: 0.5;
}

.status-absent {
  display: inline-flex;
  align-items: center;
  padding: 0.375rem 0.75rem;
  border-radius: 9999px;
  font-size: 0.75rem;
  font-weight: 600;
  background-color: #fee2e2;
  color: #b91c1c;
}

.status-absent::before {
  content: "•";
  margin-right: 0.375rem;
  font-size: 1.25rem;
  line-height: 0.5;
}

.status-late {
  display: inline-flex;
  align-items: center;
  padding: 0.375rem 0.75rem;
  border-radius: 9999px;
  font-size: 0.75rem;
  font-weight: 600;
  background-color: #fff7ed;
  color: #c2410c;
}

.status-late::before {
  content: "•";
  margin-right: 0.375rem;
  font-size: 1.25rem;
  line-height: 0.5;
}

.status-vacation {
  display: inline-flex;
  align-items: center;
  padding: 0.375rem 0.75rem;
  border-radius: 9999px;
  font-size: 0.75rem;
  font-weight: 600;
  background-color: #e0e7ff;
  color: #4338ca;
}

.status-vacation::before {
  content: "•";
  margin-right: 0.375rem;
  font-size: 1.25rem;
  line-height: 0.5;
}

.status-default {
  display: inline-flex;
  align-items: center;
  padding: 0.375rem 0.75rem;
  border-radius: 9999px;
  font-size: 0.75rem;
  font-weight: 600;
  background-color: #f3f4f6;
  color: #4b5563;
}

.status-default::before {
  content: "•";
  margin-right: 0.375rem;
  font-size: 1.25rem;
  line-height: 0.5;
}

.no-data {
  text-align: center;
  color: #6b7280;
  padding: 2rem !important;
  font-style: italic;
}

@media (max-width: 900px) {
  .pointage-dashboard {
    padding: 1rem;
  }

  .filter-container {
    flex-direction: column;
    align-items: stretch;
  }

  .date-filter {
    flex-wrap: wrap;
    gap: 0.5rem;
    padding: 0.5rem;
  }

  .pointage-table {
    font-size: 0.875rem;
  }

  .pointage-table th,
  .pointage-table td {
    padding: 0.75rem 0.5rem;
  }

  .employee-cell {
    width: auto;
  }
}
</style>
