// src/main.js
import { createApp } from 'vue'
import App from './App.vue'
import vuetify from './plugins/vuetify'
import { registerPlugins } from '@/plugins'

const app = createApp(App)

registerPlugins(app)

app.use(vuetify)
app.mount('#app')
