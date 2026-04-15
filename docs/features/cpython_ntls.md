---
sidebar_position: 28
---

# cpython + tongsuo

## 把cpython改造成支持用NTLS协议通信

```bash
#下载源码
#基于 https://github.com/python/cpython 开源项目开发
git clone https://github.com/red-keys/cpython.git（支持NTLS功能的在3.12_ntls分支）

编译 cpython 需要的依赖软件
apt install -y \
    build-essential \
    pkg-config \
    libssl-dev \
    libffi-dev \
    libbz2-dev \
    libreadline-dev \
    libsqlite3-dev \
    zlib1g-dev \
    libncurses5-dev \
    libgdbm-dev \
    libnss3-dev \
    liblzma-dev \
    uuid-dev

apt-get install autoconf-archive  

编译步骤
bash
autoreconf -ivf -Werror
export LD_LIBRARY_PATH=/usr/local/tongsuo/lib64:$LD_LIBRARY_PATH
export LDFLAGS="-L/usr/local/tongsuo/lib64 -Wl,-rpath=/usr/local/tongsuo/lib64"
export CPPFLAGS="-I/usr/local/tongsuo/include"
./configure --prefix=/usr/local/python312 --with-openssl=/usr/local/tongsuo --enable-ntls-version
make -j$(nproc)
make install
验证安装
bash
/usr/local/python312/bin/python3 --version
输出示例：Python 3.12.12+ (Openssl=Tongsuo 8.5.0)

新的宏定义
c
#define _SSL__SSLCONTEXT_LOAD_SIGN_CERT_CHAIN_METHODDEF    \  
    {"load_sign_cert_chain", _PyCFunction_CAST(_ssl__SSLContext_load_sign_cert_chain), METH_FASTCALL|METH_KEYWORDS, _ssl__SSLContext_load_sign_cert_chain__doc__},  
  
#define _SSL__SSLCONTEXT_LOAD_ENC_CERT_CHAIN_METHODDEF    \  
    {"load_enc_cert_chain", _PyCFunction_CAST(_ssl__SSLContext_load_enc_cert_chain), METH_FASTCALL|METH_KEYWORDS, _ssl__SSLContext_load_enc_cert_chain__doc__},
实现步骤
1. 在 Modules/_ssl.c 中添加 clinic 输入
参考 load_cert_chain 的 clinic 定义 _ssl.c:4533-4540：

c
/*[clinic input]  
@critical_section  
_ssl._SSLContext.load_sign_cert_chain  
    certfile: object  
    keyfile: object = None  
    password: object = None  
  
[clinic start generated code]*/  
  
/*[clinic input]  
@critical_section  
_ssl._SSLContext.load_enc_cert_chain  
    certfile: object  
    keyfile: object = None  
    password: object = None  
  
[clinic start generated code]*/
2. 实现函数
模仿 load_cert_chain_impl _ssl.c:4543-4639，但使用 Tongsuo 的 NTLS 函数：

c
static PyObject *  
_ssl__SSLContext_load_sign_cert_chain_impl(PySSLContext *self, PyObject *certfile,  
                                          PyObject *keyfile, PyObject *password)  
{  
    // 使用 SSL_CTX_use_sign_certificate_file 和 SSL_CTX_use_sign_PrivateKey_file  
}  
  
static PyObject *  
_ssl__SSLContext_load_enc_cert_chain_impl(PySSLContext *self, PyObject *certfile,  
                                         PyObject *keyfile, PyObject *password)  
{  
    // 使用 SSL_CTX_use_enc_certificate_file 和 SSL_CTX_use_enc_PrivateKey_file  
}
3. 注册到方法表
在 context_methods 数组中添加新方法 _ssl.c:5706-5728：

c
static struct PyMethodDef context_methods[] = {  
    // ... 现有方法 ...  
    _SSL__SSLCONTEXT_LOAD_SIGN_CERT_CHAIN_METHODDEF  
    _SSL__SSLCONTEXT_LOAD_ENC_CERT_CHAIN_METHODDEF  
    {NULL, NULL}        /* sentinel */  
};
注意事项
这些宏定义只是第一步。你还需要：

Modules/clinic/_ssl.c.h 是工具自动生成的 clinic 代码，不允许手动编辑

先编辑 Modules/_ssl.c，再运行以下命令生成 clinic 代码：

bash
python3 ./Tools/clinic/clinic.py --make --srcdir . -f
例如：

c
/*[clinic input]
_ssl._SSLContext.load_sign_cert_chain
    certfile: object
    keyfile: object = None
    password: object = None

[clinic start generated code]*/

static PyObject *
_ssl__SSLContext_load_sign_cert_chain_impl(PySSLContext *self, PyObject *certfile,
                                      PyObject *keyfile, PyObject *password)
/*[clinic end generated code: output=9480bc1c380e2095 input=30bc7e967ea01a58]*/
{
    // 具体实现逻辑
}

/*[clinic input]
_ssl._SSLContext.load_enc_cert_chain
    certfile: object
    keyfile: object = None
    password: object = None

[clinic start generated code]*/

static PyObject *
_ssl__SSLContext_load_enc_cert_chain_impl(PySSLContext *self, PyObject *certfile,
                                      PyObject *keyfile, PyObject *password)
/*[clinic end generated code: output=9480bc1c380e2095 input=30bc7e967ea01a58]*/
{
    // 具体实现逻辑
}
相关函数原型
c
__owur int SSL_CTX_use_certificate_chain_file(SSL_CTX *ctx, const char *file);

__owur int SSL_CTX_use_PrivateKey_file(SSL_CTX *ctx, const char *file,
                                       int type);
__owur int SSL_CTX_use_certificate_file(SSL_CTX *ctx, const char *file,
                                        int type);
GDB 调试
bash
gdb --args /usr/local/python312/bin/python3.12 /mnt/d/python_ntls_test/ntls_client.py
(gdb) break _ssl__SSLSocket_do_handshake_impl
Breakpoint 5 at 0x7ffff79709e5: file ./Modules/_ssl.c, line 960.
服务端运行命令
bash
/usr/local/python312/bin/python3 ntls_server_20251208.py
或者使用 tongsuo 命令：

bash
/usr/local/tongsuo/bin/tongsuo s_server   -accept 8443   -enable_ntls   -sign_cert sign_server.crt   -sign_key sign_server.key   -enc_cert enc_server.crt   -enc_key enc_server.key   -CAfile ca.crt  -www
客户端运行命令
bash
/usr/local/python312/bin/python3.12 /mnt/d/python_ntls_test/ntls_client_20251208.py
或者使用 tongsuo 命令：

bash
/usr/local/tongsuo/bin/tongsuo s_client -connect 127.0.0.1:8443 -cipher ECC-SM2-SM4-CBC-SM3 -enable_ntls -ntls -sign_cert sign_client.crt -sign_key sign_client.key -enc_cert enc_client.crt -enc_key enc_client.key -CAfile ca.crt 
客户端脚本
/mnt/d/python_ntls_test/ntls_client_20251208.py：

python
#!/usr/bin/env python3
import socket, ssl

# 关键修改1：HOST 使用 IP 地址
HOST = "127.0.0.1"  # 改为直接连接本地IP
PORT = 8443

SIGN_CERTFILE = "/mnt/d/python_ntls_test/ntls_certs/sign_client.crt"
SIGN_KEYFILE = "/mnt/d/python_ntls_test/ntls_certs/sign_client.key"
ENC_CERTFILE = "/mnt/d/python_ntls_test/ntls_certs/enc_client.crt"
ENC_KEYFILE = "/mnt/d/python_ntls_test/ntls_certs/enc_client.key"
CAFILE = "/mnt/d/python_ntls_test/ntls_certs/ca.crt"

def main():
    context = ssl.SSLContext(ssl.PROTOCOL_NTLS_CLIENT)
    context.load_verify_locations(cafile=CAFILE)
    context.load_sign_cert_chain(certfile=SIGN_CERTFILE, keyfile=SIGN_KEYFILE)
    context.load_enc_cert_chain(certfile=ENC_CERTFILE, keyfile=ENC_KEYFILE)
    context.set_ciphers("ECC-SM2-SM4-CBC-SM3:@SECLEVEL=0")

    print("[+] Using cipher suite:", "ECC-SM2-SM4-CBC-SM3")

    with socket.create_connection((HOST, PORT)) as sock:
        # 关键修改2：wrap_socket 时，server_hostname 参数仍使用证书的CN
        with context.wrap_socket(sock, server_hostname="server.example.com") as ssock:
            print("Connected. Cipher:", ssock.cipher())
            # 发送请求时，Host头也保持一致
            request = f"GET / HTTP/1.1\r\nHost: server.example.com\r\n\r\n"
            ssock.sendall(request.encode())
            resp = ssock.recv(8192)
            print("Response:\n", resp.decode(errors="ignore"))

if __name__ == "__main__":
    main()
服务端脚本
/mnt/d/python_ntls_test/ntls_server_20251208.py：

python
#!/usr/bin/env python3
import socket, ssl

HOST = "0.0.0.0"
PORT = 8443  # 注意：你的客户端连接的是4433，这里要确保一致

SIGN_CERTFILE = "./ntls_certs/sign_server.crt"
SIGN_KEYFILE  = "./ntls_certs/sign_server.key"
ENC_CERTFILE  = "./ntls_certs/enc_server.crt"
ENC_KEYFILE   = "./ntls_certs/enc_server.key"
CAFILE = "./ntls_certs/ca.crt"   # 用来验证客户端证书

def main():
    # 1. 创建NTLS服务器上下文
    context = ssl.SSLContext(ssl.PROTOCOL_NTLS_SERVER)

    # 2. 【关键修复】设置NTLS密码套件
    context.set_ciphers("ECC-SM2-SM4-CBC-SM3:@SECLEVEL=0")
    print("[Server] Using NTLS cipher suite: ECC-SM2-SM4-CBC-SM3")

    # 3. 加载双证书
    context.load_sign_cert_chain(certfile=SIGN_CERTFILE, keyfile=SIGN_KEYFILE)
    context.load_enc_cert_chain(certfile=ENC_CERTFILE, keyfile=ENC_KEYFILE)

    # 4. 设置客户端证书验证
    context.verify_mode = ssl.CERT_REQUIRED
    context.load_verify_locations(cafile=CAFILE)

    # 5. 创建服务器socket
    bindsock = socket.socket(socket.AF_INET, socket.SOCK_STREAM, 0)
    bindsock.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)
    bindsock.bind((HOST, PORT))
    bindsock.listen(5)
    print(f"NTLS server listening on port {PORT}")
    print(f"Server certificate CN: server.example.com")
    print("Waiting for NTLS connections...")

    while True:
        newsock, addr = bindsock.accept()
        print(f"\n[+] Connection from {addr[0]}:{addr[1]}")
        try:
            # 6. 建立NTLS连接
            ssock = context.wrap_socket(
                newsock,
                server_side=True
            )
            print(f"[+] NTLS handshake successful")
            print(f"    Cipher: {ssock.cipher()}")
            print(f"    Client certificate verified: {ssock.getpeercert() is not None}")

            # 7. 处理客户端请求
            data = ssock.recv(4096)
            if data:
                print(f"[+] Received {len(data)} bytes:")
                print(data.decode('utf-8', errors='ignore'))

                # 发送响应
                response = (
                    b"HTTP/1.1 200 OK\r\n"
                    b"Content-Type: text/plain\r\n"
                    b"Content-Length: 24\r\n"
                    b"\r\n"
                    b"Hello from NTLS server!"
                )
                ssock.sendall(response)
                print("[+] Response sent")

            # 8. 关闭连接
            ssock.shutdown(socket.SHUT_RDWR)
            ssock.close()

        except ssl.SSLError as e:
            print(f"[-] SSL handshake failed: {e}")
            newsock.close()
        except Exception as e:
            print(f"[-] Error: {e}")
            newsock.close()

if __name__ == "__main__":
    main()
抓包分析
可以抓包 127.0.0.1:8443 的流量：

bash
sudo tcpdump -i lo -s 0 -w localhost_8443.pcap 'host 127.0.0.1 and port 8443'
然后在 Windows 系统下用 Wireshark 打开并分析 pcap 文件。