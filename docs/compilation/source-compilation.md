---
sidebar_position: 2
---
# 源码编译

## 源码准备

```bash
# clone master 分支代码
git clone https://github.com/Tongsuo-Project/Tongsuo.git
```

## 配置选项

- enable-xx：编译 xx 算法、协议或者功能，比如 enable-ntls 表示编译国密功能，enable-sm2 表示编译 sm2 算法
- no-xx：不编译 xx 算法、协议或者功能，比如 no-ntls 表示不编译国密功能，no-sm2 表示不编译 sm2 算法
- --prefix=DIR：指定 openssl 的安装目录，如果只是想生成库文件，没有必要执行 make install 命令，也就可以不用指定该选项，默认值：/usr/local
- --openssldir=DIR：指定 openssl 配置文件的安装目录，如果不指定，默认安装到 --prefix 指定目录下的 ssl 目录
- --cross-compile-prefix=PREFIX：指定交叉编译工具链，以连接号结束，比如 arm-linux-gnueabihf-
- --symbol-prefix=PREFIX：指定导出符号前缀，在多个 openssl 版本库共存的场景中用到，详细移步教程：[Tongsuo（原 BabaSSL） 与其他 openssl 版本库共存方案](./openssl-compatible.md)
- --api=x.y.z：x.y.z 为 API 版本号，是下列值之一：0.9.8, 1.0.0, 1.0.1, 1.0.2, 1.1.0, 1.1.1, 3.0，默认值：3.0，如果要编译与 openssl-1.1.1 兼容的 API，需要指定--api=1.1.1.
- -Wl,-rpath,/opt/tongsuo/lib：rpath 指定编译出的 openssl 二进制程序依赖的 libcrypto.so 和 libssl.so 目录，效果与 `LD_LIBRARY_PATH` 和 `DYLD_LIBRARY_PATH`环境变量一样
- --debug：如果需要 gdb 或者 lldb 调试需要加这个选项

## 编译安装

### 本地编译

```bash
# 配置选项
./config --prefix=/opt/tongsuo -Wl,-rpath,/opt/tongsuo/lib enable-ec_elgamal enable-paillier enable-ntls

# 查看 config 结果
perl configdata.pm --dump

# 编译
make -j

# 安装
make install
```

### ios交叉编译

#### 编译

```bash
# 配置环境变量
export CC=clang;
## 先确保机器上安装了 Xcode 开发工具
## 如下两个环境变量在参数中用到： -isysroot \$(CROSS_TOP)/SDKs/\$(CROSS_SDK)
export CROSS_TOP=/Applications/Xcode.app/Contents/Developer/Platforms/iPhoneOS.platform/Developer
export CROSS_SDK=iPhoneOS.sdk
export PATH="/Applications/Xcode.app/Contents/Developer/Toolchains/XcodeDefault.xctoolchain/usr/bin:$PATH"

# 配置选项（那只是要编译32位的将 ios64 替换成 ios 即可）
./Configure ios64-cross no-shared no-dso no-hw no-engine enable-ntls --prefix=/opt/tongsuo-ios64

注意：如果编译 iOS arm64 架构模拟器版本，使用 darwin64-arm64-cc； x86_64 架构模拟器版本，使用 darwin64-x86_64-cc，并根据 Arm 或 Intel 芯片类型配置环境变量

# 查看 config 结果
perl configdata.pm --dump

# 编译
make -j
```

#### 打包

使用 lipo 工具打包（网上文章很多，此处略）

### Android交叉编译

在macOS上编译android-arm64，步骤如下。Linux或其他操作系统仅供参考。

首先，安装NDK：

```bash
# 这里以macOS为例, 下载NDK23
curl -OLv https://dl.google.com/android/repository/android-ndk-r23c-darwin.zip
unzip android-ndk-r23c-darwin.zip
sudo cp android-ndk-r23c-darwin.zip /opt/
```

编译Tongsuo：

```bash
export ANDROID_NDK_ROOT=/opt/android-ndk-r23c
PATH=$ANDROID_NDK_ROOT/toolchains/llvm/prebuilt/darwin-x86_64/bin:$PATH

# 按需配置选项
./Configure android-arm64

make -j
```
