---
查找表种的输入输出置乱编码都是随机选择的,白盒多样性的值越大,攻击者就  越难分析出隐藏在查找表中的密钥信息以及输入输出置乱编码。sidebar_label: '国密SM4算法的白盒方案实现'
sidebar_position: 99
---
# 国密SM4算法的白盒方案实现

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

### 2.2 Xiao-Lai方案（wbsm4-xiao-stkey）

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

其中$A_i$为$\mathbf{GF}(2)$上的$32 \times 32$比特的可逆矩阵，$a_i$为32比特的向量。
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

线性变换$L$可以表示为左乘一个$\mathbf{GF}(2)$上的$32 \times 32$比特的矩阵$L$， 将非线性变换$\tau$与线性变换$L$结合在一起，并添加输出置乱编码$Q_{i}$。$Q_{i}$同样是32比特到32比特的可逆仿射变换。前一步操作的输出置乱编码$E_i$的逆$E_i^{-1}$作为本操作的输入置乱编码。对于一个32到32比特的非线性变换，如果用查找表表示，查找表的大小将为$2^{32} \times 32 = 16\text{GB}$，这样大小的查找表在实际应用中并不适用。因此，Xiao-Lai方案根据矩阵乘法的性质，把整个变换拆分成4个8比特到32比特的变换，再用查找表的形式表示小变换。不妨设$Q_i(x)=B_i \cdot x \oplus b_i$，则

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

### 2.3 Jin-Chao方案（wbsm4-jin-stkey）

Jin-Chao方案 <sup>[3]</sup> 使用随机非线性双射作为置乱编码。由于非线性双射不具有仿射变换的类线性性质，需要使用查找表辅助进行异或操作。为了减少查找表占用的空间，使用级联编码（Concatenation Code）实现非线性双射。对于$k$个双射函数$F_{i}(i = 1,\cdots,k)$，若输入为$n$比特的函数$F$满足：

$$
F(b) = \left\lbrack F_{1}\left( b_{1},\cdots,b_{n_{1}} \right),F_{2}\left( b_{n_{1} + 1},\cdots,b_{n_{2}} \right),\cdots, \right.\ \left. \ F_{k}\left( b_{n_{k - 1} + 1},\cdots,b_{n} \right) \right\rbrack
$$

其中$b=(b_1, \ldots, b_n)$，$b_{j}, j=1, \ldots, n$表示单个比特，则函数$F$是通过级联编码实现的映射。通过这种方式可以将一个较大的双射函数$F$分解为$k$个较小的双射函数$F_{i}$。假设每个较小双射函数的输入长度相同，对于一个从$n$比特到$m$比特的函数$F$，直接使用查找表实现所需的存储空间为$m \cdot 2^{n}$比特，使用级联编码实现所需的存储空间仅需$m \cdot 2^{\frac{n}{k}}$比特。在本方案中的所有非线性变换都使用8个4比特双射构成的级联编码实现。类似地，Jin-Chao方案将SM4轮函数的计算过程分为三个部分。

**(1) 计算$X_{i}' = X_{i+1} \oplus X_{i+2} \oplus X_{i+3}$**

依次计算：

$$
\begin{aligned}
    XT_{i} &= Ea_i[P_{i+1}^{-1}[X_{i+1}]\; \oplus P_{i+2}^{-1}[X_{i+2}]] \\
    X_{i}' &= E_i[Ea_{i}^{-1}[XT_{i}]\; \oplus P_{i+3}^{-1}[X_{i+3}]] ,
\end{aligned}
$$

其中$P_{i+j}(j=1,2,3)$、$Ea_i$均是32比特到32比特的随机非线性双射。分别将上述两式固化为查找表，在进行加解密时依次查表。

**(2) 计算$X''_i = T(X_{i}'\oplus rk_i)$**

与Xiao-Lai方案类似，同样将轮密钥隐藏到S盒中，并将非线性变换$\tau$与线性变换$L$结合在一起，添加输入输出置乱编码。不同的是本方案使用非线性双射作为置乱编码。记$E_i = (E_{i0}, \ldots, E_{i7})$，$X_{i}'=(x_0, \ldots, x_3)^\top$，$L=(L_0, \ldots, L_3)$，则本阶段计算过程可以表示为：

$$
\begin{aligned}
    Xa_{i} &= Qa_i[L_0 \cdot S_{i0}(E_{i0}^{-1} || E_{i1}^{-1}[x_0])] \\
    Xb_{i} &= Qb_i[L_1 \cdot S_{i1}(E_{i2}^{-1} || E_{i3}^{-1}[x_1])] \\
    Xc_{i} &= Qc_i[L_2 \cdot S_{i2}(E_{i4}^{-1} || E_{i5}^{-1}[x_2])] \\
    Xd_{i} &= Qd_i[L_3 \cdot S_{i3}(E_{i6}^{-1} || E_{i7}^{-1}[x_3])]  ,
\end{aligned}
$$

其中$Qa_i, Qb_i, Qc_i, Qd_i$均是32比特到32比特的随机非线性双射，$||$表示并行操作。同样地，将上述每式固化为查找表，在进行加解密时依次查表。

**(3) 计算$X_{i+4}=X_{i}\oplus X''_i$**

与第一阶段类似，本阶段同样使用异或辅助表实现加解密逻辑，依次计算：

$$
\begin{aligned}
    Xe_{i} &= Qe_i[P_{i}^{-1}[X_{i}]\; \oplus Qa_{i}^{-1}[Xa_{i}]] \\
    Xf_{i} &= Qf_i[Qe_{i}^{-1}[Xe_{i}]\; \oplus Qb_{i}^{-1}[Xb_{i}]] \\
    Xg_{i} &= Qg_i[Qf_{i}^{-1}[Xf_{i}]\; \oplus Qc_{i}^{-1}[Xc_{i}]] \\
    X_{i+4} &= P_{i+4}[Qg_{i}^{-1}[Xg_{i}]\; \oplus Qd_{i}^{-1}[Xd_{i}]] \\
\end{aligned}
$$

其中$Qe_i, Qf_i, Qg_i$均是32比特到32比特的随机非线性双射。同样地，将上述每式固化为查找表，在进行加解密时依次查表。

### 2.4 Xiao-Lai方案的动态白盒版本（wbsm4-xiao-dykey）

Xiao-Lai方案的动态白盒版本将原本隐藏在S盒中的轮密钥提取出来，经过混淆后单独存放，并使用异或辅助表完成轮密钥与SM4中间状态的异或。Xiao-Lai方案的动态白盒版本在轮函数的第一部分计算$X_{i+1},X_{i+2},X_{i+3}$三个状态的异或，以第三部分计算$X_{i}$与$X''$的异或过程与原始Xiao-Lai方案方案相同，这里不再赘述。下面将着重介绍轮函数第二部分的计算过程：

**(1) 生成白盒密钥$wbrk_i$**

受文献[4]启发，在可信环境下，对原始SM4轮密钥依次添加随机可逆仿射变换混淆和随机非线性双射混淆，生成白盒密钥：

$$
wbrk_i = R_i[Ek_i[rk_i]]
$$

其中$Ek_i=\operatorname{diag}(Ek_{i0}, Ek_{i1},Ek_{i2},Ek_{i3})$，其中$Ek_{ij},j=0, \ldots, 3$是8比特到8比特的可逆仿射变换。$R_i$是由级联编码定义的32比特到32比特的随机非线性双射变换。计算完成后，白盒密钥可以被传输至白盒环境下。由于原始轮密钥是保密的，可以保证白盒密钥具有不低于Xiao-Lai方案中SM4中间状态$X_i$的安全性。

**(2) 计算$X_{i}'\oplus rk_i$**

为了实现中间状态与轮密钥的异或操作，需要使用异或辅助表，这里使用的是由4个8比特的级联编码构成、与Jin-Chao方案中相似的查找表。具体而言：

$$
X''_i = Ea_i[E_{i}^{-1}[X'_{i}] \oplus Ek_{i}^{-1}[R_{i}^{-1}[wbrk_{i}]]]
$$

将上式固化为查找表，在进行加解密时通过查表实现SM4中间状态与轮密钥的异或。

**(3) 计算$X''_i = T(X_{i}'\oplus rk_i)$**

与原始Xiao-Lai方案类似，$T\left( X_{i}' \oplus{rk}_{i} \right)$的计算同样由4个8比特到32比特的查找表组成，只不过由于轮密钥已经和SM4状态异或，这里生成查找表使用的是普通的SM4 S盒。本阶段的查找表生成方式如下：

$$
\begin{aligned}
    Xa_{i} &= R_{i0} \cdot Sbox(E_{i0}^{-1}[x_0]) \\
    Xb_{i} &= R_{i1} \cdot Sbox(E_{i1}^{-1}[x_1]) \\
    Xc_{i} &= R_{i2} \cdot Sbox(E_{i2}^{-1}[x_2]) \\
    Xd_{i} &= R_{i3} \cdot Sbox(E_{i3}^{-1}[x_3]) \oplus b_i  \\
    X_i'' &= Xa_{i} \oplus Xb_{i} \oplus Xc_{i} \oplus Xd_{i}
\end{aligned}
$$

## 3 方案分析

### 3.1 占用空间大小

Xiao-Lai方案和Jin-Chao方案的存储空间大小分析已在参考文献[2]、[3]中给出，这里不再赘述。对于Xiao-Lai方案的动态白盒版本，除Xiao-Lai方案本身所需要的查找表外，还需要2个32比特输入，32比特输出的异或辅助表。在异或辅助表使用4个8比特的级联编码实现的情况下，需要占用$32 \times 2^{8+8} \times 8 \times 4 = 8(\text{MB})$的存储空间，共需要8.149MB的存储空间。在更新密钥时，Xiao-Lai方案的动态白盒版本无需更新所有查找表，只需要更新白盒密钥即可。将三种方案所需的存储空间大小以及更新密钥的开销总结在下表中。

|     方案     |           Xiao-Lai方案           |         Jin-Chao方案         | Xiao-Lai方案的动态白盒版本 |
| :----------: | :------------------------------: | :--------------------------: | :------------------------: |
| 所需存储空间 | 148.625KB | 320KB |          8.149MB          |
| 更新密钥开销 |            148.625KB            |            320KB            |            128B            |

### 3.2 性能

使用自定义的benchmark进行测试，重复测试10,000轮，每轮加密大小为8KB的数据，计算每秒能处理的数据量。由于白盒实现中加入了大量的混淆操作，SM4白盒方案的执行速度相较于普通SM4算法较慢。在三种SM4白盒方案中，Jin-Chao方案的所有操作均通过查找表完成，无需进行矩阵乘法运算，因此执行速度相对较快。

```
[sm4-cbc                       ] Time: 0.537 s | Speed: 148985.78 KB/s
[wbsm4-xiao-stkey-cbc          ] Time: 115.692 s | Speed: 691.49 KB/s
[wbsm4-jin-stkey-cbc           ] Time: 9.601 s | Speed: 8332.04 KB/s
[wbsm4-xiao-dykey-cbc          ] Time: 122.615 s | Speed: 652.45 KB/s
```


### 3.3 安全性

白盒多样性（Diversity）和白盒含混度（Ambiguity）是评估白盒实现安全性的两个最广泛使用的指标。

**a. 白盒多样性**

白盒多样性指的是查找表所有可能的构造方法的个数，它由输入输出置乱编码有多少种选择以及密钥空间决定。查找表种的输入输出置乱编码都是随机选择的，白盒多样性的值越大，攻击者就越难分析出隐藏在查找表中的密钥信息以及输入输出置乱编码。

Xiao-Lai方案和Jin-Chao方案的白盒多样性计算过程已在参考文献[2]、[3]中给出，这里不再赘述。Xiao-Lai方案的动态白盒版本引入了异或辅助表，在每一轮中额外引入的白盒多样性为：$(16!)^{8} \times (2^{63} \times 2^8)^{4 \times 2} \approx 2^{992}$，第二部分的白盒多样性总共为$2^{2293}$。将三种方案每一轮的白盒多样性总结在下表中。

|   方案   | Xiao-Lai方案 |                     Jin-Chao方案                     | Xiao-Lai方案的动态白盒版本 |
| :------: | :----------: | :---------------------------------------------------: | :------------------------: |
| 第一部分 | $2^{3449}$ |        $(16!)^{8 \times 5} \approx 2^{1770}$        |        $2^{3449}$        |
| 第二部分 | $2^{1371}$ | $2^{32} \times (16!)^{8 \times 5} \approx 2^{1802}$ |        $2^{2293}$        |
| 第三部分 | $2^{3197}$ |        $(16!)^{8 \times 9} \approx 2^{3186}$        |        $2^{3197}$        |

**b. 白盒含混度**

白盒含混度用于衡量有多少种不同的构造方法会产生相同的查找表。通常情况下，白盒含混度可以用白盒多样性与查找表个数的比值来计算。同样地，白盒含混度的值越大，攻击者就越难从特定的查找表中推断出隐藏的输入输出置乱编码和密钥。

Xiao-Lai方案的动态白盒版本中的异或辅助表的白盒含混度为：$(2^8!)^{4} \approx 2^{846}$，第二部分总的白盒含混度为$2^{1162}$。将三种方案每一轮的白盒含混度总结在下表中。

|   方案   | Xiao-Lai方案 | Jin-Chao方案 | Xiao-Lai方案的动态白盒版本 |
| :------: | :----------: | :----------: | :------------------------: |
| 第一部分 | $2^{284}$ | $2^{708}$ |        $2^{284}$        |
| 第二部分 | $2^{316}$ | $2^{386}$ |        $2^{1162}$        |
| 第三部分 | $2^{1087}$ | $2^{1416}$ |        $2^{1087}$        |

## 4 使用示例

### 4.1 编译选项

白盒sm4方案默认关闭，可以通过编译选项开启

```bash
./config --prefix=/usr/local enable-wbsm4-xiao-stkey enable-wbsm4-xiao-dykey enable-wbsm4-jin-stkey
make -j
make install
```

### 4.2 EVP接口

铜锁已将白盒SM4核心组件封装，可以通过EVP接口访问。下面给出一个使用Xiao-Lai方案的动态白盒版本（wbsm4-xiao-dykey）进行加密的示例。

```c
OSSL_PARAM params[4];
params[0] = OSSL_PARAM_construct_octet_string(OSSL_KDF_PARAM_KEY, k, SM4_BLOCK_SIZE);
params[1] = OSSL_PARAM_construct_utf8_string(OSSL_KDF_PARAM_CIPHER, "wbsm4-xiao-dykey", 0);
params[2] = OSSL_PARAM_construct_int(OSSL_KDF_PARAM_MODE, &mode);
params[3] = OSSL_PARAM_construct_end();

EVP_KDF *kdf = EVP_KDF_fetch(NULL, "WBSM4KDF", NULL);
EVP_KDF_CTX *kctx = EVP_KDF_CTX_new(kdf);
ret = EVP_KDF_CTX_set_params(kctx, params);
size_t len_wbsm4ctx = EVP_KDF_CTX_get_kdf_size(kctx);

unsigned char *wbsm4ctx = (unsigned char *)OPENSSL_malloc(len_wbsm4ctx);
ret = EVP_KDF_derive(kctx, wbsm4ctx, len_wbsm4ctx, NULL);

const EVP_CIPHER *cipher = EVP_get_cipherbyname("WBSM4-XIAO-DYKEY-ECB");
EVP_CIPHER_CTX *cipher_ctx = EVP_CIPHER_CTX_new();
EVP_EncryptInit(cipher_ctx, cipher, (unsigned char *)wbsm4ctx, NULL);

memcpy(block, input, SM4_BLOCK_SIZE);
EVP_EncryptUpdate(cipher_ctx, block, &outl, block, SM4_BLOCK_SIZE);

// 只有Xiao-Lai方案的动态白盒版本（wbsm4-xiao-dykey）可以通过以下方式更新密钥
int update_key = 1;
params[0] = OSSL_PARAM_construct_octet_string(OSSL_KDF_PARAM_KEY, new_k, SM4_BLOCK_SIZE);
params[1] = OSSL_PARAM_construct_int(OSSL_KDF_PARAM_WBSM4_UPDATE_KEY, &update_key);
params[2] = OSSL_PARAM_construct_end();
uint8_t *wbrk_buf = (uint8_t *)OPENSSL_malloc(32 * sizeof(uint32_t));

ret = EVP_KDF_derive(kctx, wbrk_buf, 32 * sizeof(uint32_t), params);

params[0] = OSSL_PARAM_construct_octet_string(OSSL_KDF_PARAM_KEY, wbrk_buf, 32 * sizeof(uint32_t));
params[1] = OSSL_PARAM_construct_end();
ret = EVP_CIPHER_CTX_set_params(cipher_ctx, params); 

memcpy(block, input, SM4_BLOCK_SIZE);
outl = SM4_BLOCK_SIZE;
ret = EVP_EncryptUpdate(cipher_ctx, block, &outl, block, SM4_BLOCK_SIZE);
```

### 4.3 测试样例

在 `test/wbsm4_internel_test.c`中提供了相关测试样例。

```c
int test_wbsm4_xiao_stkey(void);
int test_EVP_wbsm4_xiao_stkey(void);
int test_wbsm4_jin_stkey(void);
int test_EVP_wbsm4_jin_stkey(void);
int test_wbsm4_xiao_dykey(void);
int test_EVP_wbsm4_xiao_dykey(void);
```

## 参考文献

[1] CHOW S, EISEN P, JOHNSON H, 等. White-Box Cryptography and an AES Implementation[C/OL]//NYBERG K, HEYS H. Selected Areas in Cryptography. Berlin, Heidelberg: Springer, 2003: 250-270. DOI:10.1007/3-540-36492-7_17.

[2] 肖雅莹.白盒密码及AES与SMS4算法的实现[D].上海交通大学,2010.

[3] JIN C, BAO Z, MIAO W, 等. A Lightweight Nonlinear White-Box SM4 Implementation Applied to Edge IoT Agents[J/OL]. IEEE Access, 2023, 11: 68717-68727. DOI:10.1109/ACCESS.2023.3290211.

[4] 王滨, 陈思, 陈加栋, 等. DWB-AES：基于AES的动态白盒实现方法[J]. 通信学报, 2021, 42(2): 177-186.
