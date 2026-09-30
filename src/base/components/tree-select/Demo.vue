<script setup>
import TreeSelect from "./TreeSelect.vue"

const treeDataDemo = [
  {
    "id": "6dd34748-8b91-4621-8e65-7bd507ce0edd",
    "name": "Lương thực thực phẩm",
    "commodity": "luong-thuc-thuc-pham",
    "description": "",
    "created_by": "41036702-4832-4325-a97d-cb795a932d79",
    "updated_by": "41036702-4832-4325-a97d-cb795a932d79",
    "created_date": "2024-04-20T03:37:11.351118Z",
    "updated_date": "2024-04-20T03:37:11.351213Z",
    "children": [
      {
        "id": "dcee2d57-d022-4b6e-9e3c-2267fde314eb",
        "name": "Ngô",
        "commodity": "ngo",
        "description": "",
        "created_by": "3928c607-b120-4488-8cc3-f79c06a3fbd0",
        "updated_by": "3928c607-b120-4488-8cc3-f79c06a3fbd0",
        "created_date": "2024-04-20T11:21:43.587104Z",
        "updated_date": "2024-04-20T11:21:43.587208Z",
        "children": []
      },
      {
        "id": "b530ccb3-7310-4f09-adb7-dcdfab332c76",
        "name": "Sắn",
        "commodity": "san",
        "description": "",
        "created_by": "3928c607-b120-4488-8cc3-f79c06a3fbd0",
        "updated_by": "3928c607-b120-4488-8cc3-f79c06a3fbd0",
        "created_date": "2024-04-20T11:22:17.133823Z",
        "updated_date": "2024-04-20T11:22:17.133899Z",
        "children": []
      },
      {
        "id": "6c7df6d5-7021-40f7-a6e9-e6b471c29c02",
        "name": "Khoai lang",
        "commodity": "khoai-lang",
        "description": "",
        "created_by": "3928c607-b120-4488-8cc3-f79c06a3fbd0",
        "updated_by": "3928c607-b120-4488-8cc3-f79c06a3fbd0",
        "created_date": "2024-04-20T11:22:47.334300Z",
        "updated_date": "2024-04-20T11:22:47.334414Z",
        "children": []
      },
      {
        "id": "6a3f25cc-3643-47ae-b039-2eda43af6be7",
        "name": "Gạo",
        "commodity": "gao",
        "description": "",
        "created_by": "41036702-4832-4325-a97d-cb795a932d79",
        "updated_by": "41036702-4832-4325-a97d-cb795a932d79",
        "created_date": "2024-04-20T04:48:30.696183Z",
        "updated_date": "2024-04-26T16:25:01.473093Z",
        "children": [
          {
            "id": "6a3f25cc-3643-47ae-b039-2eda43af6be8",
            "name": "Gạo ST 25",
            "commodity": "gao",
            "description": "",
            "created_by": "41036702-4832-4325-a97d-cb795a932d79",
            "updated_by": "41036702-4832-4325-a97d-cb795a932d79",
            "created_date": "2024-04-20T04:48:30.696183Z",
            "updated_date": "2024-04-26T16:25:01.473093Z",
            "children": []
          }
        ]
      }
    ]
  },
  {
    "id": "0f26960a-f570-4b07-ad5c-e45fb4ac4db7",
    "name": "Cây trồng lâu năm",
    "commodity": "cay-trong-lau-nam",
    "description": "",
    "created_by": "41036702-4832-4325-a97d-cb795a932d79",
    "updated_by": "41036702-4832-4325-a97d-cb795a932d79",
    "created_date": "2024-04-20T03:37:44.099710Z",
    "updated_date": "2024-04-20T03:37:44.099816Z",
    "children": []
  },
  {
    "id": "5022994f-fa57-4641-8d71-8d81ed5c8999",
    "name": "ABABCAAC",
    "commodity": "fasafsasfafs",
    "description": "",
    "created_by": "41036702-4832-4325-a97d-cb795a932d79",
    "updated_by": "41036702-4832-4325-a97d-cb795a932d79",
    "created_date": "2024-05-07T03:34:30.851020Z",
    "updated_date": "2024-05-07T03:34:30.851065Z",
    "children": [
      {
        "id": "d98b129b-240b-4872-951b-7a7b1fc2055e",
        "name": "fasfasf",
        "commodity": "afafsa",
        "description": "",
        "created_by": "41036702-4832-4325-a97d-cb795a932d79",
        "updated_by": "41036702-4832-4325-a97d-cb795a932d79",
        "created_date": "2024-05-07T03:34:38.440865Z",
        "updated_date": "2024-05-07T03:34:38.440927Z",
        "children": [
          {
            "id": "2d7cccb0-1f6f-427b-9e09-f82d8ccb21c9",
            "name": "AVAAV",
            "commodity": "avsasvva",
            "description": "",
            "created_by": "41036702-4832-4325-a97d-cb795a932d79",
            "updated_by": "41036702-4832-4325-a97d-cb795a932d79",
            "created_date": "2024-05-07T03:37:54.566624Z",
            "updated_date": "2024-05-07T03:37:54.566720Z",
            "children": []
          }
        ]
      }
    ]
  },
]

const handleSelectedTree = (data) => {
  return data
}

</script>
<template>
  <b-row>
    <b-col lg="3" md="4" sm="6">
      <h5>Tree select default</h5>
      <div class="position-relative">
        <TreeSelect @on-selected="handleSelectedTree" :treeData="treeDataDemo" loopField="children" labelField="name">
        </TreeSelect>
      </div>
    </b-col>
    <b-col lg="3" md="4" sm="6">
      <h5>Tree select multiple</h5>
      <div class="position-relative">
        <TreeSelect @on-selected="handleSelectedTree" :treeData="treeDataDemo" loopField="children" labelField="name"
          multiSelect="true">
        </TreeSelect>
      </div>
    </b-col>
  </b-row>
</template>
<style scoped></style>