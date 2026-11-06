# Tongsuo 8.5.0 发布

:::tip
发布时间：2026年9月30日

发布内容：Tongsuo 8.5.0

下载地址：[https://github.com/Tongsuo-Project/Tongsuo/releases/tag/8.5.0](https://github.com/Tongsuo-Project/Tongsuo/releases/tag/8.5.0)

:::


本次发布重要更新：

- 铜锁 8.5.0 正式版本，欢迎下载使用。本版本在 OpenSSL 3.5.4 基础上增强性能与协议能力，并完善 NTLS/TLCP 相关行为。
- 重要更新（8.4.0 ~ 8.5.0）：
   - 修复若干 CVE 和安全问题
   - 修复若干编译问题
   - 优化 AES-GCM、SM4-GCM、HMAC、CMAC、RSA 等密码学方案以及 TLS 协议的性能，相较 8.4.0 最多可翻倍
   - TLS 连接的安全等级默认设置为 2，禁用过低的协议版本（如 TLS1.1）和安全强度低于 112bit 的密码原语；NTLS 的 ECDHE 套件（SM2-AKE）安全等级为 3
   - 支持 PQC 算法 ML-KEM、ML-DSA 和 SLH-DSA，支持 PQC 密钥协商机制 curveSM2MLKEM768、X25519MLKEM768 等
   - 实现 QUIC 协议（RFC9000），并提供 BoringSSL-style QUIC 接口
   - 实现 TCP Fast Open（RFC7413）
   - 实现 HPKE（RFC9180）
   - 实现 AES-GCM-SIV（RFC8452）
   - 支持在 TLS 中使用 raw public key（RFC7250）
   - 支持使用 brotli 和 zstd 进行证书压缩（RFC8879）
   - 支持在 TLS1.3 ClientHello 中包含多个 keyshare
   - 添加 TLS round-trip 时间测量功能
   - NTLS 默认开启双证书 keyUsage 检查
   - 增加获取 NTLS 对端签名证书与加密证书的 API
   - NTLS 加强 ECC-CKE 协议版本检查，针对 ECDHE-CKE 提供兼容的编码方案
   - 提供白盒 SM4 功能
   - SMTC Provider 适配蚂蚁密码卡（atf_slibce）
   - 增加 SDF 框架和部分功能接口
   - 随机数熵源增加 rtcode、rtmem 和 rtsock
   - speed 支持测试 SM2 密钥对生成和 SM4 密钥对生成
   - 增加 TSAPI，支持常见密码学算法
   - 增加 SM2 两方门限解密/签名算法
   - 增加商用密码检测和认证 Provider，包括身份认证、完整性验证、算法自测试、随机数自检、熵源健康测试；增加 mod 应用，包括生成 SMTC 配置、自测试功能
   - 基础代码迁移到 OpenSSL 3.5.4

NTLS 相关能力说明见：[国密 TLCP 使用手册](/docs/features/TLCP)。
