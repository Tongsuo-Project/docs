# Tongsuo 8.5.0-pre1 发布

:::tip
发布时间：2026年3月23日

发布内容：Tongsuo 8.5.0-pre1

下载地址：[https://github.com/Tongsuo-Project/Tongsuo/releases/tag/8.5.0-pre1](https://github.com/Tongsuo-Project/Tongsuo/releases/tag/8.5.0-pre1)

:::


本次发布重要更新：

- 铜锁8.5.0的第一个预发布版本（-pre1），欢迎下载试用。
- 重要更新：
   - 修复多个安全漏洞
   - 优化AES-GCM、SM4-GCM、HMAC、CMAC、RSA等密码学方案以及TLS协议的性能，相较8.4.0最多可翻倍
   - TLS连接的安全等级默认设置为2，禁用过低的协议版本（如TLS1.1）和安全强度低于112bit的密码原语
   - 支持PQC算法ML-KEM、ML-DSA和SLH-DSA，支持PQC密钥协商机制curveSM2MLKEM768、X25519MLKEM768等
   - 实现QUIC协议（RFC9000）
   - 实现TCP Fast Open（RFC7413）
   - 实现HPKE（RFC9180）
   - 实现AES-GCM-SIV（RFC8452）
   - 支持在TLS中使用raw public key（RFC7250）
   - 支持使用brotli和zstd进行证书压缩（RFC8879）
   - 支持在TLS1.3 ClientHello中包含多个keyshare
   - 添加TLS round-trip时间测量功能
   - SMTC Provider适配蚂蚁密码卡（atf_slibce）
   - 增加SDF框架和部分功能接口
   - 随机数熵源增加rtcode、rtmem和rtsock
   - speed支持测试SM2密钥对生成和SM4密钥对生成
   - 增加TSAPI，支持常见密码学算法
   - 增加SM2两方门限解密/签名算法
   - 增加商用密码检测和认证Provider，包括身份认证、完整性验证、算法自测试、随机数自检、 熵源健康测试；增加mod应用，包括生成SMTC配置、自测试功能
   - 基础代码迁移到OpenSSL 3.5.4