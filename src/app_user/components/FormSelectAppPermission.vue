<script>
import { getInstalledApp, filerApps } from '@/base/store/api/server_api.js'
import { AllBadges } from "@/helpers/utils/badges.js"
import { uuidv4 } from '@/helpers/utils/uuid/uuid.js';
export default ({
    props: {
        defaultPermissions: {
            default: []
        },
        disable: {
            default: false
        }
    },
    data() {
        return {
            AllBadges: AllBadges,
            listApp: {
                results: []
            },
            selectedPermissons: []
        }
    },
    computed: {
        filterApp() {
            const selectedPermissons = this.selectedPermissons
            let apps = this.listApp?.results
            apps = apps.map(app => {
                let perCount_ = 0
                const maxPer = app.permissions.length
                app.permissions.map(per => {
                    per.labelId = uuidv4()
                    if (selectedPermissons.includes(per.id)) perCount_ += 1
                    return per
                })
                if (perCount_ == 0) perCount_ = "Không có quyền nào"
                else if (perCount_ == maxPer) perCount_ = 'Toàn quyền'
                else perCount_ = `Được chọn ${perCount_}/${maxPer} quyền`
                return {
                    ...app,
                    perCount: perCount_
                }
            })
            return filerApps(apps)
        }
    },
    mounted() {
        getInstalledApp(true).then(data => {
            this.listApp = data
        })
    },
    watch: {
        selectedPermissons() {
            this.$emit('change-data', this.selectedPermissons)
        },
        defaultPermissions() {
            try {
                const idsDefault = this.defaultPermissions.map(per => per.id)
                this.selectedPermissons = idsDefault ?? []
            }
            catch {
                return
            }
        }
    }
})
</script>

<template>
    <!-- Accordions with Icons -->
    <BAccordion class="accordion-icon-none" id="accordionWithicon">
        <BAccordionItem v-for="app in filterApp" :key="app.id">
            <template #title>
                <i class="me-2" :class="app.icon"></i> {{ app.name }} ({{ app.perCount }})
            </template>
            <b-row>
                <b-col class="mt-3" lg="12">
                    <div class="form-check mb-2" v-for="(per, index) in app.permissions" :key="per.id">
                        <input class="form-check-input" type="checkbox" :id="per.labelId" :disabled="disable"
                            v-model="selectedPermissons" :value="per.id">
                        <label class="form-check-label" :for="per.labelId">
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
        </BAccordionItem>
    </BAccordion>
</template>
