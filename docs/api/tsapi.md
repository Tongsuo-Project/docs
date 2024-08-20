# 概述

Tongsuo密码库给应用程序提供的API，包括获取熵、生成随机数、SM2密钥对生成、SM2签名、SM2验签、SM2加密、SM2解密、SM2密钥导入、SM2密钥导出、
SM2密钥信封导入、SM2密钥信封导出、SM2密钥生成、SM2密钥删除、SM2密钥更新、SM4加密、SM4解密、SM3杂凑等功能。

部分密钥管理接口，通常包含index入参，需要密码设备支持，比如密码卡或密码机，TSAPI通常调用密码设备提供的SDF接口来实现。

## 头文件和函数原型

```c
#include <openssl/tsapi.h>

unsigned char *TSAPI_GetEntropy(int entropy, size_t *outlen);
void TSAPI_FreeEntropy(unsigned char *ent, size_t len);
char *TSAPI_Version(void);
unsigned char *TSAPI_RandBytes(size_t len);

# ifndef OPENSSL_NO_SM2
EVP_PKEY *TSAPI_SM2Keygen(void);
#  ifndef OPENSSL_NO_SM3
unsigned char *TSAPI_SM2Sign(EVP_PKEY *key, const unsigned char *tbs,
                             size_t tbslen, size_t *siglen);
int TSAPI_SM2Verify(EVP_PKEY *key, const unsigned char *tbs, size_t tbslen,
                    const unsigned char *sig, size_t siglen);
#  endif
unsigned char *TSAPI_SM2Encrypt(EVP_PKEY *key, const unsigned char *in,
                                size_t inlen, size_t *outlen);
unsigned char *TSAPI_SM2Decrypt(EVP_PKEY *key, const unsigned char *in,
                                size_t inlen, size_t *outlen);
unsigned char *TSAPI_SM2EncryptWithISK(int isk, const unsigned char *in,
                                       size_t inlen, size_t *outlen);
unsigned char *TSAPI_SM2DecryptWithISK(int isk, const unsigned char *in,
                                       size_t inlen, size_t *outlen);
unsigned char *TSAPI_ECCCipher_to_SM2Ciphertext(const OSSL_ECCCipher *ecc,
                                                size_t *ciphertext_len);
OSSL_ECCCipher *TSAPI_SM2Ciphertext_to_ECCCipher(const unsigned char *ciphertext,
                                                 size_t ciphertext_len);
int TSAPI_ImportSM2Key(int index, int sign, const char *user,
                       const char *password, const EVP_PKEY *sm2_pkey);
EVP_PKEY *TSAPI_ExportSM2KeyWithIndex(int index, int sign, const char *user,
                                      const char *password);
OSSL_ECCrefPublicKey *TSAPI_EVP_PKEY_get_ECCrefPublicKey(const EVP_PKEY *pkey);
OSSL_ECCrefPrivateKey *TSAPI_EVP_PKEY_get_ECCrefPrivateKey(const EVP_PKEY *pkey);
EVP_PKEY *TSAPI_EVP_PKEY_new_from_ECCrefKey(const OSSL_ECCrefPublicKey *pubkey,
                                            const OSSL_ECCrefPrivateKey *privkey);
int TSAPI_ImportSM2KeyWithEvlp(int index, int sign, const char *user,
                               const char *password, unsigned char *key,
                               size_t keylen, unsigned char *dek,
                               size_t deklen);
int TSAPI_ExportSM2KeyWithEvlp(int index, int sign, const char *user,
                               const char *password, EVP_PKEY *sm2_pubkey,
                               unsigned char **priv, size_t *privlen,
                               unsigned char **pub, size_t *publen,
                               unsigned char **outevlp, size_t *outevlplen);
int TSAPI_GenerateSM2KeyWithIndex(int index, int sign, const char *user, const char *password);
int TSAPI_DelSm2KeyWithIndex(int index, int sign, const char *user,
                                const char *password);
int TSAPI_UpdateSm2KeyWithIndex(int index, int sign, const char *user,
                                const char *password);
EVP_PKEY *TSAPI_ExportSM2PubKeyWithIndex(int index, int sign);
# endif

# ifndef OPENSSL_NO_SM4
unsigned char *TSAPI_SM4Encrypt(int mode, const unsigned char *key,
                                size_t keylen, int isk,
                                const unsigned char *iv,
                                const unsigned char *in, size_t inlen,
                                size_t *outlen);
unsigned char *TSAPI_SM4Decrypt(int mode, const unsigned char *key,
                                size_t keylen, int isk,
                                const unsigned char *iv,
                                const unsigned char *in, size_t inlen,
                                size_t *outlen);
# endif
# ifndef OPENSSL_NO_SM3
unsigned char *TSAPI_SM3(const void *data, size_t datalen, size_t *outlen);
# endif
```

## 函数说明

TSAPI_GetEntropy()用户获取具有entropy熵值的熵，输出缓冲区的长度为*outlen, outlen不能为NULL。TSAPI_GetEntropy()返回的缓冲区需要通过调
用TSAPI_FreeEntropy()释放。

TSAPI_FreeEntropy()用于释放TSAPI_GetEntropy()返回的缓冲区，len应该是缓冲区ent的实际长度。

TSAPI_Version()返回Tongsuo的版本号字符串，注意：返回的字符串是动态分配的，需要调用OPENSSL_free()释放。

TSAPI_RandBytes()生成len字节的随机数；返回的缓冲区需要通过调用OPENSSL_free()释放。

TSAPI_SM2Keygen()生成一个SM2密钥对，返回的EVP_PKEY对象需要通过调用EVP_PKEY_free()释放。

TSAPI_SM2Sign()使用SM2密钥key对长度为tbslen的数据tbs进行签名，返回签名值，签名值的长度通过*siglen返回，返回的缓冲区需要通过调用
OPENSSL_free()释放。

TSAPI_SM2Verify()使用SM2密钥key对长度为tbslen的数据tbs，长度为siglen的签名sig进行验证，返回1表示验证成功，0表示验证失败。

TSAPI_SM2Encrypt()使用SM2密钥key对长度为inlen的数据in进行加密，返回加密后的数据，加密后的数据长度通过*outlen返回，返回的缓冲区需要通过调
用OPENSSL_free()释放。

TSAPI_SM2Decrypt()使用SM2密钥key对长度为inlen的数据in进行解密，返回解密后的数据，解密后的数据长度通过*outlen返回，返回的缓冲区需要通过调
用OPENSSL_free()释放。

TSAPI_SM2EncryptWithISK()使用索引为isk的SM2密钥对长度为inlen的数据in进行加密，返回加密后的数据，加密后的数据长度通过*outlen返回，返回的
缓冲区需要通过调用OPENSSL_free()释放。

TSAPI_SM2DecryptWithISK()使用索引为isk的SM2密钥对长度为inlen的数据in进行解密，返回解密后的数据，解密后的数据长度通过*outlen返回，返回的
缓冲区需要通过调用OPENSSL_free()释放。

TSAPI_ECCCipher_to_SM2Ciphertext()将OSSL_ECCCipher对象ecc转换为SM2密文，返回SM2密文，SM2密文的长度通过ciphertext_len返回，返回的
缓冲区需要调用OPENSSL_free()释放。

TSAPI_SM2Ciphertext_to_ECCCipher()将SM2密文ciphertext转换为OSSL_ECCCipher对象，返回OSSL_ECCCipher对象；返回的OSSL_ECCCipher对
象需要调用OPENSSL_free()释放。

TSAPI_ImportSM2Key()将EVP_PKEY对象sm2_pkey导入到索引为index的SM2密码设备中，sign为1表示签名私钥，为0表示加密公钥，user和password为密
码设备的用户名和密码。

TSAPI_ExportSM2KeyWithIndex()从索引为index的SM2密码设备中导出密钥，sign为1表示导出签名私钥，为0表示导出加密公钥，user和password为密码
设备的用户名和密码。

TSAPI_EVP_PKEY_get_ECCrefPublicKey()从EVP_PKEY对象pkey中获取OSSL_ECCrefPublicKey对象；返回的对象需要调用OPENSSL_free()释放。

TSAPI_EVP_PKEY_get_ECCrefPrivateKey()从EVP_PKEY对象pkey中获取OSSL_ECCrefPrivateKey对象；返回的对象需要调用OPENSSL_free()释放。

TSAPI_EVP_PKEY_new_from_ECCrefKey()从OSSL_ECCrefPublicKey对象pubkey和OSSL_ECCrefPrivateKey对象privkey创建EVP_PKEY对象；返回的
对象需要调用EVP_PKEY_free()释放。

TSAPI_ImportSM2KeyWithEvlp()通过信封方式导入SM2密钥，导入的密钥key长度为keylen，这里的密钥key为密文，使用dek加密，dek长度为deklen，加
密算法为SM4，dek使用设备加密密钥加密（SM2私钥）。导入后的索引为index；sign为1表示签名私钥，为0表示加密公钥，user和password为密码设备的用户
名和密码。

TSAPI_ExportSM2KeyWithEvlp()通过信封方式导出SM2密钥，导出的密钥索引为index，sign为1表示签名私钥，为0表示加密公钥，user和password为密码
设备的用户名和密码；返回的信封数据outevlp，长度保存在*outevlplen，需要调用OPENSSL_free()释放；返回的公私钥数据pub和priv，长度保存在
*publen和*privlen，需要调用OPENSSL_free()释放。信封outevlp中包含加密SM2密钥的对称密钥，对称密钥使用sm2_pubkey加密。

TSAPI_ImportSM2KeyWithEvlp()和TSAPI_ExportSM2KeyWithEvlp()是密码设备实现相关的，需要密码设备支持，并且成对使用。

TSAPI_GenerateSM2KeyWithIndex()生成一个SM2密钥对，索引为index，sign为1表示签名私钥，为0表示加密公钥，user和password为密码设备的用户名
和密码。

TSAPI_DelSm2KeyWithIndex()删除索引为index的SM2密钥，sign为1表示签名私钥，为0表示加密公钥，user和password为密码设备的用户名和密码。

TSAPI_UpdateSm2KeyWithIndex()更新索引为index的SM2密钥，sign为1表示签名私钥，为0表示加密公钥，user和password为密码设备的用户名和密码。

TSAPI_ExportSM2PubKeyWithIndex()导出索引为index的SM2公钥，sign为1表示签名私钥，为0表示加密公钥。

TSAPI_SM4Encrypt()使用SM4算法对长度为inlen的数据in进行加密，key为密钥，keylen为密钥长度，mode为加密模式，iv为初始向量；isk内部加密密钥
的索引，如果isk小于0，即索引无效时，key为明文，否则当isk >=0时，key为密文，表示key使用isk代表的SM2公钥加密；返回加密后的数据，加密后的数据
长度通过*outlen返回，返回的缓冲区需要通过调用OPENSSL_free()释放。

TSAPI_SM4Decrypt()使用SM4算法对长度为inlen的数据in进行解密，key为密钥，keylen为密钥长度，mode为解密模式，iv为初始向量；isk内部加密密钥
的索引，如果isk小于0，即索引无效时，key为明文，否则当isk >=0时，key为密文，表示key使用isk代表的SM2公钥解密；返回解密后的数据，解密后的数据
长度通过*outlen返回，返回的缓冲区需要通过调用OPENSSL_free()释放。

TSAPI_SM3()计算长度为datalen的数据data的SM3杂凑值，返回SM3杂凑值，杂凑值的长度通过*outlen返回，返回的缓冲区需要通过调用OPENSSL_free()
释放。

## 返回值说明

返回int类型的函数，返回值为1表示成功，0表示失败。

返回指针类型的函数，比如unsigned char *， EVP_PKEY *，OSSL_ECCCipher *，OSSL_ECCrefPublicKey *，OSSL_ECCrefPrivateKey *等，
返回NULL表示失败，非NULL表示成功。

## 历史

TSAPI_*函数在Tongsuo 8.5.0版本中引入。
