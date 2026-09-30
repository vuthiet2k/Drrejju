<template>
  <footer class="footer" style="z-index: 2;position:fixed;left:0">
    <b-container fluid>
      <b-row>
        <b-col col sm="6">
          {{ new Date().getFullYear() }} <span v-if="false">© DTwin Team</span>
        </b-col>
        <b-col col sm="6" class="text-end">
          <div>
            <span v-if="false">Design & Develop by DTwin Team</span>
          </div>
        </b-col>
      </b-row>
    </b-container>
  </footer>
</template>
