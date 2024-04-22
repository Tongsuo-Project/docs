---
sidebar_position: 0
---
# 编译和安装

一般来说，典型的编译和安装过程如下：

```bash
./config --prefix=/path/to/install/dir
make
make install
```

如果是 Windows，则需要：

```bash
perl Configure enable-ntls
nmake
nmake install
```

以上将会安装铜锁的头文件、library 文件和铜锁二进制程序。如果需要在独立的 build 目录中编译铜锁以保证源代码仓库的整洁，则可以：

```bash
cd tongsuo-build
/path/to/Tongsuo/source/config --prefix=/path/to/dest
make
make install
```

目前铜锁支持的操作系统有：各种 Linux 发行版、macOS、Android、iOS 和 Windows。在这些操作系统上，还需要事先准备好对应的环境：

* make
* Perl 5，以及 `Text::Template` 模块
* C 编译器
* C 库

铜锁对第三方库的依赖很少，但是目前依然对 Perl 依赖较大。

如果希望执行自动化测试用例，则需：

```bash
make test
```

在安装的时候，可以选择只安装 library 文件：

```bash
make install_runtime_libs
```

如果还需要安装头文件以便于基于铜锁开发应用程序，则可以：

```bash
make install_dev
```

也可以只安装铜锁二进制程序和其依赖的铜锁 library 文件：

```bash
make install_programs
```

铜锁的 Configure 脚本提供了大量的用于开关各种特性的选项。一般来讲，使用 `enable-xxx` 做为对某个特性的开启，而使用 `no-xxx` 来关闭某个特性。例如，`enable-ntls` 即开启 TLCP，而` no-rsa` 则是不编译RSA算法。
