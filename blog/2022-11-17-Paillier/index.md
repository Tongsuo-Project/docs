---
title: Tongsuo 支持半同态加密算法 Paillier
authors: [wa5i]
tags: [算法]
---
## 背景
在[《Tongsuo 支持半同态加密算法 EC-ElGamal》](https://www.yuque.com/tsdoc/misc/ec-elgamal)中，已经阐述了同态和半同态加密算法的背景和原理，可以移步查阅，总之，同态算法在隐私计算领域有着重要的作用，目前应用比较广泛的是 Paillier 和 EC-ElGamal 半同态加密算法，这两个算法都只支持加法同态，其接口也类似，只是原理和性能不一样，Paillier 是基于复合剩余类的困难性问题（大数分解难题）的公钥加密算法，有点类似 RSA，而 EC-ElGamal 是基于椭圆曲线数学理论的公钥加密算法，其安全性理论上要比 Paillier 要更好，但其性能各有优劣，EC-ElGamal 的加密和密文加法性能要比 Paillier 好，而 Paillier 的解密和密文标量乘法性能要比 EC-ElGamal 好，而且稳定，EC-ElGamal 的解密性能与解密的数字大小有关系，数字越大可能需要解密的时间越长，这与 EC-ElGamal 解密用到的解密表有关系，而 Paillier 的解密就没有这个问题，可以根据自己的业务特点选择使用 Paillier 还是 EC-ElGamal。
## Paillier 原理
### 密钥生成

1. 随机选择两个大素数 $p,q$，满足 $gcd(pq, (p-1)(q-1))=1$，且满足 p 和 q 的长度相等；
2. 计算 $n=pq$以及$\lambda=lcm(p-1, q-1)$，$lcm$ 表示最小公倍数；
3. 随机选择整数 $g\gets \mathbb{Z}_{n^2}^*$，一般$g$的计算公式如下：
   1. 随机选择整数 $k \in \mathbb{Z}_{n}^*$
   2. 计算：$g=1+kn$，为了简化和提高性能，$k$一般选1，$g=1+n$
4. 定义 L 函数：$L(x)=\frac{x-1}{n}$，计算：$\mu=(L(g^\lambda \space mod \space n^2))^{-1} \space mod \space n$
5. 公钥：$(n, \space g)$，私钥：$(\lambda, \space \mu)$
### 加密

1. 明文 m，满足 $-n < m < n$
2. 选择随机数 r，满足 $0 \leq r<n$ 且 $r\in \mathbb{Z}_n^*$
3. 计算密文：$c=g^mr^n\space mod\space n^2$
### 解密

1. 密文 c，满足 $c\in \mathbb{Z}_{n^2}^*$
2. 计算明文：$m=L(c^\lambda \space mod \space n^2) \times \mu \space mod \space n$
### 密文加法

1. 密文：$c_1  \space and \space c_2$，计算：$c=c_1 \times c_2 \space mod\space n^2$，$c$ 就是密文加法的结果
### 密文减法

1. 密文：$c_1  \space and \space c_2$，计算：$c=\frac{c_1}{c_2} \space mod\space n^2$，$c$ 就是密文减法的结果
### 密文标量乘法

1. 密文：$c_1$，明文标量：$a$，计算：$c=c_1^a \space mod\space n^2$，$c$ 就是密文标量乘法的结果
## 正确性
### 加解密正确性
公式推导需要用到 Carmichael 函数和确定合数剩余的公式，下面简单说明一下：

- Carmichael 函数
   1. 设 $n=pq$，其中：$p,q$为大素数
   2. 欧拉函数：$\phi(n)$，Carmichael函数：$\lambda(n)$
   3. 当 $\phi(n)=(p-1)(q-1)$和 $\lambda(n)=lcm(p-1, q-1)$时，其中：$\left|\mathbb{Z}_{n^2}^*\right|=\phi(n^2)=n\phi(n)$。对于任意 $w \in \mathbb{Z}_{n^2}^*$，有如下性质：$\begin{cases}
w^\lambda=1\space mod\space n \\
w^{n\lambda}=1\space mod\space n^2
\end{cases}$
- 判定合数剩余
   1. 判定合数剩余类问题是指$n=pq$，其中：$p,q$为大素数，任意给定 $y \in \mathbb{Z}_{n^2}^*$，使得 $z=y^n\space mod\space n^2$，则说 $z$是模$n^2$的第$n$次剩余
   2. 第$n$项剩余的集合是$\mathbb{Z}_{n^2}^*$的一个$\phi(n)$阶乘法子集
   3. 每个第$n$项剩余$z$都正好拥有$n$个$n$阶的根，其中只有一个是严格小于$n$的（即 $\sqrt[n]{z}\space mod\space n$ ）
   4. 第$n$项剩余都可以写成 $(1+n)^x=1+xn\space mod\space n^2$的形式
- 正确性验证
$$
\begin{align}
c^\lambda\space mod\space n^2 & =(g^mr^n)^\lambda\space mod\space n^2 \\
& =g^{m\lambda}r^{n\lambda}\space mod\space n^2 \\
& =g^{m\lambda}\space mod\space n^2 \\
& =(1+n)^{m\lambda}\space mod\space n^2 \\
& =1+nm\lambda\space mod\space n^2 \\
\end{align}
$$

$$
\begin{align}
g^\lambda\space mod\space n^2 & =(1+n)^\lambda\space mod\space n^2 \\
& =1+n\lambda\space mod\space n^2 \\
\end{align}
$$

$$
L(c^\lambda\space mod\space n^2)=\frac{c^\lambda\space mod\space n^2-1}{n}=\frac{1+nm\lambda\space mod\space n^2-1}{n}=m\lambda\space mod\space n^2
$$

$$
L(g^\lambda\space mod\space n^2)=\frac{g^\lambda\space mod\space n^2-1}{n}=\frac{1+n\lambda\space mod\space n^2-1}{n}=\lambda\space mod\space n^2
$$

解密：
$$
\begin{align}
m & = L(c^\lambda \space mod \space n^2) \times \mu \space mod \space n \\
& = \frac{L(c^\lambda \space mod \space n^2)}{L(g^\lambda \space mod \space n^2)}\space mod \space n \\
& = \frac{m\lambda\space mod\space n^2}{\lambda\space mod\space n^2}\space mod \space n \\
& = m\space mod \space n \\
& = m
\end{align}
$$
### 密文加法正确性
$Encrypt(m_1)=c_1$，$Encrypt(m_2)=c_2$
$$
\begin{align}
Decrypt(c) & = Decrypt(c_1 \times c_2 \space mod\space n^2) = Decrypt((g^{m_1}r_1^n\times g^{m_2}r_2^n)\space mod\space n^2) \\
& = Decrypt((g^{m_1+m_2}(r_1+r_2)^n)\space mod\space n^2)=Decrypt((g^{m_1+m_2}{r}^n)\space mod\space n^2)=m_1+m_2\\
\end{align}
$$

### 密文减法正确性
$Encrypt(m_1)=c_1$，$Encrypt(m_2)=c_2$
$$
\begin{align}
Decrypt(c) & = Decrypt(\frac{c_1}{c_2} \space mod\space n^2) = Decrypt(\frac{g^{m_1}r_1^n}{ g^{m_2}r_2^n}\space mod\space n^2) \\
& = Decrypt((g^{m_1}r_1^n\times (g^{m_2}r_2^n)^{-1})\space mod\space n^2) = Decrypt((g^{m_1}r_1^n\times g^{-m_2}r_2^{-n}\space mod\space n^2) \\
& = Decrypt((g^{m_1-m_2}(r_1r_2^{-1})^n)\space mod\space n^2)=Decrypt((g^{m_1-m_2}{r}^n)\space mod\space n^2)=m_1-m_2\\
\end{align}
$$

### 密文标量乘法正确性
$Encrypt(m_1)=c_1$
$$
\begin{align}
Decrypt(c) & = Decrypt(c_1^a
 \space mod\space n^2) = Decrypt((g^{m_1}r^n)^a\space mod\space n^2) \\
& = Decrypt((g^{am_1}(r^a)^n)\space mod\space n^2)=Decrypt((g^{am_1}r_1^n)\space mod\space n^2)=am_1\\
\end{align}
$$
## 算法实现
### 接口定义

- 对象相关接口
   - 公/私钥对象：`PAILLIER_KEY`，该对象用来保存 paillier 公钥和私钥的基本信息，比如$p,q,n,g,\lambda,\mu$等信息，私钥保存所有字段，公钥只保存 $n,g$，其他字段为空或者0。相关接口如下：
        ```c
        // 创建 PAILLIER_KEY 对象
        PAILLIER_KEY *PAILLIER_KEY_new(void);

        // 释放 PAILLIER_KEY 对象
        void PAILLIER_KEY_free(PAILLIER_KEY *key);

        // 拷贝 PAILLIER_KEY 对象，将 src 拷贝到 dest 中
        PAILLIER_KEY *PAILLIER_KEY_copy(PAILLIER_KEY *dest, PAILLIER_KEY *src);

        // 复制 PAILLIER_KEY 对象
        PAILLIER_KEY *PAILLIER_KEY_dup(PAILLIER_KEY *key);

        // 将 PAILLIER_KEY 对象引用计数加1，释放 PAILLIER_KEY 对象时若引用计数不为0则不能释放其内存
        int PAILLIER_KEY_up_ref(PAILLIER_KEY *key);

        // 生成 PAILLIER_KEY 对象中的参数，bits 为随机大素数 p、q 的二进制位长度
        int PAILLIER_KEY_generate_key(PAILLIER_KEY *key, int bits);

        // 获取 key 的类型：公钥 or 私钥
        // PAILLIER_KEY_TYPE_PUBLIC 为私钥，PAILLIER_KEY_TYPE_PRIVATE 为私钥
        int PAILLIER_KEY_type(PAILLIER_KEY *key);
        ```

   - 上下文对象：`PAILLIER_CTX`，该对象用来保存公私钥对象以及一些其他内部用到的信息，是  paillier算法其他接口的第一个参数。相关接口如下：
        ```c
        // 创建 PAILLIER_CTX 对象，key 为 paillier 公钥或者私钥，threshold 为支持最大的数字阈值，加密场景可设置为0，解密场景可使用默认值：PAILLIER_MAX_THRESHOLD
        PAILLIER_CTX *PAILLIER_CTX_new(PAILLIER_KEY *key, int64_t threshold);

        // 释放 PAILLIER_CTX 对象
        void PAILLIER_CTX_free(PAILLIER_CTX *ctx);

        // 拷贝 PAILLIER_CTX 对象，将 src 拷贝到 dest 中
        PAILLIER_CTX *PAILLIER_CTX_copy(PAILLIER_CTX *dest, PAILLIER_CTX *src);

        // 复制 PAILLIER_CTX 对象
        PAILLIER_CTX *PAILLIER_CTX_dup(PAILLIER_CTX *src);
        ```

   - 密文对象：`PAILLIER_CIPHERTEXT`，该对象是用来保存 paillier 加密后的结果信息，用到`PAILLIER_CIPHERTEXT`的地方，可调用如下接口：
        ```c
        // 创建 PAILLIER_CIPHERTEXT 对象
        PAILLIER_CIPHERTEXT *PAILLIER_CIPHERTEXT_new(PAILLIER_CTX *ctx);

        // 释放 PAILLIER_CIPHERTEXT 对象
        void PAILLIER_CIPHERTEXT_free(PAILLIER_CIPHERTEXT *ciphertext);
        ```

- 加密/解密接口
    ```c
    // 加密，将明文 m 进行加密，结果保存到 PAILLIER_CIPHERTEXT 对象指针 out 中
    int PAILLIER_encrypt(PAILLIER_CTX *ctx, PAILLIER_CIPHERTEXT *out, int32_t m);

    // 解密，将密文 c 进行解密，结果保存到 int32_t 指针 out 中
    int PAILLIER_decrypt(PAILLIER_CTX *ctx, int32_t *out, PAILLIER_CIPHERTEXT *c);
    ```

- 密文加/减/标量乘运算接口
    ```c
    // 密文加，r = c1 + c2
    int PAILLIER_add(PAILLIER_CTX *ctx, PAILLIER_CIPHERTEXT *r,
                    PAILLIER_CIPHERTEXT *c1, PAILLIER_CIPHERTEXT *c2);

    // 密文标量加，r = c1 * m
    int PAILLIER_add_plain(PAILLIER_CTX *ctx, PAILLIER_CIPHERTEXT *r,
                        PAILLIER_CIPHERTEXT *c1, int32_t m);

    // 密文减，r = c1 - c2
    int PAILLIER_sub(PAILLIER_CTX *ctx, PAILLIER_CIPHERTEXT *r,
                    PAILLIER_CIPHERTEXT *c1, PAILLIER_CIPHERTEXT *c2);

    // 密文标量乘，r = c * m
    int PAILLIER_mul(PAILLIER_CTX *ctx, PAILLIER_CIPHERTEXT *r,
                    PAILLIER_CIPHERTEXT *c, int32_t m);
    ```

- 编码/解码接口

同态加密涉及到多方参与，可能会需要网络传输，这就需要将密文对象`PAILLIER_CIPHERTEXT`编码后才能传递给对方，对方也需要解码得到`PAILLIER_CIPHERTEXT`对象后才能调用其他接口进行运算。
接口如下：
```c
// 编码，将密文 ciphertext 编码后保存到 out 指针中，out 指针的内存需要提前分配好；
// 如果 out 为 NULL，则返回编码所需的内存大小；
// flag：标志位，预留，暂时没有用
size_t PAILLIER_CIPHERTEXT_encode(PAILLIER_CTX *ctx, unsigned char *out,
                                  size_t size,
                                  const PAILLIER_CIPHERTEXT *ciphertext,
                                  int flag);

// 解码，将长度为 size 的内存数据 in 解码后保存到密文对象 r 中
int PAILLIER_CIPHERTEXT_decode(PAILLIER_CTX *ctx, PAILLIER_CIPHERTEXT *r,
                               unsigned char *in, size_t size);
```
以上所有接口详细说明请参考 paillier API 文档：[https://www.yuque.com/tsdoc/api/slgr6f](https://www.yuque.com/tsdoc/api/slgr6f)
### 核心实现

- Paillier Key

    Paillier 不像 EC-ElGamal，EC-ElGamal 在 Tongsuo 里面直接复用 `EC_KEY` 即可，Paillier Key 在 Tongsuo 里面则需要实现一遍，主要功能有：公/私钥的生成、PEM 格式存储、公/私钥解析和文本展示，详情请查阅代码：crypto/paillier/paillier_key.c、crypto/paillier/paillier_asn1.c、crypto/paillier/paillier_prn.c

- Paillier 加解密、密文运算

    Paillier 的加解密和密文运算算法非常简单，主要是大数的模幂运算，使用 Tongsuo 里面的 BN 相关接口就可以，需要注意的是，负数的加密/解密用到模逆运算，不能直接按公式计算（$c=g^mr^n\space mod\space n^2$），这是因为 Openssl 的接口`BN_mod_exp`没有关注指数（上面公式的 m）是不是负数，如果是负数的话需要做一次模逆运算：$m=-k,c=g^mr^n\space mod\space n^2=g^{-k}r^n\space mod\space n^2=(g^k)^{-1}r^n\space mod\space n^2$，这里计算出 $g^k$之后做一次模逆运算（`BN_mod_inverse`）再与$r^n$相乘；解密的时候，需要检查是否检查了阈值（`PAILLIER_MAX_THRESHOLD`），超出则说明是负数，需要减去 n 才得到真正的结果。
密文减法也需要用到模逆运算，通过密文减法的公式（$c=\frac{c_1}{c_2} \space mod\space n^2=c_1c_2^{-1}\space mod\space n^2$）得知，$c_2$需要进行模逆运算（`BN_mod_inverse`）再与$c_1$相乘。
详情请查阅代码：crypto/paillier/paillier_crypt.c

- Paillier 命令行

    为了提高 Paillier 的易用性，Tongsuo 实现了如下 paillier 子命令：
    ```bash
    $ /opt/tongsuo-debug/bin/openssl paillier -help
    Usage: paillier [action options] [input/output options] [arg1] [arg2]

    General options:
    -help         Display this summary

    Action options:
    -keygen       Generate a paillier private key
    -pubgen       Generate a paillier public key
    -key          Display/Parse a paillier private key
    -pub          Display/Parse a paillier public key
    -encrypt      Encrypt a number with the paillier public key, usage: -encrypt 99, 99 is an example number
    -decrypt      Decrypt a ciphertext using the paillier private key, usage: -decrypt c1, c1 is an example ciphertext
    -add          Paillier homomorphic addition: add two ciphertexts, usage: -add c1 c2, c1 and c2 are tow example ciphertexts, result: E(c1) + E(c2)
    -add_plain    Paillier homomorphic addition: add a ciphertext to a plaintext, usage: -add_plain c1 99, c1 is an example ciphertext, 99 is an example number, result: E(c1) + 99
    -sub          Paillier homomorphic subtraction: sub two ciphertexts, usage: -sub c1 c2, c1 and c2 are tow example ciphertexts, result: E(c1) - E(c2)
    -mul          Paillier homomorphic scalar multiplication: multiply a ciphertext by a known plaintext, usage: -mul c1 99, c1 is an example ciphertext, 99 is an example number, result: E(c1) * 99

    Input options:
    -in val       Input file
    -key_in val   Input is a paillier private key used to generate public key

    Output options:
    -out outfile  Output the paillier key to specified file
    -noout        Don't print paillier key out
    -text         Print the paillier key in text
    -verbose      Verbose output

    Parameters:
    arg1          Argument for encryption/decryption, or the first argument of a homomorphic operation
    arg2          The second argument of a homomorphic operation
    ```
    主要命令有：
    - keygen：生成 paillier 私钥
    - pubgen：用 paillier 私钥生成公钥
    - key：文本显示 paillier 私钥
    - pub：文本显示 paillier 公钥
    - encrypt：对数字进行加密，输出 paillier 加密的结果，需要通过参数-key_in参数指定 paillier 公钥文件路径，如果加密负数则需要将`-`用`_`代替，因为`-`会被 openssl 解析成预定义参数了（下同）
    - decrypt：对 paillier 密文进行解密，输出解密结果，需要通过-key_in参数指定 paillier 私钥文件路径
    - add：对两个 paillier 密文进行同态加法操作，输出同态加法密文结果，需要通过参数-key_in参数指定 paillier 公钥文件路径
    - add_plain：将 paillier 密文和明文相加，输出同态加法密文结果，需要通过参数-key_in参数指定 paillier 公钥文件路径
    - sub：对两个 paillier 密文进行同态减法操作，输出同态减法密文结果，需要通过参数-key_in参数指定 paillier 公钥文件路径
    - mul：将 paillier 密文和明文相乘，输出同态标量乘法密文结果，需要通过参数-key_in参数指定 paillier 公钥文件路径
    
    通过以上命令即可在命令行进行 Paillier 算法实验，降低入门门槛，详情请查阅代码：apps/paillier.c
    
    另外还实现了 paillier 的 speed 命令，可以进行性能测试，详情请查阅代码：apps/speed.c
    ## 用法&例子
    ### demo 程序
    ```c title="paillier_test.c"
    #include <stdio.h>
    #include <time.h>
    #include <openssl/paillier.h>
    #include <openssl/pem.h>

    #define CLOCKS_PER_MSEC (CLOCKS_PER_SEC/1000)

    int main(int argc, char *argv[])
    {
        int ret = -1;
        int32_t r;
        clock_t begin, end;
        PAILLIER_KEY *pail_key = NULL, *pail_pub = NULL;
        PAILLIER_CTX *ctx1 = NULL, *ctx2 = NULL;
        PAILLIER_CIPHERTEXT *c1 = NULL, *c2 = NULL, *c3 = NULL;
        FILE *pk_file = fopen("pail-pub.pem", "rb");
        FILE *sk_file = fopen("pail-key.pem", "rb");

        if ((pail_pub = PEM_read_PAILLIER_PublicKey(pk_file, NULL, NULL, NULL)) == NULL)
            goto err;
        if ((pail_key = PEM_read_PAILLIER_PrivateKey(sk_file, NULL, NULL, NULL)) == NULL)
            goto err;

        if ((ctx1 = PAILLIER_CTX_new(pail_pub, PAILLIER_MAX_THRESHOLD)) == NULL)
            goto err;
        if ((ctx2 = PAILLIER_CTX_new(pail_key, PAILLIER_MAX_THRESHOLD)) == NULL)
            goto err;

        if ((c1 = PAILLIER_CIPHERTEXT_new(ctx1)) == NULL)
            goto err;
        if ((c2 = PAILLIER_CIPHERTEXT_new(ctx1)) == NULL)
            goto err;

        begin = clock();
        if (!PAILLIER_encrypt(ctx1, c1, 20000021))
            goto err;
        end = clock();
        printf("PAILLIER_encrypt(20000021) cost: %lfms\n", (double)(end - begin)/CLOCKS_PER_MSEC);

        begin = clock();
        if (!PAILLIER_encrypt(ctx1, c2, 500))
            goto err;
        end = clock();
        printf("PAILLIER_encrypt(500) cost: %lfms\n", (double)(end - begin)/CLOCKS_PER_MSEC);

        if ((c3 = PAILLIER_CIPHERTEXT_new(ctx1)) == NULL)
            goto err;

        begin = clock();
        if (!PAILLIER_add(ctx1, c3, c1, c2))
            goto err;
        end = clock();
        printf("PAILLIER_add(C2000021,C500) cost: %lfms\n", (double)(end - begin)/CLOCKS_PER_MSEC);

        begin = clock();
        if (!(PAILLIER_decrypt(ctx2, &r, c3)))
            goto err;
        end = clock();
        printf("PAILLIER_decrypt(C20000021,C500) result: %d, cost: %lfms\n", r, (double)(end - begin)/CLOCKS_PER_MSEC);

        begin = clock();
        if (!PAILLIER_mul(ctx1, c3, c2, 800))
            goto err;
        end = clock();
        printf("PAILLIER_mul(C500,800) cost: %lfms\n", (double)(end - begin)/CLOCKS_PER_MSEC);

        begin = clock();
        if (!(PAILLIER_decrypt(ctx2, &r, c3)))
            goto err;
        end = clock();
        printf("PAILLIER_decrypt(C500,800) result: %d, cost: %lfms\n", r, (double)(end - begin)/CLOCKS_PER_MSEC);


        printf("PAILLIER_CIPHERTEXT_encode size: %zu\n", PAILLIER_CIPHERTEXT_encode(ctx2, NULL, 0, NULL, 1));

        ret = 0;
    err:
        PAILLIER_KEY_free(pail_key);
        PAILLIER_KEY_free(pail_pub);
        PAILLIER_CIPHERTEXT_free(c1);
        PAILLIER_CIPHERTEXT_free(c2);
        PAILLIER_CIPHERTEXT_free(c3);
        PAILLIER_CTX_free(ctx1);
        PAILLIER_CTX_free(ctx2);
        fclose(sk_file);
        fclose(pk_file);
        return ret;
    }
    ```
### 编译和运行
先确保 Tongsuo 开启 paillier，如果是手工编译 Tongsuo，可参考如下编译步骤：
```bash
# 下载代码
git clone git@github.com:Tongsuo-Project/Tongsuo.git


# 编译参数需要加上：enable-paillier
./config  --debug no-shared no-threads enable-paillier --strict-warnings -fPIC --prefix=/opt/tongsuo

# 编译
make -j

# 安装到目录 /opt/tongsuo 
sudo make install
```
### 编译 demo 程序
```bash
gcc -Wall -g -o paillier_test ./paillier_test.c -I/opt/tongsuo/include -L/opt/tongsuo/lib -lssl -lcrypto
```
### 生成 Paillier 公私钥
```bash
# 先生成私钥
/opt/tongsuo/bin/openssl paillier -keygen -out pail-key.pem
# 用私钥生成公钥
/opt/tongsuo/bin/openssl paillier -pubgen -key_in ./pail-key.pem -out pail-pub.pem
```
### 运行结果
```bash
$ ./paillier_test
PAILLIER_encrypt(20000021) cost: 3.202000ms
PAILLIER_encrypt(500) cost: 0.442000ms
PAILLIER_add(C2000021,C500) cost: 0.047000ms
PAILLIER_decrypt(C20000021,C500) result: 20000521, cost: 0.471000ms
PAILLIER_mul(C500,800) cost: 0.056000ms
PAILLIER_decrypt(C500,800) result: 400000, cost: 0.464000ms
PAILLIER_CIPHERTEXT_encode size: 0
```

