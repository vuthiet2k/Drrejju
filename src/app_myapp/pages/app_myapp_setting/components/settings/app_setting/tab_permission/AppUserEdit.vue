<script>
import { AllBadges } from "@/helpers/utils/badges.js"
import { uuidv4 } from '@/helpers/utils/uuid/uuid.js';

export default ({
    props: {
        userToEdit: {
            type: Object,
            default: () => {
                return {
                    "id": "",
                    "username": "",
                    "first_name": "",
                    "last_name": "",
                    "photo": null,
                    "role_in_app": [],
                }
            }
        },
        roles: {
            type: Object
        }
    },
    computed: {
        visualRoles() {
            return this.roles.map(role => {
                role.labelId = uuidv4()
                return role
            })
        }
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
        compareObjects(a, b) {
            const aIds = a.map(obj => obj.id);
            const bIds = b;

            const newIds = bIds.filter(id => !aIds.includes(id));
            const removedIds = aIds.filter(id => !bIds.includes(id));

            return {
                added: newIds,
                removed: removedIds
            };
        }
    },
    watch: {
        userToEdit() {
            this.selectedRoles = this.userToEdit.role_in_app.map(rl => rl.id)
        },
        selectedRoles() {
            const rl = this.compareObjects(this.userToEdit.role_in_app, this.selectedRoles)
            this.$emit('change-roles', { ...rl, roles_update: this.selectedRoles })
        }
    }
})
</script>

<template>
    <b-row>
        <b-col class="mb-3 bg-head-title" lg="12">
            <button class="accordion-button p-2 " type="button" data-bs-toggle="collapse"
                data-bs-target="#accor_iconExamplecollapse1" aria-expanded="true"
                aria-controls="accor_iconExamplecollapse1">
                Thông tin người dùng
            </button>
        </b-col>
        <b-col lg="6">
            <label for="name" class="form-label">
                Tên đăng nhập
            </label>
            <input type="text" class="form-control" id="name" :value="userToEdit.username" disabled>
        </b-col>
        <b-col lg="6">
            <label for="name" class="form-label">
                Tên người dùng
            </label>
            <input type="text" class="form-control" disabled
                :value="`${userToEdit.first_name} ${userToEdit.last_name}`">
        </b-col>
        <b-col class="mt-3 bg-head-title" lg="12">
            <button class="accordion-button p-2 " type="button" data-bs-toggle="collapse"
                data-bs-target="#accor_iconExamplecollapse1" aria-expanded="true"
                aria-controls="accor_iconExamplecollapse1">
                VAI TRÒ TRONG ỨNG DỤNG
            </button>
        </b-col>
        <b-col class="mt-3" lg="12">
            <div class="form-check mb-2" v-for="role in visualRoles" :key="role.id">
                <input class="form-check-input" type="checkbox" :id="`formCheckRole${role.labelId}_${userToEdit.username}`"
                    v-model="selectedRoles" :value="role.id">
                <label class="form-check-label" :for="`formCheckRole${role.labelId}_${userToEdit.username}`">
                    <div>
                        <h5>{{ role.name }}</h5>
                        <ul v-if="role?.permissions?.length">
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