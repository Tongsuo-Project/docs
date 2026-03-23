---
sidebar_position: 2
---
# 应用程序使用 Tongsuo 证书压缩功能（适用于 8.5.0 及之后的版本）

## 构建

启用 TLS 证书压缩功能需要在编译时启用压缩算法，目前支持的选项包括 enable-zlib、enable-brotli 以及 enable-zstd。开启其中任意一个即可支持证书压缩功能，也可以同时开启多个以支持多个证书压缩算法。
```bash
./Configure enable-zlib
```

## 示例程序

开启压缩算法后，客户端代码不需要改动即可支持证书压缩功能，服务端代码需要显式调用 SSL_CTX_compress_certs 或者 SSL_compress_certs 函数。
在 SSL_CTX 中启用证书压缩功能的示例代码如下：

```c
const SSL_METHOD *meth = TLS_server_method();
SSL_CTX *ctx = SSL_CTX_new(meth);

/*  
    其中的参数 0 代表根据编译时支持的压缩算法压缩证书，大多数情况下使用 0 即可。
    也可根据自己的需要使用 TLSEXT_comp_cert_zlib（1）、TLSEXT_comp_cert_brotli（2）以及 TLSEXT_comp_cert_zstd（3）。
 */
SSL_CTX_compress_certs(ctx, 0);

```

## 命令行

也可以使用 Tongsuo 提供的 s_client 和 s_server 来使用 TLS 证书压缩功能，其中 s_server 需要使用 -cert_comp 参数显式启用证书压缩，s_client 会根据编译时支持的算法默认启用：
```bash
# 服务端
/opt/babassl/bin/openssl s_server -accept 127.0.0.1:34567 -cert server.crt -key server.key -tls1_3 -cert_comp -www -quiet
```
