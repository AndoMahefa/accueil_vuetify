<template>
  <v-container>
    <v-card>
      <FullCalendar
        ref="fullCalendar"
        :options="calendarOptions"
      />
    </v-card>

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
import { get } from '@/service/ApiService'
import FullCalendar from '@fullcalendar/vue3'
import timeGridPlugin from '@fullcalendar/timegrid'
import dayGridPlugin from '@fullcalendar/daygrid'
import interactionPlugin from '@fullcalendar/interaction'
import frLocale from '@fullcalendar/core/locales/fr'

export default {
  components: {
    FullCalendar
  },
  data() {
    return {
      directionColors: {
        1: '#4CAF50', // Vert pour direction 1
        2: '#2196F3', // Bleu pour direction 2
        3: '#9C27B0', // Violet pour direction 3
        4: '#FF9800', // Orange pour direction 4
        // Ajoutez d'autres IDs et couleurs au besoin
      },
      rdv: [],
      minDate: new Date().toISOString().substr(0, 10),
      loading: false,
      snackbar: {
        show: false,
        text: '',
        color: 'success'
      },
      calendarOptions: {
        plugins: [dayGridPlugin, timeGridPlugin, interactionPlugin],
        initialView: 'timeGridWeek',
        locale: frLocale,
        headerToolbar: {
          left: 'prev,next today',
          center: 'title',
          right: 'dayGridMonth,timeGridWeek,timeGridDay'
        },
        events: [],
        editable: false,
        selectable: true,
        selectMirror: true,
        weekends: false,
        height: 'auto',
        slotMinTime: '08:00:00',
        slotMaxTime: '19:00:00',
        eventTimeFormat: {
          hour: '2-digit',
          minute: '2-digit',
          hour12: false
        },
        allDaySlot: false,
        slotDuration: '00:30:00',
        expandRows: true,
        stickyHeaderDates: true,
        dayHeaderFormat: { weekday: 'long', day: 'numeric', month: 'numeric' }
      }
    }
  },
  async mounted() {
    await this.fetchRdv()
  },
  methods: {
    formatTime(dateTime) {
      const date = new Date(dateTime)
      return date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
    },
    async fetchRdv() {
      this.loading = true
      try {
        let url = `rendez-vous`
        const response = await get(url)
        if (response.ok) {
          const data = await response.json()
          this.rdv = data.rdv
          this.updateCalendarEvents()
        } else {
          console.error('Erreur lors de la récupération des rendez-vous')
          this.showError("Erreur lors de la récupération des rendez-vous")
        }
      } catch (error) {
        this.showError("Une erreur est survenue lors du chargement des rendez-vous")
      } finally {
        this.loading = false
      }
    },
    updateCalendarEvents() {
      console.log(this.rdv)
      const events = this.rdv.map(item => {
        const start = new Date(item.date_heure)
        const [hours, minutes, seconds] = item.heure_fin.split(':').map(Number);
        // Cloner la date de début et appliquer l'heure de fin
        const end = new Date(start);
        end.setHours(hours);
        end.setMinutes(minutes);
        end.setSeconds(seconds || 0);

        // Récupérer la couleur selon id_direction
        const directionId = item.direction.id; // Adaptez selon votre structure de données
        const eventColor = this.directionColors[directionId] || '#1976D2'; // Couleur par défaut

        return {
          title: `${item.visiteur.nom} ${item.visiteur.prenom} - ${item.motif}`,
          start: start,
          end: end,
          backgroundColor: eventColor,
          borderColor: eventColor,
          extendedProps: {
            directionId: directionId // Stockez l'ID pour utilisation ultérieure si besoin
          }
        }
      })
      this.calendarOptions.events = events
    },
    showSuccess(message) {
      this.snackbar.color = 'success'
      this.snackbar.text = message
      this.snackbar.show = true
    },
    showError(message) {
      this.snackbar.color = 'error'
      this.snackbar.text = message
      this.snackbar.show = true
    }
  }
}
</script>

<style>
  .fc {
    font-family: "Roboto", sans-serif;
    color: #000;
    background-color: #fff;
  }

  .fc-toolbar-title {
    font-size: 1.5rem !important;
    font-weight: bold !important;
    text-transform: capitalize;
    color: #000;
  }

  .fc-event {
    cursor: pointer;
    padding: 2px 4px;
  }

  .fc-day-today {
    background-color: rgba(25, 118, 210, 0.05) !important;
  }

  .fc-timegrid-slot {
    height: 40px !important;
  }

  .fc .fc-timegrid-slot-label {
    color: #000;
  }

  .fc .fc-col-header-cell-cushion {
    color: #000;
    text-transform: capitalize;
  }

  .fc-theme-standard td,
  .fc-theme-standard th,
  .fc-theme-standard .fc-scrollgrid {
    border-color: #ddd;
  }

  .fc .fc-button-primary {
    background-color: #1976D2;
    border-color: #1976D2;
  }

  .fc .fc-button-primary:not(:disabled):hover {
    background-color: #1565C0;
    border-color: #1565C0;
  }

  .fc .fc-button-primary:not(:disabled).fc-button-active,
  .fc .fc-button-primary:not(:disabled):active {
    background-color: #0D47A1;
    border-color: #0D47A1;
  }
</style>
