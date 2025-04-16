# 利用生成器生成白盒程序
我们的工作台如图所示。

![工作台](https://cdn.nlark.com/yuque/0/2025/png/12713214/1743488666242-223d941e-3e6c-4217-b6f1-285336feab70.png)

1. 修改密钥和参数。从主程序中打开程序minimal.py，修改密钥和相关参数，保存并且关闭程序。

```python
# 密钥
KEY = "samplekey1234567"
# 加解密
if_enc = 1
# 是否混合 boolean dummy shuffling
if_dummy = 1
# 槽数
slot = 2**1
# 并行加密明文组数
slice_cnt = 64

# 掩码
ct = mask_circuit(ct, MINQ(rand=rand))
ct = mask_circuit(ct, DOM(rand=rand, nshares=2))
```

2. 生成白盒方案。在命令行执行：

`./minimal.py`

即可在build文件夹生成白盒保护程序code.c。

![build文件夹生成code.c](https://cdn.nlark.com/yuque/0/2025/png/12713214/1743488666186-fa9ebb06-bb3c-4da4-937c-5fd6b8bef8b3.png)



# 白盒程序加密/解密与速度正确性验证
本节描述如何使用生成器产生的白盒保护程序，并进行速度与正确性验证。

执行加密程序需要提前将明文二进制字符串放入文件test_plaintext中，然后执行：

`./buildrun_enc.sh`

类似的，执行解密程序需要提前将密文二进制字符串放入文件test_ciphertext中，然后执行：

`./buildrun_dec.sh`

输出以二进制字符串的格式存储在test_plaintext和test_ciphertext文件中，用户可以通过二进制读写模式打开。

此外，我们也提供了辅助的正确性验证程序“reference_impl.py”，可以随机生成任意组明文写入test_plaintext中，并调用标准库的sm4加密将密文保存至test_ciphertext，方便用户进行正确性验证。

输出举例如图：

![加密输出示例](https://cdn.nlark.com/yuque/0/2025/png/12713214/1743488666332-d9b448c5-d23f-460a-b7f0-6d998603607b.png)

![解密输出示例](https://cdn.nlark.com/yuque/0/2025/png/12713214/1743488666271-188aecb1-c1f9-442c-a684-04810d1376d6.png)

# 参考
本工作参考了[whitebox/synthesis at master · cryptolu/whitebox](https://github.com/cryptolu/whitebox/tree/master/synthesis)的实现。

