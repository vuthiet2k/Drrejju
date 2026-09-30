<script>
import { AllBadges } from "@/helpers/utils/badges.js"

export default ({
    props: {
        roles: {
            type: Object
        }
    },
    computed: {
    },
    data() {
        const selectedRoles = []
        return {
            AllBadges,
            selectedRoles
        }
    },
    mounted() {

    },
    methods: {
    },
    watch: {
        userToEdit() {
            this.selectedRoles = this.userToEdit.role_in_app.map(rl => rl.id)
        },
        selectedRoles() {
            this.$emit('change-roles', this.selectedRoles)
        }
    }
})
</script>

<template>
    <b-row>
        <b-col class="mt-3" lg="12">
            <div class="form-check mb-2" v-for="(role, index) in roles" :key="role.id">
                <input class="form-check-input" type="checkbox" :id="`formCheckRole${index}`" v-model="selectedRoles"
                    :value="role.id">
                <label class="form-check-label" :for="`formCheckRole${index}`">
                    <div>
                        <h5>{{ role.name }}</h5>
                        <ul v-if="role.permissions.length">
                            <li v-for="(per, index) in role.permissions" :key="per.id">
                                <span :class="AllBadges[index]">
                                    {{ per.name }}
                                </span>
                            </li>
                        </ul>
                        <ul v-else>
                            <li>
                                Chưa được liên kết với quyền nào!
                            </li>
                        </ul>
                    </div>
                </label>
            </div>
        </b-col>
    </b-row>
</template>

<style>
.bg-head-title {
    background-color: #DBE4FF;
}
</style>