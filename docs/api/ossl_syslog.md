# 概述

OSSL_syslog()函数用于向操作系统（syslog）输出日志，日志的类别为daemon。

操作系统日志（syslog）是一种标准的日志记录系统，用于记录系统的运行状态、错误信息等。syslog日志可以通过系统的日志查看工具查看，如Linux系统的
/var/log/messages文件。

## 头文件和函数原型

```c
#include <crypto.h>

void OSSL_enable_syslog(void);
void OSSL_disable_syslog(void);
void OSSL_syslog(int priority, const char *message, ...);
```

## 函数说明

OSSL_enable_syslog()函数用于启用syslog日志输出。

OSSL_disable_syslog()函数用于禁用syslog日志输出。

OSSL_syslog()函数用于向syslog输出日志。priority包括LOG_EMERG、LOG_ALERT、LOG_CRIT、LOG_ERR、LOG_WARNING、LOG_NOTICE、LOG_INFO、
LOG_DEBUG级别，message为日志内容。

## 返回值

无。

## 示例

```c
    OSSL_enable_syslog();

    OSSL_syslog(LOG_DEBUG, "Debug 111\n");

    OSSL_disable_syslog();
```

## 历史

OSSL_enable_syslog()、OSSL_disable_syslog()和OSSL_syslog()函数在Tongsuo 8.5.0版本中引入。
