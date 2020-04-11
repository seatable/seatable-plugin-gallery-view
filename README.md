# seatable-plugin-gallery-view
This plugin is used to show the card view.

## 项目运行说明

1. 克隆到本地

    ```git@github.com:seafileltd/seatable-plugin-gallery-view.git```

2. 安装依赖

    ```npm install```

3. 执行运行命令

    ```npm run start 或者 npm start```

## seatable-plugin-gallery-view 打包


1. 在修改 plugin-config 中 info.json 文件

   ```
    {
      "name": '',
      "version": '',
      "display_name": '',
      "description": '',
    }
   ```

    **注: 具体参数如下**

    * name: 插件名字，不能和其他插件冲突，只能包含字母、数字和下划线
    * version: 版本号
    * display_name: 显示的名称
    * description: 插件描述

2. 运行 npm run build-plugin 打包插件
