<!-- eslint-disable vue/html-self-closing -->
<template>
  <v-navigation-drawer
    :model-value="drawer"
    :mini-variant="toggleMini"
    permanent
    color="#6EC1B4"
    app
    @update:model-value="$emit('update:drawer', $event)"
  >
    <!-- Logo -->
    <v-list-item
      class="sidebar-logo-container"
      @click="toggleSidebar"
    >
      <div class="d-flex align-center">
        <img
          :src="logoFull"
          alt="Logo"
          class="sidebar-logo"
        />
      </div>
    </v-list-item>

    <v-divider />

    <v-list>
      <template v-for="(item, index) in items" :key="item.title">
        <!-- Menu avec sous-menus -->
        <v-list-group
          v-if="item.items"
          :value="openGroups[index]"
          @click="toggleGroup(index)"
        >
          <template v-slot:activator="{ props }">
            <v-list-item
              v-bind="props"
              :prepend-icon="item.icon"
              :title="item.title"
              class="text-white"
            />
          </template>

          <v-list-item
            v-for="subItem in item.items"
            :key="subItem.title"
            :to="subItem.to"
            :title="subItem.title"
            class="text-white pl-4"
          />
        </v-list-group>

        <!-- Menu simple -->
        <v-list-item
          v-else
          :to="item.to"
          link
          class="d-flex align-center text-white"
        >
          <template #prepend>
            <v-icon color="white">{{ item.icon }}</v-icon>
          </template>
          <v-list-item-title v-if="!toggleMini">
            {{ item.title }}
          </v-list-item-title>
        </v-list-item>
      </template>
    </v-list>
  </v-navigation-drawer>
</template>

<script>
export default {
    props: {
      drawer: Boolean,
      toggleMini: Boolean,
      items: Array,
      userName: String
    },
    emits: ['update:drawer'],
    data() {
        return {
          logoFull: new URL('@/assets/images/LogoApipa.png', import.meta.url).href,
          openGroups: {} // Pour suivre l'état d'ouverture de chaque groupe
        };
    },
    methods: {
        toggleSidebar() {
            this.$emit('update:drawer', !this.drawer);
        },
        navigate(item) {
            if (item.to) {
                this.$router.push(item.to);
            }
        },
        toggleGroup(index) {
            // Utilise Vue.set pour assurer la réactivité
            this.$set(this.openGroups, index, !this.openGroups[index]);
        }
    }
};
</script>

<style scoped>
  .v-list-item {
      padding: 8px 16px;
  }

  .v-list-item .v-list-item-icon {
      margin-right: 50px;
  }

  .translatex {
      transform: scale(1.5);
      transition: transform 0.5s ease-in;
  }

  .sidebar-logo-container {
      display: flex;
      justify-content: center;
      align-items: center;
      width: 100%;
      height: 100px;
  }

  .sidebar-logo {
      width: 100%;
      max-width: 100px;
      height: auto;
      object-fit: contain;
      transition: all 0.3s ease;
  }

  .v-list-group__items .v-list-item {
    padding-left: 16px;
  }

  .v-list-group__header .v-list-item__title {
    color: white;
  }

  .v-list-item--active {
    background-color: rgba(255, 255, 255, 0.1);
  }

  .v-list-group__items .v-list-item:hover {
    background-color: rgba(255, 255, 255, 0.05);
  }
</style>
