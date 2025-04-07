// stores/serviceStore.js
import { defineStore } from 'pinia'

export const useServiceStore = defineStore('service', {
  state: () => ({
    name: 'Chargement...',
    hasFetched: false
  }),
  actions: {
    async fetchServiceName() {
      if (this.hasFetched) return

      const idService = localStorage.getItem('idService')
      if (!idService) return

      try {
        const token = localStorage.getItem('token')
        const response = await fetch(`http://localhost:8000/api/service/${idService}`, {
          headers: { Authorization: `Bearer ${token}` }
        })

        const data = await response.json()
        this.name = data.nom
      } catch (error) {
        console.error('Erreur:', error)
        this.name = 'Erreur de chargement'
      } finally {
        this.hasFetched = true
      }
    }
  }
})
