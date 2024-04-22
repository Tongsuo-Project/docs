---
sidebar_position: 11
---
# wrk + 铜锁，测试国密性能

[wg/wrk](https://github.com/wg/wrk) 基于 OpenSSL，用于测试 HTTPS 性能。

[铜锁 wrk](https://github.com/Tongsuo-Project/wrk) 基于原有的 wrk 项目，适配 wrk + 铜锁密码库，支持国密 HTTPS，即 HTTP over TLCP，方便大家用于测试国密 HTTPS 性能。

## 新增命令行参数

    ```bash
    -n, --ntls             Use NTLS (TLCP) instead of TLS，使用国密TLCP通信
    -C, --cipher      <S>  Cipher list，设置密码套件，例如ECC-SM2-SM4-CBC-SM3
    -S, --sign_cert   <F>  Signature certificate，设置客户端的签名证书
    -K, --sign_key    <F>  Signature key，设置客户端的签名私钥
    -E, --enc_cert    <F>  Encryption certificate，设置客户端的加密证书
    -Y, --enc_key     <F>  Encryption key，设置客户端的加密私钥
    ```

## 铜锁官网下载 wrk

[https://www.tongsuo.net/releases/](https://www.tongsuo.net/releases/)

## 基于源码构建 wrk

```bash
# wrk基于铜锁密码库测试国密性能，需要先构建铜锁密码库
git clone https://github.com/Tongsuo-Project/Tongsuo

cd Tongsuo
./config --prefix=/opt/tongsuo enable-ntls
make -j
make install

cd ../

git clone https://github.com/Tongsuo-Project/wrk

cd wrk

WITH_OPENSSL=/opt/tongsuo/ LDFLAGS=-Wl,-rpath=/opt/tongsuo/lib64/ make

```

## 性能测试

```bash
# 测试ECC-SM2-SM4-CBC-SM3
./wrk -t2 -c100 -d10 -n --cipher "ECC-SM2-SM4-CBC-SM3" https://127.0.0.1


# 测试ECDHE-SM2-SM4-CBC-SM3，需要配置客户端的签名和加密的证书和私钥
./wrk -t2 -c100 -d10 -n --cipher "ECDHE-SM2-SM4-CBC-SM3" --sign_cert /path/to/sm2_sign.crt  --sign_key /path/to/sm2_sign.key --enc_cert /path/to/sm2_enc.crt  --enc_key /path/to/sm2_enc.key https://127.0.0.1 
```
