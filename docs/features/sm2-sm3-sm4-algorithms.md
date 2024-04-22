---
sidebar_position: 12
---
# 在铜锁中使用 SM2&SM3&SM4 算法的教程

铜锁提供了一系列API来支持应用程序使用 SM2，SM3 和 SM4 算法。本文对这些用法进行整理，以方面用户更好的参考使用。

为了节省篇幅，头文件统一描述。
```c
#include <openssl/evp.h>
#include <openssl/err.h>
#include <openssl/ec.h>
```

## SM2

SM2 算法涉及的操作有：密钥生成、加密、解密、签名、验签

### SM2密钥生成

SM2 的密钥是一个公私钥对，根据铜锁版本的不同，SM2 密钥对的生成也存在区别。铜锁中使用 EVP_PKEY 数据结构来表示一对 SM2 密钥，该结构同时存放 SM2 的私钥和公钥。

#### 铜锁 8.3.x 和 8.2.x 系列

采用传统的 OpenSSL 风格的非对称密钥生成方式进行 SM2 的密钥生成

```c
EVP_PKEY_CTX *sm2_ctx = NULL;
EVP_PKEY *sm2_key = NULL;

sm2_ctx = EVP_PKEY_CTX_new_id(EVP_PKEY_EC, NULL);
if (sm2_ctx == NULL) {
    /* 错误处理 */
}
if (!EVP_PKEY_keygen_init(sm2_ctx)) {
    /* 错误处理 */
}
if (!EVP_PKEY_CTX_set_ec_paramgen_curve_nid(sm2_ctx, OBJ_sn2nid("SM2"))) {
    /* 错误处理 */
}
if (!EVP_PKEY_keygen(sm2_ctx, &sm2_key)) {
    /* 错误处理 */
}
if (!EVP_PKEY_set_alias_type(sm2_key, EVP_PKEY_SM2)) {
    /* 错误处理 */
}
```

#### 铜锁 8.4.x 系列

铜锁 8.4.0 提供了简易的 API 来实现 SM2 密钥对的生成

```c
EVP_PKEY *sm2_key = NULL;

sm2_key = EVP_PKEY_Q_keygen(NULL, NULL, "SM2");
if (sm2_key == NULL) {
    /* 错误处理 */
}
```

执行成功之后，就可以获得一个可在后续使用的 EVP_PKEY 结构。

此外，8.4.x 版本的铜锁，也兼容 8.3.x 和 8.2.x 版本的 SM2 密钥生成方式。

#### 导出密钥

如果需要将内存中的密钥（EVP_PKEY）导出到文件，例如常用的PEM格式，则可使用：PEM_write_bio_PrivateKey 函数进行导出。

#### 导入密钥

相比于直接生成新的 SM2 密钥对，一种更加常见的方式可能是从现有的密钥文件中读取密钥（例如公钥或者私钥）。TBD...

### SM2 加密

在拥有 SM2 密钥（即 EVP_PKEY 对象）之后，就可以使用该密钥进行一系列的 SM2 密码学原语操作。现在从 SM2 加密算法开始，介绍 EVP_PKEY 对象的使用方式。

```c
EVP_PKEY_CTX *pctx = NULL;
unsigned char msg[] = "Winter Is Coming";
unsigned char *out = NULL;
size_t outlen = 0, inlen = 0;

/* 假设sm2_key已经提前设置好 */

pctx = EVP_PKEY_CTX_new(sm2_key, NULL);
if (pctx == NULL) {
    /* 错误处理 */
}
if (EVP_PKEY_encrypt_init(pctx) <= 0) {
    /* 错误处理 */
}
inlen = strlen((char *)msg);
if (EVP_PKEY_encrypt(pctx, NULL, &outlen, msg, inlen) <= 0) {
    /* 错误处理 */
}
out = OPENSSL_malloc(outlen);
if (out == NULL) {
    /* 错误处理 */
}
if (EVP_PKEY_encrypt(pctx, out, &outlen, msg, inlen) <= 0) {
    /* 错误处理 */
}
EVP_PKEY_CTX_free(pctx);
EVP_PKEY_free(sm2_key);
```

其中，在铜锁中公钥密码学算法的操作和运算，是基于EVP_PKEY_CTX对象展开的。因此首先需要基于EVP_PKEY创建一个EVP_PKEY_CTX，即上例中的pctx变量，然后对pctx进行加密初始化。上例中，明文消息被存放在msg变量中，是一个字符串，当然也可以是任何其他的数据或内容。然后是一个典型的两次调用过程，即对实际的加密函数EVP_PKEY_encrypt进行两次调用，第一次调用时密文buffer为空，旨在获取加密后的密文长度，然后根据此长度进行内存分配，即上例中对out指针分配内存。第二次调用是实际执行的SM2加密操作，即对明文msg，使用sm2_key进行加密，得到密文out。

### SM2 解密

SM2 的解密操作和 SM2 加密操作类似，几乎就是将 encrypt 的相关函数替换为解密的 decrypt 函数。

```c
EVP_PKEY_CTX *pctx = NULL;
unsigned char *out = NULL;
size_t outlen = 0, inlen = 0;

/* 假设sm2_key, 密文cipher_text, 密文长度inlen已经提前准备好 */
pctx = EVP_PKEY_CTX_new(sm2_key, NULL);
if (pctx == NULL) {
    /* 错误处理 */
}
if (EVP_PKEY_decrypt_init(pctx) <= 0) {
    /* 错误处理 */
}
if (EVP_PKEY_decrypt(pctx, NULL, &outlen, cipher_text, inlen) <= 0) {
    /* 错误处理 */
}
out = OPENSSL_malloc(outlen);
if (out == NULL) {
    /* 错误处理 */
}
if (EVP_PKEY_decrypt(pctx, out, &outlen, cipher_text, inlen) <= 0) {
    /* 错误处理 */
}
EVP_PKEY_CTX_free(pctx);
EVP_PKEY_free(sm2_key);
```
由上例可见，SM2 解密的流程和加密类似，经过两次调用 EVP_PKEY_decrypt 实现对密文的解密，解密后的明文存放在 out 指向的内存中。对于不再需要使用的 PKEY 和 PKEY_CTX，需要显式的调用对应的 _free 函数进行释放。

### SM2 签名

SM2 签名操作的整体流程类似于加密操作。
```c
EVP_PKEY_CTX *pctx = NULL;
unsigned char md[EVP_MAX_MD_SIZE];
unsigned char *sig = NULL;
size_t mdlen = EVP_MAX_MD_SIZE, siglen = 0;

/* 假设sm2_key, md, mdlen已经提前准备好*/
pctx = EVP_PKEY_CTX_new(sm2_key, NULL);
if (pctx == NULL) {
    /* 错误处理 */
}
if (EVP_PKEY_sign_init(pctx) <= 0) {
    /* 错误处理 */
}
if (EVP_PKEY_sign(pctx, NULL, &siglen, md, mdlen) <= 0) {
    /* 错误处理 */
}
sig = OPENSSL_malloc(siglen);
if (sig == NULL) {
    /* 错误处理 */
}
if (EVP_PKEY_sign(pctx, sig, &siglen, md, mdlen) <= 0) {
    /* 错误处理 */
}
```

整个流程也是调用两次 EVP_PKEY_sign，对 md 中存储的数据进行签名。这里用 md，是 message digest 的意思，即对消息的摘要进行签名，是目前SM2签名算法的典型使用方式。得到的签名值会存储在 sig 指针所指向的内存中，其长度为 siglen。在使用的时候一般会将消息原文和签名值共同发出，供接收方验签使用。

### SM2 验签

SM2 验签是针对 SM2 签名和原文进行验证的过程，因此输入的数据需要有原文和签名值，返回的结果是成功或失败，其中成功是指经过SM2验签发现原文没有被篡改，签名值 OK。失败则代表验签出现了问题，原文可能被篡改、或签名值损坏等原因导致。
```c
EVP_PKEY sm2_key；
EVP_PKEY_CTX *pctx;
unsigned char *md, *sig;
size_t mdlen, siglen;

/* 假设sm2_key, md, mdlen, sig, siglen都已经准备好 */
EVP_PKEY_CTX_free(pctx);
pctx = EVP_PKEY_CTX_new(sm2_key, NULL);
if (pctx == NULL) {
    /* 错误处理 */
}
if (EVP_PKEY_verify_init(pctx) <= 0) {
    /* 错误处理 */
}
ret = EVP_PKEY_verify(pctx, sig, siglen, md, mdlen);
if (ret == 1) {
    /* 验签成功 */
} else if (ret == 0) {
    /* 验签失败 */
} else if (ret < 0) {
    /* 错误处理 */
} else {
    /* will never happen */
}
```

SM2 验签的整体流程类似于签名流程，唯一值得注意的事 EVP_PKEY_verify 函数的返回值。不同于其他函数，EVP_PKEY_verify 返回值只有在小于0的时候，才是发生了错误，需要进行错误处理。而返回0的时候，则只是说明验签失败，而非其他常规错误。

## SM3

SM3 是计算消息摘要的商用密码算法，也叫做密码杂凑算法或哈希算法。SM3算法不需要密钥，可直接针对消息进行计算从而得到其摘要值。根据铜锁版本的不同，SM3算法也有不同的使用方式。

### 铜锁 8.3.x 和 8.2.x 系列

```c
EVP_MD_CTX *mdctx = NULL;
unsigned int mdlen = 0;

/* 假设msg, inlen, md都已设置好 */
mdctx = EVP_MD_CTX_new();
if (mdctx == NULL) {
    /* 错误处理 */
}
if (!EVP_DigestInit_ex(mdctx, EVP_sm3(), NULL)) {
    /* 错误处理 */
}
if (!EVP_DigestUpdate(mdctx, msg, inlen)) {
    /* 错误处理 */
}
if (!EVP_DigestFinal_ex(mdctx, md, &mdlen)) {
    /* 错误处理 */
}
EVP_MD_CTX_free(mdctd);
```

其中，EVP_DigestUpdate 可以调用多次，实现对数据流进行哈希。

### 铜锁 8.4.x 系列

```c
unsigned char data[] = "Winter Is Coming", *md;
size_t len = 0, mdlen = 0;

/* 假设各项数据都已经准备好 */
if (!EVP_Q_digest(NULL, "SM3", NULL, data, len, md, &mdlen)) {
    /* 错误处理 */
}
```

在 8.4.x 的铜锁中也可以时候用老版本的方式进行SM3计算，例如进行流式数据输入的场景下。

## SM4

SM4 是分组加密算法，因此存在加密和解密两种计算。但是因为分组加密涉及到加密模式的问题（mode of operation），尤其是对 AEAD 相关模式的使用，也存在不用的调用方式，因此需要额外注意。

### SM4加密

#### 非AEAD模式

即诸如 ECB，CBC 等模式的使用方式。
```c
EVP_CIPHER_CTX *sm4_ctx = NULL;
unsigned char key[] = { 0x01, 0x23, 0x45, 0x67, 0x89, 0xAB, 0xCD, 0xEF,
                        0xFE, 0xDC, 0xBA, 0x98, 0x76, 0x54, 0x32, 0x10 };
unsigned char iv[] = { 0x00, 0x01, 0x02, 0x03, 0x04, 0x05, 0x06, 0x07, 
                       0x08, 0x09, 0x0A, 0x0B, 0x0C, 0x0D, 0x0E, 0x0F };

/* 假设msg, msglen, out, outlen均定义完毕 */
sm4_ctx = EVP_CIPHER_CTX_new();
if (sm4_ctx == NULL) {
    /* 错误处理 */
}
if (!EVP_EncryptInit_ex(sm4_ctx, EVP_sm4_cbc(), NULL, key, iv)) {
    /* 错误处理 */
}
if (!EVP_EncryptUpdate(sm4_ctx, out, (int *)&outlen, msg, msglen)) {
    /* 错误处理 */
}
if (!EVP_EncryptFinal_ex(sm4_ctx, out + outlen, (int *)&tmplen)) {
    /* 错误处理 */
}
EVP_CIPHER_CTX_free(sm4_ctx);
```

SM4 算法的密钥是16个字节长，即128位。在上例中，因为使用了CBC模式，因此还需要额外准备IV值。SM4加密的整体流程也是Init-Update-Final的形式。如果需要使用其他加密模式，则需对应调整 `EVP_sm4_cbc()` 函数为其他模式，例如 EVP_sm4_ecb 等。

#### AEAD 模式

铜锁支持的 SM4 的 AEAD 模式有 GCM 和 CCM。这两种模式在铜锁中的加密方式基本类似于非 AEAD 模式，但是由于 AEAD 增加了额外的认证信息，因此需要增加新的 API。
```c
unsigned char key[] = { 0x01, 0x23, 0x45, 0x67, 0x89, 0xAB, 0xCD, 0xEF,
                        0xFE, 0xDC, 0xBA, 0x98, 0x76, 0x54, 0x32, 0x10 };
unsigned char iv_gcm[] = { 0x00, 0x01, 0x02, 0x03, 0x04, 0x05, 0x06, 0x07, 
                           0x08, 0x09, 0x0A, 0x0B };
unsigned char aad[] = "Winter has come";
size_t aadlen = strlen((char *)aad);
unsigned char tag[16];

sm4_ctx = EVP_CIPHER_CTX_new();
if (sm4_ctx == NULL) {
    /* 错误处理 */
}
if (!EVP_EncryptInit_ex(sm4_ctx, EVP_sm4_gcm(), NULL, key, iv)) {
    /* 错误处理 */
}
if (!EVP_EncryptUpdate(sm4_ctx, NULL, (int *)&outlen, aad, aadlen)) {
    /* 错误处理 */
}
if (!EVP_EncryptUpdate(sm4_ctx, out, (int *)&outlen, msg, msglen)) {
    /* 错误处理 */
}
if (!EVP_EncryptFinal_ex(sm4_ctx, out + outlen, (int *)&tmplen)) {
    /* 错误处理 */
}
if (!EVP_CIPHER_CTX_ctrl(sm4_ctx, EVP_CTRL_GCM_GET_TAG, 16, tag)) {
    /* 错误处理 */
}
EVP_CIPHER_CTX_free(sm4_ctx);
```

以 SM4 GCM 为例，在上例中，主要有两处需要注意之处。第一点是在out设置为NULL的情况下调用 EVP_EncryptUpdate 函数设置 AAD（即Additional Authenticated Data），此步骤为可选，即可以不提供 AAD。第二点就是需要使用 EVP_CIPHER_CTX_ctrl 获取tag。这个tag将在解密的时候来判断密文是否被篡改。

### SM4解密

#### 非AEAD模式

非 AEAD 模式下的 SM4 算法的解密流程和加密一致，只不过把 encrypt 函数替换成对应的 decrypt 函数即可。为了节省篇幅，这里就不赘述。

#### AEAD 模式

因为涉及到 tag 的使用，因此 AEAD 模式的解密，例如 GCM，需要额外对 tag 进行处理。

```c
unsigned char key[] = { 0x01, 0x23, 0x45, 0x67, 0x89, 0xAB, 0xCD, 0xEF,
                        0xFE, 0xDC, 0xBA, 0x98, 0x76, 0x54, 0x32, 0x10 };
unsigned char iv_gcm[] = { 0x00, 0x01, 0x02, 0x03, 0x04, 0x05, 0x06, 0x07, 
                           0x08, 0x09, 0x0A, 0x0B };
unsigned char aad[] = "Winter has come";
size_t aadlen = strlen((char *)aad);

/* 假设tag已从额外渠道获取 */
sm4_ctx = EVP_CIPHER_CTX_new();
if (sm4_ctx == NULL) {
    /* 错误处理 */
}
if (!EVP_DecryptInit_ex(sm4_ctx, EVP_sm4_gcm(), NULL, key, iv)) {
    /* 错误处理 */
}
if (!EVP_DecryptUpdate(sm4_ctx, NULL, (int *)&outlen, aad, aadlen)) {
    /* 错误处理 */
}
if (!EVP_DecryptUpdate(sm4_ctx, out, (int *)&outlen, msg, msglen)) {
    /* 错误处理 */
}
if (!EVP_CIPHER_CTX_ctrl(sm4_ctx, EVP_CTRL_GCM_SET_TAG, 16, tag)) {
    /* 错误处理 */
}
if (!EVP_DecryptFinal_ex(sm4_ctx, out + outlen, (int *)&tmplen)) {
    /* 错误处理 */
}
EVP_CIPHER_CTX_free(sm4_ctx);
```
和 GCM 模式的加密相比，解密操作最大不同就是需要在 EVP_DecryptFinal_ex 之前，进行 tag 的设置，从而使得铜锁可以判断信息是否遭到了篡改。
