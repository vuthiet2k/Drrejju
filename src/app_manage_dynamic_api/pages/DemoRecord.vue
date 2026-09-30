<script setup>
import LayoutRecord from "../layout/record/LayoutRecord.vue";

</script>

<template>
  <LayoutRecord id="add-user">
    <template #header>
      <button type="button" class="btn btn-soft-primary waves-effect waves-light">
        Thêm mới
      </button>
      <button type="button" class="btn btn-warning btn-icon waves-effect waves-light"><i
          class="ri-save-2-fill"></i></button>
      <button type="button" class="btn btn-danger btn-icon waves-effect waves-light"><i
          class="las la-undo-alt"></i></button>
      <!-- <div class="px-2 py-1" style="background-color: #ecedf3; border-radius: 4px;">
        <div class="fs-11"><b>Trạng thái</b></div>
        <span class="fs-10">Cập nhật gần nhất lúc: dd/mm/yyyy</span>
      </div> -->
    </template>

    <template #body>
      <form action="#">
        <input class="form-control">
      </form>
    </template>
  </LayoutRecord>

  <LayoutRecord id="update-user">
    <template #header>
      <button type="button" class="btn btn-soft-primary waves-effect waves-light">
        Chỉnh sửa
      </button>
      <button type="button" class="btn btn-warning btn-icon waves-effect waves-light"><i
          class="ri-save-2-fill"></i></button>
      <button type="button" class="btn btn-danger btn-icon waves-effect waves-light"><i
          class="las la-undo-alt"></i></button>
      <!-- <div class="px-2 py-1" style="background-color: #ecedf3; border-radius: 4px;">
        <div class="fs-11"><b>Trạng thái</b></div>
        <span class="fs-10">Cập nhật gần nhất lúc: dd/mm/yyyy</span>
      </div> -->
    </template>
  </LayoutRecord>

  <LayoutRecord id="view-user">
    <template #header>
      <button type="button" class="btn btn-soft-primary waves-effect waves-light">
        Xem chi tiết
      </button>
      <button type="button" class="btn btn-warning btn-icon waves-effect waves-light" data-bs-toggle="offcanvas"
        data-bs-target="#offcanvasupdate-user" aria-controls="offcanvasupdate-user"><i class="las la-edit"></i></button>
      <button type="button" class="btn btn-danger btn-icon waves-effect waves-light"><i
          class="ri-delete-bin-5-line"></i></button>
      <!-- <div class="px-2 py-1" style="background-color: #ecedf3; border-radius: 4px;">
        <div class="fs-11"><b>Trạng thái</b></div>
        <span class="fs-10">Cập nhật gần nhất lúc: dd/mm/yyyy</span>
      </div> -->
    </template>
  </LayoutRecord>
</template>
