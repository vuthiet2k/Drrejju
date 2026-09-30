<script>
import { useManageAppStore } from "../../../../store.js"
import { AllBadges } from "@/helpers/utils/badges.js"
import { uuidv4 } from '@/helpers/utils/uuid/uuid.js';

export default ({
    props: {
        appId: {
            type: String,
            default: ""
        },
        roleId: {
            type: String,
            default: ""
        }
    },
    computed: {
        /* eslint-disable */
        role() {
            return this.role
        }
    },
    data() {
        const store = useManageAppStore()
        const role = {
            id: "",
            name: "",
            description: "",
            permissions: []
        }
        const permissions = []
        return {
            AllBadges,
            store,
            role,
            permissions
        }
    },
    components: {
    },
    mounted() {
        this.$emit('change-app-role', this.role)
    },
    methods: {
    },
    watch: {
        appId() {
            this.store.getAllPersInApp(this.appId).then(data => {
                this.permissions = data['results']
                this.permissions = this.permissions.map(per => {
                    per.labelId = uuidv4()
                    return per
                })
            })
        },
        role: {
            handler() {
                const permiss = this.role.permissions.map(per => {
                    return {
                        "id": per
                    }
                })
                const rl = {
                    appId: this.appId,
                    name: this.role.name,
                    description: this.role.description,
                    permissions: permiss
                }
                this.$emit('change-app-role', rl)
            },
            deep: true
        },
        roleId() {
            if (this.roleId) {
                this.store.getRoleDetail(this.roleId).then(data => {
                    const permiss = data.permissions.map(per => per.id)
                    this.role.id = data.id
                    this.role.name = data.name
                    this.role.description = data.description
                    this.role.permissions = permiss
                })
            }
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
                Thông tin vai trò
            </button>
        </b-col>
        <b-col lg="6">
            <label for="name" class="form-label">
                Tên vai trò
            </label>
            <input type="text" class="form-control" id="name" v-model="role.name" placeholder="Nhập tên vai trò">
        </b-col>
        <b-col lg="6">
            <label for="name" class="form-label">
                Mô tả vai trò
            </label>
            <textarea name="" id="" cols="30" rows="5" class="form-control" v-model="role.description"
                placeholder="Nhập mô tả vai trò"></textarea>
        </b-col>
        <b-col class="mt-3 bg-head-title" lg="12">
            <button class="accordion-button p-2 " type="button" data-bs-toggle="collapse"
                data-bs-target="#accor_iconExamplecollapse1" aria-expanded="true"
                aria-controls="accor_iconExamplecollapse1">
                QUYỀN TRONG ỨNG DỤNG
            </button>
        </b-col>
        <b-col class="mt-3" lg="12">
            <div class="form-check mb-2" v-for="(per, index) in permissions" :key="per.id">
                <input class="form-check-input" type="checkbox" :id="`formCheckRoleToEdit${per.labelId}`"
                    v-model="role.permissions" :value="per.id">
                <label class="form-check-label" :for="`formCheckRoleToEdit${per.labelId}`">
                    <div>
                        <span :class="AllBadges[index]">
                            {{ per.codename }}
                        </span>
                    </div>
                    <div>
                        {{ per.name }}
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