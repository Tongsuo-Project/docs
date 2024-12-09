# 1级密码模块使用说明

## 密码模块基本信息

3个1级密码模块的产品名称、版本号、代码分支、证书和检测报告如下：

|平台|产品名称|版本号|代码分支|证书|检测报告|
|---|---|---|---|---|---|
|Android|BabaSSL移动端软件密码模块|8.2.1|8.2.1-gm|[证书](../../static/pdf/BabaSSL移动端软件密码模块证书.pdf)|待补充|
|iOS|BabaSSL IOS端软件密码模块|8.3.0|8.3.0-gm|[证书](../../static/pdf/BabaSSL-IOS端软件密码模块证书.pdf)|待补充|
|Linux|应用安全软件密码模块（Linux版）|8.3.1|8.3.1-gm|[证书](../../static/pdf/应用安全软件密码模块（Linux版）证书.pdf)|[检测报告](../../static/pdf/应用安全软件密码模块（Linux版）-检测报告.pdf)|

## 构建和安装

Android构建：

```bash
git checkout 8.2.1-gm

# 构建测试版
# ./config --prefix=/opt/babassl no-shared no-hw no-hw-padlock no-static-engine enable-tls1_3 enable-ssl3 enable-ssl3-method enable-weak-ssl-ciphers no-evp-cipher-api-compat no-status no-dynamic-ciphers no-optimize-chacha no-rsa-multi-prime-key-compat no-session-lookup no-session-reused-type no-global-session-cache no-verify-sni no-skip-scsv enable-ntls enable-ssl-trace --debug -fPIC enable-gm

# 构建发布版
./config --prefix=/opt/babassl no-shared no-hw no-hw-padlock no-static-engine enable-tls1_3 enable-ssl3 enable-ssl3-method enable-weak-ssl-ciphers no-evp-cipher-api-compat no-status no-dynamic-ciphers no-optimize-chacha no-rsa-multi-prime-key-compat no-session-lookup no-session-reused-type no-global-session-cache no-verify-sni no-skip-scsv enable-ntls enable-ssl-trace --release -fPIC enable-gm

make -j

make install

# 为保证软件的完整性，需要使用符合要求的硬件生成二进制签名，步骤略

# 查看版本号
TONGSUO_NO_SELF_TEST_INTEGRITY=1 TONGSUO_NO_PASSWORD=1 \
/opt/babassl/bin/openssl version -g
```

iOS构建：

```bash
git checkout 8.3.0-gm

# 构建测试版
# ./config no-shared enable-threads enable-tls1_3 enable-ssl3 enable-ssl3-method enable-weak-ssl-ciphers no-evp-cipher-api-compat no-req-status no-status no-crypto-mdebug-count no-dynamic-ciphers no-optimize-chacha no-rsa-multi-prime-key-compat no-session-lookup no-session-reused-type no-global-session-cache no-verify-sni no-skip-scsv enable-ntls enable-crypto-mdebug-count enable-crypto-mdebug-backtrace enable-ssl-trace --debug -fPIC --prefix=/opt/babassl enable-gm --with-rand-seed=getrandom,egd,rtc -DSSL_DEBUG -DOPENSSL_NO_INTEGRITY

# 构建发布版
./config no-shared enable-threads enable-tls1_3 enable-ssl3 enable-ssl3-method enable-weak-ssl-ciphers no-evp-cipher-api-compat no-req-status no-status no-crypto-mdebug-count no-dynamic-ciphers no-optimize-chacha no-rsa-multi-prime-key-compat no-session-lookup no-session-reused-type no-global-session-cache no-verify-sni no-skip-scsv enable-ntls enable-crypto-mdebug-count enable-crypto-mdebug-backtrace enable-ssl-trace --release -fPIC --prefix=/opt/babassl enable-gm --with-rand-seed=getrandom,egd,rtc

make -j

make install

# 为保证软件的完整性，需要使用符合要求的硬件生成二进制签名，步骤略

# 查看版本号
OPENSSL_NO_INTEGRITY=1 OPENSSL_NO_AUTH=1 \
/opt/babassl/bin/openssl version -g

```

Linux构建：

```bash
git checkout 8.3.1-gm

# 构建过程同与iOS构建过程相同
```

## 免责声明

- 所有用户在使用以上密码模块时，请务必遵守密码相关的法律法规和有关部门的要求，否则由此产生的法律责任由使用方自行承担。
- 以上密码模块的源代码仅供参考，如果基于以上源代码再次申请商用密码产品认证或其他资质，请务必遵守相关的密码产品检测现行标准和要求，具体要求以实际选择的商用密码检测机构为准。
