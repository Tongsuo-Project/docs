---
sidebar_position: 7
---

# SM4-NI 性能优化

## 概述

在x86的 CPU 上，可以利用 AES-NI 指令集以及 SIMD 指令集对 SM4 的 CTR 和 GCM 等模式进行性能优化，可实现130%左右的性能提升（即为未优化版本的2.5倍左右）。

## 性能对比数据

以铜锁8.3系列版本为例：

测试环境：macOS 11.7 / 2.4 GHz Quad-Core Intel Core i5 / 16 GB 2133 MHz LPDDR3

测试程序：tongsuo/babassl speed

性能数据对比：

| SM4 GCM |  |  |  |  |  |
| --- | --- | --- | --- | --- | --- |
| 数据块大小（字节） | 64 | 256 | 1024 | 8192 | 16384 |
| Tongsuo 8.3（无优化） | 114MB/s | 118MB/s | 118MB/s | 118MB/s | 118MB/s |
| Tongsuo 8.3（AESNI） | 258MB/s | 285MB/s | 285MB/s | 285MB/s | 285MB/s |

## 开启方法

本功能的实现，目前依赖于编译器提供的内嵌函数，因此需要在支持 `x86intrin.h` 的编译器上编译。
```bash
./Configure -march=native
make
```

## NOTICE

本功能基于了 Markku-Juhani O. Saarine 所率先发明的理论。
