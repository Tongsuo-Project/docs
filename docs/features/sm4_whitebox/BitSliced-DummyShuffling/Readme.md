# 基于比特切片实现的虚拟洗牌保护方案的生成器研究

## 1 绪论
与传统密码分析的危险信道模型不同，白盒密码学假定运行密码算法被部署在不安全的执行环境中，
攻击者对于运行密码算法的设备具备完全的掌控能力，可以通过提取代码组件、分析运行过程中产生的中间状态等方式恢复密钥。由于其适用于移动支付、数字版权管理等商用场景，在近些年愈发受到关注。

从保护方案上来看，主流的、受到关注的白盒保护方案共分为三种：基于编码（Encode）的白盒保护方案[1, 2]、基于高次非线性掩码（Masking）的白盒保护方案[3]以及基于虚拟洗牌的白盒保护方案[4]。而随着白盒密码的发展，编码和掩码保护方案被证明是脆弱的、容易受到差分计算分析（differential computation attack，DCA）攻击[5, 6]。虚拟洗牌方案是迄今为止唯一一个可以达到其所声明的安全性的方案，因此备受关注。

虚拟洗牌方案是 **WhibOx19** 白盒竞赛的三个优胜方案之一，并在欧密2021中由其设计者 Biryukov 和 Udovenko 公布具体细节。它旨在对抗差分计算攻击，采用冗余操作来掩盖真实计算的值。虚拟洗牌方案需要配合掩码方案才能达到预期的安全性。其中，使用线性掩码即可达到预期的安全性。值得一提的是，虚拟洗牌方案的实现效率及低，因此，在 WhibOx19 竞赛中使用者采用了比特切片（bitslice）的实现方式。然而，公布的论文[8]中并未提及该方案的具体实现细节，只给出了该方案的伪代码，而这个伪代码本身并无法进行比特切片操作。除此之外，论文并未公布生成器的相关代码，这使得使用虚拟洗牌方案保护密码算法在实际应用中的安全性成为了一个没有解决的难题。

### 1.1 本研究工作

基于上述考虑，本研究在[8]中提出的虚拟洗牌的伪代码的基础上，给出了虚拟洗牌方案的布尔电路实现方式。该实现方式可以直接使用比特切片，达到与 Biryukov 和 Udovenko 在 WhibOx 竞赛中同数量级的实现效率。
同时，本方案给出针对 SM4 商用密码标准的白盒实现程序生成器。

## 2 基础知识
### 2.1 虚拟洗牌

虚拟洗牌方案（dummy shuffling）方案包含 $N_s$ 个计算槽（slot），每个槽执行正常的加密（或解密，后续以加密为例进行描述）行为，例如 AES、SM4 等。然而，根据计算槽的输入不同被分成两类：

- 主槽（main slot）：输入为真实的明文；

- 虚拟槽（dummy slot）：输入为与明文相同长度的随机值。

每次进行计算时，主槽的未知随机选取。

该方案的具体执行流程如下：

1）输入混淆阶段：
生成 $(Ns-1)$ 个虚拟输入并与真实输入（即主槽输入）混淆。混淆后的输入记为 {p1,...,pNs}。其中，真实输入的位置 pm 是随机的，即满足概率：

        Pr{pm = i} = 1 / Ns, i =1,2,...,Ns

2)计算阶段：对于每一个索引，计算

        ci = E(pi)
        
3)输出选择阶段：提取主槽输出 pm 作为输出。

### 2.2 掩码

掩码（masking）是适用于侧信道防护即白盒防护中的一种重要策略，值得一提的是，虚拟洗牌方案被证明只有在结合掩码方案时才具备预期的安全性。

由于我们着重于虚拟洗牌方案的研究，因此仅介绍常用的 ISW 线性掩码方案，该方案的运行效率较高，常用作虚拟洗牌方案的补偿方案。
ISW 将运行过程中的每一个中间状态 s 拆分成 n 个比特，即 $s = s1⊕...⊕sn$，其中 n 是一个可以被选择的参数。

### 2.3 比特切片技术












# 参考文献
[1]Chow S ,  Eisen P A ,  Johnson H , et al. White-Box Cryptography and an AES Implementation[J]. Springer, Berlin, Heidelberg, 2002.

[2]Bringer J ,  Chabanne H ,  Dottax E . White Box Cryptography: Another Attempt[J]. Iacr Cryptology Eprint Archive, 2006.

[3]Biryukov, A, Udovenko, A, Attacks and countermeasures for white-box designs., Peyrin, T., Galbraith, S. (eds.) ASIACRYPT 2018, Part II. LNCS, vol. 11273, pp. 373–402. Springer, Heidelberg (Dec 2018)

[4]Biryukov A, Udovenko A. Dummy shuffling against algebraic attacks in white-box implementations[C]//Annual International Conference on the Theory and Applications of Cryptographic Techniques. Cham: Springer International Publishing, 2021: 219-248.

[5]Bos J W, Hubain C, Michiels W, et al. Differential computation analysis: Hiding your white-box designs is not enough[C]//Cryptographic Hardware and Embedded Systems–CHES 2016: 18th International Conference, Santa Barbara, CA, USA, August 17-19, 2016, Proceedings 18. Springer Berlin Heidelberg, 2016: 215-236.

[6]Rivain M, Wang J. Analysis and improvement of differential computation attacks against internally-encoded white-box implementations[J]. IACR Transactions on Cryptographic Hardware and Embedded Systems, 2019: 225-255.

[7]Biryukov A, Udovenko A. Dummy shuffling against algebraic attacks in white-box implementations[C]//Annual International Conference on the Theory and Applications of Cryptographic Techniques. Cham: Springer International Publishing, 2021: 219-248.

[8]Biryukov A, Udovenko A. Dummy shuffling against algebraic attacks in white-box implementations[C]//Annual International Conference on the Theory and Applications of Cryptographic Techniques. Cham: Springer International Publishing, 2021: 219-248.

[9]Ishai Y, Sahai A, Wagner D. Private circuits: Securing hardware against probing attacks[C]//Advances in Cryptology-CRYPTO 2003: 23rd Annual International Cryptology Conference, Santa Barbara, California, USA, August 17-21, 2003. Proceedings 23. Springer Berlin Heidelberg, 2003: 463-481.
