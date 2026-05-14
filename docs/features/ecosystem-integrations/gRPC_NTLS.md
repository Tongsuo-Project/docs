---
sidebar_position: 7
slug: /features/gRPC_NTLS
---

# gRPC + Tongsuo 

## 把gRPC改造成支持用NTLS协议通信


```bash
# 下载源码
# 基于 https://github.com/grpc/grpc 开源项目开发
git clone https://github.com/red-keys/grpc.git （支持NTLS功能的在grpc-tongsuo分支）
mkdir -p cmake/build  
# 删除编译缓存
rm -rf /home/red/grpc/cmake/build/*
设置环境变量
确保使用铜锁：

bash
export LD_LIBRARY_PATH=/usr/local/lib:$LD_LIBRARY_PATH
export PKG_CONFIG_PATH=/usr/local/tongsuo/lib64/pkgconfig:$PKG_CONFIG_PATH
export LD_LIBRARY_PATH=/usr/local/tongsuo/lib64:$LD_LIBRARY_PATH
export LIBRARY_PATH=/usr/local/tongsuo/lib64:$LIBRARY_PATH
注意：不止编译grpc的时候需要设置环境变量，编译grpc服务端客户端的时候也要设置环境变量。不然会报错：

text
ld: /usr/local/lib/libgrpc.so: undefined reference to `SSL_CTX_use_enc_certificate@OPENSSL_3.0.0`
原因是用 ldd /usr/local/lib/libgrpc.so | grep ssl 发现 libssl.so.3 => /lib/x86_64-linux-gnu/libssl.so.3，没有链接到 /usr/local/tongsuo/lib64/libssl.so.3。

CMake 配置修改
给 CMakeLists.txt 添加：

cmake
if(OPENSSL_IS_TONGSUO)
  add_definitions(-DOPENSSL_IS_TONGSUO) 
endif()
然后给 cmake 加 -DOPENSSL_IS_TONGSUO=ON 编译选项，代码里面所有的 #if defined(OPENSSL_IS_TONGSUO) 就会生效。

其他有用选项：

-DCMAKE_BUILD_TYPE=Debug：编译出带调试信息的 grpc 动态库文件，用于 GDB 调试

-DgRPC_SSL_PROVIDER=package：获取本地的 openssl 而不是远程下载源码再编译额外的 openssl

-DCMAKE_CXX_STANDARD=17：避免 C++ 17 特性编译报错

编译 gRPC
bash
cmake \
  -DOPENSSL_IS_TONGSUO=ON \
  -DCMAKE_BUILD_TYPE=Debug \
  -DCMAKE_CXX_STANDARD=17 \
  -DBUILD_SHARED_LIBS=ON \
  -DgRPC_SSL_PROVIDER=package \
  -DOPENSSL_CRYPTO_LIBRARY=/usr/local/tongsuo/lib64/libcrypto.so \
  -DOPENSSL_SSL_LIBRARY=/usr/local/tongsuo/lib64/libssl.so \
  -DOPENSSL_INCLUDE_DIR=/usr/local/tongsuo/include \
  -DOPENSSL_ROOT_DIR=/usr/local/tongsuo \
  ../..

make -j$(nproc)
make install

apt clean
apt update
apt install -y libssl-dev libre2-dev
验证安装
bash
# 检查 gRPC++ 版本
pkg-config --modversion grpc++        # 输出: 1.77.0-dev

# 检查 protoc 版本
protoc --version                       # 输出: libprotoc 31.1

# 检查 OpenSSL 版本
pkg-config --modversion openssl        # 输出: 1.1.1w
关键代码结构
C++ 服务端凭据结构
定义在 include/grpcpp/security/server_credentials.h：

cpp
struct PemKeyCertPair { }
关键转换函数在 src/cpp/server/secure_server_credentials.cc：

cpp
std::shared_ptr<ServerCredentials> SslServerCredentials( 
C++ 客户端凭据结构
定义在 include/grpcpp/security/credentials.h：

cpp
struct SslCredentialsOptions { }
关键转换函数在 src/cpp/client/secure_credentials.cc：

cpp
std::shared_ptr<ChannelCredentials> SslCredentials(  
C API 结构
定义在 include/grpc/credentials.h：

cpp
typedef struct {  
  const char* private_key;  
  const char* cert_chain;  
} grpc_ssl_pem_key_cert_pair;
关键转换函数在 src/core/credentials/transport/ssl/ssl_credentials.cc：

cpp
tsi_ssl_pem_key_cert_pair* grpc_convert_grpc_to_tsi_cert_pairs(
内存管理 - 对应的销毁函数在 src/core/credentials/transport/tls/ssl_utils.cc：

cpp
void grpc_tsi_ssl_pem_key_cert_pairs_destroy
TSI 层
定义在 src/core/tsi/ssl_transport_security.h：

cpp
struct tsi_ssl_pem_key_cert_pair {  
  const char* private_key;  
  const char* cert_chain;  
};
生成证书脚本
创建 make_gm_certs.sh：

bash
#!/bin/bash
WORKDIR="./ntls_certs"
mkdir -p $WORKDIR && cd $WORKDIR || exit 1

# 生成根CA证书（SM2算法）
/usr/local/tongsuo/bin/openssl genpkey -algorithm EC -pkeyopt ec_paramgen_curve:sm2 -out ca.key
/usr/local/tongsuo/bin/openssl req -x509 -new -key ca.key -out ca.crt -subj "/C=CN/ST=ZJ/L=HZ/O=NTLS_CA/CN=Root CA" -sigopt sm2_id:1234567812345678

echo "====== 生成服务器证书 ======"
# 签名证书
/usr/local/tongsuo/bin/openssl genpkey -algorithm EC -pkeyopt ec_paramgen_curve:sm2 -out sign_server.key
/usr/local/tongsuo/bin/openssl req -new -key sign_server.key -out server_sign.csr \
    -subj "/C=CN/ST=ZJ/L=HZ/O=Server/CN=server.example.com"
# 添加服务器签名证书扩展
/usr/local/tongsuo/bin/openssl x509 -req -in server_sign.csr \
    -CA ca.crt -CAkey ca.key -CAcreateserial \
    -out sign_server.crt -days 365 \
    -extfile <(echo -e "basicConstraints=critical,CA:FALSE\nkeyUsage=Digital Signature\nextendedKeyUsage=serverAuth") \
    -sigopt sm2_id:1234567812345678

# 加密证书
/usr/local/tongsuo/bin/openssl genpkey -algorithm EC -pkeyopt ec_paramgen_curve:sm2 -out enc_server.key
/usr/local/tongsuo/bin/openssl req -new -key enc_server.key -out server_enc.csr \
    -subj "/C=CN/ST=ZJ/L=HZ/O=Server/CN=server.example.com"
# 添加加密证书扩展
/usr/local/tongsuo/bin/openssl x509 -req -in server_enc.csr \
    -CA ca.crt -CAkey ca.key \
    -out enc_server.crt -days 365 \
    -extfile <(echo -e "basicConstraints=critical,CA:FALSE\nkeyUsage=Key Encipherment, Data Encipherment, Key Agreement\nextendedKeyUsage=serverAuth") \
    -sigopt sm2_id:1234567812345678

echo "====== 生成客户端证书 ======"
# 签名证书
/usr/local/tongsuo/bin/openssl genpkey -algorithm EC -pkeyopt ec_paramgen_curve:sm2 -out sign_client.key
/usr/local/tongsuo/bin/openssl req -new -key sign_client.key -out client_sign.csr \
    -subj "/C=CN/ST=ZJ/L=HZ/O=Client/CN=client.example.com"
# 添加客户端签名证书扩展
/usr/local/tongsuo/bin/openssl x509 -req -in client_sign.csr \
    -CA ca.crt -CAkey ca.key -CAcreateserial \
    -out sign_client.crt -days 365 \
    -extfile <(echo -e "basicConstraints=critical,CA:FALSE\nkeyUsage=Digital Signature\nextendedKeyUsage=clientAuth") \
    -sigopt sm2_id:1234567812345678

# 加密证书
/usr/local/tongsuo/bin/openssl genpkey -algorithm EC -pkeyopt ec_paramgen_curve:sm2 -out enc_client.key
/usr/local/tongsuo/bin/openssl req -new -key enc_client.key -out client_enc.csr \
    -subj "/C=CN/ST=ZJ/L=HZ/O=Client/CN=client.example.com"
# 添加加密证书扩展
/usr/local/tongsuo/bin/openssl x509 -req -in client_enc.csr \
    -CA ca.crt -CAkey ca.key \
    -out enc_client.crt -days 365 \
    -extfile <(echo -e "basicConstraints=critical,CA:FALSE\nkeyUsage=Key Encipherment, Data Encipherment, Key Agreement\nextendedKeyUsage=clientAuth") \
    -sigopt sm2_id:1234567812345678

echo "证书生成完成，目录：$WORKDIR"
编译脚本
创建 make_server_client.sh：

bash
protoc --grpc_out=. --plugin=protoc-gen-grpc=/usr/local/bin/grpc_cpp_plugin echo.proto
protoc --cpp_out=. echo.proto 

g++ -std=c++17 -c helloworld.pb.cc helloworld.grpc.pb.cc
g++ -std=c++17 -c greeter_server_mtls.cc
g++ -std=c++17 -c greeter_client_mtls.cc
g++ -std=c++17 -o server helloworld.pb.o helloworld.grpc.pb.o greeter_server_mtls.o \
    $(pkg-config --cflags --libs grpc++ protobuf)
g++ -std=c++17 -o client helloworld.pb.o helloworld.grpc.pb.o greeter_client_mtls.o \
    $(pkg-config --cflags --libs grpc++ protobuf)
编译完之后分别执行 ./server 和 ./client 即可。

Proto 文件
创建 helloworld.proto：

protobuf
syntax = "proto3";

package helloworld;

service Greeter {
  rpc SayHello (HelloRequest) returns (HelloReply) {}
}

message HelloRequest {
  string name = 1;
}

message HelloReply {
  string message = 1;
}
服务端代码
创建 greeter_server_ntls.cc：

cpp
// greeter_server_mtls.cc
#include <iostream>
#include <memory>
#include <string>
#include <fstream>
#include <grpcpp/grpcpp.h>
#include <grpcpp/security/credentials.h>
#include "helloworld.grpc.pb.h"

using grpc::Server;
using grpc::ServerBuilder;
using grpc::ServerContext;
using grpc::Status;
using grpc::SslServerCredentialsOptions;
using helloworld::Greeter;
using helloworld::HelloRequest;
using helloworld::HelloReply;

// 辅助函数：读取文件内容（放在类定义之前）
std::string ReadFile(const std::string& filename) {
  std::ifstream file(filename, std::ios::in | std::ios::binary);
  if (!file.is_open()) {
    std::cerr << "Failed to open file: " << filename << std::endl;
    return "";
  }
  std::string content((std::istreambuf_iterator<char>(file)),
                      std::istreambuf_iterator<char>());
  return content;
}

class GreeterServiceImpl final : public Greeter::Service {
  Status SayHello(ServerContext* context, const HelloRequest* request,
                  HelloReply* reply) override {
    std::string prefix("Hello ");
    reply->set_message(prefix + request->name());

    // 获取客户端证书信息
    auto auth_context = context->auth_context();
    if (auth_context) {
      std::cout << "Client authenticated with mTLS" << std::endl;

      // 获取客户端证书的通用名称
      auto peer_identity = auth_context->GetPeerIdentity();
      if (!peer_identity.empty()) {
        std::cout << "Client identity: " << peer_identity[0] << std::endl;
      }
    }

    std::cout << "Server: Sending response for " << request->name() << std::endl;
    return Status::OK;
  }
};

int main(int argc, char** argv) {
  // 启用 NTLS 国密套件
  setenv("GRPC_SSL_CIPHER_SUITES",
         "ECC-SM2-SM4-CBC-SM3", 1);

  // 强烈建议打开调试
  setenv("GRPC_VERBOSITY", "DEBUG", 1);
  setenv("GRPC_TRACE", "handshaker,security", 1);

  std::string server_address("0.0.0.0:50051");
  GreeterServiceImpl service;

  // 设置 mTLS 选项
  grpc::SslServerCredentialsOptions ssl_opts;

  // 设置服务器证书和私钥
  grpc::SslServerCredentialsOptions::PemKeyCertPair key_cert_pair;
  key_cert_pair.sign_private_key = ReadFile("ntls_certs/sign_server.key");
  key_cert_pair.sign_cert_chain = ReadFile("ntls_certs/sign_server.crt");
  key_cert_pair.enc_private_key = ReadFile("ntls_certs/enc_server.key");
  key_cert_pair.enc_cert_chain = ReadFile("ntls_certs/enc_server.crt");
  ssl_opts.pem_key_cert_pairs.push_back(key_cert_pair);

  // 设置 CA 证书用于验证客户端证书
  ssl_opts.pem_root_certs = ReadFile("ntls_certs/ca.crt");

  // 设置客户端证书验证要求
  ssl_opts.client_certificate_request =
      GRPC_SSL_REQUEST_AND_REQUIRE_CLIENT_CERTIFICATE_AND_VERIFY;

  // 创建 SSL 凭证
  auto ssl_creds = grpc::SslServerCredentials(ssl_opts);

  // 构建服务器
  ServerBuilder builder;
  builder.AddListeningPort(server_address, ssl_creds);
  builder.RegisterService(&service);

  std::unique_ptr<Server> server(builder.BuildAndStart());
  std::cout << "NTLS Server listening on " << server_address << std::endl;

  // 等待客户端连接
  server->Wait();

  return 0;
}
客户端代码
创建 greeter_client_ntls.cc：

cpp
// greeter_client_ntls.cc  
#include <iostream>
#include <memory>
#include <string>
#include <fstream>
#include <cstdlib>

#include <grpcpp/grpcpp.h>
#include <grpcpp/security/credentials.h>
#include "helloworld.grpc.pb.h"

using grpc::Channel;
using grpc::ClientContext;
using grpc::Status;
using grpc::SslCredentialsOptions;
using grpc::ChannelArguments;
using helloworld::Greeter;
using helloworld::HelloRequest;
using helloworld::HelloReply;

// 辅助函数：读取文件内容
std::string ReadFile(const std::string& filename) {
    std::ifstream file(filename, std::ios::in | std::ios::binary);
    if (!file.is_open()) {
        std::cerr << "Failed to open file: " << filename << std::endl;
        return "";
    }
    return std::string((std::istreambuf_iterator<char>(file)),
                       std::istreambuf_iterator<char>());
}

class GreeterClient {
public:
    GreeterClient(std::shared_ptr<Channel> channel)
        : stub_(Greeter::NewStub(channel)) {}

    std::string SayHello(const std::string& user) {
        HelloRequest request;
        request.set_name(user);
        HelloReply reply;
        ClientContext context;

        // NTLS客户端标识
        context.AddMetadata("client-info", "NTLS-client");

        Status status = stub_->SayHello(&context, request, &reply);
        if (status.ok()) {
            return reply.message();
        } else {
            std::cerr << "RPC failed: " << status.error_code() << ": "
                      << status.error_message() << std::endl;
            return "RPC failed";
        }
    }

private:
    std::unique_ptr<Greeter::Stub> stub_;
};


int main(int argc, char** argv) {
    // ==================== NTLS关键配置 ====================

    // 1. 设置国密密码套件（必须在gRPC初始化前设置）
    // 注意：这个环境变量名在不同gRPC版本中可能不同
    setenv("GRPC_SSL_CIPHER_SUITES", "ECC-SM2-SM4-CBC-SM3", 1);

    // 3. 启用详细SSL日志用于调试
    setenv("GRPC_VERBOSITY", "DEBUG", 1);
    setenv("GRPC_TRACE", "ssl,cipher,handshaker", 1);

    // ==================== 证书文件读取 ====================
    std::string ca_cert = ReadFile("ntls_certs/ca.crt");
    std::string sign_key = ReadFile("ntls_certs/sign_client.key");
    std::string sign_cert = ReadFile("ntls_certs/sign_client.crt");
    std::string enc_key = ReadFile("ntls_certs/enc_client.key");
    std::string enc_cert = ReadFile("ntls_certs/enc_client.crt");

    // 检查所有证书文件是否成功读取
    if (ca_cert.empty() || sign_key.empty() || sign_cert.empty() ||
        enc_key.empty() || enc_cert.empty()) {
        std::cerr << "错误: 无法加载证书文件" << std::endl;
        std::cerr << "请检查以下文件是否存在:" << std::endl;
        std::cerr << "  ntls_certs/ca.crt" << std::endl;
        std::cerr << "  ntls_certs/sign_client.key" << std::endl;
        std::cerr << "  ntls_certs/sign_client.crt" << std::endl;
        std::cerr << "  ntls_certs/enc_client.key" << std::endl;
        std::cerr << "  ntls_certs/enc_client.crt" << std::endl;
        return 1;
    }

    // ==================== SSL配置 ====================
    grpc::SslCredentialsOptions ssl_opts;
    ssl_opts.pem_root_certs = ca_cert;

    // NTLS双证书设置
    ssl_opts.pem_sign_private_key = sign_key;
    ssl_opts.pem_sign_cert_chain = sign_cert;
    ssl_opts.pem_enc_private_key = enc_key;
    ssl_opts.pem_enc_cert_chain = enc_cert;

    auto ssl_creds = grpc::SslCredentials(ssl_opts);

    // ==================== Channel配置 ====================
    ChannelArguments channel_args;

    // 关键：解决CN不匹配问题
    // 实际连接localhost，但使用server.example.com进行证书校验
    channel_args.SetSslTargetNameOverride("server.example.com");

    // 注意：grpc.ssl_cipher_suites在这里设置无效！
    // 密码套件只能通过环境变量GRPC_SSL_CIPHER_SUITES设置

    std::string target_str("localhost:50051");

    // ==================== 创建连接 ====================
    std::cout << "正在连接到服务器 " << target_str << " ..." << std::endl;
    std::cout << "证书CN: server.example.com" << std::endl;
    std::cout << "密码套件: ECC-SM2-SM4-CBC-SM3" << std::endl;

    auto channel = grpc::CreateCustomChannel(target_str, ssl_creds, channel_args);

    // 等待连接建立
    auto deadline = std::chrono::system_clock::now() + std::chrono::seconds(10);
    if (!channel->WaitForConnected(deadline)) {
        std::cerr << "错误: 无法连接到服务器" << std::endl;

        // 诊断信息
        auto state = channel->GetState(true);
        std::cerr << "通道状态: ";
        switch (state) {
            case GRPC_CHANNEL_IDLE: std::cerr << "空闲"; break;
            case GRPC_CHANNEL_CONNECTING: std::cerr << "连接中"; break;
            case GRPC_CHANNEL_READY: std::cerr << "就绪"; break;
            case GRPC_CHANNEL_TRANSIENT_FAILURE: std::cerr << "暂时失败"; break;
            case GRPC_CHANNEL_SHUTDOWN: std::cerr << "关闭"; break;
        }
        std::cerr << std::endl;

        return 1;
    }

    std::cout << "连接成功!" << std::endl;

    // ==================== 发送请求 ====================
    GreeterClient greeter(channel);
    std::string reply = greeter.SayHello("NTLS客户端");
    std::cout << "服务器响应: " << reply << std::endl;

    return 0;
}
抓包分析
可以抓包 50051 端口的流量。DNS 解析 localhost 时，如果连接的是 IPv4 地址，IP 是 127.0.0.1；如果连接的是 IPv6 地址，IP 是 ::1。

bash
tcpdump -i lo -s 0 -w localhost_50051.pcap '(host 127.0.0.1 or host ::1) and port 50051'
然后在 Windows 系统下用 Wireshark 打开并分析 pcap 文件。
