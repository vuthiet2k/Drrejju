<script setup>
/* eslint-disable */
import { applications, isLoadingApp } from "@/helpers/user/applications.js";

</script>

<template>
    <div class="container">
        <div class="mt-5" v-for="(application, index) in applications" :key="index">
            <h4 class="section-title text-warning mb-3 text-uppercase">
                {{ application.title }}
            </h4>
            <b-row class="row-cols-xxl-5 row-cols-xl-4 row-cols-lg-3 row-cols-md-2 row-cols-1">
                <b-col v-for="(ungdung, i) in application.listPage" :key="i">
                    <router-link :to="`/${ungdung.path}`">
                        <b-card no-body class="card-height-100 cursor-pointer card-animate ribbon-box">
                            <div class="ribbon-two ribbon-two-danger" v-if="ungdung.meta.backendOnly"><span>Backend
                                    only</span></div>
                            <b-card-body class="text-center py-4">
                                <i class="display-6 text-primary" :class="ungdung.meta.icon"></i>
                                <h6 class="mt-4 text-muted">{{ ungdung.meta.name }}</h6>
                            </b-card-body>
                        </b-card>
                    </router-link>
                </b-col>
                <b-col>
                    <b-card no-body class="card-height-100 cursor-pointer card-animate ribbon-box">
                        <b-card-body class="text-center py-4">
                            <i class="display-6 text-primary ri-add-box-line"></i>
                            <h6 class="mt-4 text-muted">Thêm</h6>
                        </b-card-body>
                    </b-card>
                </b-col>
            </b-row>
        </div>
        <div v-if="!applications.length && !isLoadingApp" class="text-center p-3">
            <h4 class="text-white">KHÔNG ĐƯỢC QUYỀN TRUY CẬP ỨNG DỤNG NÀO!</h4>
        </div>
        <div v-if="!applications.length && isLoadingApp" class="text-center p-3">
            <h4 class="text-white">ĐANG TẢI ỨNG DỤNG ...!</h4>
        </div>
        <div class="mt-5 w-100 text-center">
            <router-link to="/" class="btn btn-secondary w-lg waves-effect waves-light">
                <i class="ri-arrow-left-line me-2 fw-semibold align-bottom"></i>
                Trang chủ
            </router-link>
        </div>
    </div>
</template>
