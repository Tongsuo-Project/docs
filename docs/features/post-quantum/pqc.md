---
sidebar_position: 1
slug: /features/pqc
---
# 在铜锁中使用 PQC 建立 TLS 1.3 连接

目前铜锁提供了 SM2DH-MLKEM768-hybrid（curveSM2MLKEM768） 混合抗量子密码密钥交换算法。本文描述如何在编译选项中引入该算法参数以及如何在建立 TLS 1.3 连接时使用该参数。

铜锁的一些未发布版本中使用了 SM2DH-MLKEM768-hybrid 作为混合套件的名称，后面正式发布的版本会统一使用 https://datatracker.ietf.org/doc/html/draft-yang-tls-hybrid-sm2-mlkem-03 中定义的标准名称，即 curveSM2MLKEM768

## 编译（默认开启）

### 8.5.0 之前的版本

在 ./config 后加上对应的命令行选项：

```
./config enable-kyber enable-sm2dh-mlkem768-hybrid
```

通过下面的命令行选项禁用：

```
./config no-kyber no-sm2dh-mlkem768-hybrid
```

当 tls-1.3、ec、sm2 等相关特性被关闭时，sm2dh-mlkem768-hybrid 也会被关闭。

### 8.5.0 及之后的版本

默认开启，当 ML-KEM 和 SM2 等特性被关闭时会被一并关闭。

## 使用

可以通过 OpenSSL 命令行使用：

```
-groups curveSM2MLKEM768
```

也可以通过下面的 API 使用：

```
SSL_CTX_set1_groups_list(ctx, "curveSM2MLKEM768");
```
