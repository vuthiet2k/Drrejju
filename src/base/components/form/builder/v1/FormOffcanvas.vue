<template>
  <LayoutRecord
    :id="form.head.id"
    :title="form.head.name"
    v-for="(form, index) in formsTemplate"
    :key="index"
  >
    <template #header>
      <directive v-for="(btn, index) in form.head.btns" :key="index">
        <button
          v-if="btn.type == 'offcanvas'"
          type="button"
          :class="btn.class"
          @click="($e) => btn.click($e, form.body.structures)"
          data-bs-toggle="offcanvas"
          :data-bs-target="'#offcanvas' + btn.dataBsTarget"
          :aria-controls="'#offcanvas' + btn.dataBsTarget"
        >
          <i :class="btn.icon"></i>
        </button>
        <button
          v-else
          type="button"
          :class="btn.class"
          @click="($e) => btn.click($e, form.body.structures)"
        >
          <i :class="btn.icon"></i>
        </button>
      </directive>
    </template>
    <template #body>
      <FormLoading v-if="form.body.isLoading"></FormLoading>
      <form v-else action="#">
        <template
          v-for="(structure, index) in form.body.structures"
          :key="index"
        >
          <template
            v-if="
              !isSatisfyConditions(structure.conditions, form.body.structures)
            "
          >
          </template>
          <template v-else>
            <AccordionRecord :title="structure.title.toUpperCase()">
              <b-row>
                <b-col
                  :lg="field.col"
                  v-for="(field, indexField) in structure.fields"
                  :key="indexField"
                >
                  <template v-if="isSatisfyDepend(field, form.body.structures)">
                    <div class="mb-3">
                      <label
                        v-if="field.show_label"
                        :for="getTheFieldRef(field, structure)"
                        class="form-label mb-1 d-flex"
                        >{{ field.name }}
                        <span class="text-danger" v-if="field.require">*</span>
                        &nbsp;
                        <span
                          v-if="field.help_text"
                          class="d-flex cursor-pointer"
                          :title="field.help_text"
                          ><i class="ri-question-line"></i
                        ></span>
                      </label>
                      <template v-if="field.form_type == formTypes.text">
                        <input
                          type="text"
                          class="form-control"
                          :id="getTheFieldRef(field, structure)"
                          :disabled="field.disable"
                          :ref="getTheFieldRef(field, structure)"
                          :placeholder="getFieldPlaceholder(field)"
                          v-model="field.value"
                        />
                      </template>
                      <template
                        v-else-if="field.form_type == formTypes.textarea"
                      >
                        <textarea
                          class="form-control"
                          :ref="getTheFieldRef(field, structure)"
                          :id="getTheFieldRef(field, structure)"
                          :disabled="field.disable"
                          :placeholder="getFieldPlaceholder(field)"
                          v-model="field.value"
                        ></textarea>
                      </template>
                      <template
                        v-else-if="field.form_type == formTypes.texteditor"
                      >
                        <TextEditor
                          v-model="field.value"
                          :data="field.value"
                          :disable="field.disable"
                        ></TextEditor>
                      </template>
                      <template v-else-if="field.form_type == formTypes.select">
                        <template v-if="field.depend">
                          <Select
                            :api="
                              strMapping(field.source, form?.body?.structures)
                            "
                            :isLocalSearch="!field.source"
                            :localData="field.init_data"
                            :multiSelect="field.multiple"
                            :id="getTheFieldRef(field, structure)"
                            :ref="getTheFieldRef(field, structure)"
                            :defaultValue="field.value"
                            :label="field.search_field"
                            :searchField="field.search_field"
                            :labelField="field.label_field"
                            :isCloseOnSelect="true"
                            :defaultValueLabel="getFieldPlaceholder(field)"
                            :disable="field.disable"
                            :showIcon="field.show_icon"
                            iconFiled="name"
                            @change-data="(data) => (field.value = data)"
                          >
                          </Select>
                        </template>
                        <template v-else>
                          <Select
                            :api="field.source"
                            :isLocalSearch="!field.source"
                            :localData="field.init_data"
                            :multiSelect="field.multiple"
                            :id="getTheFieldRef(field, structure)"
                            :ref="getTheFieldRef(field, structure)"
                            :defaultValue="field.value"
                            :label="field.search_field"
                            :searchField="field.search_field"
                            :labelField="field.label_field"
                            :isCloseOnSelect="true"
                            :defaultValueLabel="getFieldPlaceholder(field)"
                            :disable="field.disable"
                            :showIcon="field.show_icon"
                            iconFiled="name"
                            @change-data="(data) => (field.value = data)"
                          >
                          </Select>
                        </template>
                      </template>
                      <template v-else-if="field.form_type == formTypes.date">
                        <DateInput
                          :placeholder="getFieldPlaceholder(field)"
                          :ref="getTheFieldRef(field, structure)"
                          :id="getTheFieldRef(field, structure)"
                          v-model="field.value"
                          :disabled="field.disable"
                        >
                        </DateInput>
                      </template>
                      <template
                        v-else-if="field.form_type == formTypes.datetime"
                      >
                        <DateInput
                          :placeholder="getFieldPlaceholder(field)"
                          :ref="getTheFieldRef(field, structure)"
                          :isDateTime="true"
                          :id="getTheFieldRef(field, structure)"
                          v-model="field.value"
                          :disabled="field.disable"
                        >
                        </DateInput>
                      </template>
                      <template v-else-if="field.form_type == formTypes.image">
                        <template
                          v-if="field.data_type == dataTypes.multi_file"
                        >
                          <Images
                            v-model="field.value"
                            :disable="field.disable"
                            :images="field.value"
                            @onDeleteImage="handleClickEdit(currentObjectId)"
                            :id="getTheFieldRef(field, structure)"
                            :source="field.source"
                          >
                          </Images>
                        </template>
                        <template v-else>
                          <Photo
                            :id="getTheFieldRef(field, structure)"
                            :currentPhoto="field.value"
                            v-model="field.value"
                            :label="field.name"
                            :disable="field.disable"
                            :gallery="field.gallery"
                            :dynamic_pick="
                              field.data_type ==
                              dataTypes.dynamic_file_or_foreign_key
                            "
                          >
                          </Photo>
                        </template>
                      </template>
                      <template v-else-if="field.form_type == formTypes.point">
                        <MapLocation
                          v-model="field.value"
                          :disable="field.disable"
                        >
                        </MapLocation>
                      </template>
                      <template
                        v-else-if="field.form_type == formTypes.object3d"
                      >
                        <Object3d
                          :id="getTheFieldRef(field, structure)"
                          v-model="field.value"
                          :disable="field.disable"
                          :currentObject="field.value"
                        ></Object3d>
                      </template>
                      <template
                        v-else-if="field.form_type == formTypes.manageList"
                      >
                        <FormManageList
                          :dataApi="field.data_api"
                          :preload="field.preload"
                          :postLink="globalMapping(field.post_link)"
                          :fieldName="field.field"
                          :editableFields="field.editable_fields"
                          :recordEditApi="globalMapping(field.record_edit_api)"
                          :recordValidation="field.record_validation"
                          :delLink="globalMapping(field.del_link)"
                          :objId="currentObjectId"
                          v-model="field.value"
                          :exportApi="globalMapping(field.export_api)"
                          :disable="field.disable"
                        >
                        </FormManageList>
                      </template>
                      <template v-else-if="field.form_type == formTypes.switch">
                        <div
                          class="form-check form-switch form-switch-md"
                          dir="ltr"
                        >
                          <input
                            type="checkbox"
                            class="form-check-input"
                            v-model="field.value"
                            :disabled="field.disable"
                          />
                        </div>
                      </template>
                      <template v-else>
                        <input
                          type="text"
                          class="form-control"
                          :ref="getTheFieldRef(field, structure)"
                          :placeholder="getFieldPlaceholder(field)"
                          :id="getTheFieldRef(field, structure)"
                          v-model="field.value"
                          :disabled="field.disable"
                        />
                      </template>
                    </div>
                  </template>
                </b-col>
              </b-row>
            </AccordionRecord>
          </template>
        </template>
      </form>
    </template>
  </LayoutRecord>
</template>

<script>
import { setup, data, components, mounted } from "./FormOffcanvasStruct";
import methods from "./FormOffcanvasFunc";

export default {
  setup,
  data,
  components,
  mounted,
  methods,
};
</script>
