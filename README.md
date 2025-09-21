协同文档编辑器模块（DocVault 核心模块）
一个基于 Tiptap 和 Next.js 15 构建的现代化协同文档编辑器，结合 React 19 与 NestJS 11 实现全栈协同能力，集成丰富的富文本编辑、多人实时协作特性，支持插件扩展、主题定制与持久化存储，适用于团队协作写作、知识沉淀、在线教育等场景。
🚀 功能特性
📝 富文本编辑：支持标题、多级列表、表格、代码块、数学公式（KaTeX 渲染）、图片上传 / 拖拽、链接嵌入等丰富格式
👥 实时协作：基于 Yjs + @hocuspocus/provider 实现高效协同，多人编辑时实时同步光标位置、内容变更
🧩 插件扩展：基于 Tiptap 生态支持自定义插件开发，内置表情、待办清单、详情卡片等增强组件
🛠️ 工程化工具：采用 Biome 统一代码 lint / 格式化，Playwright 保障端到端测试，支持文档版本管理、主题切换（亮色 / 暗色）
📦 技术栈
前端技术栈
Next.js 15
React 19
Tiptap
Yjs
@hocuspocus/provider
Tailwind CSS
Socket.io
Biome
Playwright
后端技术栈
NestJS 11
@hocuspocus/server
TypeORM
JWT