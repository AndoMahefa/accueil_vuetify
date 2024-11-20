<template>
  <div class="d-flex justify-center mt-4">
    <v-btn 
      :disabled="page === 1" 
      class="mx-1"
      @click="changePage(page - 1)"
    >
      Précédent
    </v-btn>
  
    <v-btn 
      v-for="p in pageNumbers" 
      :key="p"
      :class="{'v-btn--active': page === p}"
      class="mx-1"
      @click="changePage(p)"
    >
      {{ p }}
    </v-btn>
  
    <v-btn 
      :disabled="page === totalPages" 
      class="mx-1"
      @click="changePage(page + 1)"
    >
      Suivant
    </v-btn>
  </div>
</template>
  
<script>
    export default {
        props: {
            page: {
                type: Number,
                required: true,
            },
            totalPages: {
                type: Number,
                required: true,
            },
        },
        emits: ['update:page'],
        computed: {
            pageNumbers() {
                const range = [];
                for (let i = 1; i <= this.totalPages; i++) {
                range.push(i);
                }
                return range;
            },
        },
        methods: {
            changePage(page) {
                this.$emit('update:page', page);
            },
        },
    };
    </script>
    
<style scoped>
    .v-btn--active {
        background-color: #2D3E6A;
        color: white;
    }
</style>
  