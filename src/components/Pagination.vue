<template>
  <v-row justify="center">
    <v-col cols="8">
      <v-container class="max-width">
        <v-pagination
          :model-value="currentPage"
          :length="totalPages"
          class="my-4"
          rounded="circle"
          @update:model-value="onPageChange" 
        />
      </v-container>
    </v-col>
  </v-row>
</template>

<script>
export default {
  name: 'Pagination',
  props: {
    totalPages: {
      type: Number,
      required: true,
    },
    currentPage: {
      type: Number,
      required: true,
    },
  },
  methods: {
    onPageChange(page) {
      // Émettez un événement pour informer le parent
      this.$emit('page-changed', page);
    },
  },
};
</script>

<style scoped>
</style>
