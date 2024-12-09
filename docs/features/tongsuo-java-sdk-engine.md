# Tongsuo-Java-SDK + 海光CPU密码协处理器使用教程

## 概述

铜锁介绍
> 铜锁/Tongsuo 是一个提供现代密码学算法和安全通信协议的开源基础密码库，为存储、网络、密钥管理、隐私计算等诸多业务场景提供底层的密码学基础能力，实现数据在传输、使用、存储等过程中的私密性、完整性和可认证性，为数据生命周期中的隐私和安全提供保护能力。

海光HCT介绍
> 海光密码技术(HCT, Hygon Cryptographic Technology)是基于海光密码协处理器和密码指令集自主设计研发的一套密码算法加速软件开发套件。HCT充分利用海光平台密码加速特性，整合底层海光密码计算资源，为用户上层应用提供高性能密码计算能力。用户无需了解底层细节就可以轻松使用海光平台高性能密码计算能力，显著提升密码应用的性能。此外，HCT通过OpenSSL标准接口对外提供密码计算能力，完美兼容OpenSSL生态，具有良好的易用性和可移植性。用户可以方便的将已有项目代码迁移到海光平台，从而大幅缩短项目开发时间。

Tongsuo-Java-SDK以Tongsuo密码库为核心，为Java应用程序封装密码学接口，支持常用的密码学算法和安全通信协议。
利用Tongsuo密码库的Engine扩展机制，可以将密码学算法卸载到外部密码硬件上。
通过Tongsuo-Java-SDK + Tongsuo + 海光CPU密码协处理器构建更加简单易用的密码解决方案，帮助企业解决Java生态的密码合规问题。

## 使用说明

### 1.海光机器环境配置

需要准备支持海光密码协处理器的机器环境，物理机或虚拟机都可以，参考文档如下：

- 物理机：https://openanolis.cn/sig/Hygon-Arch/doc/865622263675623238
- 虚拟机：https://openanolis.cn/sig/Hygon-Arch/doc/1110520213566721211 2.3 虚拟机环境准备

如遇到任何问题，请联系海光技术支持。

### 2.构建和安装Tongsuo密码库

当需要使用外部Engine时，如海光密码协处理器Engine，tongsuo-java-sdk需要依赖Tongsuo动态库，基于源代码，在Linux系统
上构建和安装Tongsuo密码库如下所示：

```bash
git clone https://github.com/Tongsuo-Project/Tongsuo

cd Tongsuo

git checkout 8.4-stable

# 如果系统上没有perl，需要安装perl及相关依赖
perl ./Configure --banner=Configured --prefix=/opt/tongsuo --libdir=/opt/tongsuo/lib enable-weak-ssl-ciphers enable-ntls --release

make -j
make install
```

### 3.拷贝HCT Engine

在第1步中，已经安装好hct开发套件，拷贝HCT Engine对应的动态库文件，hct.so到tongsuo的lib/engines-3目录下：
注意：拷贝的是engines-3目录下的hct.so文件。

```bash
cp /opt/hygon/hct/lib64/engines-3/hct.so /opt/tongsuo/lib/engines-3/
```

### 4.(可选)构建和安装Tongsuo-Java-SDK

如果maven上已经发布了满足需求的版本，本步骤可跳过，直接从maven上下载对应的jar包。注意：tongsuo-openjdk基于Tongsuo
静态库编译，tongsuo-openjdk-dynamic基于Tongsuo动态库编译，因此对于要使用外部Engine的应用程序应该下载tongsuo-openjdk-dynamic。

否则，需要从源代码构建和安装Tongsuo-Java-SDK, 可以参考如下步骤：

```bash
git clone https://github.com/Tongsuo-Project/tongsuo-java-sdk

# 构建
LD_LIBRARY_PATH=/opt/tongsuo/lib \
./gradlew clean build -PtongsuoHome=/opt/tongsuo -PtongsuoDynamic=1

# 构建好的jar包放在 openjdk/build/libs下，注意：自己编译的jar包名字是不包含dynamic的
ls -l openjdk/build/libs
```

### 5. 应用集成Tongsuo-Java-SDK，并使用外部Engine

以示例代码examples/jce/SM3WithEngine.java为例，演示如何使用Tongsuo-Java-SDK + Tongsuo + 海光CPU密码协处理器。
源代码见https://github.com/Tongsuo-Project/tongsuo-java-sdk/blob/master/examples/jce/SM3WithEngine.java。

其中的关键代码如下：

```java
TongsuoProvider ts = new TongsuoProvider();
if (ts.setEngine("hct") != 1) {
    System.out.println("set engine failed");
    return;
}
Security.addProvider(ts);
```

编译和运行代码如下：

```bash
cd examples/jce

# 编译SM3WithEngine
javac -cp /path/to/tongsuo-openjdk-<version>-<os>-<arch>.jar SM3WithEngine.java

# 运行SM3WithEngine，注意，需要设置LD_LIBRARY_PATH环境变量，指向Tongsuo动态库的路径
LD_LIBRARY_PATH=/opt/tongsuo/lib \
java -cp '.:/path/to/tongsuo-openjdk-<version>-<os>-<arch>.jar' SM3WithEngine
```
