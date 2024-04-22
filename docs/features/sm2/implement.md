---
sidebar_position: 2
---
# 铜锁SM2算法性能优化实践：（二）快速模约减算法实现

> 本文旨在介绍本系列文章第一篇[《综述》](overview.md)中涉及的快速模约减算法的详细推导和实现过程

## 背景

在SM2数字签名算法中，有限域运算是椭圆曲线点运算和数字签名运算的基础，其运算性能将直接影响整体性能表现。而在有限域运算中，**模约减**运算的整体使用频率最高，在模乘、模平方、模逆等运算中均有运用。以模乘法为例，其定义为：对于素数域参数$p$和乘数$a$，模乘运算的结果等于 $a * a \mod p$。也就是说，对于乘法结果大于$p$的**中间值**，模乘法需要将其约减到$p$以内，此过程因此被称为**模约减**。<br />由于$p$是一个非常大的素数，且上述运算中间值最大可达$p^2-1$，采用除法来计算模约减的效率将极其低下（在具体实践中，有限域除法一般借助乘法逆元实现，其耗时大约是模乘运算的200-300倍）。目前，铜锁项目中SM2算法使用了通用蒙哥马利约分算法实现模约减过程，暂时没有针对曲线特化的快速模约减算法实现。相应的，部分常用的NIST曲线`nistp224`、`nistp256`和`nistp521`基于广域梅森素数实现了曲线特化的快速模约减算法，并运用于各自的64-bit平台优化中。

考虑到SM2曲线同样采用广域梅森素数作为素数域参数，且实现64-bit平台优化也需要使用模约减算法，因此为SM2曲线实现曲线参数特化的快速模约减算法是非常有必要的。同时，为了保证对部分32位平台的兼容性和后续扩展，在功能开发的过程中保留了原有的条件编译模式，同时支持32位和64位平台使用该快速模约减算法。测试结果表明，使用了快速模约减的SM2模乘运算与简单模乘和蒙哥马利模乘相比，时间开销分别降低**81.34%**和**29.91%**。

## 预备知识

在数论中，**梅森素数(Mersenne Prime)** 是形如$2^n − 1$的质数，其中 $n$ 为整数。梅森素数的数量非常稀少，直到今天（2023年7月）仅有51个梅森素数被发现。由于梅森素数的构成与2的指数幂相关，在以二进制为数据表示方式的现代计算机中，它不仅便于计算和存储，也能够加速有限域运算，因此在密码学领域广受青睐。NIST曲线家族中，`nistp521`曲线的素数域参数$p$就选择了梅森素数$2^{521} -1$。

然而，梅森素数的数量实在是过于稀少，以至于在椭圆曲线素数域参数$p$的合理取值范围内仅有一个梅森素数 $2^{521} -1$ ，其他的梅森素数要么过大，要么太小，不满足使用要求。因此，许多椭圆曲线的素数域参数$p$选用了梅森素数的拓展版本—— **广义梅森素数（General Mersenne Prime)** 。广义梅森素数是形如 $f(2^n)$的素数，其中 $f(x)$ 是具有较小整数系数的低次多项式。例如，`nistp256`曲线采用如下所示的广义梅森素数作为素数域参数$p$：

$p_{nistp256} = 2^{256} − 2^{224} + 2^{192} + 2^{96} − 1$

## 算法原理

在国标GM/T 0003.5-2012中，给出了sm2曲线的推荐素数域参数$p$。$p$是一个广义梅森素数，表示如下：

$p_{sm2p256} = 2^{256} − 2^{224} - 2^{96} + 2^{64} - 1$

下面以大整数 $v(v < p^2 < 2^{512})$ 和参数 $p_{sm2p256}$ 为例，推导基于广义梅森素数的快速模约减算法。该算法利用参数 $p_{sm2p256}$ 各项系数之间最小差为 $2^{32}$ 的特点，将表示中间值的大整数按照32位分割，并转化为如下表示形式：

$(v[0]*2^0 + v[1]*2^{32} + v[2]*2^{64} + ... + v[15]*2^{480})  \mod p$, 其中 $0 \leq v[i]< 2^{32}$

然后将 $v[8] - v[15]$ 的高位参数约化到 $v[0] - v[7]$ 的低位参数上。在约化之前，我们先根据将参数 $p_{sm2p256}$ 转化为按照32位分割的表示形式：

| 2^288 | 2^256 | 2^224 | 2^192 | 2^160 | 2^128 | 2^096 | 2^064 | 2^032 | 2^000 |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
|  | 1 | -1 | 0 | 0 | 0 | -1 | 1 | 0 | -1 |

接下来处理所有高位参数，此处以 $v[8]$ 为例，设$v[8] = a$，那么$v[8]$可以表示为：

| 2^288 | 2^256 | 2^224 | 2^192 | 2^160 | 2^128 | 2^096 | 2^064 | 2^032 | 2^000 |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 0 | a | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 |

注意到，根据模运算的运算规则，$a * 2^{256} \mod p \equiv (a*2^{256} - x*p) \mod p$，也就是说，在原数的基础上增减模数 $p$ 的倍数并不影响模运算的结果。那么，为了消去高位参数$a$，不妨减去一个$a *p$，此时有：

| 2^288 | 2^256 | 2^224 | 2^192 | 2^160 | 2^128 | 2^096 | 2^064 | 2^032 | 2^000 |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 0 | a | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 |
|  | a | -a | 0 | 0 | 0 | -a | a | 0 | -a |

上下相减，高位参数$v[8]$被成功消除，低位约化的结果为：$a * 2^{224} + a * 2^{96} - a * 2^{64} + a$。依次对$v[8] - v[15]$做低位约化即可消除所有高位参数。将所有的低位约化结果合并同类项，可得到如下的sm2快速模约减算法。该算法由[白国强等人](https://ieeexplore.ieee.org/document/7011249)于2014年首次提出，实际运用中也有多种不同的参数组合形式：
![image.png](../img/256.png)
图1：基于参数 $p_{sm2p256}$ 的快速模约减算法
最后对约化后的低位参数$v[0] - v[7]$再做一次约减，旨在将模约减结果规约到$[0,p)$范围内。此处最多需要减去$13p$即可得到最终结果，无需使用成本昂贵的模除法。从图1中不难看出，基于广义梅森素数的SM2快速模约减算法仅需要少量的有限域加法和减法即可实现，性能表现明显优于使用模逆元的模约减算法。

## 算法实现

（本节将介绍所实现算法的核心部分，完整算法实现请参见`crypto/bn/bn_sm2.c`。）

前文提到，在高位参数约化后，还需要对低位参数做约化以获得最终结果，也就是减去参数$p$的某个倍数$np \quad (0<=p<=13)$。为了进一步提高性能，在代码实现中我们构造一个预计算表以存储$1-13p$，以节约计算$np$的开销。又因为约减结果在$[0,p)$范围内，且$p < 2^{256}$,因此只需要保留预计算参数的低256位：
```c
/*
 * /* Pre-computed tables are "carry-less" values of modulus*(i+1),
 * all values are in little-endian format.
 */
static const BN_ULONG _sm2_p_256[][BN_SM2_256_TOP] = {
    {0xFFFFFFFFFFFFFFFFull, 0xFFFFFFFF00000000ull,
     0xFFFFFFFFFFFFFFFFull, 0xFFFFFFFEFFFFFFFFull},/*p*/
    {0xFFFFFFFFFFFFFFFEull, 0xFFFFFFFE00000001ull,
     0xFFFFFFFFFFFFFFFFull, 0xFFFFFFFDFFFFFFFFull},/*2p*/
    ...
    {0xFFFFFFFFFFFFFFF4ull, 0xFFFFFFF40000000Bull,
     0xFFFFFFFFFFFFFFFFull, 0xFFFFFFF3FFFFFFFFull},/*12p*/
    {0xFFFFFFFFFFFFFFF3ull, 0xFFFFFFF30000000Cull,
     0xFFFFFFFFFFFFFFFFull, 0xFFFFFFF2FFFFFFFFull}/*13p*/
};
```
同时，为了保证被约减数$v$满足$0 <= v < p^2$，在模约减前还需要对输入进行验证。基于同样的原因，我们还需要预计算$p^2$的值：
```c
/* pre-compute the value of p^2 check if the input satisfies input < p^2. */
static const BN_ULONG _sm2_p_256_sqr[] = {
    0x0000000000000001ULL, 0x00000001FFFFFFFEULL,
    0xFFFFFFFE00000001ULL, 0x0000000200000000ULL,
    0xFFFFFFFDFFFFFFFEULL, 0xFFFFFFFE00000003ULL,
    0xFFFFFFFFFFFFFFFFULL, 0xFFFFFFFE00000000ULL
};
```
在64位平台和部分支持64位无符号整型的32位平台上，由于$v[i]$满足$0 \leq v[i]< 2^{32}$，因此可以使用64位无符号整形变量`accumulator`作为中间值存储累加结果，从而在$v[0] - v[7]$各参数上直接累加高位参数约化结果。以$v[0]$为例，其相应代码如下：
```c
    	SM2_INT64 acc;         /* accumulator */

        acc = rp[0];
        acc += bp[8 - 8];
        acc += bp[9 - 8];
        acc += bp[10 - 8];
        acc += bp[11 - 8];
        acc += bp[12 - 8];
        acc += bp[13 - 8];
        acc += bp[14 - 8];
        acc += bp[15 - 8];
        acc += bp[13 - 8];
        acc += bp[14 - 8];
        acc += bp[15 - 8];	/*累加高位参数约化结果*/
        rp[0] = (unsigned int)acc; /*获得结果的低32位*/
        acc >>= 32; /*进位部分右移32位，作为v[1]输入的一部分*/
```
对于部分不支持64位无符号整型的32位平台，32位整形变量由于数据溢出无法作为中间值保留进位结果，上述代码将不能正确运行。此时需要借助现有工具函数和铜锁底层大数运算函数的支持，按照前文展示的算法逐一累加 $s_1 ~ s_{14}$，每次还需要记录进位$carry$:
```c
        /*
         * r_d += s2 + s6 + s7 + s8 + s9
         * s2 = (c15, c14, c13, c12, c11, 0, c9, c8)
         */
        sm2_set_256(t_d, buf.bn, 15, 14, 13, 12, 11, 0, 9, 8);
        carry += (int)bn_add_words(r_d, r_d, t_d, BN_SM2_256_TOP);
        /*
         * s6 = (c11, c11, c10, c15, c14, 0, c13, c12)
         */
        sm2_set_256(t_d, buf.bn, 11, 11, 10, 15, 14, 0, 13, 12);
        carry += (int)bn_add_words(r_d, r_d, t_d, BN_SM2_256_TOP);
        /*
         * s7 = (c10, c15, c14, c13, c12, 0, c11, c10)
         */
        sm2_set_256(t_d, buf.bn, 10, 15, 14, 13, 12, 0, 11, 10);
        carry += (int)bn_add_words(r_d, r_d, t_d, BN_SM2_256_TOP);
        /*
         * s8 = (c9, 0, 0, c9, c8, 0, c10, c9)
         */
        sm2_set_256(t_d, buf.bn, 9, 0, 0, 9, 8, 0, 10, 9);
        carry += (int)bn_add_words(r_d, r_d, t_d, BN_SM2_256_TOP);
        /*
         * s9 = (c8, 0, 0, 0, c15, 0, c12, c11)
         */
        sm2_set_256(t_d, buf.bn, 8, 0, 0, 0, 15, 0, 12, 11);
        carry += (int)bn_add_words(r_d, r_d, t_d, BN_SM2_256_TOP);
```
最后处理进位，得到最终结果，此处变量mask的作用是减少代码中不必要的分支，尽可能提高其抗侧信道攻击强度：
```c
    mask =
        0 - (PTR_SIZE_INT) (*u.f) (c_d, r_d, _sm2_p_256[0], BN_SM2_256_TOP);
    mask &= 0 - (PTR_SIZE_INT) carry;
    res = c_d;
    res = (BN_ULONG *)(((PTR_SIZE_INT) res & ~mask) |
                       ((PTR_SIZE_INT) r_d & mask));
    sm2_cp_bn(r_d, res, BN_SM2_256_TOP);
    r->top = BN_SM2_256_TOP;
    bn_correct_top(r);
```
## 测试

### 正确性测试

为了验证快速模约减算法的正确性，我们在测试环节设计了相应的单元测试。该测试的核心思路是，随机生成一批有限域大整数$a_i, b_i$，分别使用铜锁提供的默认方法和本文实现的快速模约减方法计算$a_i * b_i \mod p$，然后比较二者计算结果是否相等：
```c
    /*
     * Randomly generate two numbers in the prime field and multiply them，then compare the results of fast modular reduction and conventional algorithms.
     */
    for (i = 0; i < 100; i++){
        if (!TEST_true(BN_priv_rand_range_ex(a, p, 0, ctx))
            || !TEST_true(BN_priv_rand_range_ex(b, p, 0, ctx))
            || !TEST_true(BN_mul(ab_fast, a, b, ctx))
            || !TEST_true(BN_sm2_mod_256(ab_fast, ab_fast, p, ctx))
            || !TEST_true(BN_mod_mul(ab, a, b, p, ctx))) {
            goto done;
        }

        if (!TEST_int_eq(BN_ucmp(ab, ab_fast), 0)){
            goto done;
        }
    }
```
	可以使用如下命令调用测试：
```bash
make test TESTS="test_mod_sm2"
```

测试结果：
```bash
➜  Tongsuo git:(sm2p256) ✗ make test TESTS="test_mod_sm2"
/Library/Developer/CommandLineTools/usr/bin/make depend && /Library/Developer/CommandLineTools/usr/bin/make _tests
10-test_mod_sm2.t .. ok   
All tests successful.
Files=1, Tests=1,  1 wallclock secs ( 0.00 usr  0.01 sys +  0.07 cusr  0.02 csys =  0.10 CPU)
Result: PASS
```

### 性能测试

为了充分比较快速模约减算法的性能，我们选择比较SM2有限域运算中较常用的模乘法运算作为测试单元，测试使用了SM2快速模约减函数`BN_sm2_mod_256`、简单模约减函数`BN_nnmod`的模乘函数`ossl_ec_GFp_field_mul` 和通用蒙哥马利模乘函数`BN_mod_mul_montgomery`的模乘法运算耗时。测试在`Apple M2 pro`平台上进行，测试数据如下表所示：

|  | SM2快速模约减 | 简单模约减 | 蒙哥马利模乘约减 |
| --- | --- | --- | --- |
| 模乘法耗时（ns/iter） | **35.53** | 190.45 | 50.69 |

测试结果表明，使用SM2快速模约减函数的模乘法耗时最少，相较于简单模约减能够减少 **81.34%** 的时间开销，即使对使用了汇编优化的蒙哥马利模乘运算，在计算时间上仍有 **29.91%** 的优势。
