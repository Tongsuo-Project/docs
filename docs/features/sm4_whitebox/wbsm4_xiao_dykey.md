---
查找表种的输入输出置乱编码都是随机选择的,白盒多样性的值越大,攻击者就  越难分析出隐藏在查找表中的密钥信息以及输入输出置乱编码。sidebar_label: '国密SM4算法的白盒方案实现'
sidebar_position: 99
---
# 一种基于Xiao-Lai方案的动态SM4白盒算法

## 1 白盒密码概述

白盒密码是一种特殊的密码学技术，旨在保护加密算法在不可信环境中的安全性，最早由Chow等人提出<sup>[1]</sup>。与传统的黑盒模型不同，白盒密码假设攻击者可以完全访问算法的内部细节，包括密钥和中间计算结果。其主要应用场景包括软件保护、数字版权管理（DRM）和嵌入式系统等，确保即使攻击者能够逆向工程或动态调试，也无法轻易提取密钥或破坏加密过程。白盒密码通过复杂的数学变换和混淆技术，将密钥与算法深度融合，从而在开放环境中实现高强度的安全防护。

## 2 方案设计

### 2.1 白盒密码原理

白盒密码的原理是通过混淆技术在关键密码操作的输入和输出添加置乱编码，并封装成查找表的形式，隐藏关键的加密逻辑和数据。例如对于一个从$m$比特到$n$比特的映射$F$，分别使用一个从$m$比特到$m$比特的随机双射$G$（例如可逆仿射变换）和一个从$n$比特到$n$比特的随机双射$H$对映射$F$的输入和输出进行混淆：

$$
F' = H \circ F \circ G^{-1} .
$$

分组密码可以看作是由一系列串行的子部件（例如AES-128中的轮密钥加、S盒替换等）构成，在白盒实现中需要分别对每一个子部件进行混淆。每一个部件的输入置乱编码应是上一个部件的输出置乱编码的逆。例如对于一个从$m$比特到$n$比特的映射$F$和一个从$n$比特到$p$比特的映射$K$，$K \circ F$应被混淆为：

$$
K' \circ F' = (P \circ K \circ H^{-1}) \circ (H \circ F \circ G^{-1})
$$

其中$P$是一个从$p$比特到$p$比特的随机双射。分别将$(H \circ F \circ G^{-1})$和$(P \circ K \circ H^{-1})$固化成查找表，将$F$和$K$的逻辑隐藏。值得注意的是，在上述串行子部件“头”“尾”两端的置乱编码为外部编码（external encoding）。例如在本例中，需要使用$G$对输入进行编码，使用$P^{-1}$对输出进行解码。

### 2.2 Xiao-Lai方案

Xiao-Lai方案 <sup>[2]</sup> 使用可逆仿射变换作为置乱编码，将轮函数$F\left( X_{i},X_{i+1},X_{i+2},X_{i+3},rk_{i} \right)$执行过程分为三个部分，分别进行$X_{i+1},X_{i+2},X_{i+3}$三个状态的异或、原SM4算法中的非线性变换$\tau$与线性变换$L$，以及$X_{i}$与$X''$的异或操作。

**(1) 计算$X_{i}' = X_{i+1} \oplus X_{i+2} \oplus X_{i+3}$**

在计算之前需要消去上一个变换中的输出置乱编码，随后添加新的置乱编码$E_i$。本阶段的计算过程可以表示为：

$$
\begin{aligned}
    X_{i}' =\; &E_i \circ P_{i+1}^{-1}[X_{i+1}]\; \oplus \\
		&E_i \circ P_{i+2}^{-1}[X_{i+2}] \; \oplus \\
		&E_i \circ P_{i+3}^{-1}[X_{i+3}]\;,
\end{aligned}
$$

其中$P_{i+j}(j=1,2,3)$是32比特到32比特的随机可逆仿射变换：

$$
P_i(x)=A_i \cdot x \oplus a_i  \;,
$$

其中$A_i$为$\mathbf{GF}(2)$上的$32 \times 32$的可逆矩阵，$a_i$为32比特的向量。
$E_i=\operatorname{diag}(E_{i0}, E_{i1},E_{i2},E_{i3})$，其中$E_{ij}$是8比特到8比特的可逆仿射变换。
记

$$
M_{i+j}=E_i \circ P_{i+j} \;,\; j=1,2,3 .
$$

最后只需要保存$M_{i+j}$，而$E_i$和$P_{i+j}$都不会在白盒环境中单独出现，保证了SM4算法中间状态的安全性。由于仿射变换的类线性性质，可以直接将带有可逆仿射置乱编码的中间状态进行异或操作。

**(2) 计算$X''_i = T(X_{i}'\oplus rk_i)$**

在Xiao-Lai方案中，将轮密钥隐藏到S盒中。即在每一轮的非线性变换$\tau$中，

$$
\begin{aligned}
    &\tau \left( X'_i \oplus{rk}_{i} \right) \\
= \;&(Sbox\left( x_{i0} \oplus rk_{i0} \right),Sbox\left( x_{i0} \oplus rk_{i0} \right),Sbox\left( x_{i0} \oplus rk_{i0} \right),Sbox\left( x_{i0} \oplus rk_{i0} \right))^\top
\end{aligned}
$$

其中，

$$
\begin{aligned}
X'_i &= (x_{i0},x_{i1},x_{i2},x_{i3})^\top, \\
rk_i &= (rk_{i0},rk_{i1},rk_{i2},rk_{i3})^\top
\end{aligned}
$$

记$S_{ij}(x) = Sbox\left( x\oplus rk_{ij} \right),\ i = 0,1,\ldots,31,\ j = 0,1,2,3$，则子密钥被隐藏到每一轮的$S_{ij}$。由于S盒是公开的，攻击者得到$S_{ij}$的时候依然可以得到密钥信息，因此，还需要在输入输出侧添加置乱编码。

线性变换$L$可以表示为左乘一个$\mathbf{GF}(2)$上的$32 \times 32$的矩阵$L$， 将非线性变换$\tau$与线性变换$L$结合在一起，并添加输出置乱编码$Q_{i}$。$Q_{i}$同样是32比特到32比特的可逆仿射变换。前一步操作的输出置乱编码$E_i$的逆$E_i^{-1}$作为本操作的输入置乱编码。对于一个32到32比特的非线性变换，如果用查找表表示，查找表的大小将为$2^{32} \times 32 = 16\text{GB}$，这样大小的查找表在实际应用中并不适用。因此，Xiao-Lai方案根据矩阵乘法的性质，把整个变换拆分成4个8比特到32比特的变换，再用查找表的形式表示拆分后的8比特到32比特变换。不妨设$Q_i(x)=B_i \cdot x \oplus b_i$，则

$$
\begin{aligned}
Q_{i} \circ L (z) 	&= (B_i \cdot L) \cdot z \oplus b_i = R_i \cdot z \oplus b_i \\
			&= \left( R_{i0}\ R_{i1}\ R_{i2}\ R_{i3} \right) \cdot \begin{pmatrix} z_{0} \\ z_1 \\ z_2 \\ z_{3} \end{pmatrix} \oplus b_i \\
			&= R_{i0} \cdot z_{0}\oplus R_{i1} \cdot z_{1}\oplus R_{i2} \cdot z_{2}\oplus R_{i3} \cdot z_{3}\oplus b_i \\
			&= (R_{i0} \cdot z_{0})\oplus(R_{i1} \cdot z_{1})\oplus(R_{i2} \cdot z_{2})\oplus(R_{i3} \cdot z_{3} \oplus  b_i)
\end{aligned}
$$

其中$B_i \cdot L = R_i = (R_{i0}\ R_{i1}\ R_{i2}\ R_{i3})$，$R_{ij}, j=0,\ldots,3$是$\mathbf{GF}(2)$上的$32 \times 8$矩阵，$z$是长度为32比特的非线性变换$\tau$的结果。根据上述方法，可以把32比特到32比特的变换拆分成4个8比特到32比特的变换，然后将4个结果相异或得到最后的输出。因此，$T\left(X_{i}' \oplus{rk}_{i} \right)$的计算可以由4个8比特到32比特的查找表组成，每次计算的时候只需要查找对应的4个查找表，然后将4个结果进行异或：

$$
\begin{aligned}
    Xa_{i} &= R_{i0} \cdot S_{i0}(E_{i0}^{-1}[x_0]) \\
    Xb_{i} &= R_{i1} \cdot S_{i1}(E_{i1}^{-1}[x_1]) \\
    Xc_{i} &= R_{i2} \cdot S_{i2}(E_{i2}^{-1}[x_2]) \\
    Xd_{i} &= R_{i3} \cdot S_{i3}(E_{i3}^{-1}[x_3]) \oplus b_i  \\
    X_i'' &= Xa_{i} \oplus Xb_{i} \oplus Xc_{i} \oplus Xd_{i}
\end{aligned}
$$

**(3) 计算$X_{i+4}=X_{i}\oplus X''_i$**

计算

$$
\begin{aligned}
X_{i+4} = \; &P_{i+4}'' \circ Q^{-1}_i[X''_i] \; \oplus \\
            &P_{i+4}' \circ P^{-1}_{i}[X_i]
\end{aligned}
$$

其中，$P'_{i + 4} = P_{i + 4}\oplus a_{i+4}'$和$P''_{i + 4} = P_{i + 4}\oplus a_{i+4} \oplus a_{i+4}'$，均为32比特到32比特的可逆仿射变换。

在生成查找表阶段，上述每轮加解密所使用的查找表以及复合仿射变换在可信环境下生成；在加解密阶段，通过上述查找表及复合仿射变换在白盒环境下实现原始SM4算法的加解密逻辑。

### 2.3 基于Xiao-Lai方案的动态SM4白盒算法（wbsm4-xiao-dykey）

Xiao-Lai方案的动态白盒版本将原本隐藏在S盒中的轮密钥提取出来，经过混淆后单独存放，并使用异或辅助表完成轮密钥与SM4中间状态的异或。Xiao-Lai方案的动态白盒版本在轮函数的第一部分计算$X_{i+1},X_{i+2},X_{i+3}$三个状态的异或，以第三部分计算$X_{i}$与$X''$的异或过程与原始Xiao-Lai方案方案相同，这里不再赘述。下面将着重介绍轮函数第二部分的计算过程：

**(1) 生成白盒密钥$wbrk_i$**

受文献[4]启发，在可信环境下，对原始SM4轮密钥依次添加随机可逆仿射变换混淆和随机非线性双射混淆，生成白盒密钥。Jin-Bao方案 <sup>[3]</sup> 中同样使用了随机非线性双射作为置乱编码。由于非线性双射不具有仿射变换的类线性性质，需要使用查找表辅助进行异或操作。为了减少查找表占用的空间，使用级联编码（Concatenation Code）实现非线性双射。对于$k$个双射函数$F_{i}(i = 1,\cdots,k)$，若输入为$n$比特的函数$F$满足：

$$
F(b) = \left\lbrack F_{1}\left( b_{1},\cdots,b_{n_{1}} \right),F_{2}\left( b_{n_{1} + 1},\cdots,b_{n_{2}} \right),\cdots, \right.\ \left. \ F_{k}\left( b_{n_{k - 1} + 1},\cdots,b_{n} \right) \right\rbrack
$$

其中$b=(b_1, \ldots, b_n)$，$b_{j}, j=1, \ldots, n$表示单个比特，则函数$F$是通过级联编码实现的映射。通过这种方式可以将一个较大的双射函数$F$分解为$k$个较小的双射函数$F_{i}$。假设每个较小双射函数的输入长度相同，对于一个从$n$比特到$m$比特的函数$F$，直接使用查找表实现所需的存储空间为$m \cdot 2^{n}$比特，使用级联编码实现所需的存储空间仅需$m \cdot 2^{\frac{n}{k}}$比特。在本方案中的所有非线性变换都使用8个4比特双射构成的级联编码实现。

白盒密钥定义为：

$$
wbrk_i = R_i[Ek_i[rk_i]]
$$

其中$Ek_i=\operatorname{diag}(Ek_{i0}, Ek_{i1},Ek_{i2},Ek_{i3})$，其中$Ek_{ij},j=0, \ldots, 3$是8比特到8比特的可逆仿射变换。$R_i$是由级联编码定义的32比特到32比特的随机非线性双射变换。计算完成后，白盒密钥可以被传输至白盒环境下。由于原始轮密钥是保密的，可以保证白盒密钥具有不低于Xiao-Lai方案中SM4中间状态$X_i$的安全性。

**(2) 计算$X_{i}'\oplus rk_i$**

为了实现中间状态与轮密钥的异或操作，需要使用异或辅助表，这里使用的是由4个8比特的级联编码构成、与Jin-Bao方案中相似的查找表。具体而言：

$$
X''_i = Ea_i[E_{i}^{-1}[X'_{i}] \oplus Ek_{i}^{-1}[R_{i}^{-1}[wbrk_{i}]]]
$$

其中$R_{i}^{-1}$、$Ek_{i}^{-1}$是在生成白盒密钥时使用的置乱编码的逆，$wbrk_{i}$是白盒密钥。$E_{i}$是第一阶段使用的输出置乱编码，$Ea_i=\operatorname{diag}(Ea_{i0}, Ea_{i1},Ea_{i2},Ea_{i3})$，其中$Ea_{ij}$是8比特到8比特的可逆仿射变换。将上式固化为查找表，在进行加解密时通过查表实现SM4中间状态与轮密钥的异或。

**(3) 计算$X''_i = T(X_{i}'\oplus rk_i)$**

与原始Xiao-Lai方案类似，$T\left( X_{i}' \oplus{rk}_{i} \right)$的计算同样由4个8比特到32比特的查找表组成，只不过由于轮密钥已经和SM4状态异或，这里生成查找表使用的是普通的SM4 S盒。本阶段的查找表生成方式如下：

$$
\begin{aligned}
    Xa_{i} &= R_{i0} \cdot Sbox(Ea_{i0}^{-1}[x_0]) \\
    Xb_{i} &= R_{i1} \cdot Sbox(Ea_{i1}^{-1}[x_1]) \\
    Xc_{i} &= R_{i2} \cdot Sbox(Ea_{i2}^{-1}[x_2]) \\
    Xd_{i} &= R_{i3} \cdot Sbox(Ea_{i3}^{-1}[x_3]) \oplus b_i  \\
    X_i'' &= Xa_{i} \oplus Xb_{i} \oplus Xc_{i} \oplus Xd_{i}
\end{aligned}
$$

## 3 方案分析

### 3.1 占用空间大小

Xiao-Lai方案加密所需的存储空间大小分析已在参考文献[2]中给出，这里不再赘述。对于Xiao-Lai方案的动态白盒版本每一轮加密所需的存储空间为：
- 第一部分包含 3 个 32 比特到 32 比特的仿射变换: $3 \times (32 \times 32 + 32) = 396(\text{B})$。
- 第二部分包含 4 个 8 比特输入，32 比特输出的查找表：$4 \times 2^{8} \times 32 = 4096(\text{B})$；
以及1个64比特输入，32比特输出的异或辅助表。在异或辅助表使用4个8比特的级联编码实现的情况下，需要的存储空间为：$2^{8+8} \times 8 \times 4 = 262144(\text{B})$。
- 第三部分包含2个 32 比特到 32 比特的仿射变换: $2 \times (32 \times 32 + 32) = 264(\text{B})$。

共需要$32 \times (396 + 4094 + 262144 + 264) \approx 8.145(\text{MB})$的存储空间。在更新密钥时，Xiao-Lai方案的动态白盒版本无需更新所有查找表，只需要更新白盒密钥即可。将白盒方案加密时所需的存储空间大小以及更新密钥的开销总结在下表中。

|     方案     |           Xiao-Lai方案            | Xiao-Lai方案的动态白盒版本 |
| :----------: | :------------------------------: | :------------------------: |
| 所需存储空间 | 148.625KB |         8.145MB          |
| 更新密钥开销 |            148.625KB                  |            128B            |

值得注意的是，添加混淆后白盒SM4方案的轮函数不再是对合运算，因此一般使用两套查找表分别进行加密和解密运算。在铜锁项目中，为了节省存储查找表的空间，在生成白盒查找表时使用一个原始SM4密钥生成加密与解密共用的查找表。其中，在轮函数的第一部分和第二部分加密和解密可以共用查找表，因此加密与解密共用的查找表相比加密用的查找表所需的额外空间为轮函数第三部分的 $32 \times 264 = 8448(\text{B})$,加密与解密共用的查找表所需的存储空间总共约为8.153MB。

### 3.2 性能

使用自定义的benchmark进行测试，重复测试10,000轮，每轮加密大小为8KB的数据，计算每秒能处理的数据量。
性能测试环境如下：
- 操作系统：macOS Sequoia 15.3.2
- 处理器：Apple M4
- 内存：16GB
- 编译器：Apple clang version 16.0.0 (clang-1600.0.26.6)
- 构建方式：
```bash
./config --prefix=/usr/local enable-wbsm4-xiao-dykey
make -j8
make install

# benchmark
cc -O3 -o benchmark_wbsm4 benchmark_wbsm4.c -lcrypto
```

`benchmark_wbsm4.c`：
```c
#include <stdio.h>
#include <string.h>
#include <time.h>
#include <openssl/evp.h>
#include <openssl/kdf.h>
#include <openssl/core_dispatch.h>
#include <openssl/core_names.h>

#define SM4_BLOCK_SIZE 16
#define BUF_SIZE (1024 * 8)
#define TEST_ROUNDS 10000

void benchmark(const char *cipher_name) {
    uint8_t k[SM4_BLOCK_SIZE] = {0};
    uint8_t iv[SM4_BLOCK_SIZE] = {0};
    uint8_t input[BUF_SIZE] = {0};
    uint8_t ciphertext[BUF_SIZE + SM4_BLOCK_SIZE];
    int ciphertext_len = 0;
    int outl = 0;
    unsigned char *wbsm4ctx = NULL;

    memset(input, 'A', BUF_SIZE);

    if (strncmp(cipher_name, "wbsm4-", 6) == 0) {
        int mode = EVP_KDF_WBSM4KDF_MODE_GEN_TABLE;
        OSSL_PARAM params[4];
        params[0] = OSSL_PARAM_construct_octet_string(OSSL_KDF_PARAM_KEY, k, SM4_BLOCK_SIZE);
        params[2] = OSSL_PARAM_construct_int(OSSL_KDF_PARAM_MODE, &mode);
        params[3] = OSSL_PARAM_construct_end();

        EVP_KDF *kdf = EVP_KDF_fetch(NULL, "WBSM4KDF", NULL);
        EVP_KDF_CTX *kctx = EVP_KDF_CTX_new(kdf);
        size_t len_wbsm4ctx = EVP_KDF_CTX_get_kdf_size(kctx);
        wbsm4ctx = (unsigned char *)OPENSSL_malloc(len_wbsm4ctx);
        EVP_KDF_derive(kctx, wbsm4ctx, len_wbsm4ctx, params);
    }

    const EVP_CIPHER *cipher = EVP_get_cipherbyname(cipher_name);
    EVP_CIPHER_CTX *cipher_ctx = EVP_CIPHER_CTX_new();

    clock_t start = clock();
    for (int i = 0; i < TEST_ROUNDS; i++) {
        if (strncmp(cipher_name, "wbsm4-", 6) == 0) {
            EVP_EncryptInit(cipher_ctx, cipher, (unsigned char *)wbsm4ctx, iv);
        }
        else {
            EVP_EncryptInit(cipher_ctx, cipher, k, iv);
        }
        EVP_EncryptUpdate(cipher_ctx, ciphertext, &outl, input, BUF_SIZE);
        ciphertext_len = outl;
        EVP_EncryptFinal(cipher_ctx, ciphertext + outl, &outl);
        ciphertext_len += outl;
    }

    clock_t end = clock();
    double elapsed = (double)(end - start) / CLOCKS_PER_SEC;
    double total_kb = (double)BUF_SIZE * TEST_ROUNDS / (1024.0);
    double speed = total_kb / elapsed;

    printf("[%-30s] Time: %.3f s | Speed: %.2f KB/s\n", cipher_name, elapsed, speed);
}

int main() {
    benchmark("sm4-cbc");
    benchmark("wbsm4-xiao-dykey-cbc");

    return 0;
}
```

测试结果如下所示，这里同时对比了Xiao-Lai方案 <sup>[2]</sup> （wbsm4-xiao-stkey）和Jin-Bao方案 <sup>[3]</sup> （wbsm4-jin-stkey）。由于白盒实现中加入了大量的混淆操作，SM4白盒方案的执行速度相较于普通SM4算法较慢。

```
[sm4-cbc                       ] Time: 0.537 s | Speed: 148985.78 KB/s
[wbsm4-xiao-dykey-cbc          ] Time: 122.615 s | Speed: 652.45 KB/s
[wbsm4-xiao-stkey-cbc          ] Time: 115.692 s | Speed: 691.49 KB/s
[wbsm4-jin-stkey-cbc           ] Time: 9.601 s | Speed: 8332.04 KB/s
```

### 3.3 安全性

白盒多样性（Diversity）和白盒含混度（Ambiguity）是评估白盒实现安全性的两个最广泛使用的指标。

**a. 白盒多样性**

白盒多样性指的是查找表所有可能的构造方法的个数，它由输入输出置乱编码有多少种选择以及密钥空间决定。查找表种的输入输出置乱编码都是随机选择的，白盒多样性的值越大，攻击者就越难分析出隐藏在查找表中的密钥信息以及输入输出置乱编码。

Xiao-Lai方案的白盒多样性计算过程已在参考文献[2]中给出，这里不再赘述。$\mathbf{GF}(2)$上的$n \times n$的可逆矩阵数量为$\prod_{i=1}^{n-1}\left(2^n-2^i\right)$ <sup>[4]</sup> ，因此Xiao-Lai方案的动态白盒版本在每一轮的白盒多样性可以估算为：
- 第一部分：$(2^{1023} \times 2^{32})^3 \times (2^{63} \times 2^{8})^{4} \approx 2^{3449}$；
- 第二部分：4 个 8 比特输入，32 比特输出的查找表的白盒多样性为：$(2^{63} \times 2^{8})^{4} \times 2^{32} \times (2^{1023} \times 2^{32}) \approx 2^{1371}$；
添加异或辅助表后，在每一轮中额外引入的白盒多样性为：$(16!)^{8} \times (2^{63} \times 2^8)^{4 \times 2} \approx 2^{992}$，第二部分的白盒多样性总共为$2^{1371} \times 2^{992} = 2^{2293}$；
- 第三部分：$(2^{1023} \times 2^{32})^3 \times 2^{32} \approx 2^{3197}$。

将白盒方案每一轮的白盒多样性总结在下表中。
|   方案   | Xiao-Lai方案   | Xiao-Lai方案的动态白盒版本 |
| :------: | :----------: | :------------------------: |
| 第一部分 | $2^{3449}$ |             $2^{3449}$        |
| 第二部分 | $2^{1371}$ |        $2^{2293}$        |
| 第三部分 | $2^{3197}$ |              $2^{3197}$        |

**b. 白盒含混度**

白盒含混度用于衡量有多少种不同的构造方法会产生相同的查找表。通常情况下，白盒含混度可以用白盒多样性与查找表个数的比值来计算。同样地，白盒含混度的值越大，攻击者就越难从特定的查找表中推断出隐藏的输入输出置乱编码和密钥。

Xiao-Lai方案的白盒含混度计算过程已在参考文献[2]中给出，这里不再赘述。Xiao-Lai方案的动态白盒版本在每一轮的白盒含混度可以估算为：
- 第一部分：$ (2^{63} \times 2^{8})^{4} \approx 2^{284}$；
- 第二部分：4 个 8 比特输入，32 比特输出的查找表的白盒含混度为：$(2^{63} \times 2^{8})^{4} \times 2^{32} \approx 2^{316}$；
添加异或辅助表后，在每一轮中额外引入的白盒含混度为：$(2^8!)^{4} \approx 2^{846}$，第二部分的白盒含混度总共为$2^{316} \times 2^{846} = 2^{1162}$；
- 第三部分：$2^{1023} \times 2^{32} \times 2^{32} \approx 2^{1087}$。

将白盒方案每一轮的白盒含混度总结在下表中。

|   方案   | Xiao-Lai方案 | Xiao-Lai方案的动态白盒版本 |
| :------: | :----------: | :------------------------: |
| 第一部分 | $2^{284}$ |         $2^{284}$        |
| 第二部分 | $2^{316}$ |        $2^{1162}$        |
| 第三部分 | $2^{1087}$ |        $2^{1087}$        |

## 4 使用示例

### 4.1 编译选项

相关 PR 链接：[#723](https://github.com/Tongsuo-Project/Tongsuo/pull/723)。

白盒sm4方案默认关闭，可以通过编译选项开启。

```bash
./config --prefix=/usr/local  enable-wbsm4-xiao-dykey 
make -j
make install
```

### 4.2 EVP接口

铜锁已将白盒SM4核心组件封装，可以通过EVP接口访问。下面给出一个使用Xiao-Lai方案的动态白盒版本（wbsm4-xiao-dykey）进行加密的示例。

```c
// 生成白盒密钥及查找表
EVP_KDF *kdf = EVP_KDF_fetch(NULL, "WBSM4KDF", NULL);
EVP_KDF_CTX *kctx = EVP_KDF_CTX_new(kdf);
size_t len_wbsm4ctx = EVP_KDF_CTX_get_kdf_size(kctx);
unsigned char *wbsm4ctx = (unsigned char *)OPENSSL_malloc(len_wbsm4ctx);

int mode = EVP_KDF_WBSM4KDF_MODE_GEN_TABLE;
OSSL_PARAM params[4];
params[0] = OSSL_PARAM_construct_octet_string(OSSL_KDF_PARAM_KEY, k, SM4_BLOCK_SIZE);
params[1] = OSSL_PARAM_construct_int(OSSL_KDF_PARAM_MODE, &mode);
params[2] = OSSL_PARAM_construct_end();
EVP_KDF_derive(kctx, wbsm4ctx, len_wbsm4ctx, params);

// 初始化加密上下文
const EVP_CIPHER *cipher = EVP_get_cipherbyname("WBSM4-XIAO-DYKEY-ECB");
EVP_CIPHER_CTX *cipher_ctx = EVP_CIPHER_CTX_new();
EVP_EncryptInit(cipher_ctx, cipher, (unsigned char *)wbsm4ctx, NULL);

// 加密
EVP_EncryptUpdate(cipher_ctx, block, &outl, input, SM4_BLOCK_SIZE);

/* 在不更换整个查找表的情况下，更新白盒密钥 */
mode = EVP_KDF_WBSM4KDF_MODE_UPDATE_KEY;
params[0] = OSSL_PARAM_construct_octet_string(OSSL_KDF_PARAM_KEY, new_k, SM4_BLOCK_SIZE);
params[1] = OSSL_PARAM_construct_int(OSSL_KDF_PARAM_MODE, &mode);
params[2] = OSSL_PARAM_construct_end();
uint8_t *wbrk_buf = (uint8_t *)OPENSSL_malloc(SM4_KEY_SCHEDULE * sizeof(uint32_t));

// EVP_KDF_derive()根据输入的update_key推导出32个轮密钥，并进行混淆生成对应的白盒密钥，存放在wbrk_buf中
EVP_KDF_derive(kctx, wbrk_buf, SM4_KEY_SCHEDULE * sizeof(uint32_t), params);

// 更新白盒密钥到加密上下文对象
params[0] = OSSL_PARAM_construct_octet_string(OSSL_CIPHER_PARAM_WBSM4_WBRK, wbrk_buf, SM4_KEY_SCHEDULE * sizeof(uint32_t));
params[1] = OSSL_PARAM_construct_end();
EVP_CIPHER_CTX_set_params(cipher_ctx, params); 

// 使用新密钥加密
EVP_EncryptUpdate(cipher_ctx, block, &outl, input, SM4_BLOCK_SIZE);
```

## 参考文献

[1] CHOW S, EISEN P, JOHNSON H, 等. White-Box Cryptography and an AES Implementation[C/OL]//NYBERG K, HEYS H. Selected Areas in Cryptography. Berlin, Heidelberg: Springer, 2003: 250-270. DOI:10.1007/3-540-36492-7_17.

[2] 肖雅莹.白盒密码及AES与SMS4算法的实现[D].上海交通大学,2010.

[3] JIN C, BAO Z, MIAO W, 等. A Lightweight Nonlinear White-Box SM4 Implementation Applied to Edge IoT Agents[J/OL]. IEEE Access, 2023, 11: 68717-68727. DOI:10.1109/ACCESS.2023.3290211.

[4] 王滨, 陈思, 陈加栋, 等. DWB-AES：基于AES的动态白盒实现方法[J]. 通信学报, 2021, 42(2): 177-186.
