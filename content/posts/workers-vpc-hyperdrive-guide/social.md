Workers VPCの実装ガイドを書きました。

Cloudflare Workersから私設ネットワークのDBへ繋ぐ構成は「トンネル → VPC Service → Hyperdrive → Worker」の4段。コマンドの中核は実質1つです。

差が出るのは手順より前の設計判断でした。ServicesとNetworksのどちらでバインドするか、そしてHyperdriveを「挟んでもいいオプション」ではなく本体として扱うか。経路の設計だと思って始めると、実際に決めているのはDB接続の寿命管理でした。

https://www.tentspace.net/blog/workers-vpc-hyperdrive-guide
