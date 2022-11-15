<template>
  <div>
    <!-- 面包屑导航 -->
    <el-breadcrumb separator="/">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>商品分类</el-breadcrumb-item>
    </el-breadcrumb>

    <!-- 卡片视图 -->
    <el-card>
      <!-- 添加分类按钮 -->
      <el-row>
        <el-col>
          <el-button type="primary" @click="showAddCateDialog"
            >添加分类</el-button
          >
        </el-col>
      </el-row>

      <!-- 表格区 -->
      <el-table
        :data="cateList"
        row-key="cat_id"
        border
        :tree-props="{ children: 'children', hasChildren: 'hasChildren' }"
      >
        <el-table-column hasChildren label="#" type="" width="40px">
          <template slot-scope="scope">
            {{ scope.row.index }}
          </template>
        </el-table-column>
        <el-table-column label="分类名称" prop="cat_name"></el-table-column>
        <el-table-column label="是否有效">
          <template slot-scope="scope">
            <i
              v-if="!scope.row.cat_deleted"
              :style="{ color: '#90ee90' }"
              class="el-icon-success"
            ></i>
            <i v-else :style="{ color: 'red' }" class="el-icon-error"></i>
          </template>
        </el-table-column>
        <el-table-column label="排序">
          <template slot-scope="scope">
            <el-tag v-if="scope.row.cat_level === 0">一级</el-tag>
            <el-tag v-else-if="scope.row.cat_level === 1" type="success"
              >二级</el-tag
            >
            <el-tag v-else type="warning">三级</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="180px">
          <template slot-scope="scope">
            <el-button
              type="primary"
              icon="el-icon-edit"
              size="mini"
              @click="editCateDialog(scope.row)"
              >编辑</el-button
            >
            <el-button
              type="danger"
              icon="el-icon-delete"
              size="mini"
              @click="deleteCate(scope.row)"
              >删除</el-button
            >
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页区 -->
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="queryInfo.pagenum"
        :page-sizes="[3, 5, 10, 15]"
        :page-size="queryInfo.pagesize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
      >
      </el-pagination>
    </el-card>

    <!-- 添加分类对话框 -->
    <el-dialog
      title="添加分类"
      :visible.sync="addCateDialogVisible"
      width="50%"
      @close="addCateDialogClosed"
    >
      <!-- 添加分类表单 -->
      <el-form
        :model="addCateFrom"
        :rules="addCateFromRules"
        ref="addCateFromRef"
        label-width="100px"
      >
        <el-form-item label="分类名称：" prop="cat_name">
          <el-input v-model="addCateFrom.cat_name"></el-input>
        </el-form-item>
        <el-form-item label="父级分类：">
          <!-- 
            // 级联选择器配置对象
                value: 'cat_id',
                label: 'cat_name',
                children: 'children',
            -->
          <el-cascader
            v-model="selecteKeys"
            :options="parentCateList"
            clearable
            :props="{
              expandTrigger: 'hover',
              checkStrictly: true,
              value: 'cat_id',
              label: 'cat_name',
              children: 'children',
            }"
            @change="parentCateChange"
          ></el-cascader>
        </el-form-item>
      </el-form>
      <!-- 底部区域 -->
      <span slot="footer" class="dialog-footer">
        <el-button @click="addCateDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addCate">确 定</el-button>
      </span>
    </el-dialog>

    <!-- 添加分类对话框 -->
    <el-dialog
      title="添加分类"
      :visible.sync="editCateDialogVisible"
      width="50%"
      @close="editCateDialogClosed"
    >
      <!-- 添加分类表单 -->
      <el-form
        :model="editCateFrom"
        :rules="addCateFromRules"
        ref="editCateFromRef"
        label-width="100px"
      >
        <el-form-item label="分类名称：" prop="cat_name">
          <el-input v-model="editCateFrom.cat_name"></el-input>
        </el-form-item>
      </el-form>
      <!-- 底部区域 -->
      <span slot="footer" class="dialog-footer">
        <el-button @click="editCateDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="editCate">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  data() {
    return {
      queryInfo: {
        // 查询条件
        type: 3,
        pagenum: 1,
        pagesize: 5,
      },
      cateList: [], // 商品分类数据列表
      total: 0, // 总数据条数
      addCateDialogVisible: false, // 控制添加分类对话框的显示与隐藏
      addCateFrom: {
        // 添加分类表单数据对象
        cat_pid: 0, // 父级分类 id
        cat_name: '', // 将要添加的分类名称
        cat_level: 0, // 分类等级
      },
      addCateFromRules: {
        cat_name: [
          { required: true, message: '请输入分类名称', trigger: 'blur' },
          {
            min: 2,
            max: 10,
            message: '长度在 2 到 10 个字符',
            trigger: 'blur',
          },
        ],
      },
      parentCateList: [], // 父级分类列表
      selecteKeys: [], // 选中的父级分类 id 数组
      editCateDialogVisible: false, // 编辑弹窗的显示与隐藏
      editCateFrom: {
        // 修改分类数据列表
        cat_pid: 0, // 父级分类 id
        cat_name: '', // 将要添加的分类名称
      },
    }
  },
  created() {
    this.getCateList()
  },
  methods: {
    async getCateList() {
      try {
        const { data: res } = await this.$http.get('categories', {
          params: this.queryInfo,
        })
        this.cateList = res.data.result // 数据列表赋值
        this.total = res.data.total // 总数据条数
        // 为每个列表添加一个索引
        for (let i = 0; i < this.cateList.length; i++) {
          this.cateList[i].index = i + 1
        }
      } catch (err) {
        return this.$message.error('商品分类数据获取失败！')
      }
    },
    // 监听 pagesize 改变的事件
    handleSizeChange(newSize) {
      this.queryInfo.pagesize = newSize
      this.getCateList()
    },
    // 监听 pagenum 改变
    handleCurrentChange(newPage) {
      this.queryInfo.pagenum = newPage
      this.getCateList()
    },
    // 点击按钮，展示添加分类对话框
    showAddCateDialog() {
      this.getParentCateList() // 获取父级分类数据列表
      this.addCateDialogVisible = true // 展示对话框
    },
    // 获取父级分类的数据列表
    async getParentCateList() {
      try {
        const { data: res } = await this.$http.get('categories', {
          params: { type: 2 },
        })
        this.parentCateList = res.data
      } catch (err) {
        return this.$message.error('获取父级分类数据失败！')
      }
    },
    // 选择项发送变化触发这个函数
    parentCateChange() {
      // 如果数组长度 大于0 则证明选中父级分类，反之说明没有选中任何父级分类
      if (this.selecteKeys.length > 0) {
        this.addCateFrom.cat_pid = this.selecteKeys[this.selecteKeys.length - 1] // 父级分类 id
        this.addCateFrom.cat_level = this.selecteKeys.length // 当前分类等级赋值
        return
      } else {
        this.addCateFrom.cat_pid = 0
        this.addCateFrom.cat_level = 0
      }
    },
    // 点击按钮添加新的类
    addCate() {
      this.$refs.addCateFromRef.validate(async (valid) => {
        if (!valid) return
        try {
          const { data: res } = await this.$http.post(
            'categories',
            this.addCateFrom
          )
          this.$message.success('添加分类成功')
          this.getCateList()
          this.addCateDialogVisible = false
        } catch (err) {
          return this.$message.error('添加分类失败！')
        }
      })
    },
    // 监听对话框的关闭事件，重置表单
    addCateDialogClosed() {
      this.$refs.addCateFromRef.resetFields()
      this.selecteKeys = []
      this.addCateFrom.cat_level = 0
      this.addCateFrom.cat_pid = 0
    },
    editCateDialog(cate) {
      this.editCateFrom.cat_id = cate.cat_id
      this.editCateFrom.cat_name = cate.cat_name
      this.editCateDialogVisible = true
    },
    // 编辑分类
    async editCate() {
      try {
        const { data: res } = await this.$http.put(
          `categories/${this.editCateFrom.cat_id}`,
          { cat_name: this.editCateFrom.cat_name }
        )
        this.$message.success('编辑分类成功')
        this.getCateList()
        this.editCateDialogVisible = false
      } catch (err) {
        return this.$message.error('编辑分类失败！')
      }
    },
    // 监听对话框的关闭事件，重置表单
    editCateDialogClosed() {
      this.$refs.editCateFromRef.resetFields()
      this.addCateFrom.cat_name = ''
    },
    // 删除分类
    deleteCate(cate) {
      this.$confirm('此操作将永久删除该分类, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      })
        .then(async () => {
          const { data: res } = await this.$http.delete(
            `categories/${cate.cat_id}`
          )
          if (res.meta.status !== 200)
            return this.$message.error('删除分类失败！')
          this.$message({
            type: 'success',
            message: '删除成功!',
          })
          this.getCateList() // 刷新用户列表
        })
        .catch(() => {
          this.$message({
            type: 'info',
            message: '已取消删除',
          })
        })
    },
  },
}
</script>

<style lang="less" scoped>
.el-cascader {
  width: 100%;
}
</style>
