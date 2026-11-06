---
sidebar_position: 1
slug: /features/TLCP
---
# 国密TLCP使用手册
## 编译 NTLS 功能
NTLS 在 Tongsuo 的术语中代指符合 GM/T 0024 SSL VPN 和 TLCP 协议的安全通信协议，其特点是采用加密证书/私钥和签名证书/私钥相分离的方式。
在编译 Tongsuo 的时候，需要显式的指定编译参数方可开启 NTLS 的支持：
```bash
./config enable-ntls --prefix=/path/to/tongsuo
make -j
make install
```
## 特性使用（s_server/s_client工具验证）
测试用证书在`test/certs/sm2`目录下
server 端：命令行输入
```bash
openssl s_server -accept 127.0.0.1:4433 \
-enc_cert test/certs/sm2/server_enc.crt \
-enc_key test/certs/sm2/server_enc.key \
-sign_cert test/certs/sm2/server_sign.crt \
-sign_key test/certs/sm2/server_sign.key \
-enable_ntls
```
client 端(测试 ECC-SM2-WITH-SM4-SM3 套件)：命令行输入
```bash
openssl s_client -connect 127.0.0.1:4433 -cipher ECC-SM2-WITH-SM4-SM3 -enable_ntls -ntls
```
client 端(测试 ECDHE-SM2-WITH-SM4-SM3 套件)：命令行输入
```bash
openssl s_client -connect 127.0.0.1:4433 -cipher ECDHE-SM2-WITH-SM4-SM3 \
-sign_cert test/certs/sm2/client_sign.crt \
-sign_key test/certs/sm2/client_sign.key \
-enc_cert test/certs/sm2/client_enc.crt \
-enc_key test/certs/sm2/client_enc.key \
-enable_ntls -ntls
```
## 客户端和服务端集成TLCP
服务端代码片段如下所示，可编译的完整服务端代码可以参考 [https://www.yuque.com/tsdoc/ts/gdwdfuoih2mxxotf#L7Ntj](https://www.yuque.com/tsdoc/ts/gdwdfuoih2mxxotf#L7Ntj)
```c
int main() {
    //变量定义
    const SSL_METHOD *meth = NULL;
    SSL_CTX *ctx = NULL;
    const char *sign_key_file = "/path/to/sign_key_file";
    const char *sign_cert_file = "/path/to/sign_cert_file";
    const char *enc_key_file = "/path/to/enc_key_file";
    const char *enc_cert_file = "/path/to/enc_cert_file";

    //双证书相关server的各种定义
    meth = NTLS_server_method();
    //生成上下文
    ctx = SSL_CTX_new(meth);
    //允许使用国密双证书功能
    SSL_CTX_enable_ntls(ctx);

    //加载签名证书，加密证书
    if (sign_key_file) {
        if (!SSL_CTX_use_sign_PrivateKey_file(cctx->ctx, sign_key_file,
                                              SSL_FILETYPE_PEM))
            goto err;
    }

    if (sign_cert_file) {
        if (!SSL_CTX_use_sign_certificate_file(cctx->ctx, sign_cert_file,
                                               SSL_FILETYPE_PEM))
            goto err;
    }

    if (enc_key_file) {
        if (!SSL_CTX_use_enc_PrivateKey_file(cctx->ctx, enc_key_file,
                                             SSL_FILETYPE_PEM))
            goto err;
    }

    if (enc_cert_file) {
        if (!SSL_CTX_use_enc_certificate_file(cctx->ctx, enc_cert_file,
                                              SSL_FILETYPE_PEM))
            goto err;
    }

    //...后续同标准tls流程
    con = SSL_new(ctx);
}
```
客户端代码片段如下所示，可编译的完整客户端可以参考 [https://www.yuque.com/tsdoc/ts/gdwdfuoih2mxxotf#Zhkwt](https://www.yuque.com/tsdoc/ts/gdwdfuoih2mxxotf#Zhkwt)
```c
int main() {
    //变量定义
    const SSL_METHOD *meth = NULL;
    SSL_CTX *ctx = NULL;
    const char *sign_key_file = "/path/to/sign_key_file";
    const char *sign_cert_file = "/path/to/sign_cert_file";
    const char *enc_key_file = "/path/to/enc_key_file";
    const char *enc_cert_file = "/path/to/enc_cert_file";

    //双证书相关client的各种定义
    meth = NTLS_client_method();
    //生成上下文
    ctx = SSL_CTX_new(meth);
    //允许使用国密双证书功能
    SSL_CTX_enable_ntls(ctx);

    //设置算法套件为ECC-SM2-WITH-SM4-SM3或者ECDHE-SM2-WITH-SM4-SM3
    //这一步并不强制编写，默认ECC-SM2-WITH-SM4-SM3优先
    if(SSL_CTX_set_cipher_list(ctx, "ECC-SM2-WITH-SM4-SM3") <= 0)
        goto err;

    //加载签名证书，加密证书，仅ECDHE-SM2-WITH-SM4-SM3套件需要这一步,
    //该部分流程用...begin...和...end...注明
    // ...begin...
    if (sign_key_file) {
        if (!SSL_CTX_use_sign_PrivateKey_file(cctx->ctx, sign_key_file,
                                              SSL_FILETYPE_PEM))
            goto err;
    }

    if (sign_cert_file) {
        if (!SSL_CTX_use_sign_certificate_file(cctx->ctx, sign_cert_file,
                                               SSL_FILETYPE_PEM))
            goto err;
    }

    if (enc_key_file) {
        if (!SSL_CTX_use_enc_PrivateKey_file(cctx->ctx, enc_key_file,
                                             SSL_FILETYPE_PEM))
            goto err;
    }

    if (enc_cert_file) {
        if (!SSL_CTX_use_enc_certificate_file(cctx->ctx, enc_cert_file,
                                              SSL_FILETYPE_PEM))
            goto err;
    }
    // ...end...

    //...后续同标准tls流程
    con = SSL_new(ctx);
}
```

## 双证书 keyUsage 检查（8.5.0）

自 8.5.0 起，NTLS/TLCP 握手在校验证书链后，默认会对**对端**签名证书与加密证书检查 `keyUsage`（依据 GB/T 20518-2018 附录用途约定，并兼容常见实现）：

| 证书类型 | 要求（至少满足其一） |
| --- | --- |
| 签名证书 | `digitalSignature` 或 `nonRepudiation` |
| 加密证书 | `keyEncipherment`、`dataEncipherment` 或 `keyAgreement` |

说明：

- 证书**必须**携带 `keyUsage` 扩展；缺省扩展会导致握手失败。
- 不要求与附录掩码完全相等，也不强制扩展为 critical。
- 该检查**默认开启**。若需与仅部分实现、或证书 KU 不规范的对端互通，可显式关闭。

关闭示例（API）：

```c
SSL_CTX_set_ntls_cert_key_usage_check(ctx, 0);  /* 0=关闭，1=开启 */
/* 或针对单个 SSL 对象 */
SSL_set_ntls_cert_key_usage_check(ssl, 0);
```

命令行（`s_client` / `s_server`）：

```bash
openssl s_client ... -enable_ntls -ntls -disable_ntls_cert_key_usage_check
openssl s_server ... -enable_ntls -disable_ntls_cert_key_usage_check
```

配置项（`SSL_CONF`）：`enable_ntls_cert_key_usage_check`，取值为 `on` / `off`。

建议签发双证书时按 GB/T 20518-2018 附录设置 `keyUsage`，并将扩展标记为 `critical`：

```text
# 签名证书（附录 C.3）
keyUsage = digitalSignature, nonRepudiation

# 加密证书（附录 C.4）
keyUsage = keyEncipherment, dataEncipherment, keyAgreement
```

## 获取对端签名证书与加密证书（8.5.0）

NTLS 握手成功后，可用下列接口分别取得对端的签名证书与加密证书（均为内部引用，**不要** `X509_free`）：

```c
#include <openssl/ssl.h>

X509 *sign_cert = SSL_get0_peer_sign_certificate_ntls(ssl);
X509 *enc_cert  = SSL_get0_peer_enc_certificate_ntls(ssl);

if (sign_cert == NULL || enc_cert == NULL) {
    /* 非 NTLS 连接、握手未完成，或对端未提供对应证书 */
}
```

行为要点：

- 仅在当前连接为 NTLS 时有效；否则返回 `NULL`。
- 签名证书对应会话中的对端身份证书；加密证书取自对端证书链中的加密证书位置（客户端与服务端在链中的索引不同，接口已封装）。
- 适合在应用层分别校验、展示或缓存双证书，而无需自行解析 Certificate 消息顺序。

## NTLS CKE 标准兼容性更新（8.5.0）

### ECC 套件：预主密钥中的协议版本检查

对使用 SM2 加密预主密钥的 ECC 类套件，服务端在解密 ClientKeyExchange 后会按 GB/T 38636-2020 第 6.4.5.8 节校验 `PMS.client_version` 是否与 `ClientHello.client_version` 一致。

- 校验失败时**不**单独抛出可区分的解密告警，而是改用随机预主密钥继续握手（与 RFC 5246 对 RSA PKCS #1.5 预主密钥版本不匹配的处理类似），以降低服务端被利用为解密预言机的风险。
- 应用侧无需额外配置；请保证客户端写入的 PMS 前两字节与 ClientHello 版本一致。

### ECDHE 套件：ClientKeyExchange 长度前缀兼容

GB/T 38636-2020 第 6.4.5.8 节将 ECDHE 的 ClientKeyExchange 载荷描述为带长度前缀的 `opaque ClientECDHEParams<0..2^16-1>`，而既有部分实现按“裸”`ClientECDHEParams` 编解码。

Tongsuo 默认仍使用与既有生态兼容的编码；若需发送符合标准向量前缀的 CKE，可开启严格模式：

```c
SSL_CTX_set_ntls_strict_ecdhe_cke(ctx, 1);  /* 默认 0：兼容模式 */
SSL_set_ntls_strict_ecdhe_cke(ssl, 1);
```

命令行：

```bash
openssl s_client ... -enable_ntls -ntls -enable_ntls_strict_ecdhe_cke \
  -cipher ECDHE-SM2-WITH-SM4-SM3 \
  -sign_cert ... -sign_key ... -enc_cert ... -enc_key ...
```

配置项：`enable_ntls_strict_ecdhe_cke`，取值为 `on` / `off`。

服务端接收时会自动识别两种编码形式（有无 2 字节长度前缀），一般无需改服务端配置即可与严格/兼容客户端互通。

## 说明
由于国密双证书的握手流程和协议版本号与标准 tls 流程存在一定的不同，因此我们选择将双证书的实现(代码里命名为 ntls)同现有的 tls 状态机拆分开来，然后在入口处通过对请求的版本号进行识别，然后使其进入正确的状态机。
