<template>
  <div>
    <!-- 面包屑导航 -->
    <el-breadcrumb separator="/">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>权限管理</el-breadcrumb-item>
      <el-breadcrumb-item>角色列表</el-breadcrumb-item>
    </el-breadcrumb>

    <!-- 卡片视图 -->
    <el-card>
      <!-- 添加角色按钮区 -->
      <el-row>
        <el-col>
          <el-button type="primary" @click="DialogVisible = true"
            >添加角色</el-button
          >
        </el-col>
      </el-row>
      <!-- 角色列表区 -->
      <el-table :data="rolesList" border stripe>
        <!-- 展开列 -->
        <el-table-column type="expand">
          <template slot-scope="scope">
            <el-row
              :class="['bdbottom', i1 === 0 ? 'bdtop' : '', 'vcenter']"
              v-for="(item1, i1) in scope.row.children"
              :key="item1.id"
            >
              <!-- 一级权限 -->
              <el-col :span="5">
                <el-tag
                  closable
                  @close="removeRightByid(scope.row, item1.id)"
                  >{{ item1.authName }}</el-tag
                >
                <i class="el-icon-caret-right"></i>
              </el-col>
              <!-- 二级和三级权限 -->
              <el-col :span="19">
                <!-- 通过 for 循环嵌套渲染二级权限 -->
                <el-row
                  :class="[i2 === 0 ? '' : 'bdtop', 'vcenter']"
                  v-for="(item2, i2) in item1.children"
                  :key="item2.id"
                >
                  <el-col :span="6">
                    <el-tag
                      type="success"
                      closable
                      @close="removeRightByid(scope.row, item2.id)"
                      >{{ item2.authName }}</el-tag
                    >
                    <i class="el-icon-caret-right"></i>
                  </el-col>
                  <el-col :span="18">
                    <el-tag
                      type="warning"
                      closable
                      @close="removeRightByid(scope.row, item3.id)"
                      v-for="item3 in item2.children"
                      :key="item3.id"
                      >{{ item3.authName }}</el-tag
                    >
                  </el-col>
                </el-row>
              </el-col>
            </el-row>
          </template>
        </el-table-column>
        <!-- 索引列 -->
        <el-table-column label="#" type="index"></el-table-column>
        <el-table-column label="角色名称" prop="roleName"></el-table-column>
        <el-table-column label="角色描述" prop="roleDesc"></el-table-column>
        <el-table-column label="操作" width="300px">
          <template slot-scope="scope">
            <!-- 修改 -->
            <el-button
              type="primary"
              icon="el-icon-edit"
              size="mini"
              @click="showEditDialog(scope.row.id, 1)"
              >编辑</el-button
            >
            <!-- 删除 -->
            <el-button
              type="danger"
              icon="el-icon-delete"
              size="mini"
              @click="deleteRoles(scope.row.id)"
              >删除</el-button
            >
            <!-- 分配角色 -->
            <el-button
              type="warning"
              icon="el-icon-setting"
              size="mini"
              @click="showSetRightDialog(scope.row)"
              >分配权限</el-button
            >
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- 添加用户对话框 -->
    <el-dialog
      :title="state === 0 ? '添加角色' : '编辑角色'"
      :visible.sync="DialogVisible"
      width="50%"
      @close="DialogClosed"
    >
      <!-- 内容主体区 -->
      <el-form
        :model="form"
        :rules="formRules"
        ref="formRef"
        label-width="100px"
      >
        <el-form-item label="角色名称" prop="roleName">
          <el-input v-model="form.roleName"></el-input>
        </el-form-item>
        <el-form-item label="角色描述" prop="roleDesc">
          <el-input v-model="form.roleDesc"></el-input>
        </el-form-item>
      </el-form>
      <!-- 底部区域 -->
      <span slot="footer" class="dialog-footer">
        <el-button
          @click="
            DialogVisible = false
            state = 0
          "
          >取 消</el-button
        >
        <el-button type="primary" @click="Roles">确 定</el-button>
      </span>
    </el-dialog>

    <!-- 分配权限对话框 -->
    <el-dialog
      title="分配权限"
      :visible.sync="setRightDialogVisible"
      width="50%"
      @close="setRightDialogClosed"
    >
      <!-- 树形控件 -->
      <el-tree
        :data="rightsList"
        :props="treeProps"
        show-checkbox
        node-key="id"
        default-expand-all
        :default-checked-keys="defKeys"
        ref="treeRef"
      ></el-tree>
      <!-- 底部区域 -->
      <span slot="footer" class="dialog-footer">
        <el-button @click="setRightDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="allotRights"
          >确 定</el-button
        >
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  data() {
    return {
      rolesList: [], // 所有角色列表数据
      form: {}, // 添加角色表单数据
      formRules: {
        roleName: [
          { required: true, message: '请输入角色名称', trigger: 'blur' },
          {
            min: 3,
            max: 10,
            message: '长度在 3 到 10 个字符',
            trigger: 'blur',
          },
        ],
        roleDesc: [
          { required: false, message: '请输入角色描述', trigger: 'blur' },
          {
            min: 3,
            max: 10,
            message: '长度在 3 到 10 个字符',
            trigger: 'blur',
          },
        ],
      }, // 添加角色表单验证规则
      state: 0, // 角色列表的添加或修改 0:添加 1:修改
      DialogVisible: false, // 添加角色弹出款的显示与隐藏
      setRightDialogVisible: false, // 权限分配对话框显示与隐藏
      rightsList: [], //所有权限数据
      treeProps: {
        // 树形控件的属性绑定数据
        children: 'children',
        label: 'authName',
      },
      defKeys: [], // 默认选中的节点 id 数组
      roleId: '', // 当前即将分配权限的角色id
    }
  },
  created() {
    this.getRolesList()
  },
  methods: {
    // 获取所有角色列表
    async getRolesList() {
      const { data: res } = await this.$http.get('roles')
      if (res.meta.status !== 200)
        return this.$message.error('获取角色列表失败！')
      this.rolesList = res.data
    },
    // 确认按钮
    Roles() {
      if (this.state === 0) {
        this.form = {}
        this.add()
      } else {
        this.edit()
      }
      this.DialogVisible = false // 隐藏添加对话框
      this.getRolesList() // 更新列表数据
      this.state = 0 // 清空表单
    },
    async add() {
      const { data: res } = await this.$http.post('roles', this.form)
      if (res.meta.status !== 201) return this.$message.error('添加角色失败！')
      this.$message.success('添加角色成功')
    },
    async edit() {
      const { data: res } = await this.$http.put('roles/' + this.form.roleId, {
        roleName: this.form.roleName,
        roleDesc: this.form.roleDesc,
      })
      if (res.meta.status !== 200) return this.$message.error('修改角色失败！')
      this.$message.success('修改角色成功')
    },
    // 关闭添加角色弹出框
    DialogClosed() {
      this.$refs.formRef.resetFields()
      this.form = {}
      this.state = 0
    },
    // 展示编辑角色和编辑弹窗
    async showEditDialog(id) {
      this.state = 1
      const { data: res } = await this.$http.get('roles/' + id)
      if (res.meta.status !== 200) return this.$message.error('获取角色失败！')
      this.form = res.data
      this.DialogVisible = true
    },
    // 删除角色
    deleteRoles(id) {
      this.$confirm('此操作将永久删除该用户, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      })
        .then(async () => {
          const { data: res } = await this.$http.delete('roles/' + id)
          if (res.meta.status !== 200)
            return this.$message.error('删除角色失败！')
          this.$message({
            type: 'success',
            message: '删除成功!',
          })
          this.getRolesList() // 刷新角色列表
        })
        .catch(() => {
          this.$message({
            type: 'info',
            message: '已取消删除',
          })
        })
    },
    // 根据 id 删除对应的权限
    removeRightByid(role, rightId) {
      this.$confirm('此操作将永久删除该用户, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      })
        .then(async () => {
          const { data: res } = await this.$http.delete(
            `roles/${role.id}/rights/${rightId}`
          )
          if (res.meta.status !== 200)
            return this.$message.error('删除角色失败！')
          this.$message({
            type: 'success',
            message: '删除成功!',
          })
          role.children = res.data
          // this.getRolesList() // 刷新角色列表
        })
        .catch(() => {
          this.$message({
            type: 'info',
            message: '已取消删除',
          })
        })
    },
    // 展示分配权限对话框
    async showSetRightDialog(role) {
      this.roleId = role.id // 当前角色 id
      // 获取所有权限数据
      const { data: res } = await this.$http.get('rights/tree')
      if (res.meta.status !== 200) return this.$message.error('获取权限失败！')
      this.rightsList = res.data // 获取到的权限数据
      this.getLeafKeys(role, this.defKeys) // 递归获取三级节点的id
      this.setRightDialogVisible = true
    },
    // 通过递归，获取角色下的所有三级权限 id ，并保存到 defKeys
    getLeafKeys(node, arr) {
      // 如果当前 node 节点不包含 children 属性，则是三级节点
      if (!node.children) {
        return arr.push(node.id)
      }
      node.children.forEach((item) => {
        this.getLeafKeys(item, arr)
      })
    },
    // 监听分配权限的对话框
    setRightDialogClosed() {
      this.defKeys = []
    },
    // 点击为角色分配权限
    async allotRights() {
      const keys = [
        ...this.$refs.treeRef.getCheckedKeys(),
        ...this.$refs.treeRef.getHalfCheckedKeys(),
      ]
      const idStr = keys.join(',')
      const { data: res } = await this.$http.post(`roles/${this.roleId}/rights`, {
        rids: idStr,
      })
      if (res.meta.status !== 200) return this.$message.error('角色权限分配失败！')
      this.getRolesList() // 刷新列表
      this.setRightDialogVisible = false // 隐藏对话框
      this.$message.success('角色权限分配成功')
    },
  },
}
</script>

<style lang="less" scoped>
.el-tag {
  margin: 7px;
}
.bdtop {
  border-top: 1px solid #eee;
}
.bdbottom {
  border-bottom: 1px solid #eee;
}
.vcenter {
  display: flex;
  align-items: center;
}
</style>
