---
title: 铜锁的 C 代码风格
authors: [InfoHunter]
tags: [code style, c]
---
# 总述

铜锁采用类似于OpenSSL的代码风格（Coding Style）。因铜锁项目中存在多种编程语言，而C语言作为其中占比最大的一种，所以本文对铜锁的C语言代码风格进行定义。

# 一、缩进
缩进采用4个空格，禁止使用Tab。预处理指令，按照嵌套层次，使用1个空格作为缩进，例如：
```c
#if
# define
# if
#  define
# else
#  define
# endif
#else
# define
#endif

#define
```

# 二、换行

禁止一行中写多个语句，例如下例是禁止的：
```c
if (condition) do_this();
do_something_everytime();
```
原则上每行的长度为80个字符，即超过80个字符的行需要进行换行；除非换行后严重影响可读性，可不受80字符的行长度限制。对于用户可见的字符串，例如输出到命令行对用户起提示作用的字符串，则禁止换行，以防止无法使用grep等工具在代码中查找。

# 三、大括号配对和空格

对于非函数类语句，铜锁采用如下的大括号对齐风格：
```c
if (x is true) {
    we do y
} else if (conidtion) {
    we do z
} else {
    do something...
}

do {
    ...
} while (1);

switch (suffix) {
case 'G':
case 'g':
    mem <<= 30;
    break;
case 'M':
case 'm':
    mem <<= 20;
    break;
case 'K':
case 'k':
    mem <<= 10;
    /* fall through */
default:
    break;
}
```
需要注意的是，对于switch语句，其中的case需要和switch对齐，而非进一步进行缩进。
对于函数，则大括号的起始位置有变化：
```c
int function(int x)
{
    body of function
}
```
此外，关于空格也有相关约定。在绝大部分的关键字后面，都需要加1个空格，例如：
```c
if, switch, case, for, do, while, return
```
对于函数，以及行为类似函数的关键字，如sizeof, typeof, alignof和__attribute__等，其后则不需要添加空格，例如：
```c
SOMETYPE *p = OPENSSL_malloc(sizeof(*p) * num_of_elements);
```
双元和三元运算符的两侧也需要添加1个空格，而一元运算符则无需添加空格：
```c
=  +  -  <  >  *  /  %  |  &  ^  <=  >=  ==  !=  ?  : +=

以下无需添加空格：

&  *  +  -  ~  !  defined

foo++
--bar

foo.bar
foo->bar
```
定义指针的时候，型号需要靠近变量一侧，而不是类型一侧：
```c
char *p = "something";
int *a = NULL;
```

# 四、命名规则

变量和函数的命名禁止使用匈牙利命名法或者任何的驼峰式命名法，例如下列变量和函数名称都是禁止的：
```c
int iVar;
int myVar;
char *pChar;
int AFunctionThatHandlesSomething()
```
相反，使用小写字母加下划线为主的命名方式：
```c
int temp;
int ctx;
char *p;
int do_signature();
```
铜锁继承自OpenSSL，因此部分导出的API也延续了OpenSSL的命名规律，也就是大写字母开头，后加下划线和小写字母表明函数用途的方式。此部分风格暂时继续沿用，后续根据铜锁重构的进展再进行调整。

# 五、注释

禁止使用//风格的注释。对于单行注释，使用：
```c
/* .... */
```
对于多行注释，使用：
```c
/*-
 * This is the preferred style for multi-line
 * comments in the OpenSSL source code.
 * Please use it consistently.
 *
 * Description:  A column of asterisks on the left side,
 * with beginning and ending almost-blank lines.
 */
```

