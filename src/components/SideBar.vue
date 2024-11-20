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
            <v-list-item
                v-for="item in items"
                :key="item.title"
                link
                class="d-flex align-center"
                @click="navigate(item)"
            >
                <div class="d-flex align-center">
                    <v-list-item-icon class="mr-4">
                        <v-icon color="#fff">
                            {{ item.icon }}
                        </v-icon>
                    </v-list-item-icon>
                
                    <v-list-item-content v-if="!toggleMini">
                        <v-list-item-title :style="{ color: '#FFF' }">{{ item.title }}</v-list-item-title>
                    </v-list-item-content>
                </div>
            </v-list-item>
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
        logoFull: new URL('@/assets/images/LogoApipa.png', import.meta.url).href 
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
</style>