# Paillier API

## 功能简介

Paillier 是一个支持加法同态的公钥密码系统 ，由 Paillier 在1999年的欧密会（EUROCRYPT）上首次提出。此后，在 PKC'01 中提出了 Paillier 方案的简化版本26，是当前 Paillier 方案的最优方案。在众多 PHE 方案中，Paillier 方案由于效率较高、安全性证明完备的特点，在各大顶会和实际应用中被广泛使用，是隐私计算场景中最常用的PHE实例化方案之一。

Paillier 仅支持加法同态，故为半同态加密算法，支持密文加法、减法、标量乘法等操作，其中减法可以转换成加法加上负数、标量乘法可以转换成多个相同的项相加，所以均属于加法同态的范畴。

铜锁的 Paillier 实现功能主要包含：Paillier 公钥/私钥的生成和文本显示、明文数字加密和密文解密、密文加法/减法/标量乘法运行、密文数据编码/解码、speed 测试等。

## 数据结构和头文件

> 写需要include的头文件、数据结构、宏定义等，为接下来介绍函数做准备
>

```c
// 头文件
#include <openssl/paillier.h>

// paillier 公/私钥
PAILLIER_KEY *key;

// paillier 操作上下文
PAILLIER_CTX *ctx;

// paillier 密文，用于保存 paillier 加密结果
PAILLIER_CIPHERTEXT *c;

// paillier 类型标志位：目前仅实现了 g 参数优化的类型
# define PAILLIER_FLAG_G_OPTIMIZE             0x01

// PAILLIER_KEY_type 函数返回值，0 表示 paillier 公钥
# define PAILLIER_KEY_TYPE_PUBLIC             0
// PAILLIER_KEY_type 函数返回值，1 表示 paillier 私钥
# define PAILLIER_KEY_TYPE_PRIVATE            1

// paillier 运算支持的最大阈值
# define PAILLIER_MAX_THRESHOLD               ((((uint64_t)1) << 63) - 1)
```

## PAILLIER_KEY_new
### 函数原型
```c
PAILLIER_KEY *PAILLIER_KEY_new(void);
```

该函数用于创建 paillier key，公钥和私钥均使用该函数创建。

### 函数参数
| 参数 | 类型 | 说明 |
| --- | --- | --- |
| 无 |  |  |


### 示例
无

### 返回值
| 返回值 | 含义 | 说明 |
| --- | --- | --- |
| PAILLIER_KEY * | PAILLIER_KEY 对象指针 | |
| NULL | 失败 | |


### 版本信息
Tongsuo-8.4.0 以及之后版本支持此特性。

### 注意事项
函数的返回值需要调用方调用 PAILLIER_KEY_free 来释放其内存。

## PAILLIER_KEY_free
### 函数原型
```c
void PAILLIER_KEY_free(PAILLIER_KEY *key);
```

该函数用于释放 PAILLIER_KEY 对象内存，当引用计数大于0时不会真正的释放内存而只是将引用计数减1，当引用计数减到0时才会真正释放内存。

### 函数参数
| 参数 | 类型 | 说明 |
| --- | --- | --- |
| key | PAILLIER_KEY * |  key 指针 |


### 示例
无

### 返回值
| 返回值 | 含义 | 说明 |
| --- | --- | --- |
| 无 |  | |


### 版本信息
Tongsuo-8.4.0 以及之后版本支持此特性。

### 注意事项
无

## PAILLIER_KEY_copy
### 函数原型
```c
PAILLIER_KEY *PAILLIER_KEY_copy(PAILLIER_KEY *dest, PAILLIER_KEY *src);
```

该函数用于拷贝 PAILLIER_KEY 对象内容，将 src 指针所指的 PAILLIER_KEY 对象拷贝到 dest 指针内存中，dest 和 src 不能为空。

### 函数参数
| 参数 | 类型 | 说明 |
| --- | --- | --- |
| src | PAILLIER_KEY * | 源对象指针 |
| dest | PAILLIER_KEY * | 目标对象指针 |


### 示例
无

### 返回值
| 返回值 | 含义 | 说明 |
| --- | --- | --- |
| PAILLIER_KEY | PAILLIER_KEY 对象指针 | 正常时返回 dest 指针值 |
| NULL | | |


### 版本信息
Tongsuo-8.4.0 以及之后版本支持此特性。

### 注意事项
无

## PAILLIER_KEY_dup
### 函数原型
```c
PAILLIER_KEY *PAILLIER_KEY_dup(PAILLIER_KEY *key);
```

该函数用于（深拷贝）复制 PAILLIER_KEY 对象。

### 函数参数
| 参数 | 类型 | 说明 |
| --- | --- | --- |
| key | PAILLIER_KEY * |  |


### 示例
无

### 返回值
| 返回值 | 含义 | 说明 |
| --- | --- | --- |
| PAILLIER_KEY | 复制的 PAILLIER_KEY 对象指针 | PAILLIER_KEY 对象指针是 new 出来再复制的，该指针需要自己释放 |
| NULL | | |


### 版本信息
Tongsuo-8.4.0 以及之后版本支持此特性。

### 注意事项
需要调用 PAILLIER_KEY_free 来释放对象内存。

## PAILLIER_KEY_up_ref
### 函数原型
```c
int PAILLIER_KEY_up_ref(PAILLIER_KEY *key)；
```

该函数是将 PAILLIER_KEY 的引用计数加1。

### 函数参数
| 参数 | 类型 | 说明 |
| --- | --- | --- |
| key | PAILLIER_KEY * |  |


### 示例
无

### 返回值
| 返回值 | 含义 | 说明 |
| --- | --- | --- |
| 1 | 正常 | |
| 0 | 出错 | |


### 版本信息
Tongsuo-8.4.0 以及之后版本支持此特性。

### 注意事项
无

## PAILLIER_KEY_generate_key
### 函数原型
```c
int PAILLIER_KEY_generate_key(PAILLIER_KEY *key, int bits);
```

该函数用来生成 PAILLIER_KEY 的参数：p、q、n、lambda、u 等。

### 函数参数
| 参数 | 类型 | 说明 |
| --- | --- | --- |
|  key | PAILLIER_KEY |  |
| bits | int | 随机素数 p、q 的二进制位长度 |


### 示例
无

### 返回值
| 返回值 | 含义 | 说明 |
| --- | --- | --- |
| 1 | 正常 | |
| 0 | 出错 | |


### 版本信息
Tongsuo-8.4.0 以及之后版本支持此特性。

### 注意事项
无

## PAILLIER_KEY_type
### 函数原型
```c
int PAILLIER_KEY_type(PAILLIER_KEY *key);
```

该函数是用来获取 key 的类型：公钥 or 私钥。

### 函数参数
| 参数 | 类型 | 说明 |
| --- | --- | --- |
| key | PAILLIER_KEY * |  |


### 示例
无

### 返回值
| 返回值 | 含义 | 说明 |
| --- | --- | --- |
| PAILLIER_KEY_TYPE_PUBLIC | 公钥 | 值为0 |
| PAILLIER_KEY_TYPE_PRIVATE | 私钥 | 值为1 |


### 版本信息
Tongsuo-8.4.0 以及之后版本支持此特性。

### 注意事项
无

## PAILLIER_CTX_new
### 函数原型
```c
PAILLIER_CTX *PAILLIER_CTX_new(PAILLIER_KEY *key, int64_t threshold);
```

该函数用于创建 PAILLIER_CTX，在后续进行 PAILLIER 操作时需要使用此上下文。

### 函数参数
| 参数 | 类型 | 说明 |
| --- | --- | --- |
| key | PAILLIER_KEY * | paillier 公钥/私钥 |
| threshold | int64_t | paillier 解密支持最大的数字阈值，加密场景用不到，解密场景可使用默认值：PAILLIER_MAX_THRESHOLD |


### 示例
无

### 返回值
| 返回值 | 含义 | 说明 |
| --- | --- | --- |
| PAILLIER_CTX * | PAILLIER_CTX 对象指针 | |
| NULL | 失败 | |


### 版本信息
Tongsuo-8.4.0 以及之后版本支持此特性。

### 注意事项
函数的返回值需要调用方调用 PAILLIER_CTX_free 来释放其内存。

## PAILLIER_CTX_free
### 函数原型
```c
void PAILLIER_CTX_free(PAILLIER_CTX *ctx);
```

该函数用于释放 PAILLIER_CTX 对象内存。

### 函数参数
| 参数 | 类型 | 说明 |
| --- | --- | --- |
| ctx | PAILLIER_CTX * |  ctx 指针 |


### 示例
无

### 返回值
| 返回值 | 含义 | 说明 |
| --- | --- | --- |
| 无 |  | |


### 版本信息
Tongsuo-8.4.0 以及之后版本支持此特性。

### 注意事项
无

## PAILLIER_CTX_copy
### 函数原型
```c
PAILLIER_CTX *PAILLIER_KEY_copy(PAILLIER_CTX *dest, PAILLIER_CTX *src);
```

该函数用于拷贝 PAILLIER_CTX 对象内容，将 src 指针所指的 PAILLIER_CTX 对象拷贝到 dest 指针内存中，dest 和 src 不能为空。

### 函数参数
| 参数 | 类型 | 说明 |
| --- | --- | --- |
| src | PAILLIER_CTX * | 源对象指针 |
| dest | PAILLIER_CTX * | 目标对象指针 |


### 示例
无

### 返回值
| 返回值 | 含义 | 说明 |
| --- | --- | --- |
| PAILLIER_CTX | PAILLIER_CTX 对象指针 | 正常时返回 dest 指针值 |
| NULL | | |


### 版本信息
Tongsuo-8.4.0 以及之后版本支持此特性。

### 注意事项
无

## PAILLIER_CTX_dup
### 函数原型
```c
PAILLIER_CTX *PAILLIER_CTX_dup(PAILLIER_CTX *src);
```

该函数用于（深拷贝）复制 PAILLIER_CTX 对象。

### 函数参数
| 参数 | 类型 | 说明 |
| --- | --- | --- |
| src | PAILLIER_CTX * |  |


### 示例
无

### 返回值
| 返回值 | 含义 | 说明 |
| --- | --- | --- |
| PAILLIER_CTX | 复制的 PAILLIER_CTX 对象指针 | PAILLIER_CTX 对象指针是 new 出来再复制的，该指针需要自己释放 |
| NULL | | |


### 版本信息
Tongsuo-8.4.0 以及之后版本支持此特性。

### 注意事项
需要调用 PAILLIER_CTX_free 来释放对象内存。

## PAILLIER_CIPHERTEXT_new
### 函数原型
```c
PAILLIER_CIPHERTEXT *PAILLIER_CIPHERTEXT_new(PAILLIER_CTX *ctx);
```

该函数用于创建 PAILLIER_CIPHERTEXT 对象，之后可用来保存加密以及 paillier 同态运算结果。

### 函数参数
| 参数 | 类型 | 说明 |
| --- | --- | --- |
| ctx | PAILLIER_CTX * | 上下文指针 |


### 示例
无

### 返回值
| 返回值 | 含义 | 说明 |
| --- | --- | --- |
| PAILLIER_CIPHERTEXT * | PAILLIER_CIPHERTEXT 对象指针 | |
| NULL | 失败 | |


### 版本信息
Tongsuo-8.4.0 以及之后版本支持此特性。

### 注意事项
函数的返回值需要调用方调用 PAILLIER_CIPHERTEXT_free 来释放其内存。

## PAILLIER_CIPHERTEXT_free
### 函数原型
```c
void PAILLIER_CIPHERTEXT_free(PAILLIER_CIPHERTEXT *ciphertext);
```

该函数用于释放 PAILLIER_CIPHERTEXT 对象内存。

### 函数参数
| 参数 | 类型 | 说明 |
| --- | --- | --- |
| ciphertext | PAILLIER_CIPHERTEXT * |  ciphertext 指针 |


### 示例
无

### 返回值
| 返回值 | 含义 | 说明 |
| --- | --- | --- |
| 无 |  | |


### 版本信息
Tongsuo-8.4.0 以及之后版本支持此特性。

### 注意事项
无

## PAILLIER_CIPHERTEXT_encode
### 函数原型
```c
size_t PAILLIER_CIPHERTEXT_encode(PAILLIER_CTX *ctx, unsigned char *out,
                                  size_t size,
                                  const PAILLIER_CIPHERTEXT *ciphertext,
                                  int flag);
```

该函数是 paillier 密文的编码函数，将 ciphertext 编码为二进制格式，结果保存到 out 指针中，若 out 为 NULL，则返回编码所需的字节长度。

### 函数参数
| 参数 | 类型 | 说明 |
| --- | --- | --- |
| ctx | PAILLIER_CTX * | 上下文指针 |
| out | unsigned char * | 编码结果输出地址 |
| size | size_t | out 指针内存大小，需要大于等于编码的输出大小 |
| ciphertext | const PAILLIER_CIPHERTEXT * | paillier 密文指针 |
| flag | int | 标志位，预留，暂时没有用 |


### 示例
无

### 返回值
| 返回值 | 含义 | 说明 |
| --- | --- | --- |
| size_t | 编码输出结果的长度 | 单位：字节 |
| 0 | 失败 | |


### 版本信息
Tongsuo-8.4.0 以及之后版本支持此特性。

### 注意事项
无

## PAILLIER_CIPHERTEXT_decode
### 函数原型
```c
int PAILLIER_CIPHERTEXT_decode(PAILLIER_CTX *ctx, PAILLIER_CIPHERTEXT *r,
                               unsigned char *in, size_t size);
```

该函数用于创建 PAILLIER_CIPHERTEXT 对象，之后可用来保存加密以及 paillier 同态运算结果。

### 函数参数
| 参数 | 类型 | 说明 |
| --- | --- | --- |
| ctx | PAILLIER_CTX * | paillier 公钥/私钥 |
| r | PAILLIER_CIPHERTEXT * | 解码结果保存地址，需要提前分配该指针内存 |
| in | unsigned char * | 需要解码的二进制内存地址 |
| size | size_t | in 指针字节大小 |


### 示例
无

### 返回值
| 返回值 | 含义 | 说明 |
| --- | --- | --- |
| 1 | 成功 | |
| 0 | 失败 | |


### 版本信息
Tongsuo-8.4.0 以及之后版本支持此特性。

### 注意事项
无

## PAILLIER_encrypt
### 函数原型
```c
int PAILLIER_encrypt(PAILLIER_CTX *ctx, PAILLIER_CIPHERTEXT *out, int32_t m);
```

该函数是 paillier 加密函数，用来加密明文 m，密文结果放到 out 指针中。

### 函数参数
| 参数 | 类型 | 说明 |
| --- | --- | --- |
| ctx | PAILLIER_CTX * | PAILLIER 操作上下文指针 |
| out | PAILLIER_CIPHERTEXT * | 加密结果输出指针 |
| m | int32_t | 要加密的明文 |


### 示例
无

### 返回值
| 返回值 | 含义 | 说明 |
| --- | --- | --- |
| 1 | 正常 | |
| 0 | 出错 | |


### 版本信息
Tongsuo-8.4.0 以及之后版本支持此特性。

### 注意事项
无

## PAILLIER_decrypt
### 函数原型
```c
int PAILLIER_decrypt(PAILLIER_CTX *ctx, int32_t *out, PAILLIER_CIPHERTEXT *c);
```

该函数是 paillier 解密函数，用来解密密文 c，结果放到 out 指针中。

### 函数参数
| 参数 | 类型 | 说明 |
| --- | --- | --- |
| ctx | PAILLIER_CTX * | PAILLIER 操作上下文指针 |
| out | int32_t * | 解密结果输出指针 |
| c | PAILLIER_CIPHERTEXT * | 要解密的 PAILLIER 密文 |


### 示例
无

### 返回值
| 返回值 | 含义 | 说明 |
| --- | --- | --- |
| 1 | 正常 | |
| 0 | 出错 | |


### 版本信息
Tongsuo-8.4.0 以及之后版本支持此特性。

### 注意事项
无

## PAILLIER_add
### 函数原型
```c
int PAILLIER_add(PAILLIER_CTX *ctx, PAILLIER_CIPHERTEXT *r,
                 PAILLIER_CIPHERTEXT *c1, PAILLIER_CIPHERTEXT *c2);
```

该函数是 paillier 密文加法函数，将密文 c1 和 c2 进行加法操作，结果保存到 r 中，表达式为：E(r) = E(c1 + c2) = E(c1) * E(c2)，E表示密文。

### 函数参数
| 参数 | 类型 | 说明 |
| --- | --- | --- |
| ctx | PAILLIER_CTX * | PAILLIER 操作上下文指针 |
| r | PAILLIER_CIPHERTEXT * | 保存加法操作结果对象指针，非空 |
| c1 | PAILLIER_CIPHERTEXT * | 第一个操作数密文指针，非空 |
| c2 | PAILLIER_CIPHERTEXT * | 第二个操作数密文指针，非空 |


### 示例
无

### 返回值
| 返回值 | 含义 | 说明 |
| --- | --- | --- |
| 1 | 正常 | |
| 0 | 出错 | |


### 版本信息
Tongsuo-8.4.0 以及之后版本支持此特性。

### 注意事项
无

## PAILLIER_add_plain
### 函数原型
```c
int PAILLIER_add_plain(PAILLIER_CTX *ctx, PAILLIER_CIPHERTEXT *r,
                       PAILLIER_CIPHERTEXT *c1, int32_t m);
```

该函数是 paillier 密文加法函数，将密文 c1 和明文 m 进行加法操作，结果保存到 r 中，表达式为：E(r) = E(c1 + m) = E(c1) * g<sup>m</sup>，E表示密文。

### 函数参数
| 参数 | 类型 | 说明 |
| --- | --- | --- |
| ctx | PAILLIER_CTX * | PAILLIER 操作上下文指针 |
| r | PAILLIER_CIPHERTEXT * | 保存加法操作结果对象指针，非空 |
| c1 | PAILLIER_CIPHERTEXT * | 第一个操作数密文指针，非空 |
| m | int32_t | 第二个操作数：明文 |


### 示例
无

### 返回值
| 返回值 | 含义 | 说明 |
| --- | --- | --- |
| 1 | 正常 | |
| 0 | 出错 | |


### 版本信息
Tongsuo-8.4.0 以及之后版本支持此特性。

### 注意事项
无

## PAILLIER_sub
### 函数原型
```c
int PAILLIER_sub(PAILLIER_CTX *ctx, PAILLIER_CIPHERTEXT *r,
                 PAILLIER_CIPHERTEXT *c1, PAILLIER_CIPHERTEXT *c2);
```

该函数是 paillier 密文减法函数，将密文 c1 和 c2 进行减法操作，结果保存到 r 中，表达式为：E(r) = E(c1 - c2) = E(c1) * E(-c2) = E(c1)/E(c2)，E表示密文。

### 函数参数
| 参数 | 类型 | 说明 |
| --- | --- | --- |
| ctx | PAILLIER_CTX * | PAILLIER 操作上下文指针 |
| r | PAILLIER_CIPHERTEXT * | 保存加法操作结果对象指针，非空 |
| c1 | PAILLIER_CIPHERTEXT * | 第一个操作数密文指针，非空 |
| c2 | PAILLIER_CIPHERTEXT * | 第二个操作数密文指针，非空 |


### 示例
无

### 返回值
| 返回值 | 含义 | 说明 |
| --- | --- | --- |
| 1 | 正常 | |
| 0 | 出错 | |


### 版本信息
Tongsuo-8.4.0 以及之后版本支持此特性。

### 注意事项
无

## PAILLIER_mul
### 函数原型
```c
int PAILLIER_mul(PAILLIER_CTX *ctx, PAILLIER_CIPHERTEXT *r,
                 PAILLIER_CIPHERTEXT *c, int32_t m);
```

该函数是 paillier 密文标量乘法函数，将密文 c 和明文 m 进行乘法操作，结果保存到 r 中，表达式为：E(r) = E(c * m) = E(c) <sup>m</sup>，E表示密文。

### 函数参数
| 参数 | 类型 | 说明 |
| --- | --- | --- |
| ctx | PAILLIER_CTX * | PAILLIER 操作上下文指针 |
| r | PAILLIER_CIPHERTEXT * | 保存加法操作结果对象指针，非空 |
| c | PAILLIER_CIPHERTEXT * | 第一个操作数密文指针，非空 |
| m | int32_t | 第二个操作数：明文 |


### 示例
无

### 返回值
| 返回值 | 含义 | 说明 |
| --- | --- | --- |
| 1 | 正常 | |
| 0 | 出错 | |


### 版本信息
Tongsuo-8.4.0 以及之后版本支持此特性。

### 注意事项
无

## PAILLIER_KEY_print
### 函数原型
```c
int PAILLIER_KEY_print(BIO *bp, const PAILLIER_KEY *key, int indent);
```

该函数是 paillier key 的打印函数，可以以文本格式输出 key 中的参数信息。

### 函数参数
| 参数 | 类型 | 说明 |
| --- | --- | --- |
| bp | BIO * |  |
| key | PAILLIER_KEY * |  |
| indent | int | 缩进空格数 |


### 示例
```bash
$ ./apps/openssl paillier -pub -in ./paillier-pub.pem -text -noout
Paillier Public Key:
n:
    2f:02:e4:bf:41:63:0c:90:fa:a4:24:4b:64:4f:0b:
    1b:85:e1:90:f6:c3:e3:99:c0:a1:56:47:9b:e3:65:
    e9:da:ab:22:49:a0:e4:2a:5a:47:92:6e:0e:83:fa:
    e5:07:91:32:e9:ba:9f:12:1f:1d:bf:52:f5:bf:7f:
    12:9c:aa:71
g:
    2f:02:e4:bf:41:63:0c:90:fa:a4:24:4b:64:4f:0b:
    1b:85:e1:90:f6:c3:e3:99:c0:a1:56:47:9b:e3:65:
    e9:da:ab:22:49:a0:e4:2a:5a:47:92:6e:0e:83:fa:
    e5:07:91:32:e9:ba:9f:12:1f:1d:bf:52:f5:bf:7f:
    12:9c:aa:72
```

### 返回值
| 返回值 | 含义 | 说明 |
| --- | --- | --- |
| 1 | 正常 | |
| 0 | 出错 | |


### 版本信息
Tongsuo-8.4.0 以及之后版本支持此特性。

### 注意事项
无

## PAILLIER_KEY_print_fp
### 函数原型
```c
int PAILLIER_KEY_print_fp(FILE *fp, const PAILLIER_KEY *key, int indent);
```

与 `PAILLIER_KEY_print`类似，只不过是输出到文件。

### 函数参数
| 参数 | 类型 | 说明 |
| --- | --- | --- |
| fp | FILE * | key 文件句柄 |
| key | PAILLIER_KEY * |  |
| indent | int | 缩进空格数 |


### 示例
无

### 返回值
| 返回值 | 含义 | 说明 |
| --- | --- | --- |
| 1 | 正常 | |
| 0 | 出错 | |


### 版本信息
Tongsuo-8.4.0 以及之后版本支持此特性。

### 注意事项
无

## PEM_read_PAILLIER_PrivateKey/PEM_read_bio_PAILLIER_PrivateKey
### 函数原型
```c
PAILLIER_KEY *PEM_read_PAILLIER_PrivateKey(FILE *fp, PAILLIER_KEY **x, 
                                           pem_password_cb *cb, void *u);
PAILLIER_KEY *PEM_read_bio_PAILLIER_PrivateKey(BIO *bp, PAILLIER_KEY **x, pem_password_cb *cb, void *u);
```

从文件中读取 paillier 私钥文件并解析到 PAILLIER_KEY 结构中。

### 函数参数
| 参数 | 类型 | 说明 |
| --- | --- | --- |
| fp | FILE * | 私钥文件句柄 |
| bp | BIO * | |
| x | PAILLIER_KEY ** | 如果为 NULL 则忽略该参数；<br/>如果 x 不为 NULL 但 *x 为 NULL，则返回的结构指针会被写入 *x |
| cb | pem_password_cb * | pem 文件密码回调函数，暂时用不到，先设为 NULL |
| u | void * | |


### 示例
无

### 返回值
| 返回值 | 含义 | 说明 |
| --- | --- | --- |
| PAILLIER_KEY * | 解析后的 PAILLIER_KEY 结构指针 | 需要调用 PAILLIER_KEY_free 来释放 |
| NULL | 出错 | |


### 版本信息
Tongsuo-8.4.0 以及之后版本支持此特性。

### 注意事项
无

## PEM_write_PAILLIER_PrivateKey/PEM_write_bio_PAILLIER_PrivateKey
### 函数原型
```c
int PEM_write_PAILLIER_PrivateKey(FILE *fp, const PAILLIER_KEY *x);
int PEM_write_bio_PAILLIER_PrivateKey(BIO *bp, const PAILLIER_KEY *x);
```

将 PAILLIER_KEY 结构以 PEM 私钥格式写入文件中。

### 函数参数
| 参数 | 类型 | 说明 |
| --- | --- | --- |
| fp | FILE * | 私钥文件句柄 |
| bp | BIO * | |
| x | PAILLIER_KEY * | 私钥指针 |


### 示例
无

### 返回值
| 返回值 | 含义 | 说明 |
| --- | --- | --- |
| 1 | 成功 |  |
| 0 | 出错 | |


### 版本信息
Tongsuo-8.4.0 以及之后版本支持此特性。

### 注意事项
无

## PEM_read_PAILLIER_PublicKey/PEM_read_bio_PAILLIER_PublicKey
### 函数原型
```c
PAILLIER_KEY *PEM_read_PAILLIER_PublicKey(FILE *fp, PAILLIER_KEY **x, 
                                           pem_password_cb *cb, void *u);
PAILLIER_KEY *PEM_read_bio_PAILLIER_PublicKey(BIO *bp, PAILLIER_KEY **x, pem_password_cb *cb, void *u);
```

从文件中读取 paillier 公钥文件并解析到 PAILLIER_KEY 结构中。

### 函数参数
| 参数 | 类型 | 说明 |
| --- | --- | --- |
| fp | FILE * | 公钥文件句柄 |
| bp | BIO * | |
| x | PAILLIER_KEY ** | 如果为 NULL 则忽略该参数；<br/>如果 x 不为 NULL 但 *x 为 NULL，则返回的结构指针会被写入 *x |
| cb | pem_password_cb * | pem 文件密码回调函数，暂时用不到，先设为 NULL |
| u | void * | |


### 示例
无

### 返回值
| 返回值 | 含义 | 说明 |
| --- | --- | --- |
| PAILLIER_KEY * | 解析后的 PAILLIER_KEY 结构指针 | 需要调用 PAILLIER_KEY_free 来释放 |
| NULL | 出错 | |


### 版本信息
Tongsuo-8.4.0 以及之后版本支持此特性。

### 注意事项
无

## PEM_write_PAILLIER_PublicKey/PEM_write_bio_PAILLIER_PublicKey
### 函数原型
```c
int PEM_write_PAILLIER_PublicKey(FILE *fp, const PAILLIER_KEY *x);
int PEM_write_bio_PAILLIER_PublicKey(BIO *bp, const PAILLIER_KEY *x);
```

将 PAILLIER_KEY 结构以 PEM 公钥格式写入文件中。

### 函数参数
| 参数 | 类型 | 说明 |
| --- | --- | --- |
| fp | FILE * | 公钥文件句柄 |
| bp | BIO * | |
| x | PAILLIER_KEY * | 公钥指针 |


### 示例
无

### 返回值
| 返回值 | 含义 | 说明 |
| --- | --- | --- |
| 1 | 成功 |  |
| 0 | 出错 | |


### 版本信息
Tongsuo-8.4.0 以及之后版本支持此特性。

### 注意事项
无

