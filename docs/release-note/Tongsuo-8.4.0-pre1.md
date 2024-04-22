# Tongsuo 8.4.0-pre1 发布

:::tip
发布时间：2023年6月7日

发布内容：Tongsuo 8.4.0-pre1

下载地址：[https://github.com/Tongsuo-Project/Tongsuo/releases/tag/8.4.0-pre1](https://github.com/Tongsuo-Project/Tongsuo/releases/tag/8.4.0-pre1)
:::

本次发布重要更新：

- 铜锁8.4.0的第一个预发布版本（-pre1），欢迎下载试用。铜锁的8.4.0是一个大版本发布，其中包括了对多种半同态算法、零知识证明算法和硬件加速能力的支持，并删除了不常用的算法以及进行了漏洞的修复
- 重要更新：
   - 修复多个安全漏洞
   - 删除多个不常用的算法
   - 支持零知识证明算法-bulletproofs (r1cs)
   - 支持零知识证明算法-bulletproofs (range proof)
   - ZUC 算法优化以及 speed 支持 ZUC 算法
   - s_server支持配置多证书测试TLCP SNI功能
   - SSL_connection_is_ntls改成使用预读方式判断是否为NTLS
   - Paillier 支持硬件加速（蚂蚁隐私计算加速硬件）
   - BIGNUM 运算支持 method 机制
   - 支持半同态加密算法 Twisted-EC-ElGamal
   - 支持半同态加密算法 EC-ElGamal 命令行
   - 支持半同态加密算法-Paillier
   - 删除对VMS系统的支持
   - 支持新特性 - 添加导出符号前缀
   - 删除PA-RISC架构代码
   - 删除SPARC架构代码
   - 支持椭圆曲线（EC）点计算硬件加速 API（蚂蚁隐私计算加速硬件）
   - 修复2处SM2签名算法的实现bug [0x9527-zhou]
   - 基础代码迁移到OpenSSL 3.0.2


