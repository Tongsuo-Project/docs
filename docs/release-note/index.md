---
sidebar_position: 5
title: "版本发布"
---
import DocCardList from '@theme/DocCardList';

<DocCardList />

## 源码包

基于 Github Release 发布版本，下载页面：

https://github.com/Tongsuo-Project/Tongsuo/releases

| 版本    | 维护状态            |
|-------|-----------------|
| 8.4.x | 长期维护，至少维护至2029年 |
| 8.3.x | 长期维护，至少维护至2028年 |
| 8.2.x | 停止维护            |

## 生态软件

### curl，支持发送国密HTTPS请求

| 操作系统          | 文件               | 签名  |
|---------------|------------------|-----|
| Linux(x64)        | [curl-Linux-X64](https://gitee.com/Tongsuo/download/raw/master/curl-Linux-X64)       | [gpg](https://gitee.com/Tongsuo/download/raw/master/curl-Linux-X64.asc) |
| macOS(arm64) | [curl-macOS-ARM64](https://gitee.com/Tongsuo/download/raw/master/curl-macOS-ARM64)       | [gpg](https://gitee.com/Tongsuo/download/raw/master/curl-macOS-ARM64.asc) |
| macOS(x64) | [curl-macOS-X64](https://gitee.com/Tongsuo/download/raw/master/curl-macOS-X64)       | [gpg](https://gitee.com/Tongsuo/download/raw/master/curl-macOS-X64.asc) |
| Windows(x64)  | [curl-Windows-X64.exe](https://gitee.com/Tongsuo/download/raw/master/curl-Windows-X64.exe) | [gpg](https://gitee.com/Tongsuo/download/raw/master/curl-Windows-X64.exe.asc) |

### wrk，支持国密HTTPS性能测试

| 操作系统          | 文件               | 签名         |
|-----|-----|-----|
| Linux         | [wrk-Linux](https://gitee.com/Tongsuo/download/raw/master/wrk-Linux)       | [gpg](https://gitee.com/Tongsuo/download/raw/master/wrk-Linux.asc) |
| macOS(x86_64) | [wrk-macOS](https://gitee.com/Tongsuo/download/raw/master/wrk-macOS)       | [gpg](https://gitee.com/Tongsuo/download/raw/master/wrk-macOS.asc) |


### wget，支持从国密Web服务器下载文件

| 操作系统          | 文件               | 签名  |
|---------------|------------------|-----|
| Linux         | [wget-Linux](https://gitee.com/Tongsuo/download/raw/master/wget-Linux)       | [gpg](https://gitee.com/Tongsuo/download/raw/master/wget-Linux.asc) |
| macOS(x86_64) | [wget-macOS](https://gitee.com/Tongsuo/download/raw/master/wget-macOS)       | [gpg](https://gitee.com/Tongsuo/download/raw/master/wget-macOS.asc) |
| Windows       | [wget-Windows.exe](https://gitee.com/Tongsuo/download/raw/master/wget-Windows.exe) | [gpg](https://gitee.com/Tongsuo/download/raw/master/wget-Windows.exe.asc) |


## 项目公钥

Tongsuo 在发布新版本的时候，会使用项目的私钥对源码包或二进制进行签名，可以使用公钥进行验签，以防止内容被篡改。公钥内容如下：

* 版本号大于等于 8.4.1：[Tongsuo-public-new.key](./pk/tongsuo-202603.key)

* 版本号在 8.3.3 和 8.4.0 之间：[Tongsuo-public-old.key](https://gitee.com/Tongsuo/download/raw/master/Tongsuo-public.key)

* 版本号小于 8.3.3：[BabaSSL-public.key](https://gitee.com/Tongsuo/download/raw/master/BabaSSL-public.key)。

```bash
# 下载公钥后导入
gpg --import Tongsuo-public.key

# 下载软件和对应的签名文件

# 使用公钥验证签名
gpg --verify curl-Linux.asc curl-Linux
```