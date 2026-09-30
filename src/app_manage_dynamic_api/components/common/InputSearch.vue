<script setup>
import { reactive, defineEmits } from "vue";
import { TextSearchAPIMap4D } from "../../common/map/function_map.js";
import { debounce } from "../../common/common.js";

const emit = defineEmits(["change"]);

const result = reactive({
  show: false,
  data: [],
  search: "",
  isLoading: false,
});

const handleBlur = () => {
  setTimeout(() => {
    result.show = false;
  }, 300);
};

const handleKeySearch = () => {
  if (result.isLoading) {
    return;
  }
  result.isLoading = true;
  const debouncedSearch = debounce(async () => {
    result.data = await TextSearchAPIMap4D(result.search);
    result.isLoading = false;
  }, 1000);
  debouncedSearch();
};

const handleClickResult = (item) => {
  result.search = item.name;
  emit("change", item);
};
</script>

<template>
  <div class="bar d-flex position-relative">
    <input
      v-model="result.search"
      type="search"
      name="search"
      pattern=".*\S.*"
      required
      autocomplete="off"
      @focus="result.show = true"
      @blur="handleBlur"
      @keyup="handleKeySearch"
    />
    <button class="search-btn" type="button">
      <span>Search</span>
    </button>
    <div
      v-if="result.show && result.search"
      class="position-absolute bg-white"
      style="top: calc(100% - 1em); margin-inline: 1.5em; left: 0; right: 0"
    >
      <div class="w-100 d-flex justify-content-center" v-if="result.isLoading">
        <div class="spinner-border" role="status">
          <span class="sr-only">Loading...</span>
        </div>
      </div>
      <div
        v-else
        class="p-2 overflow-auto"
        style="
          border-radius: 4px;
          box-shadow: 0 1px 4px #00000029;
          max-height: 200px;
        "
      >
        <div
          v-for="(item, index) in result.data"
          :key="index"
          class="d-flex align-items-center hover-bg p-1 cursor-pointer"
          @mousedown="handleClickResult(item)"
        >
          <i
            class="mdi mdi-map-marker align-middle me-2 text-primary fs-18"
          ></i>
          <span class="ellipsis">
            <b>{{ item.name }}</b> {{ item.address }}
          </span>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.bar input,
.search-btn,
.search-btn:before,
.search-btn:after {
  transition: all 0.25s ease-out;
}
.bar input,
.search-btn {
  width: 3em;
  height: 3em;
}
.bar input:invalid:not(:focus),
.search-btn {
  cursor: pointer;
}
.bar,
.bar input:focus,
.bar input:valid {
  width: 100%;
}
.bar input:focus,
.bar input:not(:focus) + .search-btn:focus {
  outline: transparent;
}
.bar {
  margin: auto;
  padding: 1.5em;
  justify-content: center;
  max-width: 30em;
}
.bar input {
  background: transparent;
  border-radius: 1.5em;
  box-shadow: 0 0 0 0.4em #171717 inset;
  padding: 0.75em;
  transform: translate(0.5em, 0.5em) scale(0.5);
  transform-origin: 100% 0;
  -webkit-appearance: none;
  -moz-appearance: none;
  appearance: none;
}
.bar input::-webkit-search-decoration {
  -webkit-appearance: none;
}
.bar input:focus,
.bar input:valid {
  background: #fff;
  border-radius: 0.375em 0 0 0.375em;
  box-shadow: 0 0 0 0.1em #d9d9d9 inset;
  transform: scale(1);
}
.search-btn {
  background: #171717;
  border-radius: 0 0.75em 0.75em 0 / 0 1.5em 1.5em 0;
  padding: 0.75em;
  position: relative;
  transform: translate(0.25em, 0.25em) rotate(45deg) scale(0.25, 0.125);
  transform-origin: 0 50%;
}
.search-btn:before,
.search-btn:after {
  content: "";
  display: block;
  opacity: 0;
  position: absolute;
}
.search-btn:before {
  border-radius: 50%;
  box-shadow: 0 0 0 0.2em #f1f1f1 inset;
  top: 0.75em;
  left: 0.75em;
  width: 1.2em;
  height: 1.2em;
}
.search-btn:after {
  background: #f1f1f1;
  border-radius: 0 0.25em 0.25em 0;
  top: 51%;
  left: 51%;
  width: 0.75em;
  height: 0.25em;
  transform: translate(0.2em, 0) rotate(45deg);
  transform-origin: 0 50%;
}
.search-btn span {
  display: inline-block;
  overflow: hidden;
  width: 1px;
  height: 1px;
}
.bar input:focus + .search-btn,
.bar input:valid + .search-btn {
  background: #7e7e7e;
  border-radius: 0 0.375em 0.375em 0;
  transform: scale(1);
}
.bar input:focus + .search-btn:before,
.bar input:focus + .search-btn:after,
.bar input:valid + .search-btn:before,
.bar input:valid + .search-btn:after {
  opacity: 1;
}
.bar input:focus + .search-btn:hover,
.bar input:valid + .search-btn:hover,
.bar input:valid:not(:focus) + .search-btn:focus {
  background: #7e7e7e;
}
.bar input:focus + .search-btn:active,
.bar input:valid + .search-btn:active {
  transform: translateY(1px);
}

@media screen and (prefers-color-scheme: dark) {
  body,
  input {
    color: #f1f1f1;
  }
  body {
    background: #171717;
  }
  .bar input {
    box-shadow: 0 0 0 0.4em #f1f1f1 inset;
  }
  .bar input:focus,
  .bar input:valid {
    background: #3d3d3d;
    box-shadow: 0 0 0 0.1em #3d3d3d inset;
  }
  .search-btn {
    background: #f1f1f1;
  }
}
</style>
