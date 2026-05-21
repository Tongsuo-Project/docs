---
sidebar_position: 1000
---
# 在Tongsuo中使用SM2与ML-DSA-65混合签名算法

本文旨在介绍如何在Tongsuo中使用SM2与ML-DSA-65的混合签名算法。

## 1 传统-后量子混合签名

传统-后量子混合算法（Traditional-Post-Quantum Hybrid Algorithm）是一种在密码系统中同时结合经典公钥算法和后量子密码算法的方案，旨在在向后量子安全体系过渡的过程中兼顾安全性与兼容性。传统密码算法如RSA、ECC等经过多年验证，具有成熟的标准与广泛部署，但在量子计算机出现后将面临被快速破解的风险；而后量子密码算法（如基于格的、基于码的、基于多变量多项式的算法等）可以抵御已知的量子攻击，但其在性能、实现稳定性和广泛实践验证方面尚不完全成熟。混合算法通过在密钥交换、数字签名等过程中同时执行传统算法与后量子算法，并将二者的结果结合成一个共同的会话密钥或验证条件，从而即使其中一种算法被破解，整体安全性仍可依赖另一种算法。这种方法能够在现有系统中渐进引入后量子技术，降低迁移风险，并为早期部署提供平稳过渡路径，因此在密码协议升级和标准制定中被广泛讨论与采用。

Tongsuo基于[IETF混合签名草案](https://datatracker.ietf.org/doc/html/draft-ietf-lamps-pq-composite-sigs-07)实现了实验性的SM2与ML-DSA-65混合签名算法。此算法的 OID 暂时分配在草案中提出的 `CompSig` 域名下的一个未使用字段，即 `<CompSig>.21`（2.16.840.1.114027.80.9.1.21）。其他签名细节均遵循草案规范。

## 2 构建方式

相关 PR 链接：[#756](https://github.com/Tongsuo-Project/Tongsuo/pull/756)。

SM2与ML-DSA-65混合签名算法默认关闭，可以通过编译选项开启。

```bash
./config enable-ml_dsa enable-sm2-mldsa65-hybrid
make -j4
make install
```

## 3 使用示例

### 3.1 EVP接口调用

Tongsuo支持使用EVP接口调用SM2与ML-DSA-65混合签名算法，下面给出一个使用SM2与ML-DSA-65混合签名算法进行签名的示例。

```c
uint8_t m[99] = {0};
uint8_t context[16] = {0};
int ret = 0;
size_t sig_len = 0;

// 生成密钥
EVP_PKEY *pkey = EVP_PKEY_Q_keygen(NULL, NULL, "SM2-MLDSA65-HYBRID");

// 初始化签名上下文
EVP_PKEY_CTX *sctx = EVP_PKEY_CTX_new_from_pkey(NULL, pkey, NULL);
EVP_PKEY_sign_init(sctx);
// 获取签名长度
EVP_PKEY_sign(sctx, NULL, &sig_len, m, sizeof(m));
uint8_t *sig = OPENSSL_malloc(sig_len);
// 生成签名
EVP_PKEY_sign(sctx, sig, &sig_len, m, sizeof(m));

// 初始化验签上下文
EVP_PKEY_CTX *vctx = EVP_PKEY_CTX_new_from_pkey(NULL, pkey, NULL);
EVP_PKEY_verify_init(vctx);
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
/usr/local/bin/openssl genpkey -algorithm sm2-mldsa65-hybrid -out sk.pem
/usr/local/bin/openssl pkey -in sk.pem -pubout -out pk.pem
/usr/local/bin/openssl pkeyutl -sign -rawin -inkey sk.pem -in msg -out sig
/usr/local/bin/openssl pkeyutl -verify -rawin -pubin -inkey pk.pem -in msg -sigfile sig

# 本地自签名证书
/usr/local/bin/openssl genpkey -algorithm sm2-mldsa65-hybrid -out ca.key

/usr/local/bin/openssl req -x509 -new -nodes -key ca.key \
-sm3 -days 3650 -out ca.crt -subj "/CN=SM2-MLDSA65-HYBRID Test CA"

# 作为CA签发证书
/usr/local/bin/openssl req -new -newkey sm2-mldsa65-hybrid -nodes -sigopt "sm2_id:1234567812345678" \
    -keyout server.key -out server.csr -subj "/CN=SM2-MLDSA65-HYBRID Test server"

/usr/local/bin/openssl x509 -req -in server.csr \
    -CA ca.crt -CAkey ca.key -CAcreateserial -sm2-id 1234567812345678 \
    -days 365 -out server.crt

# 验证证书
/usr/local/bin/openssl verify -CAfile ca.crt server.crt
```
