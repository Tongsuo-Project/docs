# Tongsuo 8.3.2 发布

:::tip
发布时间：2022年12月12日

发布内容：Tongsuo 8.3.2

下载地址：[Release BabaSSL-8.3.2 · Tongsuo-Project/Tongsuo](https://github.com/Tongsuo-Project/Tongsuo/releases/tag/8.3.2)
:::

本次发布重要更新：

- 考虑到项目更名前后的延续性，8.3.2版本依然保留了BabaSSL的名字
- 重要更新：
   - 修复C90下的编译问题
   - 修复SSL_CTX_dup()函数的bug
   - 修复NTLS ServerKeyExchange消息的RSA签名问题
   - 修复apps/x509的SM2证书签名bug
   - 支持新特性 - 添加导出符号前缀

