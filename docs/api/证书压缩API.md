# 证书压缩API

## 功能简介

证书压缩，即Certificate Compression，是定义在RFC 8879，提供了一种对TLS握手过程中Certificate消息的压缩能力，从而实现减小TLS握手字节传输数量的目的。

## 数据结构和头文件

```c
#include <openssl/ssl.h>

typedef int (*SSL_cert_compress_cb_fn)(SSL *s,
                                       const unsigned char *in, size_t inlen,
                                       unsigned char *out, size_t *outlen);
typedef int (*SSL_cert_decompress_cb_fn)(SSL *s,
                                         const unsigned char *in, size_t inlen,
                                         unsigned char *out, size_t outlen);
```

函数指针说明：

SSL_cert_compress_cb_fn指向一个执行实际压缩动作的函数，该函数对in和inlen所定义的数据进行压缩，并将结果通过out和outlen返回。如果out为NULL，则该函数应当通过outlen返回计算后的压缩数据长度。该函数成功时返回1，失败时返回0.

SSL_cert_decompress_cb_fn的功能和SSL_cert_compress_cb_fn类似，不过提供的是解压缩的能力。

压缩算法定义：

```c
TLSEXT_cert_compression_zlib
TLSEXT_cert_compression_brotli
TLSEXT_cert_compression_zstd
```

以上三个宏分别对应ZLIB, Brotli和Zstandard三种压缩算法，这些压缩算法也是铜锁的证书压缩功能所支持的。

## SSL_add_cert_compression_alg

### 函数原型

```c
 int SSL_add_cert_compression_alg(SSL *s, int alg_id,
                                  SSL_cert_compress_cb_fn compress,
                                  SSL_cert_decompress_cb_fn decompress);
```

该函数向SSL对象s注册一组证书压缩算法的接口，包括对Certtificate消息进行压缩处理的compress回调函数，以及对CompressedCertifcate消息进行解压缩处理的decompress回调函数。压缩算法是通过alg_id参数指定的。

### 函数参数

| 参数 | 类型 | 说明 |
| --- | --- | --- |
| s | SSL |  |
| alg_id | int | 见[#DzCwD](#DzCwD) |
| compress | SSL_cert_compress_cb_fn | |
| decompress | SSL_cert_decompress_cb_fn | |

### 示例

无

### 返回值

| 返回值 | 含义 | 说明 |
| --- | --- | --- |
| 1 | 成功 | |
| 0 | 失败 | |

### 版本信息

Tongsuo/BabaSSL 8.3.0以及之后版本支持此特性。

### 注意事项

无

## SSL_CTX_add_cert_compression_alg

### 函数原型

```c
 int SSL_CTX_add_cert_compression_alg(SSL_CTX *ctx, int alg_id,
                                      SSL_cert_compress_cb_fn compress,
                                      SSL_cert_decompress_cb_fn decompress);
```

该函数是SSL_add_cert_compression_alg的变种版本，该函数是向一个SSL_CTX对象设置压缩和解压缩回调函数。

### 函数参数

| 参数 | 类型 | 说明 |
| --- | --- | --- |
| ctx | SSL_CTX |  |
| alg_id | int | 见[#DzCwD](#DzCwD) |
| compress | SSL_cert_compress_cb_fn | |
| decompress | SSL_cert_decompress_cb_fn | |

### 示例

```c
#include <openssl/ssl.h>
#include <zlib.h>

static int zlib_compress(SSL *s,
                         const unsigned char *in, size_t inlen,
                         unsigned char *out, size_t *outlen)
{

    if (out == NULL) {
        *outlen = compressBound(inlen);
        return 1;
    }

    if (compress2(out, outlen, in, inlen, Z_DEFAULT_COMPRESSION) != Z_OK)
        return 0;

    return 1;
}

static int zlib_decompress(SSL *s,
                           const unsigned char *in, size_t inlen,
                           unsigned char *out, size_t outlen)
{
    size_t len = outlen;

    if (uncompress(out, &len, in, inlen) != Z_OK)
        return 0;

    if (len != outlen)
        return 0;

    return 1;
}

int main() {
    const SSL_METHOD *meth = TLS_client_method();
    SSL_CTX *ctx = SSL_CTX_new(meth);

    /* 配置证书、私钥... */

    /* 例如：设置压缩算法为zlib */
    SSL_CTX_add_cert_compression_alg(ctx, TLSEXT_cert_compression_zlib,
                                     zlib_compress, zlib_decompress);

    SSL *con = SSL_new(ctx);

    /* 握手... */

    return 0;
}
```

### 返回值

| 返回值 | 含义 | 说明 |
| --- | --- | --- |
| 1 | 成功 | |
| 0 | 失败 | |

### 版本信息

Tongsuo/BabaSSL 8.3.0以及之后版本支持此特性。

### 注意事项

无

## SSL_get_cert_compression_compress_id

### 函数原型

```c
int SSL_get_cert_compression_compress_id(SSL *s);
```

该函数返回当前SSL对象s中所使用的压缩算法序号。

### 函数参数

| 参数 | 类型 | 说明 |
| --- | --- | --- |
| s | SSL |  |

### 示例

无

### 返回值

| 返回值 | 含义 | 说明 |
| --- | --- | --- |
| int | 压缩算法号码 | 该整数是一个压缩算法的号码 |
| 0 | 没有使用任何压缩算法 | |

### 版本信息

Tongsuo/BabaSSL 8.3.0以及之后版本支持此特性。

### 注意事项

无

## SSL_get_cert_compression_compress_id

### 函数原型

```c
int SSL_get_cert_decompression_compress_id(SSL *s);
```

该函数返回当前SSL对象s中所使用的解压缩算法序号。

### 函数参数

| 参数 | 类型 | 说明 |
| --- | --- | --- |
| s | SSL |  |

### 示例

无

### 返回值

| 返回值 | 含义 | 说明 |
| --- | --- | --- |
| int | 解压缩算法号码 | 该整数是一个压缩算法的号码 |
| 0 | 没有使用任何压缩算法 | |

### 版本信息

Tongsuo/BabaSSL 8.3.0以及之后版本支持此特性。

### 注意事项

无
