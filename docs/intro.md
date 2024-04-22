---
sidebar_position: 1
slug: /
title: 关于铜锁
---
[![github actions ci badge](https://github.com/Tongsuo-Project/Tongsuo/workflows/GitHub%20CI/badge.svg)](https://github.com/Tongsuo-Project/Tongsuo/actions?query=workflow%3A%22GitHub+CI%22)
[![Coverage Status](https://coveralls.io/repos/github/Tongsuo-Project/Tongsuo/badge.svg?branch=master)](https://coveralls.io/github/Tongsuo-Project/Tongsuo?branch=master)

铜锁/Tongsuo 是一个提供现代密码学算法和安全通信协议的开源基础密码库，为存储、网络、密钥管理、隐私计算等诸多业务场景提供底层的密码学基础能力，实现数据在传输、使用、存储等过程中的私密性、完整性和可认证性，为数据生命周期中的隐私和安全提供保护能力。

![Tongsuo logo](/img/logo.png)

铜锁提供的主要功能有：

- 技术合规能力
  - 符合GM/T 0028《密码模块安全技术要求》的”软件密码模块安全一级”资质
- 零知识证明（ZKP）
  - Bulletproofs (Range)
  - Bulletproofs (R1CS)*
- 密码学算法
  - 中国商用密码算法：SM2、SM3、SM4、[祖冲之](https://www.yuque.com/tsdoc/ts/copzp3)等
  - 国际主流算法：ECDSA、RSA、AES、SHA等
  - 同态加密算法：[EC-ElGamal](https://www.yuque.com/tsdoc/misc/ec-elgamal)、[Paillier](https://www.yuque.com/tsdoc/misc/rdibad)等
  - 后量子密码学*：LAC、NTRU、Saber、Dilithium等
- 安全通信协议
  - 支持GB/T 38636-2020 TLCP标准，即[双证书国密](https://www.yuque.com/tsdoc/ts/hedgqf)通信协议
  - 支持[RFC 8998](https://datatracker.ietf.org/doc/html/rfc8998)，即TLS 1.3 +[国密单证书](https://www.yuque.com/tsdoc/ts/grur3x)
  - 支持[QUIC](https://datatracker.ietf.org/doc/html/rfc9000) API
  - 支持[Delegated Credentials](https://www.yuque.com/tsdoc/ts/leubbg)功能，基于[draft-ietf-tls-subcerts-10](https://www.ietf.org/archive/id/draft-ietf-tls-subcerts-10.txt)
  - 支持[TLS证书压缩](https://www.yuque.com/tsdoc/ts/df5pyi)
  - 支持紧凑TLS协议*
注：*号表示正在支持中

