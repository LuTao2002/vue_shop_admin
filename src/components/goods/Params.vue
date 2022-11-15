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
        <el-tab-pane label="动态参数" name="first">
          <el-button type="primary" size="mini" :disabled="isBtnDisabled"
            >添加参数</el-button
          >
        </el-tab-pane>
        <!-- 静态属性面板 -->
        <el-tab-pane label="静态属性" name="second">
          <el-button type="primary" size="mini" :disabled="isBtnDisabled"
            >添加属性</el-button
          >
        </el-tab-pane>
      </el-tabs>
    </el-card>
  </div>
</template>

<script>
export default {
  data() {
    return {
      cateList: [], //商品分类列表
      selectedCateKeys: [], //级联选择框双向绑定的数组
      activeName: 'first', // 被激活页签名称
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
        console.log(this.cateList)
      } catch (err) {
        this.$message.error('获取商品分类失败！')
      }
    },
    handleChange() {
      console.log(this.selectedCateKeys)
    },
    // tab 页签点击事件处理函数
    handleTabClick() {
      console.log(this.activeName)
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
</style>