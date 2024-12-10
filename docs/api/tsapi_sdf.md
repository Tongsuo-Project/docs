# Tongsuo SDF接口文档

Tongsuo提供的SDF接口，需要结合密码设备使用，实际上封装了密码设备提供的SDF接口，提供对密码设备的统一访问能力。

本文大部分接口定义参考GM/T 0018-2023 密码设备应用接口规范。

少量接口为非标接口，需要搭配特定的密码设备使用。

## 头文件和函数原型

```c
#include <openssl/sdf.h>

int TSAPI_SDF_OpenDevice(void **phDeviceHandle);
int TSAPI_SDF_CloseDevice(void *hDeviceHandle);
int TSAPI_SDF_OpenSession(void *hDeviceHandle, void **phSessionHandle);
int TSAPI_SDF_CloseSession(void *hSessionHandle);
int TSAPI_SDF_GenerateRandom(void *hSessionHandle, unsigned int uiLength,
                             unsigned char *pucRandom);
int TSAPI_SDF_GetPrivateKeyAccessRight(void *hSessionHandle,
                                       unsigned int uiKeyIndex,
                                       unsigned char *pucPassword,
                                       unsigned int uiPwdLength);
int TSAPI_SDF_ReleasePrivateKeyAccessRight(void *hSessionHandle,
                                           unsigned int uiKeyIndex);
int TSAPI_SDF_ImportKeyWithISK_ECC(void *hSessionHandle,
                                   unsigned int uiISKIndex,
                                   OSSL_ECCCipher *pucKey,
                                   void **phKeyHandle);
int TSAPI_SDF_ImportKeyWithKEK(void *hSessionHandle, unsigned int uiAlgID,
    unsigned int uiKEKIndex, unsigned char *pucKey, unsigned int puiKeyLength,
    void **phKeyHandle);
int TSAPI_SDF_ExportSignPublicKey_ECC(void *hSessionHandle,
                                      unsigned int uiKeyIndex,
                                      OSSL_ECCrefPublicKey *pucPublicKey);
int TSAPI_SDF_ExportEncPublicKey_ECC(void *hSessionHandle,
                                      unsigned int uiKeyIndex,
                                      OSSL_ECCrefPublicKey *pucPublicKey);
int TSAPI_SDF_DestroyKey(void *hSessionHandle, void *hKeyHandle);
int TSAPI_SDF_InternalEncrypt_ECC(void *hSessionHandle, unsigned int uiISKIndex,
                                  unsigned char *pucData,
                                  unsigned int uiDataLength,
                                  OSSL_ECCCipher *pucEncData);
int TSAPI_SDF_InternalDecrypt_ECC(void *hSessionHandle, unsigned int uiISKIndex,
                                  OSSL_ECCCipher *pucEncData,
                                  unsigned char *pucData,
                                  unsigned int *puiDataLength);
int TSAPI_SDF_Encrypt(void *hSessionHandle, void *hKeyHandle,
    unsigned int uiAlgID, unsigned char *pucIV, unsigned char *pucData,
    unsigned int uiDataLength, unsigned char *pucEncData,
    unsigned int *puiEncDataLength);
int TSAPI_SDF_Decrypt(void *hSessionHandle, void *hKeyHandle,
    unsigned int uiAlgID, unsigned char *pucIV, unsigned char *pucEncData,
    unsigned int uiEncDataLength, unsigned char *pucData,
    unsigned int *puiDataLength);
int TSAPI_SDF_CalculateMAC(void *hSessionHandle, void *hKeyHandle,
    unsigned int uiAlgID, unsigned char *pucIV, unsigned char *pucData,
    unsigned int uiDataLength, unsigned char *pucMac,
    unsigned int *puiMACLength);
int TSAPI_SDF_GenerateKey(void *hSessionHandle, uint8_t type, uint8_t no_kek,
    uint32_t len, void **pkey_handle);
int TSAPI_SDF_InternalSign_ECC(void *hSessionHandle, unsigned int uiISKIndex,
                               unsigned char *pucData,
                               unsigned int uiDataLength,
                               OSSL_ECCSignature *pucSignature);

```

## 函数说明

TSAPI_SDF_OpenDevice()函数用于打开密码设备，获取密码设备句柄，设备句柄保存在*phDeviceHandle中。

TSAPI_SDF_CloseDevice()函数用于关闭密码设备。

TSAPI_SDF_OpenSession()函数用于打开会话，获取会话句柄，会话句柄保存在*phSessionHandle中。

TSAPI_SDF_CloseSession()函数用于关闭会话。

TSAPI_SDF_GenerateRandom()函数用于生成随机数，uiLength为随机数长度，生成的随机数保存在pucRandom缓冲区中。

TSAPI_SDF_GetPrivateKeyAccessRight()函数用于获取私钥访问权限，uiKeyIndex为私钥索引，pucPassword为私钥密码，uiPwdLength为密码长度。

TSAPI_SDF_ReleasePrivateKeyAccessRight()函数用于释放私钥访问权限。

TSAPI_SDF_ImportKeyWithISK_ECC()函数用于导入ECC密钥，uiISKIndex为密钥索引，pucKey为密钥，phKeyHandle保存密钥句柄。

TSAPI_SDF_ImportKeyWithKEK()函数用于导入密钥，uiAlgID为密钥算法ID，uiKEKIndex为KEK索引，pucKey为密钥，puiKeyLength为密钥长度，
phKeyHandle保存密钥句柄。

TSAPI_SDF_ExportSignPublicKey_ECC()函数用于导出签名公钥，uiKeyIndex为密钥索引，pucPublicKey保存公钥。

TSAPI_SDF_ExportEncPublicKey_ECC()函数用于导出加密公钥，uiKeyIndex为密钥索引，pucPublicKey保存公钥。

TSAPI_SDF_DestroyKey()函数用于销毁密钥。

TSAPI_SDF_InternalEncrypt_ECC()函数用于内部加密，uiISKIndex为密钥索引，pucData为待加密数据，uiDataLength为数据长度，pucEncData保存
加密数据。

TSAPI_SDF_InternalDecrypt_ECC()函数用于内部解密，uiISKIndex为密钥索引，pucEncData为待解密数据，pucData保存解密数据，puiDataLength
保存解密数据长度。

TSAPI_SDF_Encrypt()函数用于加密，pucIV为初始化向量，pucData为待加密数据，uiDataLength为数据长度，pucEncData保存加密数据，
puiEncDataLength保存加密数据长度。

TSAPI_SDF_Decrypt()函数用于解密，pucIV为初始化向量，pucEncData为待解密数据，uiEncDataLength为数据长度，pucData保存解密数据，
puiDataLength保存解密数据长度。

TSAPI_SDF_CalculateMAC()函数用于计算MAC，pucIV为初始化向量，pucData为待计算MAC数据，uiDataLength为数据长度，pucMac保存MAC，
puiMACLength保存MAC长度。

TSAPI_SDF_GenerateKey()函数用于生成密钥，type为密钥类型，no_kek为KEK索引，len为密钥长度，pkey_handle保存密钥句柄。

TSAPI_SDF_InternalSign_ECC()函数用于内部签名，uiISKIndex为密钥索引，pucData为待签名数据，uiDataLength为数据长度，pucSignature保存
签名。

## 返回值说明

TSAPI_SDF_*函数返回值为0（OSSL_SDR_OK）表示成功，其他值表示错误码，具体的错误码见sdf.h。

错误码定义参考GM/T 0018-2023 密码设备应用接口规范 附录A.1。

## 示例

示例：使用密码设备上的SM2加密公钥加密数据。

```c
#include <string.h>
#include <openssl/crypto.h>
#include <openssl/sdf.h>

int main()
{
    unsigned int isk = 1;
    unsigned char in[] = "hello world";
    unsigned int inlen = strlen(in);
    void *hDeviceHandle = NULL;
    void *hSessionHandle = NULL;
    OSSL_ECCCipher *ecc = NULL;

    if (TSAPI_SDF_OpenDevice(&hDeviceHandle) != OSSL_SDR_OK)
        return NULL;

    if (TSAPI_SDF_OpenSession(hDeviceHandle, &hSessionHandle) != OSSL_SDR_OK)
        goto end;

    ecc = OPENSSL_zalloc(sizeof(OSSL_ECCCipher) + inlen);
    if (ecc == NULL)
        goto end;

    if (TSAPI_SDF_InternalEncrypt_ECC(hSessionHandle, isk, in, inlen, ecc)
            != OSSL_SDR_OK)
        goto end;

    // ecc contains the encrypted data

end:
    OPENSSL_free(ecc);
    TSAPI_SDF_CloseSession(hSessionHandle);
    TSAPI_SDF_CloseDevice(hDeviceHandle);

    return 0;
}
```

## 历史

TSAPI_*函数在Tongsuo 8.5.0版本中引入。
