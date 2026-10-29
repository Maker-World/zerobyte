<div align="center">
  <p><a href="README.md">English</a> | <b>简体中文</b></p>
  <h1>Zerobyte</h1>
  <h3>强大的远程存储备份自动化工具<br />轻松加密、压缩并保护您的数据</h3>
  <a href="https://github.com/nicotsx/zerobyte/blob/main/LICENSE">
    <img src="https://img.shields.io/github/license/nicotsx/zerobyte" />
  </a>
  <br />
  <figure>
    <img src="https://github.com/nicotsx/zerobyte/blob/main/screenshots/backup-details.webp?raw=true" alt="演示" />
    <figcaption>
      <p align="center">
        支持计划和监控的备份管理
      </p>
    </figcaption>
  </figure>
</div>

#### 加入社区

[![Discord](https://img.shields.io/discord/1466834119873925263?label=discord&logo=discord)](https://discord.gg/XjgVyXrcEH)

> [!WARNING]
> Zerobyte 仍处于 0.x.x 版本，不同版本之间可能会有较大变化。作者正在开发核心功能并收集反馈，如有 Bug 或功能需求，请提交 Issue。

<p align="center">
<a href="https://www.buymeacoffee.com/nicotsx" target="_blank"><img src="https://cdn.buymeacoffee.com/buttons/v2/default-yellow.png" alt="Buy Me A Coffee" style="height: 60px !important;width: 217px !important;" ></a>
</p>

## 简介

Zerobyte 是一款备份自动化工具，可帮助您将数据保存到多种存储后端。它基于 Restic 构建，提供现代化的 Web 界面，用于计划、管理和监控远程存储的加密备份。

## 文档

官方文档网站位于 [zerobyte.app](https://zerobyte.app)（英文）。

其中包含最新的安装指南、配置参考，以及在生产环境中运行 Zerobyte 的使用文档。

### 功能

- **自动备份**：基于 Restic，支持加密、压缩和保留策略
- **灵活的计划**：为自动备份任务设置计划，并配置细粒度的保留策略
- **端到端加密**：确保您的数据始终受到保护
- **多协议支持**：可从 NFS、SMB、WebDAV、SFTP 或本地目录进行备份

## 安装

运行 Zerobyte 需要在服务器上安装 Docker 和 Docker Compose。然后，您可以使用下面的 `compose.yaml` 文件启动应用。

```yaml
services:
  zerobyte:
    image: ghcr.io/nicotsx/zerobyte:v0.43
    container_name: zerobyte
    restart: unless-stopped
    cap_add:
      - SYS_ADMIN
    ports:
      - "4096:4096"
    devices:
      - /dev/fuse:/dev/fuse
    environment:
      - TZ=Asia/Shanghai # 设置您的时区
      - BASE_URL=http://localhost:4096 # 您访问 Zerobyte 时使用的 URL
      - APP_SECRET=94bad46...c66e25d5c2b # 使用 `openssl rand -hex 32` 生成您自己的密钥
    volumes:
      - /etc/localtime:/etc/localtime:ro
      - /var/lib/zerobyte:/var/lib/zerobyte
```

> [!WARNING]
> 强烈不建议在可从互联网访问的服务器（VPS 或做了端口转发的家庭服务器）上运行 Zerobyte。如果必须这样做，请将端口映射改为 "127.0.0.1:4096:4096"，并通过带身份验证的安全隧道（SSH 隧道、Cloudflare Tunnel 等）访问。

> [!WARNING]
> 不要将 `/var/lib/zerobyte` 指向网络共享，否则会遇到权限问题并导致性能严重下降。

> [!NOTE]
> **TrueNAS 用户：** 在 TrueNAS 上，主机路径 `/var/lib` 是临时的，系统升级时会被重置。请不要使用 `/var/lib/zerobyte:/var/lib/zerobyte`，而是创建一个专用的 ZFS 数据集（例如 `tank/docker/zerobyte`）并挂载它：
>
> ```yaml
> volumes:
>   - /etc/localtime:/etc/localtime:ro
>   - /mnt/tank/docker/zerobyte:/var/lib/zerobyte
> ```
>
> 这样可以确保您的配置、加密密钥和数据库在 TrueNAS 升级后依然保留。

然后，运行以下命令启动 Zerobyte：

```bash
docker compose up -d
```

容器运行后，即可通过 `http://<服务器IP>:4096` 访问 Web 界面。界面右上角的语言按钮可以在英文和简体中文之间切换。

## 配置

Zerobyte 可通过环境变量进行自定义。可用选项如下：

### 环境变量

| 变量                      | 说明                                                                                                         | 默认值                 |
| :------------------------ | :----------------------------------------------------------------------------------------------------------- | :--------------------- |
| `BASE_URL`                | **必填。** Zerobyte 实例的基础 URL（例如 `https://zerobyte.example.com`）。参见下方的[身份验证](#身份验证)。 | （无）                 |
| `APP_SECRET`              | **必填。** 用于加密数据库中敏感数据的随机密钥（32 个字符以上）。可使用 `openssl rand -hex 32` 生成。         | （无）                 |
| `APP_SECRET_FILE`         | 包含 `APP_SECRET` 的文件路径，适用于 Docker 或 Kubernetes secrets。与 `APP_SECRET` 二选一。                  | （无）                 |
| `PORT`                    | Web 界面和 API 监听的端口。                                                                                  | `4096`                 |
| `RESTIC_HOSTNAME`         | Restic 创建快照时使用的主机名。如果在 Docker 中设置了自定义主机名，会自动检测。                              | `zerobyte`             |
| `GOMAXPROCS`              | 可选的正整数，传递给 Restic 进程以限制 CPU 调度线程数。可用于降低备份期间的 CPU 压力。                       | Restic 默认值          |
| `TZ`                      | 容器时区（例如 `Asia/Shanghai`）。**对备份计划的准确执行至关重要。**                                         | `UTC`                  |
| `TRUST_PROXY`             | 设为 `true` 时，信任反向代理传入的 `X-Forwarded-For` 请求头。直接部署时请保持 `false`。                      | `false`                |
| `TRUSTED_ORIGINS`         | 以逗号分隔的额外 CORS 受信任源列表（例如 `http://localhost:3000,http://example.com`）。                      | （无）                 |
| `WEBHOOK_ALLOWED_ORIGINS` | 以逗号分隔的 HTTP 源列表，允许用于备份 Webhook 和对外 HTTP 通知目标。                                        | （无）                 |
| `WEBHOOK_TIMEOUT`         | 备份 Webhook 请求的超时时间（秒）。                                                                          | `60`                   |
| `LOG_LEVEL`               | 日志详细程度。可选值：`debug`、`info`、`warn`、`error`。                                                     | `info`                 |
| `RCLONE_CONFIG_DIR`       | 容器内 `rclone.conf` 所在目录的路径。以非 root 用户运行时需要修改。                                          | `/root/.config/rclone` |
| `PROVISIONING_PATH`       | JSON 文件路径，其中包含启动时同步的、由运维管理的存储库和数据源。                                            | （无）                 |

### 性能调优

如果备份占用过多 CPU，可在 Zerobyte 容器上设置 `GOMAXPROCS` 并重启容器：

```yaml
environment:
  - GOMAXPROCS=2
```

这会限制 Restic 子进程使用的 Go 调度器。正在进行的操作不受影响；新值仅对容器重启后启动的 Restic 进程生效。

其他有用的 Restic 调优选项：

- 将存储库压缩设置为 `off` 可降低 CPU 占用，`auto` 为常规的平衡选项。`max` 能节省更多空间，但会占用更多 CPU。
- 使用存储库的上传/下载限速，避免占满网络带宽。
- 在备份计划的 **自定义 restic 参数** 中，为单个任务设置高级参数，例如 `--read-concurrency 1`、`--exclude-larger-than 10G` 或 `--no-scan`。

完整指南请参阅：[性能调优](https://zerobyte.app/docs/guides/performance-tuning)（英文）。

### Webhook 与通知的网络策略

可以指向任意网络主机的备份 Webhook 和对外通知目标，受 `WEBHOOK_ALLOWED_ORIGINS` 限制。

允许列表只做源的精确匹配：协议、主机和端口都必须一致。路径会被忽略，因此 `https://hooks.example.com/backups` 允许 `https://hooks.example.com` 上的任意路径，但不允许 `http://hooks.example.com`、`https://hooks.example.com:8443` 或 `https://other.example.com`。

此策略适用于：

- 备份前/后 Webhook URL
- 通用 HTTP 通知 URL
- Gotify 服务器 URL
- 自托管 ntfy 服务器 URL
- 指向通用 HTTP 或 SMTP 网络目标的自定义 Shoutrrr URL

ntfy.sh 公共服务，以及 Slack、Discord、Pushover、Telegram 等固定服务商的通知服务，不需要配置 `WEBHOOK_ALLOWED_ORIGINS`。

备份 Webhook 不会跟随重定向。请将最终目标的源添加到 `WEBHOOK_ALLOWED_ORIGINS`，并直接配置最终 URL。

Webhook 请求头以明文存储，每行必须是一个 `Key: Value` 格式的请求头。`WEBHOOK_TIMEOUT` 控制备份前/后 Webhook 请求的超时时间；通知发送则遵循底层服务商发送器的行为。

### 预配资源

Zerobyte 可以在启动时从 JSON 文件同步由运维管理的存储库和数据源。如果您希望凭据或连接信息保存在部署配置中，而不是通过界面输入，这会很有用。

预配资源：

- 会出现在常规的存储库和数据源页面中
- 可在启动同步时从环境变量或 `/run/secrets/*` 解析凭据字段

完整的预配文档请参阅 [zerobyte.app/docs/guides/provisioning](https://zerobyte.app/docs/guides/provisioning)（英文）。

完整示例请参阅 `examples/provisioned-resources/README.md`。

### 精简部署（不挂载远程共享）

如果您只需要备份本地挂载的文件夹，不需要挂载远程共享，可以从 `compose.yaml` 中移除 `SYS_ADMIN` 权限和 FUSE 设备：

```yaml
services:
  zerobyte:
    image: ghcr.io/nicotsx/zerobyte:v0.43
    container_name: zerobyte
    restart: unless-stopped
    ports:
      - "4096:4096"
    environment:
      - TZ=Asia/Shanghai # 设置您的时区
      - BASE_URL=http://localhost:4096 # 改为您实际的 URL（使用 https:// 以启用安全 Cookie）
      - APP_SECRET=94bad46...c66e25d5c2b # 使用 `openssl rand -hex 32` 生成您自己的密钥
    volumes:
      - /etc/localtime:/etc/localtime:ro
      - /var/lib/zerobyte:/var/lib/zerobyte
      - /path/to/your/directory:/mydata
```

**取舍：**

- ✅ 减少容器权限，提升安全性
- ✅ 支持以本地目录作为备份数据源
- ✅ 支持所有存储库类型，包括本地和远程（S3、GCS、Azure、rclone）
- ❌ 无法直接在 Zerobyte 中挂载 NFS、SMB、WebDAV 或 SFTP 共享

如果需要挂载远程共享，请保留原有配置中的 `cap_add: SYS_ADMIN` 和 `devices: /dev/fuse:/dev/fuse`。

## 示例

可直接运行、便于复制粘贴的示例请参阅 [examples/README.md](examples/README.md)。

## 添加第一个数据源

Zerobyte 支持多种数据源后端，包括 NFS、SMB、WebDAV、SFTP 和本地目录。数据源代表您要备份和监控的源数据。

要添加第一个数据源，请在 Web 界面中进入“数据源”页面，点击“创建数据源”，并填写名称、类型和连接设置等必填信息。

如果要备份运行 Zerobyte 的同一主机上的本地目录，需要先将该目录挂载到 Zerobyte 容器中。您可以在 `compose.yaml` 文件中添加卷映射来实现。例如，要将主机上的 `/path/to/your/directory` 挂载到容器中的 `/mydata`，请在 `volumes` 部分添加以下这一行：

```diff
services:
  zerobyte:
    image: ghcr.io/nicotsx/zerobyte:v0.43
    container_name: zerobyte
    restart: unless-stopped
    cap_add:
      - SYS_ADMIN
    ports:
      - "4096:4096"
    devices:
      - /dev/fuse:/dev/fuse
    environment:
      - TZ=Asia/Shanghai
      - BASE_URL=http://localhost:4096 # 您访问 Zerobyte 时使用的 URL
      - APP_SECRET=94bad46...c66e25d5c2b # 使用 `openssl rand -hex 32` 生成您自己的密钥
    volumes:
      - /etc/localtime:/etc/localtime:ro
      - /var/lib/zerobyte:/var/lib/zerobyte
+     - /path/to/your/directory:/mydata
```

更新 `compose.yaml` 文件后，重启 Zerobyte 容器使更改生效：

```bash
docker compose down
docker compose up -d
```

现在，在 Zerobyte Web 界面中添加新数据源时，可以选择“目录”类型，并搜索您挂载的路径（例如 `/mydata`）作为源路径。

![添加新数据源界面](https://github.com/nicotsx/zerobyte/blob/main/screenshots/add-volume.png?raw=true)

## 创建存储库

存储库是您的备份被加密并安全存储的位置。Zerobyte 为备份存储库支持多种存储后端：

- **本地目录**：将备份存储在 `/var/lib/zerobyte/repositories/` 下的本地磁盘子文件夹，或任何其他（已挂载的）路径
- **S3 兼容存储**：Amazon S3、MinIO、Wasabi、DigitalOcean Spaces 等
- **Google Cloud Storage**：Google 的云存储服务
- **Azure Blob Storage**：Microsoft Azure 存储
- **rclone 远程**：通过 rclone 支持 40 多种云存储服务商（见下文）

存储库借助 Restic 的去重和加密功能，针对存储效率和数据完整性进行了优化。

要创建存储库，请在 Web 界面中进入“存储库”页面，点击“创建存储库”，并填写名称、类型和连接设置等必填信息。

### 使用 rclone 连接云存储

Zerobyte 可以使用 [rclone](https://rclone.org/) 支持 40 多种云存储服务商，包括 Google Drive、Dropbox、OneDrive、Box、pCloud、Mega 等。这让您几乎可以将备份存储到任何云存储服务。

**设置步骤：**

1. **在主机系统上安装 rclone**（如果尚未安装）：

   ```bash
   curl https://rclone.org/install.sh | sudo bash
   ```

2. 使用 rclone 的交互式配置**配置您的云存储远程**：

   ```bash
   rclone config
   ```

   按提示设置您的云存储服务商。对于使用 OAuth 的服务商（Google Drive、Dropbox 等），rclone 会引导您完成认证流程。

3. **确认远程已配置**：

   ```bash
   rclone listremotes
   ```

4. 更新 `compose.yaml`，**将 rclone 配置挂载到 Zerobyte 容器中**：

   ```diff
   services:
     zerobyte:
       image: ghcr.io/nicotsx/zerobyte:v0.43
       container_name: zerobyte
       restart: unless-stopped
       cap_add:
         - SYS_ADMIN
       ports:
         - "4096:4096"
       devices:
         - /dev/fuse:/dev/fuse
       environment:
         - TZ=Asia/Shanghai
         - BASE_URL=http://localhost:4096 # 您访问 Zerobyte 时使用的 URL
       volumes:
         - /etc/localtime:/etc/localtime:ro
         - /var/lib/zerobyte:/var/lib/zerobyte
   +     - ~/.config/rclone:/root/.config/rclone:ro
   ```

   > **非 root 用户注意：** 如果您的容器以其他用户运行（例如 TrueNAS 应用），请将配置挂载到相应位置，并设置 `RCLONE_CONFIG_DIR`：
   >
   > ```yaml
   > environment:
   >   - RCLONE_CONFIG_DIR=/home/appuser/.config/rclone
   > volumes:
   >   - ~/.config/rclone:/home/appuser/.config/rclone:ro
   > ```

5. **重启 Zerobyte 容器**：

   ```bash
   docker compose down
   docker compose up -d
   ```

6. 在 Zerobyte 中**创建存储库**：
   - 选择 “rclone” 作为存储库类型
   - 从下拉列表中选择您配置好的远程
   - 指定远程中的路径（例如 `backups/zerobyte`）

支持的服务商完整列表请参阅 [rclone 文档](https://rclone.org/)。

## 第一个备份任务

添加数据源并创建存储库后，就可以创建第一个备份任务了。备份任务定义了将特定数据源备份到指定存储库的计划和参数。

创建备份任务时，可以设置以下内容：

- **计划**：定义备份运行的频率（例如每天、每周）
- **保留策略**：设置备份保留多长时间的规则（例如每日备份保留 7 天，每周备份保留 4 周）
- **路径**：指定要包含在备份中的文件或目录

配置好备份任务后保存，Zerobyte 会按照设定的计划自动执行备份。
您可以在 Web 界面的“备份”页面中监控备份任务的进度和状态。

![备份界面](https://github.com/nicotsx/zerobyte/blob/main/screenshots/backups-list.png?raw=true)

## 恢复数据

Zerobyte 可以让您轻松地从备份中恢复数据。要恢复数据，请进入“备份”页面，选择要从中恢复数据的备份任务，然后选择一个具体的备份快照，并选择要恢复的文件或目录。所选数据将被恢复到其原始位置。

![恢复界面](https://github.com/nicotsx/zerobyte/blob/main/screenshots/restoring.png?raw=true)

## 身份验证

Zerobyte 使用 [better-auth](https://github.com/better-auth/better-auth) 进行身份验证和会话管理。身份验证系统会根据您的部署场景自动调整：

### 用户与角色

Zerobyte 目前没有为备份操作提供细粒度的 RBAC。经过身份验证的组织成员，会被视为可信任的操作者，可以操作所在组织中的存储库、数据源、备份计划、恢复和通知目标。

组织角色主要限制组织管理和实例管理操作。例如，普通成员不能管理成员、SSO 设置、邀请、注册或全局用户，但仍然可以操作备份资源。只有在您放心让对方使用该实例所配置的存储、数据源和通知能力时，才应将其添加到组织中。

### Cookie 安全

- **IP 地址/HTTP 访问**：设置 `BASE_URL=http://192.168.1.50:4096`（或您的 IP）。Cookie 将使用 `Secure: false`，无需 SSL 即可直接登录。
- **域名/HTTPS 访问**：设置 `BASE_URL=https://zerobyte.example.com`。Cookie 会自动使用 `Secure: true`，以保护会话。

### 反向代理设置

如果您在反向代理（Nginx、Traefik、Caddy 等）后运行 Zerobyte：

1. 将 **`BASE_URL`** 设置为您的 HTTPS 域名（例如 `https://zerobyte.example.com`）
2. 应用会根据 `https://` 前缀自动启用安全 Cookie
3. 确保代理会传递 `X-Forwarded-Proto` 请求头

### 重要说明

- `BASE_URL` 必须以 `https://` 开头才会启用安全 Cookie
- 浏览器**不会**将本地 IP 地址（例如 `http://192.168.x.x`）视为安全上下文，因此会自动禁用安全 Cookie
- `TRUSTED_ORIGINS` 只是为身份验证相关的请求允许额外的源。它不会禁用安全 Cookie，也无法在 `BASE_URL` 为 HTTPS 时让通过 HTTP 的已登录访问正常工作。
- 如果 `BASE_URL` 是 HTTPS，浏览器只会通过 HTTPS 发送 Zerobyte 的身份验证 Cookie。通过纯 HTTP 访问时可能仍能看到登录页，但由于没有会话 Cookie，登录后的操作都会失败。

## 故障排除

常见问题的排查方法请参阅 [TROUBLESHOOTING.md](TROUBLESHOOTING.md)（英文）。

## 第三方软件

本项目包含以下第三方软件组件：

### Restic

Zerobyte 包含 [Restic](https://github.com/restic/restic) 以提供备份功能。

- **许可证**：BSD 2-Clause License
- **版权**：Copyright (c) 2014, Alexander Neumann <alexander@bumpern.de>
- **状态**：未经修改直接包含
- **许可证文本**：参见 [LICENSES/BSD-2-Clause-Restic.txt](LICENSES/BSD-2-Clause-Restic.txt)

第三方软件许可证和署名的完整列表，请参阅 [NOTICES.md](NOTICES.md)。

## 参与贡献

欢迎任何人参与贡献！如果您发现了 Bug 或有功能需求，请在 GitHub 上提交 Issue。如果想贡献代码，欢迎 fork 仓库并提交 Pull Request。所有贡献者都需要先签署贡献者许可协议（CLA），我们才能接受您的贡献，这是为了同时保护您和本项目。详情请参阅 [CONTRIBUTING.md](CONTRIBUTING.md)（英文）。

## 本地开发（不使用 Docker）

安装 Bun 1.4.4 和 Portless 后，可以在开发时不使用 Docker，直接在本地运行 Zerobyte：

```bash
bun install
bun run dev
```

运行 `bun fmt` 格式化代码，运行 `bun run typecheck` 检查应用和所有工作区的类型，运行 `bun run check` 同时执行 lint、类型检查和格式检查。在 VS Code 中，**Format current file with Bun** 任务会运行同样的格式化工具。

本地开发时，请在仓库根目录创建 `.env.local` 文件并覆盖 Docker 中的路径：

```bash
# 示例
ZEROBYTE_DATABASE_URL=./data/zerobyte.db
APP_SECRET=your_app_secret_here
RESTIC_PASS_FILE=./data/restic.pass
RESTIC_CACHE_DIR=./data/restic/cache
ZEROBYTE_REPOSITORIES_DIR=./data/repositories
ZEROBYTE_VOLUMES_DIR=./data/volumes
BASE_URL=https://*.localhost
```

说明：

- 远程挂载后端（NFS/SMB/WebDAV/SFTP）依赖 Linux 挂载工具和 `CAP_SYS_ADMIN`，在 macOS 上预计无法使用。
- 要真正运行备份或存储库检查，请在本机安装 `restic`（例如通过 Homebrew）。如果没有安装 `restic`，应用仍可启动，但备份操作会失败并给出明确的错误提示。
