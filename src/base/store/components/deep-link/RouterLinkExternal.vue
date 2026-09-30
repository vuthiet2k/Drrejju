<script>
/**
 * Router Link External (Chuyển hướng tới các ứng dụng khác)
 * @version 1.0
 * @description 'Component RouterLinkInternal được sử dụng để chuyển hướng tới các app khác'
 * 
 */

import { get_deep_link_app } from '@/base/store/utils/deep_link.js'

export default {
    props: ['appId', 'path', 'name'],
    data() {
        return {
            fullPath: ''
        }
    },
    mounted() {
        get_deep_link_app(this.appId, this.path).then(fPath => {
            this.fullPath = fPath
        })
    }
}
</script>

<template>
    <a :href="fullPath">{{ name }}</a>
</template>