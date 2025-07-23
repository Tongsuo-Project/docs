---
sidebar_position: 999
---
# 在Tongsuo中使用ML-DSA后量子签名算法

本文旨在介绍如何在Tongsuo中使用ML-DSA后量子数字签名算法。

## 1 ML-DSA算法

**ML-DSA (Module-Lattice-based Digital Signature Algorithm)**，其更广为人知的名字是 **CRYSTALS-Dilithium**，是一种后量子密码学 (Post-Quantum Cryptography, PQC) 数字签名算法。它的设计目标是在可预见的未来，抵御来自传统计算机和量子计算机的双重攻击，以取代目前广泛使用的 RSA 和 ECDSA 等签名方案。

该算法由美国国家标准与技术研究院 (NIST) 在其后量子密码学标准化竞赛中，最终选定为数字签名的首要标准，并正式发布为 **FIPS 204** 标准。

### 核心特点

*   **抗量子攻击**：
    传统的签名算法（如 RSA、ECDSA）的安全性依赖于大数分解或离散对数等数学难题，这些问题在强大的量子计算机上可被 Shor 算法有效破解。ML-DSA 的安全性则基于“模块格 (Module Lattice)”上的数学难题，如**带错误模块学习 (Module-LWE)** 和**模块最短独立向量 (Module-SIVP)** 问题。这些问题被认为即使对于量子计算机也难以解决。

*   **标准化与权威性**：
    作为 NIST PQC 竞赛的获胜者，ML-DSA 经过了全球密码学界多年的严格审查和分析，其安全性和性能得到了广泛认可。NIST 的标准化使其成为未来政府和商业应用中的首选签名算法。

*   **性能与效率**：
    与其他后量子签名方案相比，ML-DSA 在性能和签名大小之间取得了出色的平衡。它的签名和验证速度非常快，使其适用于对性能要求较高的场景。虽然其签名体积比 ECDSA 大，但在可接受的范围内，远小于其他一些后量子候选方案。

*   **安全级别**：
    ML-DSA 提供了多个不同的安全级别（如 Level 2, 3, 5），分别对应 AES-128、AES-192 和 AES-256 的经典安全强度，以满足不同应用场景的安全需求。

### ML-DSA的变体
下表列出了由 NIST 在 **FIPS 204** 标准中最终确定的三种 ML-DSA 变体及其关键参数。其中最常用的变体是 ML-DSA-65，因为它在安全级别、性能和签名大小之间提供了最佳平衡。

| 变体名称 | NIST 安全等级 | 可比拟的经典安全强度 | 公钥大小 (字节) | 私钥大小 (字节) | 签名大小 (字节) |
|:--- |:---:|:---:|:---:|:---:|:---:|
| **ML-DSA-44**  | **等级 2** | ≈ AES-128 | 1,312 | 2,560 | 2,420 | 
| **ML-DSA-65**  | **等级 3** | ≈ AES-192 | 1,952 | 4,032 | 3,309 | 
| **ML-DSA-87**  | **等级 5** | ≈ AES-256 | 2,592 | 4,896 | 4,627 | 




## 2 构建方式

相关 PR 链接：[#742](https://github.com/Tongsuo-Project/Tongsuo/pull/742)。

Tongsuo实现了ML-DSA-65变体，ML-DSA算法默认关闭，可以通过编译选项开启。

```bash
./config enable-ml_dsa
make -j
make install
```

## 3 使用示例

### 3.1 EVP接口调用

Tongsuo支持使用EVP接口调用ML-DSA，下面给出一个使用ML-DSA进行签名的示例。

```c
uint8_t m[99] = {0};
uint8_t context[16] = {0};
int ret = 0;
size_t sig_len = 0;

// 生成密钥
EVP_PKEY *pkey = EVP_PKEY_Q_keygen(NULL, NULL, "ML-DSA-65");

// 初始化签名上下文
EVP_PKEY_CTX *sctx = EVP_PKEY_CTX_new_from_pkey(NULL, pkey, NULL);
EVP_PKEY_sign_init(sctx);
// 传入context-string
OSSL_PARAM params[2];
params[0] = OSSL_PARAM_construct_octet_string(OSSL_SIGNATURE_PARAM_CONTEXT_STRING, context, sizeof(context));
params[1] = OSSL_PARAM_construct_end();
EVP_PKEY_CTX_set_params(sctx, params);
// 获取签名长度
EVP_PKEY_sign(sctx, NULL, &sig_len, m, sizeof(m));
uint8_t *sig = OPENSSL_malloc(sig_len);
// 生成签名
EVP_PKEY_sign(sctx, sig, &sig_len, m, sizeof(m));

// 初始化验签上下文
EVP_PKEY_CTX *vctx = EVP_PKEY_CTX_new_from_pkey(NULL, pkey, NULL);
EVP_PKEY_verify_init(vctx);
// 传入context-string
EVP_PKEY_CTX_set_params(vctx, params);
// 验证签名
ret = EVP_PKEY_verify(vctx, sig, sig_len, m, sizeof(m));

EVP_PKEY_CTX_free(sctx);
EVP_PKEY_CTX_free(vctx);
EVP_PKEY_free(pkey);
OPENSSL_free(sig);
```

### 3.2 命令行调用

```bash
# 签名与验证
/usr/local/bin/openssl genpkey -algorithm ML-DSA-65 -out sk.pem
/usr/local/bin/openssl pkey -in sk.pem -pubout -out pk.pem
/usr/local/bin/openssl pkeyutl -sign -rawin -inkey sk.pem -in msg -out sig
/usr/local/bin/openssl pkeyutl -verify -rawin -pubin -inkey pk.pem -in msg -sigfile sig

# 手动设定种子以及私钥的格式
/usr/local/bin/openssl genpkey -algorithm ML-DSA-65 -out sk.pem \
-pkeyopt hexseed:43b460b6c5529d94d31d4482f5e9d2969dbe4bf831ae48bf0d76cd2cd00bbbb2 \
-pkeyopt sk-format:seed-only
# sk-format可选：seed-priv priv-only seed-only oqskeypair bare-seed bare-priv中的一个或多个
# 选择多个时使用逗号连接

# 本地自签名证书
/usr/local/bin/openssl req \
    -x509 \
    -newkey mldsa65 \
    -keyout localhost-mldsa.key \
    -subj /CN=localhost \
    -addext subjectAltName=DNS:localhost \
    -days 30 \
    -nodes \
    -out localhost-mldsa.crt
```
