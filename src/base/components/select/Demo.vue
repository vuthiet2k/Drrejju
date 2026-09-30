<script setup>
import Select from './Select.vue';
import { BASE_URL } from "@/helpers/api/axiosHttp";

const demoData = [
  {
    "id": 1,
    "name": "Thành phố Hà Nội",
    "id_parent": null
  },
  {
    "id": 2,
    "name": "Tỉnh Hà Giang",
    "id_parent": null
  },
  {
    "id": 4,
    "name": "Tỉnh Cao Bằng",
    "id_parent": null
  },
  {
    "id": 6,
    "name": "Tỉnh Bắc Kạn",
    "id_parent": null
  },
  {
    "id": 8,
    "name": "Tỉnh Tuyên Quang",
    "id_parent": null
  },
  {
    "id": 10,
    "name": "Tỉnh Lào Cai",
    "id_parent": null
  },
  {
    "id": 11,
    "name": "Tỉnh Điện Biên",
    "id_parent": null
  },
  {
    "id": 12,
    "name": "Tỉnh Lai Châu",
    "id_parent": null
  },
  {
    "id": 14,
    "name": "Tỉnh Sơn La",
    "id_parent": null
  },
  {
    "id": 15,
    "name": "Tỉnh Yên Bái",
    "id_parent": null
  },
  {
    "id": 17,
    "name": "Tỉnh Hoà Bình",
    "id_parent": null
  },
  {
    "id": 19,
    "name": "Tỉnh Thái Nguyên",
    "id_parent": null
  },
  {
    "id": 20,
    "name": "Tỉnh Lạng Sơn",
    "id_parent": null
  },
  {
    "id": 22,
    "name": "Tỉnh Quảng Ninh",
    "id_parent": null
  },
  {
    "id": 24,
    "name": "Tỉnh Bắc Giang",
    "id_parent": null
  },
  {
    "id": 25,
    "name": "Tỉnh Phú Thọ",
    "id_parent": null
  },
  {
    "id": 26,
    "name": "Tỉnh Vĩnh Phúc",
    "id_parent": null
  },
  {
    "id": 27,
    "name": "Tỉnh Bắc Ninh",
    "id_parent": null
  },
  {
    "id": 30,
    "name": "Tỉnh Hải Dương",
    "id_parent": null
  },
  {
    "id": 31,
    "name": "Thành phố Hải Phòng",
    "id_parent": null
  },
  {
    "id": 33,
    "name": "Tỉnh Hưng Yên",
    "id_parent": null
  },
  {
    "id": 34,
    "name": "Tỉnh Thái Bình",
    "id_parent": null
  },
  {
    "id": 35,
    "name": "Tỉnh Hà Nam",
    "id_parent": null
  },
  {
    "id": 36,
    "name": "Tỉnh Nam Định",
    "id_parent": null
  },
  {
    "id": 37,
    "name": "Tỉnh Ninh Bình",
    "id_parent": null
  },
  {
    "id": 38,
    "name": "Tỉnh Thanh Hóa",
    "id_parent": null
  },
  {
    "id": 40,
    "name": "Tỉnh Nghệ An",
    "id_parent": null
  },
  {
    "id": 42,
    "name": "Tỉnh Hà Tĩnh",
    "id_parent": null
  },
  {
    "id": 44,
    "name": "Tỉnh Quảng Bình",
    "id_parent": null
  },
  {
    "id": 45,
    "name": "Tỉnh Quảng Trị",
    "id_parent": null
  },
  {
    "id": 46,
    "name": "Tỉnh Thừa Thiên Huế",
    "id_parent": null
  },
  {
    "id": 48,
    "name": "Thành phố Đà Nẵng",
    "id_parent": null
  },
  {
    "id": 49,
    "name": "Tỉnh Quảng Nam",
    "id_parent": null
  },
  {
    "id": 51,
    "name": "Tỉnh Quảng Ngãi",
    "id_parent": null
  },
  {
    "id": 52,
    "name": "Tỉnh Bình Định",
    "id_parent": null
  },
  {
    "id": 54,
    "name": "Tỉnh Phú Yên",
    "id_parent": null
  },
  {
    "id": 56,
    "name": "Tỉnh Khánh Hòa",
    "id_parent": null
  },
  {
    "id": 58,
    "name": "Tỉnh Ninh Thuận",
    "id_parent": null
  },
  {
    "id": 60,
    "name": "Tỉnh Bình Thuận",
    "id_parent": null
  },
  {
    "id": 62,
    "name": "Tỉnh Kon Tum",
    "id_parent": null
  },
  {
    "id": 64,
    "name": "Tỉnh Gia Lai",
    "id_parent": null
  },
  {
    "id": 66,
    "name": "Tỉnh Đắk Lắk",
    "id_parent": null
  },
  {
    "id": 67,
    "name": "Tỉnh Đắk Nông",
    "id_parent": null
  },
  {
    "id": 68,
    "name": "Tỉnh Lâm Đồng",
    "id_parent": null
  },
  {
    "id": 70,
    "name": "Tỉnh Bình Phước",
    "id_parent": null
  },
  {
    "id": 72,
    "name": "Tỉnh Tây Ninh",
    "id_parent": null
  },
  {
    "id": 74,
    "name": "Tỉnh Bình Dương",
    "id_parent": null
  },
  {
    "id": 75,
    "name": "Tỉnh Đồng Nai",
    "id_parent": null
  },
  {
    "id": 77,
    "name": "Tỉnh Bà Rịa - Vũng Tàu",
    "id_parent": null
  },
  {
    "id": 79,
    "name": "Thành phố Hồ Chí Minh",
    "id_parent": null
  },
  {
    "id": 80,
    "name": "Tỉnh Long An",
    "id_parent": null
  },
  {
    "id": 82,
    "name": "Tỉnh Tiền Giang",
    "id_parent": null
  },
  {
    "id": 83,
    "name": "Tỉnh Bến Tre",
    "id_parent": null
  },
  {
    "id": 84,
    "name": "Tỉnh Trà Vinh",
    "id_parent": null
  },
  {
    "id": 86,
    "name": "Tỉnh Vĩnh Long",
    "id_parent": null
  },
  {
    "id": 87,
    "name": "Tỉnh Đồng Tháp",
    "id_parent": null
  },
  {
    "id": 89,
    "name": "Tỉnh An Giang",
    "id_parent": null
  },
  {
    "id": 91,
    "name": "Tỉnh Kiên Giang",
    "id_parent": null
  },
  {
    "id": 92,
    "name": "Thành phố Cần Thơ",
    "id_parent": null
  },
  {
    "id": 93,
    "name": "Tỉnh Hậu Giang",
    "id_parent": null
  },
  {
    "id": 94,
    "name": "Tỉnh Sóc Trăng",
    "id_parent": null
  },
  {
    "id": 95,
    "name": "Tỉnh Bạc Liêu",
    "id_parent": null
  },
  {
    "id": 96,
    "name": "Tỉnh Cà Mau",
    "id_parent": null
  }
]
const handleChange = (data) => {
  return data
}

</script>
<template>
  <b-row class="m-2">
    <b-col lg="3" md="4" sm="6">
      <h5>Select default</h5>
      <div class="position-relative">
        <Select :localData="demoData" :isCloseOnSelect="true" label="name" searchField="name" :isLocalSearch="true"
          defaultValueLabel="Chọn tỉnh ..." @change-data="handleChange">
        </Select>
      </div>
    </b-col>
    <b-col lg="3" md="4" sm="6">
      <h5>Select multiple</h5>
      <div class="position-relative">
        <Select :localData="demoData" :isCloseOnSelect="false" label="name" searchField="name" :isLocalSearch="true"
          defaultValueLabel="Chọn tỉnh ..." @change-data="handleChange" :multiSelect="true">
        </Select>
      </div>
    </b-col>
    <b-col lg="3" md="4" sm="6">
      <h5>Select with api url</h5>
      <div class="position-relative">
        <Select :api="`${BASE_URL}/api/user`" :isCloseOnSelect="true" defaultValueLabel="Chưa chọn tài khoản quản lý"
          labelField="username" searchField="username" @change-data="handleSelectManager"></Select>
      </div>
    </b-col>
    
    <b-col lg="3" md="4" sm="6">
      <h5>Select with api url</h5>
      <div class="position-relative">
        <Select :api="`${BASE_URL}/api/user`" :isCloseOnSelect="true" defaultValueLabel="Chưa chọn tài khoản quản lý"
          labelField="username" searchField="username" @change-data="handleSelectManager"></Select>
      </div>
    </b-col>
  </b-row>
</template>
