/**
 * plugins/vuetify.js
 *
 * Framework documentation: https://vuetifyjs.com`
 */

// Styles
import '@mdi/font/css/materialdesignicons.css'
import 'vuetify/styles'

// Composables
import { createVuetify } from 'vuetify'
import { VTimePicker } from 'vuetify/labs/VTimePicker'
import { VCalendar } from 'vuetify/labs/VCalendar'
import { fr } from 'date-fns/locale'

// https://vuetifyjs.com/en/introduction/why-vuetify/#feature-guides
export default createVuetify({
  locale: {
    locale: 'fr',
    fallback: 'fr',
    dateFns: {
      locale: fr
    }
  },
  theme: {
    defaultTheme: 'light',
  },
  components: {
    VTimePicker,
    VCalendar
  },
})
