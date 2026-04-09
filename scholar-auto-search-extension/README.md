# Scholar Auto Search — Chrome Extension

## 简介
这是一个用于 Google Scholar（学者页面或搜索结果页）的 Chrome 扩展。功能包括：
- 在学者或搜索结果页面自动提取论文条目；
- 本地关键词匹配并高亮匹配条目；
- 本地近似“语义”检索（基于字符串 n-gram Jaccard 相似度）来找出与示例标题/描述相似的论文；
- 可配置远程后端（可选），将页面上的论文与用户查询一起发送到后端进行更准确的语义检索（后端需自己实现 embeddings 或相似度逻辑）。

## 使用方法（本地测试）
1. 将本项目文件夹复制到本地。
2. 打开 Chrome，访问 `chrome://extensions/`，开启“开发者模式”。
3. 点击“加载已解压的扩展程序”，选择本项目文件夹。
4. 打开 Google Scholar（学者主页或搜索结果），点击扩展图标打开弹窗，输入关键词或语义示例运行检索。
5. 匹配/相似结果会在页面中高亮（橙色描边）。

## 关于语义（可选）
- 本插件内置了一个**本地近似**语义方法（n-gram Jaccard），用于快速、无需网络的相似度判断。它对短文本（标题）效果较好，但不如基于向量的 embedding 方法精确。
- 若需更强的语义匹配，请替换或搭建后端服务（示例：使用 OpenAI embeddings / local sentence-transformers），并在扩展设置中配置 `backendUrl` 和（可选）`backendApiKey`，然后在 `background.js` 中允许代理调用后端。

## 可扩展方向
- 后端语义检索（embedding + ANN）；
- 支持按年份、被引次数等过滤（需要额外从页面抓取或第三方 API）；
- 将结果导出为 CSV / BibTeX；
- 在弹窗内显示每篇的 PDF 链接（若页面提供）。
*论文检索接口：https://api.pasa.com/v1/paper/search*