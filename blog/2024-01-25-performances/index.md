---
title: 关于性能的一些数据
authors: [InfoHunter]
tags: [性能]
---

选择版本：铜锁master，铜锁8.3，OpenSSL 3.0

性能指标：SM2加解密、签名验签、密钥生成、SM3哈希、SM4的ECB和CBC模式加解密

测试数据大小：1MB 的随机数据

测试环境：macOS 11.7 / 2.4 GHz Quad-Core Intel Core i5 / 16 GB 2133 MHz LPDDR3

测试程序：master/examples目录下的方式进行测试（见：[Tongsuo/examples/perf at master · Tongsuo-Project/Tongsuo](https://github.com/Tongsuo-Project/Tongsuo/tree/master/examples/perf)），单进程测试

| 铜锁 master | 铜锁8.3 | OpenSSL 3.0 |
| --- | --- | --- |
| sm2-enc: 285 Mbps| sm2-enc: 281 Mbps | sm2-enc: 282 Mbps |
sm2-dec: 291 Mbps | sm2-dec: 289 Mbps | sm2-dec: 296 Mbps |
sm2-sign: 2506/s | sm2-sign: 2364/s | sm2-sign: 2484/s |
sm2-verify: 2772/s | sm2-verify: 2673/s | sm2-verify: 2810/s |
sm2-keygen: 1973/s | sm2-keygen: 2038/s | sm2-keygen: 1968/s |
sm3-hash: 1863 Mbps | sm3-hash: 1826 Mbps | sm3-hash: 1908 Mbps |
sm4-ecb-enc: 908 Mbps | sm4-ecb-enc: 906 Mbps | sm4-ecb-enc: 902 Mbps |
sm4-cbc-enc: 864 Mbps | sm4-cbc-enc: 855 Mbps | sm4-cbc-enc: 854 Mbps |
sm4-ecb-dec: 919 Mbps | sm4-ecb-dec: 913 Mbps | sm4-ecb-dec: 905 Mbps |
sm4-cbc-dec: 921 Mbps | sm4-cbc-dec: 915 Mbps | sm4-cbc-dec: 917 Mbps |

【附录：基于apps/speed的部分测试】

```
SM4-CBC
铜锁master:
The 'numbers' are in 1000s of bytes per second processed.
type             16 bytes     64 bytes    256 bytes   1024 bytes   8192 bytes  16384 bytes
sm4             113645.27k   114115.80k   115176.88k   114105.11k   113833.18k   112978.60k
tongsuo-8.3:
The 'numbers' are in 1000s of bytes per second processed.
type             16 bytes     64 bytes    256 bytes   1024 bytes   8192 bytes  16384 bytes
sm4              19246.65k    49904.77k    80437.00k   100238.64k   106778.20k   106173.78k
openssl-3.0:
The 'numbers' are in 1000s of bytes per second processed.
type             16 bytes     64 bytes    256 bytes   1024 bytes   8192 bytes  16384 bytes
SM4-CBC         105532.58k   110182.79k   109867.86k   111192.36k   110362.62k   110890.64k
```

## SM2门限的性能数据

以下单位均为：次/秒

### 关闭SM2优化

普通SM2：

- keygen：5069
- 签名：5859
- 验签：6154

SM2门限：

- keygen：1850
- 签名：4967
- 验签：5019

### 开SM2优化

普通SM2：

- keygen：22560
- 签名：20327
- 验签：11325

SM2门限：

- keygen：5980
- 签名：8031
- 验签：8308

