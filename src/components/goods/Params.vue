<template>
  <div>
    <!-- 面包屑导航 -->
    <el-breadcrumb separator="/">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>参数列表</el-breadcrumb-item>
    </el-breadcrumb>

    <!-- 卡片视图 -->
    <el-card>
      <!-- 警告区 -->
      <el-alert
        title="注意：只允许为第三级分类设置相关参数！"
        type="warning"
        show-icon
      >
      </el-alert>

      <!-- 选择商品分类区 -->
      <el-row class="cat-opt">
        <el-col>
          <span>选择商品分类:</span>
          <!-- 商品分类的级联选择框 -->
          <el-cascader
            v-model="selectedCateKeys"
            :options="cateList"
            :props="{
              expandTrigger: 'hover',
              value: 'cat_id',
              label: 'cat_name',
              children: 'children',
            }"
            @change="handleChange"
          ></el-cascader>
        </el-col>
      </el-row>
      <el-tabs v-model="activeName" @tab-click="handleTabClick">
        <!-- 动态参数面板 -->
        <el-tab-pane label="动态参数" name="many">
          <el-button
            type="primary"
            size="mini"
            :disabled="isBtnDisabled"
            @click="addDialogVisible = true"
            >添加参数</el-button
          >
          <!-- 动态参数表格 -->
          <el-table :data="manyTabData" border stripe>
            <!-- 展开行 -->
            <el-table-column type="expand">
              <template slot-scope="scope">
                <el-tag
                  v-for="(item, i) in scope.row.attr_vals"
                  :key="i"
                  closable
                  @close="handleClose(i, scope.row)"
                  >{{ item }}</el-tag
                >
                <!-- 输入文本框 -->
                <el-input
                  class="input-new-tag"
                  v-if="scope.row.inputVisible"
                  v-model="scope.row.inputValue"
                  ref="saveTagInput"
                  size="small"
                  @keyup.enter.native="handleInputConfirm(scope.row)"
                  @blur="handleInputConfirm(scope.row)"
                >
                </el-input>
                <!-- 添加按钮 -->
                <el-button
                  v-else
                  class="button-new-tag"
                  size="small"
                  @click="showInput(scope.row)"
                  >+ New Tag</el-button
                >
              </template>
            </el-table-column>
            <el-table-column label="#" type="index"></el-table-column>
            <el-table-column
              label="参数名称"
              prop="attr_name"
            ></el-table-column>
            <el-table-column label="操作">
              <template slot-scope="scope">
                <el-button
                  size="mini"
                  type="primary"
                  icon="el-icon-edit"
                  @click="showEditDialgo(scope.row.attr_id)"
                  >编辑</el-button
                >
                <el-button
                  size="mini"
                  type="danger"
                  icon="el-icon-delete"
                  @click="removeParams(scope.row.attr_id)"
                  >删除</el-button
                >
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
        <!-- 静态属性面板 -->
        <el-tab-pane label="静态属性" name="only">
          <el-button
            type="primary"
            size="mini"
            :disabled="isBtnDisabled"
            @click="addDialogVisible = true"
            >添加属性</el-button
          >
          <!-- 静态属性表格 -->
          <el-table :data="onlyTabData" border stripe>
            <!-- 展开行 -->
            <el-table-column type="expand">
              <template slot-scope="scope">
                <el-tag
                  v-for="(item, i) in scope.row.attr_vals"
                  :key="i"
                  closable
                  @close="handleClose(i, scope.row)"
                  >{{ item }}</el-tag
                >
                <!-- 输入文本框 -->
                <el-input
                  class="input-new-tag"
                  v-if="scope.row.inputVisible"
                  v-model="scope.row.inputValue"
                  ref="saveTagInput"
                  size="small"
                  @keyup.enter.native="handleInputConfirm(scope.row)"
                  @blur="handleInputConfirm(scope.row)"
                >
                </el-input>
                <!-- 添加按钮 -->
                <el-button
                  v-else
                  class="button-new-tag"
                  size="small"
                  @click="showInput(scope.row)"
                  >+ New Tag</el-button
                >
              </template>
            </el-table-column>
            <el-table-column label="#" type="index"></el-table-column>
            <el-table-column
              label="属性名称"
              prop="attr_name"
            ></el-table-column>
            <el-table-column label="操作">
              <template slot-scope="scope">
                <el-button
                  size="mini"
                  type="primary"
                  icon="el-icon-edit"
                  @click="showEditDialgo(scope.row.attr_id)"
                  >编辑</el-button
                >
                <el-button
                  size="mini"
                  type="danger"
                  icon="el-icon-delete"
                  @click="removeParams(scope.row.attr_id)"
                  >删除</el-button
                >
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
      </el-tabs>
    </el-card>
    <!-- 弹出对话框 -->
    <el-dialog
      :title="activeName === 'many' ? '添加动态参数' : '添加静态属性'"
      :visible.sync="addDialogVisible"
      width="50%"
      @close="addDialogClosed"
    >
      <!-- 添加参数表单区 -->
      <el-form
        :model="addForm"
        :rules="addFormRules"
        ref="addFormRef"
        label-width="110px"
      >
        <el-form-item
          :label="activeName === 'many' ? '添加动态参数' : '添加静态属性'"
          prop="attr_name"
        >
          <el-input v-model="addForm.attr_name"></el-input>
        </el-form-item>
      </el-form>
      <!-- 底部区域 -->
      <span slot="footer" class="dialog-footer">
        <el-button @click="addDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="addParams">确定</el-button>
      </span>
    </el-dialog>

    <!-- 修改对话框 -->
    <el-dialog
      :title="activeName === 'many' ? '修改动态参数' : '修改静态属性'"
      :visible.sync="editDialogVisible"
      width="50%"
      @close="editDialogClosed"
    >
      <!-- 添加参数表单区 -->
      <el-form
        :model="editForm"
        :rules="editFormRules"
        ref="editFormRef"
        label-width="110px"
      >
        <el-form-item
          :label="activeName === 'many' ? '添加动态参数' : '添加静态属性'"
          prop="attr_name"
        >
          <el-input v-model="editForm.attr_name"></el-input>
        </el-form-item>
      </el-form>
      <!-- 底部区域 -->
      <span slot="footer" class="dialog-footer">
        <el-button @click="editDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="editParams">确定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  data() {
    return {
      cateList: [], //商品分类列表
      selectedCateKeys: [], //级联选择框双向绑定的数组
      activeName: 'many', // 被激活页签名称
      manyTabData: [], // 动态数据
      onlyTabData: [], // 静态数据
      addDialogVisible: false, // 控制对话框的显示与隐藏
      addForm: {}, // 添加参数的表单数据对象
      addFormRules: {
        // 添加参数的表单验证规则
        attr_name: [
          { required: true, message: '请输入参数名称', trigger: 'blur' },
        ],
      },
      editDialogVisible: false, // 控制修改对话框的显示与隐藏
      editForm: {}, // 修改参数的表单数据对象
      editFormRules: {
        // 修改参数的表单验证规则
        attr_name: [
          { required: true, message: '请输入参数名称', trigger: 'blur' },
        ],
      },
    }
  },
  created() {
    this.getCateList()
  },
  methods: {
    async getCateList() {
      try {
        const { data: res } = await this.$http.get('categories')
        this.cateList = res.data
      } catch (err) {
        this.$message.error('获取商品分类失败！')
      }
    },
    handleChange() {
      // 根据所选分类 id  和当前所处面板 获取对应参数
      this.getParamsDate()
    },
    // tab 页签点击事件处理函数
    handleTabClick() {
      this.getParamsDate()
    },
    // 获取参数列表数据
    async getParamsDate() {
      try {
        const { data: res } = await this.$http.get(
          `categories/${this.cateId}/attributes`,
          { params: { sel: this.activeName } }
        )
        res.data.forEach((item) => {
          item.attr_vals = item.attr_vals ? item.attr_vals.split(' ') : []
          // 添加布尔值 控制文本框的显示
          this.$set(item, 'inputValue', '')
          // 文本框输入的值
          this.$set(item, 'inputVisible', false)
        })
        if (this.activeName === 'many') {
          this.manyTabData = res.data
        } else {
          this.onlyTabData = res.data
        }
      } catch (err) {
        this.$message.error('获取参数列表失败')
      }
    },
    // 监听对话框的关闭事件
    addDialogClosed() {
      this.$refs.addFormRef.resetFields()
    },
    // 点击按钮添加参数
    addParams() {
      this.$refs.addFormRef.validate(async (valid) => {
        if (!valid) return
        try {
          const { data: res } = this.$http.post(
            `categories/${this.cateId}/attributes`,
            {
              attr_name: this.addForm.attr_name,
              attr_sel: this.activeName,
            }
          )
          this.$message.success('添加参数成功')
          setTimeout(() => {
            this.getParamsDate()
          }, 100)
          this.addDialogVisible = false
        } catch (err) {
          this.$message.error('添加参数失败！')
        }
      })
    },
    // 点击按钮展示修改对话框
    async showEditDialgo(attr_id) {
      try {
        const { data: res } = await this.$http.get(
          `categories/${this.cateId}/attributes/${attr_id}`,
          { params: { attr_sel: this.activeName } }
        )
        this.editForm = res.data
        this.editDialogVisible = true
      } catch (err) {
        this.$message.error('获取参数信息失败')
      }
    },
    // 重置修改表单
    editDialogClosed() {
      this.$refs.editFormRef.resetFields()
    },
    //  点击按钮修改参数信息
    editParams() {
      this.$refs.editFormRef.validate(async (valid) => {
        if (!valid) return
        try {
          const { data: res } = this.$http.put(
            `categories/${this.cateId}/attributes/${this.editForm.attr_id}`,
            {
              attr_name: this.editForm.attr_name,
              attr_sel: this.activeName,
            }
          )
          this.$message.success('修改参数成功')
          setTimeout(() => {
            this.getParamsDate()
          }, 100)
          this.editDialogVisible = false
        } catch (err) {
          this.$message.error('修改参数失败！')
        }
      })
    },
    // 根据 id 删除对应项
    removeParams(attr_id) {
      this.$confirm('此操作将永久删除该参数, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      })
        .then(async () => {
          const { data: res } = await this.$http.delete(
            `categories/${this.cateId}/attributes/${attr_id}`
          )
          if (res.meta.status !== 200)
            return this.$message.error('删除参数失败！')
          this.$message({
            type: 'success',
            message: '删除成功!',
          })
          setTimeout(() => {
            this.getParamsDate() // 刷新列表
          }, 100)
        })
        .catch(() => {
          this.$message({
            type: 'info',
            message: '已取消删除',
          })
        })
    },
    // 文本框失去焦点 或 按下了 Enter 都会触发
    handleInputConfirm(row) {
      if (row.inputValue.trim().length === 0) {
        row.inputValue = ''
        row.inputVisible = false
        return
      }
      // 如果没有 return 则后续处理
      row.attr_vals.push(row.inputValue.trim())
      row.inputValue = ''
      row.inputVisible = false

      // 发起请求保存
      this.saveAttrVals(row)
    },
    // 发起请求 保存
    async saveAttrVals(row) {
      try {
        const { data: res } = await this.$http.put(
          `categories/${this.cateId}/attributes/${row.attr_id}`,
          {
            attr_name: row.attr_name,
            attr_sel: row.attr_sel,
            attr_vals: row.attr_vals.join(' '),
          }
        )
        this.$message.success('修改参数项成功')
      } catch (err) {
        this.$message.error('修改参数项失败！')
      }
    },
    // 点击按钮文本框和按钮的切换
    showInput(row) {
      row.inputVisible = true
      this.$nextTick((_) => {
        this.$refs.saveTagInput.$refs.input.focus()
      })
    },
    // 删除对应参数可选项
    handleClose(i, row) {
      row.attr_vals.splice(i, 1)
      this.saveAttrVals(row)
    },
  },
  computed: {
    // 如果按钮需要被禁用，返回 false 否则，返回 true
    isBtnDisabled() {
      if (this.selectedCateKeys.length !== 3) {
        return true
      } else {
        return false
      }
    },
    // 当前选择的三级分类 id
    cateId() {
      if (this.selectedCateKeys.length !== 3) return null
      return this.selectedCateKeys[2]
    },
  },
}
</script>

<style lang="less" scoped>
.cat-opt {
  margin: 15px 0;
  span {
    margin-right: 10px;
  }
}
.el-tag {
  margin: 10px;
}
.input-new-tag {
  width: 120px;
  margin: 10px;
}
.button-new-tag {
  margin: 10px;
}
</style>